import random
from argparse import Namespace, ArgumentParser
from models import Model, add_args_from_instance
from util.network import IPAddressManager
from randmac import RandMac
from typing import Dict
from models.constants import SubCmd


class NodeNotFoundError(Exception):
    pass


class NodeSettings(Model):
    unused_ips = None
    valid_node_types = ("master_server", "remote_sensor", "controller", "sensor", "server")
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
        self.mng_mac = ''
        self.sensing_mac = ''
        self.node_type = self.valid_node_types[2]

    def set_hostname(self, vm_prefix: str, node_type: str="ctrl", index: int=0):
        if index == 0:
            self.hostname = "{}-{}.lan".format(vm_prefix, node_type)
        else:
            self.hostname = "{}-{}{}.lan".format(vm_prefix, node_type, index)

    def from_namespace(self, namespace: Namespace):
        self.dns_servers = namespace.dns_servers
        self.vm_prefix = namespace.vm_prefix
        self.set_hostname(self.vm_prefix)

        try:
            self.memory = int(namespace.memory)
            self.cpu = int(namespace.cpu)
            self.template = namespace.template
        except AttributeError:
            self.memory = 0
            self.cpu = 0
            self.template = None

        self.netmask = namespace.netmask
        self.portgroup = namespace.portgroup
        self.folder = namespace.folder
        self.password = self.b64decode_string(namespace.password)
        self.gateway = namespace.gateway

        self.datastore = namespace.datastore
        self.network_id = namespace.network_id
        self.ipaddress = IPAddressManager(self.network_id, self.netmask).get_unused_ipaddress()

        self.mng_mac = str(RandMac("00:0a:29:00:00:00")).strip("'")
        self.sensing_mac = str(RandMac("00:0a:29:00:00:00")).strip("'")

    def set_for_kickstart(self, cpu: int, memory: int, node_type: str):
        self.cpu = cpu
        self.memory = memory
        self.mng_mac = str(RandMac("00:0a:29:00:00:00")).strip("'")
        self.sensing_mac = str(RandMac("00:0a:29:00:00:00")).strip("'")
        self.ipaddress = IPAddressManager(self.network_id, self.netmask).get_unused_ipaddress()
        self.node_type = node_type

    def set_from_defaults(self, other):
        for key in self.__dict__:
            self.__dict__[key] = other.__dict__[key]

    @staticmethod
    def add_args(parser: ArgumentParser, is_for_ctrl_setup: bool=False):
        parser.add_argument("--vm-folder", dest="folder", required=True, help="The folder where all your VM(s) will be created within vsphere.")
        parser.add_argument("--vm-password", dest="password", help="The root password of the VM after it is cloned.", default="d2UuYXJlLnRmcGxlbnVt")
        parser.add_argument("--portgroup", dest="portgroup", help="The managment network or portgroup name on the vsphere or esxi server.", required=True)
        parser.add_argument("--gateway", dest="gateway", help="The gateway ipaddress for the VM.", required=True)
        parser.add_argument("--netmask", dest="netmask", help="The network netmask needed for setting the management interface.", default="255.255.255.0")
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument('--vm-datastore', dest='datastore', required=True, help="The name of vsphere's datastore where it will be storing its VMs.")
        parser.add_argument("--network-id", dest="network_id", help="The network ID the application will be selecting IPs from.", required=True)
        parser.add_argument('--vm-prefix', dest='vm_prefix', required=True, help="The prefix name of the VM(s)")

        if is_for_ctrl_setup:
            parser.add_argument('--vm-template', dest='template', required=True, help="The name of the VM or Template to clone from.")
            parser.add_argument("--cpu", dest="cpu", help="The default number of CPU cores to assign to the VM(s).", default="4")
            parser.add_argument("--memory", dest="memory", help="The default amount of memory to assign to the VM(s)", default="4096")



