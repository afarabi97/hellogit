"""
Module contains classes and methods needed for generating the main projects
inventory files
"""
import os
from typing import Dict

from jinja2 import Environment, select_autoescape, FileSystemLoader
from app import TEMPLATE_DIR, DEPLOYER_DIR, CORE_DIR, MIP_KICK_DIR, MIP_CONFIG_DIR
from app.calculations import (get_sensors_from_list, get_servers_from_list,
                              server_and_sensor_count)
from app.models.kit_setup import DIPKickstartForm, MIPKickstartForm, DIPKitForm
from app.resources import NodeResourcePool
from app.utils.constants import NODE_TYPES


JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


class KickstartInventoryGenerator:
    """
    The KickstartInventory generator class.
    """

    def __init__(self, json_dict: Dict):
        self._template_ctx = json_dict

    def _set_dhcp_range(self):
        self._template_ctx['dhcp_start'] = self._template_ctx['dhcp_range']
        pos = self._template_ctx['dhcp_range'].rfind('.') + 1
        last_octet = int(self._template_ctx['dhcp_range'][pos:]) + 15
        end_ip = self._template_ctx['dhcp_range'][0:pos] + str(last_octet)
        self._template_ctx['dhcp_end'] = end_ip

    def _set_raid(self):
        for node in self._template_ctx["nodes"]:
            if node['os_raid']:
                node['boot_drives'] = ""
                node['data_drives'] = ""
            if not node['os_raid']:
                node['raid_drives'] = []

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._set_dhcp_range()
        self._set_raid()
        template = JINJA_ENV.get_template('kickstart_inventory.yml')
        kickstart_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(DEPLOYER_DIR / 'playbooks')):
            os.makedirs(str(DEPLOYER_DIR / 'playbooks'))

        with open(str(DEPLOYER_DIR / 'playbooks/inventory.yml'), "w") as kickstart_file:
            kickstart_file.write(kickstart_template)


class KitInventoryGenerator:
    """
    The KitInventory generator class
    """
    def __init__(self, kit_form: DIPKitForm, kickstart: DIPKickstartForm):
        self._kickstart = kickstart
        self._template_ctx = kit_form.to_dict()
        self._servers_list = get_servers_from_list(self._template_ctx["nodes"])
        self._sensors_list = get_sensors_from_list(self._template_ctx["nodes"])
        self._server_res = NodeResourcePool(self._servers_list)
        self._sensor_res = NodeResourcePool(self._sensors_list)

    def _set_sensor_type_counts(self) -> None:
        """
        Set sensor type counts.

        :return: None
        """
        server_count, sensor_count = server_and_sensor_count(self._template_ctx["nodes"])
        self._template_ctx["server_count"] = server_count
        self._template_ctx["sensor_count"] = sensor_count

    def _set_reservations(self) -> None:
        sensor_index_offset = 0
        server_index_offset = 0
        for index, node in enumerate(self._template_ctx["nodes"]):
            if node["node_type"] == NODE_TYPES[1]:
                node["reservations"] = self._sensor_res.get_node_reservations(index - sensor_index_offset)
                server_index_offset += 1
            elif node["node_type"] == NODE_TYPES[0]:
                node["reservations"] = self._server_res.get_node_reservations(index - server_index_offset)
                sensor_index_offset += 1

    def _set_defaults(self) -> None:
        """
        Sets the defaults for fields that need to be set before template rendering.

        :return:
        """
        self._set_sensor_type_counts()
        self._template_ctx['kubernetes_services_cidr'] = self._template_ctx['kubernetes_services_cidr']

        if "remove_node" not in self._template_ctx:
            self._template_ctx["remove_node"] = ''

    def _set_domain(self):
        self._template_ctx['domain'] = self._kickstart.domain

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._set_defaults()
        self._set_reservations()
        self._set_domain()

        template = JINJA_ENV.get_template('inventory_template.yml')
        kit_template = template.render(template_ctx=self._template_ctx)
        if not os.path.exists(str(CORE_DIR / 'playbooks')):
            os.makedirs(str(CORE_DIR / 'playbooks'))

        with open(str(CORE_DIR / 'playbooks/inventory.yml'), "w") as kit_file:
            kit_file.write(kit_template)

class MIPKickstartInventoryGenerator:
    def __init__(self, mip_kickstart: MIPKickstartForm):
        self._template_ctx = mip_kickstart.to_dict()

    def _map_mip_model(self) -> None:
        for node in self._template_ctx["nodes"]:
            if node['pxe_type'] == "SCSI/SATA/USB":
                node['model'] = "SCSI/SATA/USB"
                node['pxe_type'] = "UEFI"

            elif node['pxe_type'] == "NVMe":
                node['model'] = "NVMe"
                node['pxe_type'] = "UEFI"

    def _set_dhcp_range(self):
        self._template_ctx['dhcp_start'] = self._template_ctx['dhcp_range']
        pos = self._template_ctx['dhcp_range'].rfind('.') + 1
        last_octet = int(self._template_ctx['dhcp_range'][pos:]) + 15
        end_ip = self._template_ctx['dhcp_range'][0:pos] + str(last_octet)
        self._template_ctx['dhcp_end'] = end_ip

    def generate(self) -> None:
        self._map_mip_model()
        self._set_dhcp_range()
        template = JINJA_ENV.get_template('mip_kickstart_inventory.yml')
        kickstart_template = template.render(self._template_ctx)

        if not os.path.exists(str(MIP_KICK_DIR)):
            os.makedirs(str(MIP_KICK_DIR))

        with open(str(MIP_KICK_DIR / 'inventory.yml'), "w") as kickstart_file:
            kickstart_file.write(kickstart_template)

class MIPConfigInventoryGenerator:
    def __init__(self, context: Dict):
        self._template_ctx = context

    def generate(self) -> None:
        template = JINJA_ENV.get_template('mip_config_inventory.yml')

        inventory = template.render(self._template_ctx)

        if not os.path.exists(str(MIP_CONFIG_DIR)):
            os.makedirs(str(MIP_CONFIG_DIR))

        with open(str(MIP_CONFIG_DIR / 'inventory.yml'), "w") as inventory_file:
            inventory_file.write(inventory)
