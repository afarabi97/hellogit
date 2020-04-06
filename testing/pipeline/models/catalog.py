from argparse import Namespace, ArgumentParser
from models import Model, add_args_from_instance
from models.common import NodeSettings
from models.kickstart import KickstartSettings
from typing import Dict
from models.constants import SubCmd


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
