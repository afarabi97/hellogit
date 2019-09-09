"""
Module contains classes and methods needed for generating the main projects
inventory files
"""
import os
from typing import Dict

from jinja2 import Environment, select_autoescape, FileSystemLoader
from app import TEMPLATE_DIR, DEPLOYER_DIR, CORE_DIR
from app.calculations import (get_sensors_from_list, get_servers_from_list,
                              server_and_sensor_count)
from app.resources import NodeResourcePool, NodeResources
from shared.constants import NODE_TYPES


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

    def _map_dl160_and_supermicro(self) -> None:
        """
        Maps the DL160 and SuperMicro values to the appropriate values for the
        inventory file.
        :return:
        """
        for node in self._template_ctx["nodes"]:
            if node['pxe_type'] == "SuperMicro":
                node['pxe_type'] = "BIOS"
            elif node['pxe_type'] == "DL160":
                node['pxe_type'] = "UEFI"

    def _set_dhcp_range(self):
        self._template_ctx['dhcp_start'] = self._template_ctx['dhcp_range']
        pos = self._template_ctx['dhcp_range'].rfind('.') + 1
        last_octet = int(self._template_ctx['dhcp_range'][pos:]) + 15
        end_ip = self._template_ctx['dhcp_range'][0:pos] + str(last_octet)
        self._template_ctx['dhcp_end'] = end_ip

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._map_dl160_and_supermicro()
        self._set_dhcp_range()
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
    def __init__(self, kit_form: Dict):
        self._template_ctx = kit_form

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
        self._template_ctx['kubernetes_services_cidr'] = self._template_ctx['kubernetes_services_cidr'] + "/28"
        if self._template_ctx['dns_ip'] is None:
            self._template_ctx['dns_ip'] = ''

        if "remove_node" not in self._template_ctx:
            self._template_ctx["remove_node"] = ''

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._set_defaults()
        self._set_reservations()
        template = JINJA_ENV.get_template('inventory_template.yml')
        kit_template = template.render(template_ctx=self._template_ctx)
        if not os.path.exists(str(CORE_DIR / 'playbooks')):
            os.makedirs(str(CORE_DIR / 'playbooks'))

        with open(str(CORE_DIR / 'playbooks/inventory.yml'), "w") as kit_file:
            kit_file.write(kit_template)
