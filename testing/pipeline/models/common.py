from argparse import Namespace, ArgumentParser
from models import Model
from util.network import IPAddressManager
from randmac import RandMac
from typing import Dict

MAC_BASE = "00:0a:29:00:00:00"

class NodeSettings(Model):
    unused_ips = None
    valid_node_types = ("master_server", "remote_sensor", "controller", "sensor", "server", "mip", "gipsvc", "rhel_work_station_repo", "rhel_server_repo", "minio")
    valid_sensor_types = ("remote_sensor", "sensor")
    valid_server_types = ("master_server", "server")
    valid_node_types_no_ctrl = valid_sensor_types + valid_server_types

    def __init__(self):
        self.cpu = 0
        self.dns_servers = []
        self.ipaddress = ''
        self.memory = 0
        self.netmask = ''
        self.portgroup = ''
        self.gateway = ''
        self.folder = ''
        self.password = ''
        self.template = ''
        self.datastore = ''
        self.username = 'root'
        self.hostname = ''
        self.vm_prefix = ''
        self.network_id = ''
        self.network_block_index = 0
        self.mng_mac = ''
        self.sensing_mac = ''
        self.node_type = self.valid_node_types[2]
        self.disk_size = 100
        self.luks_password = ''
        self.extra_disks = []
        self.domain = ''
        self.os_raid = False
        self.boot_mode = 'BIOS'
        self.monitoring_interface = ["ens224"]

    def set_hostname(self, vm_prefix: str, node_type: str="ctrl", index: int=0):
        if index == 0:
            self.hostname = "{}-{}.{}".format(vm_prefix, node_type, self.domain)
        else:
            self.hostname = "{}-{}{}.{}".format(vm_prefix, node_type, index, self.domain)

    def from_namespace(self, namespace: Namespace, node_type: str=None):
        self.dns_servers = namespace.dns_servers
        self.vm_prefix = namespace.vm_prefix
        self.domain = namespace.domain
        self.os_raid = namespace.os_raid == 'yes'

        if node_type:
            self.set_hostname(self.vm_prefix, node_type=node_type)
            self.node_type = node_type
        else:
            self.set_hostname(self.vm_prefix)

        try:
            self.memory = int(namespace.memory)
            self.cpu = int(namespace.cpu)
            self.template = namespace.template
        except AttributeError:
            self.memory = 0
            self.cpu = 0
            self.template = None

        self.luks_password = namespace.luks_password

        self.netmask = namespace.netmask
        self.portgroup = namespace.portgroup
        self.folder = namespace.folder
        self.password = self.b64decode_string(namespace.password)
        self.gateway = namespace.gateway

        self.datastore = namespace.datastore
        self.network_id = namespace.network_id
        self.network_block_index = namespace.network_block_index

        if node_type == 'minio':
            self.ipaddress = IPAddressManager(self.network_id, self.network_block_index).get_free_ip()
        else:
            self.ipaddress = IPAddressManager(self.network_id, self.network_block_index).get_next_node_address()

        self.mng_mac = str(RandMac(MAC_BASE)).strip("'")
        self.sensing_mac = str(RandMac(MAC_BASE)).strip("'")
        self.disk_size = namespace.disk_size
        self.extra_disks = namespace.extra_disks.copy()

    def set_for_kickstart(self, cpu: int, memory: int, node_type: str):
        self.cpu = cpu
        self.memory = memory
        self.mng_mac = str(RandMac(MAC_BASE)).strip("'")
        self.sensing_mac = str(RandMac(MAC_BASE)).strip("'")
        self.ipaddress = IPAddressManager(self.network_id, self.network_block_index).get_next_node_address()
        self.node_type = node_type

    def set_from_defaults(self, other):
        for key in self.__dict__:
            self.__dict__[key] = other.__dict__[key]

    @staticmethod
    def add_args(parser: ArgumentParser, is_for_ctrl_setup: bool=False):
        parser.add_argument("--vm-folder", dest="folder", required=True, help="The folder where all your VM(s) will be created within vsphere.")
        parser.add_argument("--vm-password", dest="password", help="The root password of the VM after it is cloned.", required=True)
        parser.add_argument("--portgroup", dest="portgroup", help="The managment network or portgroup name on the vsphere or esxi server.", required=True)
        parser.add_argument("--gateway", dest="gateway", help="The gateway ipaddress for the VM.", required=True)
        parser.add_argument("--netmask", dest="netmask", help="The network netmask needed for setting the management interface.", default="255.255.255.0")
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument('--vm-datastore', dest='datastore', required=True, help="The name of vsphere's datastore where it will be storing its VMs.")
        parser.add_argument("--network-id", dest="network_id", help="The network ID the application will be selecting IPs from.", required=True)
        parser.add_argument("--network-block-index", dest="network_block_index", help="The network block index to use. If left as default it will default to 0 which uses 96 as the last octet. [81, 113, 145, 177, 209]",
                            default=0, choices=range(0, 5), type=int)
        parser.add_argument('--vm-prefix', dest='vm_prefix', required=True, help="The prefix name of the VM(s)")
        parser.add_argument('--domain', dest='domain', required=False, help="The kit domain", default="lan")
        parser.add_argument("--disk-size", dest="disk_size", type=int, help="The size of the VM's first disk.", default=100)
        parser.add_argument('--extra-disk', dest='extra_disks', action='append', required=False, default=[])
        parser.add_argument("--luks-password", dest="luks_password", type=str, help="The password used for disk encryption.", default='default')
        parser.add_argument('--os-raid', dest='os_raid', default='no', help="Sets OS either enabled or disabled. Use yes|no when setting it.")

        if is_for_ctrl_setup:
            parser.add_argument('--vm-template', dest='template', required=True, help="The name of the VM or Template to clone from.")
            parser.add_argument("--ctrl-cpu", dest="cpu", help="The default number of CPU cores to assign to the VM(s).", default="8")
            parser.add_argument("--ctrl-memory", dest="memory", help="The default amount of memory to assign to the VM(s)", default="16384")


