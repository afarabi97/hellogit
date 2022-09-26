from argparse import Namespace, ArgumentParser
from models import Model
from util.network import IPAddressManager
from randmac import RandMac
from typing import Dict

MAC_BASE = "00:0a:29:00:00:00"


class NodeSettings(Model):
    unused_ips = None
    valid_node_types = ("primary_server", "remote_sensor", "controller", "sensor", "server", "control_plane", "mip", "gipsvc", "rhel_repo", "minio", "service_node")
    valid_sensor_types = ("remote_sensor", "sensor")
    valid_server_types = ("primary_server", "server", "control_plane", "service_node")
    valid_node_types_no_ctrl = valid_sensor_types + valid_server_types

    def __init__(self):
        self.boot_mode = 'BIOS'
        self.commit_hash = ''
        self.cpu = 0
        self.datastore = ''
        self.disk_size = 100
        self.dns_servers = []
        self.domain = ''
        self.export_password = ''
        self.extra_disks = []
        self.folder = ''
        self.gateway = ''
        self.hostname = ''
        self.ipaddress = ''
        self.luks_password = ''
        self.memory = 0
        self.mip_username = 'assessor'
        self.mng_mac = ''
        self.netmask = ''
        self.network_block_index = 0
        self.network_id = ''
        self.node_type = self.valid_node_types[2]
        self.os_raid = False
        self.password = ''
        self.pipeline = ''
        self.portgroup = ''
        self.sensing_mac = ''
        self.service_node = False
        self.staging_export_path = ''
        self.template = ''
        self.username = 'root'
        self.vm_prefix = ''

    def is_mip(self) -> bool:
        return self.node_type == self.valid_node_types[6]

    def set_hostname(self, vm_prefix: str, node_type: str="ctrl", index: int=0):
        if index == 0:
            self.hostname = "{}-{}.{}".format(vm_prefix, node_type, self.domain)
        else:
            self.hostname = "{}-{}{}.{}".format(vm_prefix, node_type, index, self.domain)

    def from_namespace(self, namespace: Namespace, node_type: str=None):
        self.dns_servers = namespace.dns_servers
        self.domain = namespace.domain
        self.os_raid = namespace.os_raid == 'yes'
        self.service_node = namespace.service_node == 'yes'
        self.vm_prefix = namespace.vm_prefix

        if node_type:
            self.set_hostname(self.vm_prefix, node_type=node_type)
            self.node_type = node_type
        else:
            self.set_hostname(self.vm_prefix)

        try:
            self.cpu = int(namespace.cpu)
            self.memory = int(namespace.memory)
            self.template = namespace.template
        except AttributeError:
            self.cpu = 0
            self.memory = 0
            self.template = None

        self.datastore = namespace.datastore
        self.export_password = self.b64decode_string(namespace.export_password)
        self.folder = namespace.folder
        self.gateway = namespace.gateway
        self.luks_password = namespace.luks_password
        self.netmask = namespace.netmask
        self.network_block_index = namespace.network_block_index
        self.network_id = namespace.network_id
        self.password = self.b64decode_string(namespace.password)
        self.portgroup = namespace.portgroup

        if node_type == 'minio':
            self.ipaddress = IPAddressManager(self.network_id, self.network_block_index).get_free_ip()
        else:
            self.ipaddress = IPAddressManager(self.network_id, self.network_block_index).get_next_node_address()

        self.mng_mac = str(RandMac(MAC_BASE)).strip("'")
        self.sensing_mac = str(RandMac(MAC_BASE)).strip("'")
        self.disk_size = namespace.disk_size
        self.extra_disks = namespace.extra_disks.copy()
        self.pipeline = namespace.pipeline
        self.commit_hash = namespace.commit_hash

    def set_for_kickstart(self, cpu: int, memory: int, node_type: str):
        self.cpu = cpu
        self.ipaddress = IPAddressManager(self.network_id, self.network_block_index).get_next_node_address()
        self.memory = memory
        self.mng_mac = str(RandMac(MAC_BASE)).strip("'")
        self.node_type = node_type
        self.sensing_mac = str(RandMac(MAC_BASE)).strip("'")

    def set_from_defaults(self, other):
        for key in self.__dict__:
            self.__dict__[key] = other.__dict__[key]

    @staticmethod
    def add_args(parser: ArgumentParser, is_for_ctrl_setup: bool=False):
        parser.add_argument("--commit-hash", dest="commit_hash", required=False)
        parser.add_argument("--disk-size", dest="disk_size", type=int, help="The size of the VM's first disk.", default=100)
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument('--domain', dest='domain', required=False, help="The kit domain", default="lan")
        parser.add_argument("--export-password", dest="export_password", help="The root password set during export.", required=True)
        parser.add_argument('--extra-disk', dest='extra_disks', action='append', required=False, default=[])
        parser.add_argument("--gateway", dest="gateway", help="The gateway ipaddress for the VM.", required=True)
        parser.add_argument("--luks-password", dest="luks_password", type=str, help="The password used for disk encryption.", default='1qaz2wsx!QAZ@WSX')
        parser.add_argument("--netmask", dest="netmask", help="The network netmask needed for setting the management interface.", default="255.255.255.0")
        parser.add_argument("--network-block-index", dest="network_block_index",
                            help="The network block index to use. If left as default it will default to 1 which uses 64 as the last octet. [64, 128, 192]",
                            default=0, choices=range(0, 3), type=int)
        parser.add_argument("--network-id", dest="network_id", help="The network ID the application will be selecting IPs from.", required=True)
        parser.add_argument('--os-raid', dest='os_raid', default='no', help="Sets OS either enabled or disabled. Use yes|no when setting it.")
        parser.add_argument("--pipeline", dest="pipeline", required=False, default="developer-all")
        parser.add_argument("--portgroup", dest="portgroup", help="The managment network or portgroup name on the vsphere or esxi server.", required=True)
        parser.add_argument('--service-node', dest="service_node", type=str, default='no', help="Create a service node to run catalog apps.")
        parser.add_argument('--staging-export-path', dest="staging_export_path", type=str, default='/staging', help="Specifies the STAGING directory to use.")
        parser.add_argument('--vm-datastore', dest='datastore', required=True, help="The name of vsphere's datastore where it will be storing its VMs.")
        parser.add_argument("--vm-folder", dest="folder", required=True, help="The folder where all your VM(s) will be created within vsphere.")
        parser.add_argument("--vm-password", dest="password", help="The root password of the VM after it is cloned.", required=True)
        parser.add_argument('--vm-prefix', dest='vm_prefix', required=True, help="The prefix name of the VM(s)")

        if is_for_ctrl_setup:
            parser.add_argument("--ctrl-cpu", dest="cpu", help="The default number of CPU cores to assign to the VM(s).", default="8")
            parser.add_argument("--ctrl-memory", dest="memory", help="The default amount of memory to assign to the VM(s)", default="16384")
            parser.add_argument('--vm-template', dest='template', required=True, help="The name of the VM or Template to clone from.")


