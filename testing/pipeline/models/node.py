import copy
import logging

from argparse import Namespace, ArgumentParser
from models import Model
from models.kit import KitSettingsV2
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from util.network import IPAddressManager
from randmac import RandMac
from typing import Dict, List, Union
from util import redfish_util as redfish
from util.connection_mngs import MongoConnectionManager


MAC_BASE = "00:0a:29:00:00:00"

class NodeSettingsV2(Model):
    DEPLOYMENT_TYPES = ["Baremetal", "Virtual"]
    NODE_TYPES = ["Server", "Sensor", "Service", "MIP", "Control-Plane"]

    def __init__(self,
                 kit_settings: KitSettingsV2):
        super().__init__()
        self.hostname = ''
        self.ip_address = ''
        self.node_type = ''
        self.deployment_type = ''
        self.mac_address = ''
        self.data_drives = ["sdb"]
        self.boot_drives = ["sda"]
        self.raid_drives = ["sda","sdb"]
        self.os_raid = False
        self.os_raid_root_size = 50
        self.pxe_type = "BIOS"

        # Other fields not part of api payload
        self.kit_settings = kit_settings
        self.network_id = kit_settings.settings.network_id
        self.network_block_index = kit_settings.settings.network_block_index
        self.domain = kit_settings.settings.domain
        self.dns_servers = []
        self.sensing_mac = ''
        self.index = 0
        self.start_index = 0
        self.username = 'root'
        self.num_nodes = 0
        self.vm_prefix = ''
        self.memory = 0
        self.cpu = 0
        self.monitoring_interfaces = ["ens224"]
        self.device_facts = {}

    def is_sensor(self) -> bool:
        return self.node_type.lower() == "sensor"

    def is_server(self) -> bool:
        return self.node_type.lower() == "server"

    def is_service(self) -> bool:
        return self.node_type.lower() == "service"

    def is_control_plane(self) -> bool:
        return self.node_type.lower() == "control-plane"

    def is_mip(self) -> bool:
        return self.node_type.lower() == "mip"

    def set_hostname(self, vm_prefix: str, node_type: str="ctrl"):
        self.hostname = "{}-{}{}.{}".format(vm_prefix, node_type.lower(), self.index, self.domain)

    def to_node_api_payload(self):
        ret_val = { "hostname": self.hostname,
                    "ip_address": self.ip_address,
                    "node_type": self.node_type,
                    "deployment_type": self.deployment_type,
                    "mac_address": self.mac_address,
                    "data_drives": self.data_drives,
                    "boot_drives": self.boot_drives,
                    "raid_drives": self.raid_drives,
                    "os_raid": self.os_raid,
                    "os_raid_root_size":self.os_raid_root_size,
                    "pxe_type":self.pxe_type
                  }

        if self.deployment_type == self.DEPLOYMENT_TYPES[1]: # Virtual
            ret_val["pxe_type"] = None
            ret_val["mac_address"] = None

        return ret_val

    def to_mip_api_payload(self):
        return {"hostname": self.hostname,
                "ip_address": self.ip_address,
                "mac_address": None,
                "pxe_type": None,
                "deployment_type": self.deployment_type}

    def to_vmware_playbook_payload(self) -> Dict:
        return {
            "python_executable": self.python_executable,
            "vcenter": self.kit_settings.vcenter.to_dict(),
            "hostname": self.hostname,
            "mac_address": self.mac_address,
            "password": self.kit_settings.settings.password,
            "dns_servers": self.dns_servers,
            "node_type": self.node_type,
            "memory": self.memory,
            "cpu": self.cpu,
            "sensing_mac": self.sensing_mac
        }

    def from_mongo(self, obj: Dict):
        self.hostname = obj["hostname"]
        self.ip_address = obj['ip_address']
        self.node_type = obj['node_type']
        self.deployment_type = obj['deployment_type']
        self.mac_address = obj['mac_address']
        self.data_drives = obj['data_drives']
        self.boot_drives = obj['boot_drives']
        self.raid_drives = obj['raid_drives']
        self.os_raid = obj['os_raid']
        self.os_raid_root_size = obj['os_raid_root_size']
        self.pxe_type = obj['pxe_type']
        self.device_facts = obj['deviceFacts']

    def from_namespace(self, namespace: Namespace, index: int):
        self.num_nodes = namespace.num_nodes
        self.start_index = namespace.start_index
        self.index = self.start_index + index
        self.node_type = namespace.node_type
        self.vm_prefix = namespace.vm_prefix
        self.set_hostname(self.vm_prefix, self.node_type)
        self.os_raid = namespace.os_raid == 'yes'
        self.deployment_type = namespace.deployment_type
        self.ip_address = IPAddressManager(self.network_id, self.network_block_index).get_next_node_address_v2(self.index)
        self.mac_address = str(RandMac(MAC_BASE)).strip("'")
        self.dns_servers = namespace.dns_servers
        self.sensing_mac = str(RandMac(MAC_BASE)).strip("'")
        self.monitoring_interfaces = namespace.monitoring_interface

        try:
            self.memory = int(namespace.memory)
            self.cpu = int(namespace.cpu)
        except AttributeError:
            self.memory = 0
            self.cpu = 0

    def copy_myself(self, index: int):
        new_object = copy.deepcopy(self)
        new_object.set_hostname(self.vm_prefix, self.node_type, index)
        new_object.ip_address = IPAddressManager(self.network_id, self.network_block_index).get_next_node_address_v2(index)
        new_object.mac_address = str(RandMac(MAC_BASE)).strip("'")
        new_object.sensing_mac = str(RandMac(MAC_BASE)).strip("'")
        return new_object

    @classmethod
    def initalize_node_array(cls,
                             kit_settings: KitSettingsV2,
                             args: Namespace) -> List[Model]:
        ret_val = []
        for index in range(args.num_nodes):
            node = NodeSettingsV2(kit_settings)
            node.from_namespace(args, index)
            ret_val.append(node)

        return ret_val

    @classmethod
    def add_args(cls, parser: ArgumentParser):
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument('--node-type', dest='node_type',
                            required=True, help="The type of node",
                            choices=cls.NODE_TYPES)
        parser.add_argument('--deployment-type', dest='deployment_type',
                            required=True, help="The deployment type for node.",
                            choices=cls.DEPLOYMENT_TYPES)
        parser.add_argument('--vm-prefix', dest='vm_prefix', required=True, help="The prefix name of the VM(s)")
        parser.add_argument('--os-raid', dest='os_raid', default='no', help="Sets OS either enabled or disabled. Use yes|no when setting it.")
        parser.add_argument('--cpu', type=int, dest="cpu", choices=range(2, 64), required=True,
                            help="The default CPUs assigned to each server.")
        parser.add_argument('--memory', type=int, dest="memory", required=True,
                            help="The default amount of memory in mb assigned to each server.")
        parser.add_argument('--start-index', type=int, dest="start_index", required=True,
                            help="The index of the server or sensor.", default=1)
        parser.add_argument('--num-nodes', type=int, dest="num_nodes", required=True)
        parser.add_argument('--monitoring-interface', dest='monitoring_interface', required=False, \
                             default=["ens224"], nargs="+", help="The monitoring interfaces for the sensors.")


