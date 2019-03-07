"""
Module contains classes and methods needed for generating the main projects
inventory files
"""
import os
from typing import Dict

from jinja2 import Environment, select_autoescape, FileSystemLoader
from app import TEMPLATE_DIR
from app.calculations import ServerCalculations, NodeCalculations
from app.resources import NodeResourcePool, NodeResources


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

        if not os.path.exists("/opt/tfplenum-deployer/playbooks/"):
            os.makedirs("/opt/tfplenum-deployer/playbooks/")

        with open("/opt/tfplenum-deployer/playbooks/inventory.yml", "w") as kickstart_file:
            kickstart_file.write(kickstart_template)


class KitInventoryGenerator:
    """
    The KitInventory generator class
    """
    def __init__(self, kit_form: Dict):
        self._template_ctx = kit_form
        self._server_cal = ServerCalculations(self._template_ctx)
        self._sensor_cal = NodeCalculations(self._template_ctx)
        self._server_res = NodeResourcePool(self._template_ctx["servers"])
        self._sensor_res = NodeResourcePool(self._template_ctx["sensors"])

    def _set_sensor_type_counts(self) -> None:
        """
        Set sensor type counts.

        :return: None
        """
        sensor_remote_count = 0
        sensor_local_count = 0

        for sensor in self._template_ctx["sensors"]:
            if sensor['sensor_type'] == "Remote":
                sensor_remote_count += 1
            else:
                sensor_local_count += 1

        self._template_ctx["sensor_local_count"] = sensor_local_count
        self._template_ctx["sensor_remote_count"] = sensor_remote_count

    def _set_apps_bools(self) -> None:
        has_suricata = False
        has_moloch = False
        has_bro = False
        for sensor in self._template_ctx["sensors"]:
            if "suricata" in sensor['sensor_apps']:
                has_suricata = True
            if "moloch" in sensor['sensor_apps']:
                has_moloch = True
            if "bro" in sensor['sensor_apps']:
                has_bro = True

        self._template_ctx["has_suricata"] = has_suricata
        self._template_ctx["has_moloch"] = has_moloch
        self._template_ctx["has_bro"] = has_bro

    def _set_reservations(self) -> None:
        for index, sensor in enumerate(self._template_ctx["sensors"]):
            sensor["reservations"] = self._sensor_res.get_node_reservations(index)
            
        for index, server in enumerate(self._template_ctx["servers"]):
            server["reservations"] = self._server_res.get_node_reservations(index)            

    def _set_server_calculations(self) -> None:
        self._template_ctx["server_cal"] = self._server_cal.to_dict()

    def _set_sensor_calculations(self) -> None:
        for index, sensor in enumerate(self._template_ctx["sensors"]):
            sensor["cal"] = self._sensor_cal.get_node_values[index].to_dict()

    def _set_defaults(self) -> None:
        """
        Sets the defaults for fields that need to be set before template rendering.

        :return:
        """
        self._set_sensor_type_counts()
        self._template_ctx['kubernetes_services_cidr'] = self._template_ctx['kubernetes_services_cidr'] + "/28"
        if self._template_ctx['dns_ip'] is None:
            self._template_ctx['dns_ip'] = ''

        if not self._template_ctx["endgame_iporhost"]:
            self._template_ctx["endgame_iporhost"] = ''

        if not self._template_ctx["endgame_username"]:
            self._template_ctx["endgame_username"] = ''

        if not self._template_ctx["endgame_password"]:
            self._template_ctx["endgame_password"] = ''
        self._map_ceph_redundancy()
            
    def _map_ceph_redundancy(self) -> None:
        """
        Sets the ceph_redundancy value to the appropriate value before 
        adding it to the inventory file.
        :return:
        """
        if self._template_ctx["ceph_redundancy"]:
            self._template_ctx["ceph_redundancy"] = 2
        else:
            self._template_ctx["ceph_redundancy"] = 1

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._set_defaults()
        self._set_server_calculations()
        self._set_sensor_calculations()
        self._set_reservations()
        self._set_apps_bools()
        template = JINJA_ENV.get_template('inventory_template.yml')
        kit_template = template.render(template_ctx=self._template_ctx)
        if not os.path.exists("/opt/tfplenum/playbooks/"):
            os.makedirs("/opt/tfplenum/playbooks/")

        with open("/opt/tfplenum/playbooks/inventory.yml", "w") as kit_file:
            kit_file.write(kit_template)