class HwNodeSettings(Model):
    unused_ips = None
    valid_node_types = ("primary_server", "remote_sensor", "controller", "sensor", "server", "mip", "gipsvc", "rhel_repo")
    valid_sensor_types = ("remote_sensor", "sensor")
    valid_server_types = ("primary_server", "server")
    valid_node_types_no_ctrl = valid_sensor_types + valid_server_types

    def __init__(self):
        self.boot_mode = 'UEFI'
        self.build_from_release = ''
        self.cores = 0
        self.cpu_manufacturer = ''
        self.cpu_model = ''
        self.ctrl_owner = ""
        self.dns_servers = []
        self.domain = 'lan'
        self.hostname = ''
        self.ipaddress = ''
        self.luks_password = ''
        self.memory_gb = 0
        self.mng_interface = ''
        self.mng_mac = ''
        self.network_block_index = 0
        self.network_id = ''
        self.node_type = ''
        self.oob_ip = ''
        self.oob_password = ''
        self.oob_user = ''
        self.os_raid = False
        self.password = ''
        self.raid_controller_health = ''
        self.raid_storage_tb = 0
        self.redfish_password = ''
        self.redfish_user = ''
        self.release_ova = ''
        self.release_path = ''
        self.sensing_interface = ''
        self.sensing_mac = ''
        self.serial = ''
        self.sku = ''
        self.sockets = ''
        self.staging_export_path=''
        self.system_model = ''
        self.template_path = ''
        self.username = 'root'
        self.vcpus = 0

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

        self.build_from_release = namespace.build_from_release == "yes"
        self.datastore = namespace.datastore
        self.domain = namespace.domain
        self.gateway = namespace.gateway
        self.netmask = namespace.netmask
        self.password = self.b64decode_string(namespace.password)
        self.redfish_user = namespace.redfish_user
        self.release_ova = namespace.release_ova
        self.release_path = namespace.release_path
        self.template = namespace.template
        self.template_path = namespace.template_path
        self.username = namespace.username or self.username
        if self.node_type == 'mip':
            self.network_id = namespace.network_id
            self.network_block_index = namespace.network_block_index
            self.ipaddress = IPAddressManager(self.network_id, self.network_block_index).get_next_node_address()
            self.ctrl_owner = namespace.ctrl_owner + '-'
        else:
            self.ipaddress = namespace.ipaddress

    @staticmethod
    def add_args(parser: ArgumentParser, is_for_ctrl_setup: bool=False):
        parser.add_argument('--build-from-release', dest='build_from_release', default="no", help="Build kit from pre-existing controller")
        parser.add_argument('--ctrl-owner', dest='ctrl_owner', default="default", help="The name of the person who created the controller.")
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument("--domain", dest="domain", help="The domain for the kit", default="lan")
        parser.add_argument("--gateway", dest="gateway", help="The gateway ipaddress for the VM.", required=True)
        parser.add_argument("--ipaddress", dest="ipaddress", help="ipaddress for the controller.")
        parser.add_argument("--netmask", dest="netmask", help="The network netmask needed for setting the management interface.", default="255.255.255.0")
        parser.add_argument("--network-block-index", dest="network_block_index",
                            help="The network block index to use. If left as default it will default to 1 which uses 64 as the last octet. [64, 128, 192]",
                            default=0, choices=range(0, 3), type=int)
        parser.add_argument("--network-id", dest="network_id", help="The network ID the application will be selecting IPs from.")
        parser.add_argument("--node-password", dest="password", help="The root password for ctrl and node.", required=True)
        parser.add_argument("--node-username", dest="username", help="The username for ctrl and node.", default="root")
        parser.add_argument("--redfish-password", dest="redfish_password", help="The redfish password")
        parser.add_argument("--redfish-user", dest="redfish_user", help="The redfish username", default="root")
        parser.add_argument("--release-ova", dest="release_ova", required=False, help="Name of release ova")
        parser.add_argument("--release-path", dest="release_path", required=False, help="where release controller is stored")
        parser.add_argument('--staging-export-path', dest="staging_export_path", type=str, default='/staging', help="Specifies the STAGING directory to use.")
        parser.add_argument("--template", dest="template", required=True, help="Name of controller template")
        parser.add_argument("--template-path", dest="template_path", required=True, help="where controller template is stored")
        parser.add_argument('--vm-datastore', dest='datastore', required=True, help="The name of vsphere's datastore where it will be storing its VMs.")

    def set_from_defaults(self, other):
        for key in self.__dict__:
            self.__dict__[key] = other.__dict__[key]

    def set_from_dict(self, other):
        for key in other:
            self.__dict__[key] = other[key]