class HwNodeSettings(Model):
    unused_ips = None
    valid_node_types = ("master_server", "remote_sensor", "controller", "sensor", "server", "mip", "gipsvc", "rhel_work_station_repo", "rhel_server_repo")
    valid_sensor_types = ("remote_sensor", "sensor")
    valid_server_types = ("master_server", "server")
    valid_node_types_no_ctrl = valid_sensor_types + valid_server_types

    def __init__(self):
        self.ctrl_path = ''
        self.ctrl_name = ''
        self.username = 'root'
        self.password = ''
        self.hostname = ''
        self.domain = 'lan'
        self.dns_servers = []
        self.template_path = ''
        self.mng_mac = ''
        self.mng_interface = ''
        self.sensing_mac = ''
        self.sensing_interface = ''
        self.node_type = ''
        self.memory_gb = 0
        self.system_model = ''
        self.cpu_manufacturer = ''
        self.cpu_model = ''
        self.sockets = ''
        self.cores = 0
        self.vcpus = 0
        self.raid_controller_health = ''
        self.raid_storage_tb = 0
        self.serial = ''
        self.sku = ''
        self.oob_ip = ''
        self.oob_user = ''
        self.oob_password = ''
        self.ipaddress = ''
        self.boot_mode = 'UEFI'
        self.redfish_user = ''
        self.redfish_password = ''
        self.os_raid = False
        self.monitoring_interface = ''

    def set_hostname(self, node_type: str="ctrl", index: int=0):
        self.hostname = "{}{}.{}".format(node_type, index + 1, self.domain)

    def from_namespace(self, namespace: Namespace, node_type: str=None):
        self.dns_servers = namespace.dns_servers

        if node_type:
            self.set_hostname(node_type=node_type)
            self.node_type = node_type

        if namespace.redfish_password == None:
            self.redfish_password = " "
        else:
            self.redfish_password = self.b64decode_string(namespace.redfish_password)

        self.domain = namespace.domain
        self.ipaddress = namespace.ipaddress
        self.gateway = namespace.gateway
        self.netmask = namespace.netmask
        self.username = namespace.username or self.username
        self.password = self.b64decode_string(namespace.password)
        self.datastore = namespace.datastore
        self.ctrl_path = namespace.ctrl_path
        self.ctrl_name = namespace.ctrl_name
        self.template_path = namespace.template_path
        self.template = namespace.template
        self.redfish_user = namespace.redfish_user
        self.monitoring_interface = namespace.monitoring_interface

    @staticmethod
    def add_args(parser: ArgumentParser, is_for_ctrl_setup: bool=False):
        parser.add_argument("--ctrl-path", dest="ctrl_path", required=True, help="ctrl_path where controller ova is stored")
        parser.add_argument("--ctrl-name", dest="ctrl_name", required=True, help="Name of controller ova")
        parser.add_argument("--template-path", dest="template_path", required=True, help="where controller template is stored")
        parser.add_argument("--template", dest="template", required=True, help="Name of controller template")
        parser.add_argument('--vm-datastore', dest='datastore', required=True, help="The name of vsphere's datastore where it will be storing its VMs.")
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument("--gateway", dest="gateway", help="The gateway ipaddress for the VM.", required=True)
        parser.add_argument("--netmask", dest="netmask", help="The network netmask needed for setting the management interface.", default="255.255.255.0")
        parser.add_argument("--ipaddress", dest="ipaddress", help="ipaddress for the controller.", required=True)
        parser.add_argument("--node-username", dest="username", help="The username for ctrl and node.", default="root")
        parser.add_argument("--node-password", dest="password", help="The root password for ctrl and node.", required=True)
        parser.add_argument("--domain", dest="domain", help="The domain for the kit", default="lan")
        parser.add_argument("--redfish-password", dest="redfish_password", help="The redfish password")
        parser.add_argument("--redfish-user", dest="redfish_user", help="The redfish username", default="root")
        parser.add_argument("--monitoring-interface", dest="monitoring_interface", nargs= "+", help="sensor monitoring interface")

    def set_from_defaults(self, other):
        for key in self.__dict__:
            self.__dict__[key] = other.__dict__[key]