class VCenterSettings(Model):

    def __init__(self):
        self.password = ''
        self.username = ''
        self.ipaddress = ''
        self.datacenter = ''

    def from_namespace(self, namespace: Namespace):
        self.password = self.b64decode_string(namespace.vcenter_password)
        self.username = namespace.vcenter_username
        self.ipaddress = namespace.vcenter_ipaddress
        self.datacenter = namespace.vcenter_datacenter

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--vcenter-ipaddress", dest="vcenter_ipaddress", required=True,
                            help="A vcenter ip address.")
        parser.add_argument("--vcenter-username", dest="vcenter_username", required=True,
                            help="A username to the vcenter hosted on our local network.")
        parser.add_argument("--vcenter-password", dest="vcenter_password", required=True,
                            help="A password to the vcenter hosted on our local network.")
        parser.add_argument("--vcenter-datacenter", dest="vcenter_datacenter", required=True,
                            help="The data center to use on vsphere.")


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
        self.dhcp_ip_block = IPAddressManager(self.node_defaults.network_id, self.node_defaults.netmask).get_unused_ip_block()
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
        parser.add_argument('--num-servers', type=int, dest="num_servers", choices=range(2, 5), required=True,
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


class ControllerSetupSettings(Model):
    valid_run_types = ("build_from_scratch", "clone_from_nightly")

    def __init__(self):
        super().__init__()
        self.run_type = ''
        self.node = None # type: NodeSettings
        self.vcenter = None # type: VCenterSettings
        self.repo = None # type: RepoSettings

    def _validate_settings(self):
        if self.run_type not in self.valid_run_types:
            raise ValueError("The command flag --run-type {} is invalid it must be one of {}".format(self.run_type, str(valid_run_types)))

    def from_namespace(self, namespace: Namespace):
        self.rhel_source_repo = namespace.rhel_source_repo
        self.run_type = namespace.run_type

        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)

        self.node = NodeSettings()
        self.node.from_namespace(namespace)

        self.repo = RepoSettings()
        self.repo.from_namespace(namespace)

        self._validate_settings()

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--run-type', dest='run_type', required=True,
                            help="You should either pass clone_from_nightly or build_from_scratch.")
        parser.add_argument('--rhel-source-repo', dest='rhel_source_repo', default="labrepo",
                            help="Use labrepo for SIL network otherwise pass in public.")
        VCenterSettings.add_args(parser)
        RepoSettings.add_args(parser)
        NodeSettings.add_args(parser, True)


class KitSettings(Model):

    def __init__(self):
        super().__init__()
        self.kubernetes_cidr = ''

    @staticmethod
    def add_args(parser: ArgumentParser):
        pass


    def from_kickstart(self, kickstart_settings: KickstartSettings):
       self.kubernetes_cidr = IPAddressManager(kickstart_settings.node_defaults.network_id, kickstart_settings.node_defaults.netmask).get_unused_ip_block()


class SuricataSettings(Model):
    def __init__(self):
        self.affinity_hostname = ""
        self.cpu_request = 1000
        self.deployment_name = ""
        self.external_net = ["any"]
        self.home_net = ["any"]
        self.interfaces = ["ens224"]
        self.pcapEnabled = True
        self.suricata_threads = 2
        self.node_hostname = ""

    def set_from_node_settings(self, node_settings: NodeSettings):
        self.affinity_hostname = node_settings.hostname
        self.deployment_name = node_settings.hostname.replace(".lan", "-suricata")
        self.node_hostname = node_settings.hostname


class MolochCaptureSettings(Model):
    def __init__(self):
        self.cpu_request = 1000
        self.pcapWriteMethod = "simple"
        self.affinity_hostname = ""
        self.node_hostname = ""
        self.bpf = ""
        self.dontSaveBPFs = ""
        self.freespaceG = "25%"
        self.maxFileSizeG = 25
        self.magicMode = "basic"
        self.interfaces = ["ens224"]
        self.deployment_name = ""

    def set_from_node_settings(self, node_settings: NodeSettings):
        self.affinity_hostname = node_settings.hostname
        self.deployment_name = node_settings.hostname.replace(".lan", "-moloch")
        self.node_hostname = node_settings.hostname


class MolochViewerSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.user = "assessor"
        self.password = "password"
        self.deployment_name = "server-moloch-viewer"

    def to_dict(self) -> Dict:
        moloch_dict = super().to_dict()
        cache = moloch_dict["password"]
        del moloch_dict["password"]
        moloch_dict["pass"] = cache
        return moloch_dict