class HardwareNodeSettingsV2(NodeSettingsV2):

    def __init__(self, kit_settings: KitSettingsV2):
        super().__init__(kit_settings)
        self.redfish_user = ''
        self.redfish_password = ''
        self.system_model = ''
        self.cpu_model = ''
        self.sockets = 0
        self.vcpus = 0
        self.cores = 0
        self.raid_controller_health = ''
        self.raid_storage_tb = 0
        self.serial = ''
        self.sku = ''
        self.index = 0

    @classmethod
    def initalize_node_array(cls,
                             kit_settings: KitSettingsV2,
                             namespace: Namespace) -> List[Model]:
        ret_val = []
        idrac_ip_addresses = namespace.idrac_ip_addresses
        for index, idrac_ip in enumerate(namespace.idrac_ip_addresses):
            node = HardwareNodeSettingsV2(kit_settings)
            node.num_nodes = len(idrac_ip_addresses)
            actual_index = node.start_index + index
            node.from_namespace(namespace, idrac_ip, actual_index)
            ret_val.append(node)

        return ret_val

    def get_server_info(self):
        token = redfish.get_token(self.idrac_ip_address,
                                  self.redfish_user,
                                  self.redfish_password)
        info = redfish.server_info(self.idrac_ip_address, token)
        redfish.logout(token)
        return info

    def set_hostname(self):
        self.hostname = "{}{}.{}".format(self.node_type.lower(), self.index, self.domain)

    def set_ipaddress(self):
        ip_base = '.'.join(self.kit_settings.settings.gateway.split('.')[:-1]) + '.'
        last_octet = str(39 + self.index)
        self.ip_address = ip_base + last_octet

    @classmethod
    def set_idrac_values(cls, instance: Model):
        system_info = instance.get_server_info()
        logging.debug(system_info)
        instance.memory = system_info['memory_gb']
        instance.system_model = system_info['model']
        cpu_models = list(set( [x['model'] for x in system_info['processors']] ))
        cpu_models = cpu_models[0] if len(cpu_models) == 1 else cpu_models
        instance.cpu_model = cpu_models
        instance.sockets = len(system_info['processors'])
        instance.vcpus = system_info['vcpus']
        instance.cores = system_info['cores']
        instance.raid_controller_health = system_info['raid']['status']['Health']
        instance.raid_storage_tb = system_info['raid']['terabytes']
        instance.serial = system_info['serial']
        instance.sku = system_info['sku']
        instance.mac_address = system_info['pxe_mac']

    def from_namespace(self, namespace: Namespace, idrac_ip_address: str, index: int):
        self.start_index = namespace.start_index
        self.index = self.start_index + index
        self.dns_servers = namespace.dns_servers
        self.node_type = namespace.node_type
        self.monitoring_interfaces = namespace.monitoring_interface
        self.deployment_type = namespace.deployment_type
        self.idrac_ip_address = idrac_ip_address
        self.redfish_user = namespace.redfish_user
        self.redfish_password = self.b64decode_string(namespace.redfish_password)
        self.set_hostname()
        self.set_ipaddress()
        self.pxe_type = namespace.pxe_type
        self.set_idrac_values(self)

    def from_mongo(self, obj: Dict, redfish_username: str, redfish_password: str):
        super().from_mongo(obj)
        self.redfish_password = redfish_password
        self.redfish_user = redfish_username
        self.set_idrac_values(self)

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument('--node-type', dest='node_type',
                            required=True, help="The type of node",
                            choices=["Server", "Sensor", "Service"])
        parser.add_argument('--deployment-type', dest='deployment_type',
                            required=True, help="The deployment type for node.",
                            choices=["Baremetal"])
        parser.add_argument('--os-raid', dest='os_raid', default='no', help="Sets OS either enabled or disabled. Use yes|no when setting it.")
        parser.add_argument('--idrac-ip-addresses', dest="idrac_ip_addresses", help="The desired IP Address of the node.", required=True, nargs="+")
        parser.add_argument("--redfish-password", dest="redfish_password", help="The redfish password used for idrac out of band management.")
        parser.add_argument("--redfish-user", dest="redfish_user", help="The redfish username used for idrac out of band management", default="root")
        parser.add_argument('--start-index', type=int, dest="start_index", required=True,
                            help="The index of the server or sensor.", default=1)
        parser.add_argument('--pxe-type', dest='pxe_type', required=True, choices=["UEFI", "BIOS"], help="Sets the PXE type of the nodes being kickstarted.")
        parser.add_argument('--monitoring-interface', dest='monitoring_interface', required=False, \
                             default=["ens224"], nargs="+", help="The monitoring interfaces for the sensors.")


def load_control_plane_nodes_from_mongo(ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                                       kit_settings: KitSettingsV2) -> List[NodeSettingsV2]:
    ret_val = []
    with MongoConnectionManager(ctrl_settings.node.ipaddress) as mongo_manager:
        nodes = mongo_manager.mongo_node.find({})
        for node_obj in nodes: # type : Dict
            node = NodeSettingsV2(kit_settings)
            node.from_mongo(node_obj)
            if node.is_control_plane():
                ret_val.append(node)
    return ret_val


def get_control_plane_node(nodes: NodeSettingsV2) -> NodeSettingsV2:
    for node in nodes:
        if node.is_control_plane():
            return node
    raise Exception("Control plane node was not found.")