class VCenterSettings(Model):

    def __init__(self):
        self.cluster = None
        self.datacenter = None
        self.datastore = ''
        self.folder = None
        self.ipaddress = ''
        self.password = ''
        self.portgroup = ''
        self.username = ''

    def from_namespace(self, namespace: Namespace):
        self.cluster = namespace.vcenter_cluster
        self.datacenter = namespace.vcenter_datacenter
        self.datastore = namespace.vcenter_datastore
        self.folder = namespace.vcenter_folder
        self.ipaddress = namespace.vcenter_ipaddress
        self.password = self.b64decode_string(namespace.vcenter_password)
        self.portgroup = namespace.vcenter_portgroup
        self.username = namespace.vcenter_username

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--vcenter-cluster", dest="vcenter_cluster", required=False,help="The cluster to use on vsphere.", default=None)
        parser.add_argument("--vcenter-datacenter", dest="vcenter_datacenter", required=False, help="The data center to use on vsphere.", default=None)
        parser.add_argument("--vcenter-datastore", dest="vcenter_datastore", required=False, help="The datastore to use on vsphere.", default="DEV-vSAN")
        parser.add_argument("--vcenter-folder", dest="vcenter_folder", required=False, help="The folder to use on vsphere.", default=None)
        parser.add_argument("--vcenter-ipaddress", dest="vcenter_ipaddress", required=False, help="A vcenter ip address.", default="10.10.103.10")
        parser.add_argument("--vcenter-password", dest="vcenter_password", required=True, help="A password to the vcenter hosted on our local network.")
        parser.add_argument("--vcenter-portgroup", dest="vcenter_portgroup", required=False,help="The distributed portgroup to use on vsphere.", default="Interal")
        parser.add_argument("--vcenter-username", dest="vcenter_username", required=True, help="A username to the vcenter hosted on our local network.")