class VCenterSettings(Model):

    def __init__(self):
        self.password = ''
        self.username = ''
        self.ipaddress = ''
        self.datacenter = ''
        self.cluster = 'DEV_Cluster'

    def from_namespace(self, namespace: Namespace):
        self.password = self.b64decode_string(namespace.vcenter_password)
        self.username = namespace.vcenter_username
        self.ipaddress = namespace.vcenter_ipaddress
        self.datacenter = namespace.vcenter_datacenter

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--vcenter-ipaddress", dest="vcenter_ipaddress", required=False,
                            help="A vcenter ip address.", default="10.10.103.10")
        parser.add_argument("--vcenter-username", dest="vcenter_username", required=True,
                            help="A username to the vcenter hosted on our local network.")
        parser.add_argument("--vcenter-password", dest="vcenter_password", required=True,
                            help="A password to the vcenter hosted on our local network.")
        parser.add_argument("--vcenter-datacenter", dest="vcenter_datacenter", required=False,
                            help="The data center to use on vsphere.", default="DEV_Datacenter")

class ESXiSettings(Model):

    def __init__(self):
        self.password = ''
        self.username = ''
        self.ipaddress = ''

    def from_namespace(self, namespace: Namespace):
        self.password = self.b64decode_string(namespace.esxi_password)
        self.username = namespace.esxi_username
        self.ipaddress = namespace.esxi_ipaddress

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--esxi-ipaddress", dest="esxi_ipaddress", required=True,
                            help="A esxi ip address.")
        parser.add_argument("--esxi-username", dest="esxi_username", required=True,
                            help="A username to the esxi hosted on our local network.")
        parser.add_argument("--esxi-password", dest="esxi_password", required=True,
                            help="A password to the esxi hosted on our local network.")

class RepoSettings(Model):

    def __init__(self):
        self.password = ''
        self.username = ''
        self.url = ''
        self.branch_name = ''

    def from_namespace(self, namespace: Namespace):
        self.password = self.b64decode_string(namespace.repo_password)
        self.username = namespace.repo_username
        self.branch_name = namespace.repo_branch_name
        self.url = namespace.repo_url

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--repo-username", dest="repo_username", required=True,
                            help="A username to the DI2E git repo.")
        parser.add_argument("--repo-password", dest="repo_password", required=True,
                            help="A password to the DI2E git repo.")
        parser.add_argument('--branch-name', dest='repo_branch_name', required=True,
                            help="The branch name bootstrap will use when setting up the controller.")
        parser.add_argument('--repo-url', dest='repo_url', required=True,
                            help="The branch name bootstrap will use when setting up the controller.")

    # def __getstate__(self):
    #     result = self.__dict__.copy()
    #     result['password'] = u'<REDACTED>'
    #     return result

class BasicNodeCreds(Model):
    def __init__(self):
        self.username = ''
        self.password = ''
        self.ipaddress = ''

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self.password = self.b64decode_string(namespace.password)
