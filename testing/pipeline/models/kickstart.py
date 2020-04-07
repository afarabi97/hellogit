import random
from argparse import Namespace, ArgumentParser
from models import Model, add_args_from_instance
from models.common import VCenterSettings, NodeSettings
from util.network import IPAddressManager
from randmac import RandMac
from typing import Dict
from models.constants import SubCmd


class NodeNotFoundError(Exception):
    pass


class KickstartSettings(Model):
    def __init__(self):
        super().__init__()
        self.vcenter = None # type: VCenterSettings
        self.node_defaults = None # type: NodeSettings
        self.servers = [] # type: List[NodeSettings]
        self.sensors = [] # type: List[NodeSettings]
        self.nodes = [] # type: List[NodeSettings]
        self.num_servers = 0
        self.num_sensors = 0
        self.server_cpu = 0
        self.sensor_cpu = 0
        self.server_mem = 0
        self.sensor_mem = 0
        self.dhcp_ip_block = ''

    def _validate_params(self):
        if self.server_mem < 1024 or self.server_mem > 65536:
            raise ValueError("The command flag --server-mem {} is invalid. It must be greater than 1024 and less than 65536".format(self.server_mem))

        if self.sensor_mem < 1024 or self.sensor_mem > 65536:
            raise ValueError("The command flag --server-mem {} is invalid. It must be greater than 1024 and less than 65536".format(self.sensor_mem))

    def from_namespace(self, namespace: Namespace):
        self.num_servers = namespace.num_servers
        self.num_sensors = namespace.num_sensors
        self.server_cpu = namespace.server_cpu
        self.sensor_cpu = namespace.sensor_cpu
        self.server_mem = namespace.server_mem
        self.sensor_mem = namespace.sensor_mem
        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)
        self.node_defaults = NodeSettings()
        self.node_defaults.from_namespace(namespace)
        self.dhcp_ip_block = IPAddressManager(self.node_defaults.network_id, self.node_defaults.network_block_index).get_dhcp_ip_block()
        self._validate_params()

        for i in range(1, self.num_servers + 1):
            node = NodeSettings()
            node.set_from_defaults(self.node_defaults)
            node.set_hostname(self.node_defaults.vm_prefix, "server", i)
            if i == 1:
                node.set_for_kickstart(self.server_cpu, self.server_mem, NodeSettings.valid_node_types[0])
            else:
                node.set_for_kickstart(self.server_cpu, self.server_mem, NodeSettings.valid_node_types[4])
            self.servers.append(node)

        for i in range(1, self.num_sensors + 1):
            node = NodeSettings()
            node.set_from_defaults(self.node_defaults)
            node.set_hostname(self.node_defaults.vm_prefix, "sensor", i)
            node.set_for_kickstart(self.sensor_cpu, self.sensor_mem, NodeSettings.valid_node_types[3])
            self.sensors.append(node)

        self.nodes = self.sensors + self.servers

    def get_master_kubernetes_server(self) -> NodeSettings:
        for server in self.servers: # type: NodeSettings
            if server.node_type == NodeSettings.valid_node_types[0]:
                return server

        raise NodeNotFoundError("Failed to find the master Kubernetes server.")

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--num-servers', type=int, dest="num_servers", choices=range(2, 7), required=True,
                            help="The number of server VMs to create.")
        parser.add_argument('--num-sensors', type=int, dest="num_sensors", choices=range(1, 5), required=True,
                            help="The number of sensor VMs to create.")
        parser.add_argument('--server-cpu', type=int, dest="server_cpu", choices=range(2, 64), required=True,
                            help="The default CPUs assigned to each server.")
        parser.add_argument('--server-mem', type=int, dest="server_mem", required=True,
                            help="The default amount of memory in mb assigned to each server.")
        parser.add_argument('--sensor-cpu', type=int, dest="sensor_cpu", choices=range(2, 64), required=True,
                            help="The default CPUs assigned to each sensor.")
        parser.add_argument('--sensor-mem', type=int, dest="sensor_mem", required=True,
                            help="The default amount of memory in mb assigned to each sensor.")

        VCenterSettings.add_args(parser)
        NodeSettings.add_args(parser, False)


class MIPKickstartSettings(KickstartSettings):
    def __init__(self):
        super().__init__()
        self.dns = ''
        self.mips = [] # type: List[NodeSettings]

    def from_mip_namespace(self, namespace: Namespace):
        self.num_mips = namespace.num_mips
        self.mip_cpu = namespace.mip_cpu
        self.mip_mem = namespace.mip_mem

        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)
        self.node_defaults = NodeSettings()
        self.node_defaults.from_namespace(namespace)
        self.dhcp_ip_block = IPAddressManager(self.node_defaults.network_id, self.node_defaults.network_block_index).get_dhcp_ip_block()

        for i in range(1, self.num_mips + 1):
            node = NodeSettings()
            node.set_from_defaults(self.node_defaults)
            node.set_hostname(self.node_defaults.vm_prefix, "mip", i)
            node.set_for_kickstart(self.mip_cpu, self.mip_mem, NodeSettings.valid_node_types[5])
            self.mips.append(node)

    def add_mip_args(parser: ArgumentParser):
        parser.add_argument('--num-mips', type=int, dest="num_mips", choices=range(1, 15), required=True,
                            help="The number of mip VMs to create.")
        parser.add_argument('--mip-mem', type=int, dest="mip_mem", required=True,
                            help="The default amount of memory in mb assigned to each mip.")
        parser.add_argument('--mip-cpu', type=int, dest="mip_cpu", choices=range(2, 64), required=True,
                            help="The default CPUs assigned to each mip.")

        VCenterSettings.add_args(parser)
        NodeSettings.add_args(parser, False)