class ESXiSettings(Model):

    def __init__(self):
        self.ipaddress = ''
        self.password = ''
        self.username = ''

    def from_namespace(self, namespace: Namespace):
        self.ipaddress = namespace.esxi_ipaddress
        self.password = self.b64decode_string(namespace.esxi_password)
        self.username = namespace.esxi_username

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--esxi-ipaddress", dest="esxi_ipaddress", required=True, help="A esxi ip address.")
        parser.add_argument("--esxi-password", dest="esxi_password", required=True, help="A password to the esxi hosted on our local network.")
        parser.add_argument("--esxi-username", dest="esxi_username", required=True, help="A username to the esxi hosted on our local network.")


class RepoSettings(Model):

    def __init__(self):
        self.access_token = ''
        self.branch_name = ''
        self.password = ''
        self.project_id = 1
        self.url = ''
        self.username = ''

    def from_namespace(self, namespace: Namespace):
        self.access_token = namespace.access_token
        self.branch_name = namespace.repo_branch_name
        self.password = self.b64decode_string(namespace.repo_password)
        self.project_id = namespace.project_id
        self.url = namespace.repo_url
        self.username = namespace.repo_username

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--access-token", dest="access_token", required=True)
        parser.add_argument('--branch-name', dest='repo_branch_name', required=True, help="The branch name bootstrap will use when setting up the controller.")
        parser.add_argument("--project-id", dest="project_id", required=True)
        parser.add_argument("--repo-password", dest="repo_password", required=True, help="A password to the DI2E git repo.")
        parser.add_argument('--repo-url', dest='repo_url', required=True, help="The branch name bootstrap will use when setting up the controller.")
        parser.add_argument("--repo-username", dest="repo_username", required=True, help="A username to the DI2E git repo.")


class BasicNodeCreds(Model):
    def __init__(self):
        self.ipaddress = ''
        self.password = ''
        self.username = ''

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self.password = self.b64decode_string(namespace.password)
