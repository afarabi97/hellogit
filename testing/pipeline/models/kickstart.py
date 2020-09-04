import random
from argparse import Namespace, ArgumentParser
from models import Model, add_args_from_instance
from models.common import VCenterSettings, NodeSettings
from models.common import HwNodeSettings
from typing import Dict
from models.constants import SubCmd
from util.network import IPAddressManager
from util import redfish_util as redfish
import os

MEM_ERROR = "The command flag --server-mem {} is invalid. It must be greater than 1024 and less than 65536"

class NodeNotFoundError(Exception):
    pass

class HwKickstartSettings(Model):
    def __init__(self):
        super().__init__()
        self.server_oob = ''
        self.sensor_oob = ''
        self.node_defaults = None # type: NodeSettings
        self.servers = [] # type: List[HwNodeSettings]
        self.sensors = [] # type: List[HwNodeSettings]
        self.nodes = [] # type: List[HwNodeSettings]
        self.dhcp_ip_block = ''
        self.timezone = 'UTC'
        self.domain = ''
        self.upstream_dns = ''
        self.upstream_ntp = ''
        self.redfish_user = ''
        self.redfish_password = ''

    def _validate_params(self):
        pass

    def get_server_info(self, oob_ip, redfish_user, redfish_password ):
        token = redfish.get_token(oob_ip, redfish_user, redfish_password)
        info = redfish.server_info(oob_ip, token)
        redfish.logout(token)
        return info

    def from_namespace(self, namespace: Namespace):
        self.server_oob = namespace.server_oob
        self.sensor_oob = namespace.sensor_oob
        self.upstream_dns = namespace.upstream_dns
        self.upstream_ntp = namespace.upstream_ntp
        self.node_defaults = HwNodeSettings()
        self.node_defaults.from_namespace(namespace)
        self.domain = self.node_defaults.domain
        self.redfish_user = self.node_defaults.redfish_user
        self.redfish_password = self.node_defaults.redfish_password

        ip_base = '.'.join(namespace.gateway.split('.')[:-1]) + '.'
        self.dhcp_ip_block = ip_base + '192'

        first_sensor = None
        for i, oob_ip in enumerate(self.server_oob + self.sensor_oob):
            node = HwNodeSettings()
            node.set_from_defaults(self.node_defaults)
            node.oob_ip = oob_ip
            node.oob_user = self.redfish_user
            node.oob_password = self.redfish_password
            if oob_ip in self.server_oob:
                node.set_hostname('server', index=i)
                last_octet = str(40 + i)
                node.ipaddress = ip_base + last_octet
                node.node_type = 'server'
                if len(self.servers) == 0:
                    node.node_type = 'master_server'
            else:
                first_sensor = first_sensor or i
                sensor_index = i - first_sensor
                node.set_hostname('sensor', index=sensor_index)
                last_octet = str(50 + sensor_index)
                node.ipaddress = ip_base + last_octet
                node.node_type = 'sensor'
            print(node.hostname)
            print("Obtaining data from OOB IP: {}".format(oob_ip))
            system_info = self.get_server_info(oob_ip,self.redfish_user,self.redfish_password)
            node.memory_gb = system_info['memory_gb']
            node.system_model = system_info['model']
            cpu_models = list(set( [x['model'] for x in system_info['processors']] ))
            cpu_models = cpu_models[0] if len(cpu_models) == 1 else cpu_models
            node.cpu_model = cpu_models
            node.sockets = len(system_info['processors'])
            node.vcpus = system_info['vcpus']
            node.cores = system_info['cores']
            node.raid_controller_health = system_info['raid']['status']['Health']
            node.raid_storage_tb = system_info['raid']['terabytes']
            node.serial = system_info['serial']
            node.sku = system_info['sku']
            node.mng_mac = system_info['pxe_mac']
            if oob_ip in self.server_oob:
                self.servers.append(node)
            else:
                self.sensors.append(node)
            self.nodes.append(node)
            print(node)

        print("#" * 50)
        print("System summary")
        print("#" * 50)
        print("Servers: nodes {num_nodes} mem_gb {mem} storage_tb {storage} " \
                 "vcpus {vcpus} cores {cores} cpu_models: {cpu_model}".format(
            num_nodes=len(self.servers),
            mem=sum([x.memory_gb for x in self.servers]),
            storage=sum([x.raid_storage_tb for x in self.servers]),
            vcpus=sum([x.vcpus for x in self.servers]),
            cores=sum([x.cores for x in self.servers]),
            cpu_model=list(set([x.cpu_model for x in self.servers]))
        ))
        print("Sensors: nodes {num_nodes} mem_gb {mem} storage_tb {storage} " \
                 "vcpus {vcpus} cores {cores} cpu_models: {cpu_model}".format(
            num_nodes=len(self.sensors),
            mem=sum([x.memory_gb for x in self.sensors]),
            storage=sum([x.raid_storage_tb for x in self.sensors]),
            vcpus=sum([x.vcpus for x in self.sensors]),
            cores=sum([x.cores for x in self.sensors]),
            cpu_model=list(set([x.cpu_model for x in self.sensors]))
        ))

    def get_master_kubernetes_server(self) -> HwNodeSettings:
        for server in self.servers: # type: NodeSettings
            if server.node_type == NodeSettings.valid_node_types[0]:
                return server
        raise NodeNotFoundError("Failed to find the master Kubernetes server.")

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--timezone', type=str, dest="timezone", required=False, default="UTC",
                            help="The timezone for each node.")
        parser.add_argument("--server-oob", dest="server_oob", nargs="+", required=False,
                help="Out of band management ips for servers")
        parser.add_argument("--sensor-oob", dest="sensor_oob", nargs="+", required=False,
                help="Out of band management ips for servers")
        parser.add_argument('--upstream-dns', dest='upstream_dns', help="Set an upstream dns server ip")
        parser.add_argument('--upstream-ntp', dest='upstream_ntp', help="Set an upstream ntp server ip")

        HwNodeSettings.add_args(parser, False)

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
        self.timezone = 'UTC'
        self.upstream_dns = ''
        self.upstream_ntp = ''

    def _validate_params(self):
        if self.server_mem < 1024 or self.server_mem > 65536:
            raise ValueError(MEM_ERROR.format(self.server_mem))

        if self.sensor_mem < 1024 or self.sensor_mem > 65536:
            raise ValueError(MEM_ERROR.format(self.sensor_mem))

    def from_namespace(self, namespace: Namespace):
        self.timezone = namespace.timezone
        self.upstream_dns = namespace.upstream_dns
        self.upstream_ntp = namespace.upstream_ntp
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
        parser.add_argument('--timezone', type=str, dest="timezone", required=False, default="UTC",
                            help="The timezone for each node.")
        parser.add_argument('--upstream-dns', dest='upstream_dns', help="Set an upstream dns server ip")
        parser.add_argument('--upstream-ntp', dest='upstream_ntp', help="Set an upstream ntp server ip")

        VCenterSettings.add_args(parser)
        NodeSettings.add_args(parser, False)