class ZeekSettings(Model):
    def __init__(self):
        self.affinity_hostname = ""
        self.cpu_request = "1000"
        self.deployment_name = ""
        self.home_net = ["any"]
        self.interfaces = ["ens224"]
        self.zeek_workers = 4
        self.node_hostname = ""
        self.log_retention_hours = "24"

    def set_from_node_settings(self, node_settings: NodeSettings):
        self.affinity_hostname = node_settings.hostname
        self.deployment_name = node_settings.hostname.replace(".lan", "-zeek")
        self.node_hostname = node_settings.hostname


class LogstashSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.kafka_clusters = []
        self.replicas = 2
        self.heap_size = 4
        self.deployment_name = "server-logstash"

    def set_from_kickstart(self, kickstart_settings: KickstartSettings):
        self.kafka_clusters = []
        for sensor in kickstart_settings.sensors: # type: NodeSettings
            self.kafka_clusters.append(sensor.hostname.replace(".lan", "-zeek") + ".default.svc.cluster.local:9092")


class CatalogSettings(Model):

    def __init__(self):
        self.suricata_settings = dict()
        self.moloch_capture_settings = dict()
        self.zeek_settings = dict()
        self.moloch_viewer_settings = None # type: MolochViewerSettings
        self.logstash_settings = None # type: LogstashSettings

    def set_from_kickstart(self,
                           kickstart_settings: KickstartSettings,
                           namespace: Namespace):
        for sensor in kickstart_settings.sensors:
            if namespace.which == SubCmd.suricata:
                suricata_settings = SuricataSettings()
                suricata_settings.set_from_node_settings(sensor)
                suricata_settings.from_namespace(namespace)
                self.suricata_settings[sensor.hostname] = suricata_settings

            if namespace.which == SubCmd.moloch_capture:
                moloch_capture_settings = MolochCaptureSettings()
                moloch_capture_settings.set_from_node_settings(sensor)
                moloch_capture_settings.from_namespace(namespace)
                self.moloch_capture_settings[sensor.hostname] = moloch_capture_settings

            if namespace.which == SubCmd.zeek:
                zeek_settings = ZeekSettings()
                zeek_settings.set_from_node_settings(sensor)
                zeek_settings.from_namespace(namespace)
                self.zeek_settings[sensor.hostname] = zeek_settings

            if namespace.which == SubCmd.moloch_viewer:
                self.moloch_viewer_settings = MolochViewerSettings()
                self.moloch_viewer_settings.from_namespace(namespace)

            if namespace.which == SubCmd.logstash:
                logstash_settings = LogstashSettings()
                logstash_settings.set_from_kickstart(kickstart_settings)
                logstash_settings.from_namespace(namespace)
                self.logstash_settings = logstash_settings


    @staticmethod
    def add_args(parser: ArgumentParser):
        subparsers = parser.add_subparsers()
        suricata_parser = subparsers.add_parser(SubCmd.suricata,
                                                help="This subcommand can be used to install suricata on your Kit's sensors.")
        add_args_from_instance(suricata_parser, SuricataSettings())
        suricata_parser.set_defaults(which=SubCmd.suricata)

        moloch_parser = subparsers.add_parser(SubCmd.moloch_capture,
                                              help="This subcommand can be used to install moloch capture on your Kit's sensors.")
        add_args_from_instance(moloch_parser, MolochCaptureSettings())
        moloch_parser.set_defaults(which=SubCmd.moloch_capture)

        moloch_viewer_parser = subparsers.add_parser(SubCmd.moloch_viewer,
                                                     help="This subcommand can be used to install moloch viewer on your Kit's servers.")
        add_args_from_instance(moloch_viewer_parser, MolochViewerSettings())
        moloch_viewer_parser.set_defaults(which=SubCmd.moloch_viewer)

        zeek_parser = subparsers.add_parser(SubCmd.zeek,
                                            help="This subcommand can be used to install zeek on your Kit's sensors.")
        add_args_from_instance(zeek_parser, ZeekSettings())
        zeek_parser.set_defaults(which=SubCmd.zeek)

        logstash_parser = subparsers.add_parser(SubCmd.logstash,
                                                help="This subcommand can be used to install zeek on your Kit's sensors.")
        add_args_from_instance(logstash_parser, LogstashSettings())
        logstash_parser.set_defaults(which=SubCmd.logstash)


class BasicNodeCreds(Model):
    def __init__(self):
        self.username = ''
        self.password = ''
        self.ipaddress = ''

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self.password = self.b64decode_string(namespace.password)
