from argparse import Namespace, ArgumentParser
from models import Model, add_args_from_instance
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.kit import KitSettingsV2
from models.node import NodeSettingsV2, HardwareNodeSettingsV2
from typing import Dict, List, Union
from models.constants import SubCmd


DEPLOYMENT_NAME_PATTERN = "{}-{}"


class SuricataSettings(Model):
    def __init__(self):
        self.affinity_hostname = ""
        self.cpu_request = 1000
        self.deployment_name = ""
        self.external_net = ["any"]
        self.home_net = ["any"]
        self.pcapEnabled = True
        self.suricata_threads = 2
        self.node_hostname = ""
        self.interfaces = ""
        self.flow = True

    def set_from_node_settings(self, node: NodeSettingsV2):
        self.affinity_hostname = node.hostname
        pos = node.hostname.rfind(".")
        self.deployment_name = DEPLOYMENT_NAME_PATTERN.format(node.hostname[:pos], "suricata")
        self.node_hostname = node.hostname
        self.interfaces = node.monitoring_interfaces


class ArkimeCaptureSettings(Model):
    def __init__(self):
        self.cpu_request = 1000
        self.mem_limit = "7Gi"
        self.pcapWriteMethod = "simple"
        self.affinity_hostname = ""
        self.node_hostname = ""
        self.bpf = ""
        self.dontSaveBPFs = ""
        self.freespaceG = "25%"
        self.maxFileSizeG = 25
        self.magicMode = "basic"
        self.deployment_name = ""
        self.interfaces = ""

    def set_from_node_settings(self, node: NodeSettingsV2):
        self.affinity_hostname = node.hostname
        pos = node.hostname.rfind(".")
        self.deployment_name = DEPLOYMENT_NAME_PATTERN.format(node.hostname[:pos], "arkime")
        self.node_hostname = node.hostname
        self.interfaces = node.monitoring_interfaces


class ArkimeViewerSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.user = "assessor"
        self.password = "password"
        self.deployment_name = "arkime-viewer"
        self.serviceNode = False

    def to_dict(self) -> Dict:
        arkime_dict = super().to_dict()
        cache = arkime_dict["password"]
        del arkime_dict["password"]
        arkime_dict["pass"] = cache
        return arkime_dict

    def install_on_service_node(self, srv_node_exists: bool):
        self.serviceNode = srv_node_exists


class ZeekSettings(Model):
    def __init__(self):
        self.affinity_hostname = ""
        self.cpu_request = "1000"
        self.deployment_name = ""
        self.home_net = ["any"]
        self.zeek_workers = 4
        self.node_hostname = ""
        self.log_retention_hours = "24"
        self.interfaces = ""

    def set_from_node_settings(self, node: NodeSettingsV2):
        self.affinity_hostname = node.hostname
        pos = node.hostname.rfind(".")
        self.deployment_name = DEPLOYMENT_NAME_PATTERN.format(node.hostname[:pos], "zeek")
        self.node_hostname = node.hostname
        self.interfaces = node.monitoring_interfaces


class LogstashSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.replicas = 1
        self.heap_size = 2
        self.deployment_name = "logstash"
        self.external_fqdn = ""
        self.external_ip = ""
        self.serviceNode = False

    def install_on_service_node(self, srv_node_exists: bool):
        self.serviceNode = srv_node_exists

class WikijsSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "wikijs"
        self.serviceNode = False

    def install_on_service_node(self, srv_node_exists: bool):
        self.serviceNode = srv_node_exists

class MispSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "misp"
        self.cortexIntegration = True
        self.serviceNode = False

    def install_on_service_node(self, srv_node_exists: bool):
        self.serviceNode = srv_node_exists


class HiveSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "hive"
        self.cortexIntegration = True
        self.mispIntegration = True
        self.serviceNode = False

    def install_on_service_node(self, srv_node_exists: bool):
        self.serviceNode = srv_node_exists

class CortexSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "cortex"
        self.serviceNode = False

    def install_on_service_node(self, srv_node_exists: bool):
        self.serviceNode = srv_node_exists

class RocketchatSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "rocketchat"
        self.serviceNode = False

    def install_on_service_node(self, srv_node_exists: bool):
        self.serviceNode = srv_node_exists

class MattermostSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "mattermost"


class NifiSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "nifi"


class RedmineSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "redmine"


class NetflowFilebeatSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "netflow-filebeat"
        self.home_net = ["any"]


class CatalogSettings(Model):

    def __init__(self):
        self.suricata_settings = dict()
        self.arkime_capture_settings = dict()
        self.zeek_settings = dict()
        self.arkime_viewer_settings = None # type: arkimeViewerSettings
        self.logstash_settings = None # type: LogstashSettings
        self.wikijs_settings = dict()
        self.misp_settings = dict()
        self.hive_settings = dict()
        self.cortex_settings = dict()
        self.rocketchat_settings = dict()
        self.mattermost_settings = dict()
        self.nifi_settings = dict()
        self.redmine_settings = dict()
        self.netflow_filebeat_settings = dict()

    def _service_node_exists(self, nodes: List[NodeSettingsV2]) -> bool:
        for node in nodes:
            if node.is_service():
                return True
        return False

    def set_from_kickstart(self,
                           nodes: List[NodeSettingsV2],
                           kit_settings: KitSettingsV2,
                           namespace: Namespace):

        service_node_exists = self._service_node_exists(nodes)
        for node in nodes: # type : NodeSettingsV2

            if node.is_sensor():
                if namespace.which == SubCmd.suricata:
                    suricata_settings = SuricataSettings()
                    suricata_settings.set_from_node_settings(node)
                    suricata_settings.from_namespace(namespace)
                    self.suricata_settings[node.hostname] = suricata_settings

                if namespace.which == SubCmd.arkime_capture:
                    arkime_capture_settings = ArkimeCaptureSettings()
                    arkime_capture_settings.set_from_node_settings(node)
                    arkime_capture_settings.from_namespace(namespace)
                    self.arkime_capture_settings[node.hostname] = arkime_capture_settings

                if namespace.which == SubCmd.zeek:
                    zeek_settings = ZeekSettings()
                    zeek_settings.set_from_node_settings(node)
                    zeek_settings.from_namespace(namespace)
                    self.zeek_settings[node.hostname] = zeek_settings

                if namespace.which == SubCmd.arkime_viewer:
                    self.arkime_viewer_settings = ArkimeViewerSettings()
                    self.arkime_viewer_settings.from_namespace(namespace)
                    self.arkime_viewer_settings.install_on_service_node(service_node_exists)

                if namespace.which == SubCmd.logstash:
                    logstash_settings = LogstashSettings()
                    logstash_settings.from_namespace(namespace)
                    self.logstash_settings = logstash_settings

        if namespace.which == SubCmd.wikijs:
            self.wikijs_settings = WikijsSettings()
            self.wikijs_settings.install_on_service_node(service_node_exists)
            self.wikijs_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.misp:
            self.misp_settings = MispSettings()
            self.misp_settings.install_on_service_node(service_node_exists)
            self.misp_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.cortex:
            self.cortex_settings = CortexSettings()
            self.cortex_settings.install_on_service_node(service_node_exists)
            self.cortex_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.hive:
            self.hive_settings = HiveSettings()
            self.hive_settings.install_on_service_node(service_node_exists)
            self.hive_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.rocketchat:
            self.rocketchat_settings = RocketchatSettings()
            self.rocketchat_settings.install_on_service_node(service_node_exists)
            self.rocketchat_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.mattermost:
            self.mattermost_settings = MattermostSettings()
            self.mattermost_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.nifi:
            self.nifi_settings = NifiSettings()
            self.nifi_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.redmine:
            self.redmine_settings = RedmineSettings()
            self.redmine_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.netflow_filebeat:
            self.netflow_filebeat_settings = NetflowFilebeatSettings()
            self.netflow_filebeat_settings.from_namespace(namespace)

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--process', dest='process',
                            choices=[SubCmd.install,SubCmd.uninstall,SubCmd.reinstall], default=SubCmd.install,
                            help="Selects which catalog process to perform")

        subparsers = parser.add_subparsers()
        suricata_parser = subparsers.add_parser(SubCmd.suricata,
                                                help="This subcommand can be used to install suricata on your Kit's sensors.")
        add_args_from_instance(suricata_parser, SuricataSettings())
        suricata_parser.set_defaults(which=SubCmd.suricata)

        arkime_parser = subparsers.add_parser(SubCmd.arkime_capture,
                                              help="This subcommand can be used to install arkime capture on your Kit's sensors.")
        add_args_from_instance(arkime_parser, ArkimeCaptureSettings())
        arkime_parser.set_defaults(which=SubCmd.arkime_capture)

        arkime_viewer_parser = subparsers.add_parser(SubCmd.arkime_viewer,
                                                     help="This subcommand can be used to install arkime viewer on your Kit's servers.")
        add_args_from_instance(arkime_viewer_parser, ArkimeViewerSettings())
        arkime_viewer_parser.set_defaults(which=SubCmd.arkime_viewer)

        zeek_parser = subparsers.add_parser(SubCmd.zeek,
                                            help="This subcommand can be used to install zeek on your Kit's sensors.")
        add_args_from_instance(zeek_parser, ZeekSettings())
        zeek_parser.set_defaults(which=SubCmd.zeek)

        logstash_parser = subparsers.add_parser(SubCmd.logstash,
                                                help="This subcommand can be used to install logstash on your Kit's sensors.")
        add_args_from_instance(logstash_parser, LogstashSettings())
        logstash_parser.set_defaults(which=SubCmd.logstash)

        wikijs_parser = subparsers.add_parser(SubCmd.wikijs,
                                                help="This subcommand can be used to install wikijs on your Kit's servers.")
        add_args_from_instance(wikijs_parser, WikijsSettings())
        wikijs_parser.set_defaults(which=SubCmd.wikijs)

        misp_parser = subparsers.add_parser(SubCmd.misp,
                                                help="This subcommand can be used to install misp on your Kit's servers.")
        add_args_from_instance(misp_parser, MispSettings())
        misp_parser.set_defaults(which=SubCmd.misp)

        hive_parser = subparsers.add_parser(SubCmd.hive,
                                                help="This subcommand can be used to install hive on your Kit's servers.")
        add_args_from_instance(hive_parser, HiveSettings())
        hive_parser.set_defaults(which=SubCmd.hive)

        cortex_parser = subparsers.add_parser(SubCmd.cortex,
                                                help="This subcommand can be used to install cortex on your Kit's servers.")
        add_args_from_instance(cortex_parser, CortexSettings())
        cortex_parser.set_defaults(which=SubCmd.cortex)

        rocketchat_parser = subparsers.add_parser(SubCmd.rocketchat,
                                                help="This subcommand can be used to install rocketchat on your Kit's servers.")
        add_args_from_instance(rocketchat_parser, RocketchatSettings())
        rocketchat_parser.set_defaults(which=SubCmd.rocketchat)

        mattermost_parser = subparsers.add_parser(SubCmd.mattermost,
                                                help="This subcommand can be used to install mattermost on your Kit's servers.")
        add_args_from_instance(mattermost_parser, MattermostSettings())
        mattermost_parser.set_defaults(which=SubCmd.mattermost)

        nifi_parser = subparsers.add_parser(SubCmd.nifi,
                                                help="This subcommand can be used to install nifi on your Kit's servers.")
        add_args_from_instance(nifi_parser, NifiSettings())
        nifi_parser.set_defaults(which=SubCmd.nifi)

        redmine_parser = subparsers.add_parser(SubCmd.redmine,
                                                help="This subcommand can be used to install redmine on your Kit's servers.")
        add_args_from_instance(redmine_parser, RedmineSettings())
        redmine_parser.set_defaults(which=SubCmd.redmine)

        netflow_filebeat_parser = subparsers.add_parser(SubCmd.netflow_filebeat,
                                                help="This subcommand can be used to install redmine on your Kit's servers.")
        add_args_from_instance(netflow_filebeat_parser, NetflowFilebeatSettings())
        netflow_filebeat_parser.set_defaults(which=SubCmd.netflow_filebeat)