class GIPKickstartSettings(KickstartSettings):
    def __init__(self):
        super().__init__()

    @staticmethod
    def add_args(parser: ArgumentParser):
        gip_kickstart_parser = parser.add_parser(SubCmd.run_gip_kickstart,
                                                      help="Executes Kickstart on a GIP controller.")
        gip_kickstart_parser.set_defaults(which=SubCmd.run_gip_kickstart)

        gip_kickstart_parser.add_argument('--num-servers', type=int, dest="num_servers", choices=range(2, 7), required=True,
                            help="The number of server VMs to create.")
        gip_kickstart_parser.add_argument('--server-cpu', type=int, dest="server_cpu", choices=range(2, 64), required=True,
                            help="The default CPUs assigned to each server.")
        gip_kickstart_parser.add_argument('--server-mem', type=int, dest="server_mem", required=True,
                            help="The default amount of memory in mb assigned to each server.")

        VCenterSettings.add_args(gip_kickstart_parser)
        NodeSettings.add_args(gip_kickstart_parser, False)

    def _validate_params(self):
        if self.server_mem < 1024 or self.server_mem > 65536:
            raise ValueError(MEM_ERROR.format(self.server_mem))

    def from_namespace(self, namespace: Namespace):
        self.num_servers = namespace.num_servers
        self.server_cpu = namespace.server_cpu
        self.server_mem = namespace.server_mem
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

        self.nodes = self.servers

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

    @staticmethod
    def add_mip_args(parser: ArgumentParser):
        parser.add_argument('--num-mips', type=int, dest="num_mips", choices=range(1, 15), required=True,
                            help="The number of mip VMs to create.")
        parser.add_argument('--mip-mem', type=int, dest="mip_mem", required=True,
                            help="The default amount of memory in mb assigned to each mip.")
        parser.add_argument('--mip-cpu', type=int, dest="mip_cpu", choices=range(2, 64), required=True,
                            help="The default CPUs assigned to each mip.")

        VCenterSettings.add_args(parser)
        NodeSettings.add_args(parser, False)
