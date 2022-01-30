from argparse import Namespace, ArgumentParser
from models import Model, add_args_from_instance
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.kit import KitSettingsV2
from models.node import NodeSettingsV2
from typing import Dict, List
from models.constants import SubCmd


DEPLOYMENT_NAME_PATTERN = "{}-{}"


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

class JcatNifiSettings(Model):
    def __init__(self):
        self.node_hostname = "server"
        self.affinity_hostname = "Server - Any"
        self.deployment_name = "jcat-nifi"

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
        self.mattermost_settings = dict()
        self.nifi_settings = dict()
        self.jcat_nifi_settings = dict()
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
        if namespace.which == SubCmd.mattermost:
            self.mattermost_settings = MattermostSettings()
            self.mattermost_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.nifi:
            self.nifi_settings = NifiSettings()
            self.nifi_settings.from_namespace(namespace)
        elif namespace.which == SubCmd.jcat_nifi:
            self.jcat_nifi_settings = JcatNifiSettings()
            self.jcat_nifi_settings.from_namespace(namespace)
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

        mattermost_parser = subparsers.add_parser(SubCmd.mattermost,
                                                help="This subcommand can be used to install mattermost on your Kit's servers.")
        add_args_from_instance(mattermost_parser, MattermostSettings())
        mattermost_parser.set_defaults(which=SubCmd.mattermost)

        nifi_parser = subparsers.add_parser(SubCmd.nifi,
                                                help="This subcommand can be used to install nifi on your Kit's servers.")
        add_args_from_instance(nifi_parser, NifiSettings())
        nifi_parser.set_defaults(which=SubCmd.nifi)

        jcat_nifi_parser = subparsers.add_parser(SubCmd.jcat_nifi,
                                                help="This subcommand can be used to install jcat-nifi on your Kit's servers.")
        add_args_from_instance(jcat_nifi_parser, JcatNifiSettings())
        jcat_nifi_parser.set_defaults(which=SubCmd.jcat_nifi)

        redmine_parser = subparsers.add_parser(SubCmd.redmine,
                                                help="This subcommand can be used to install redmine on your Kit's servers.")
        add_args_from_instance(redmine_parser, RedmineSettings())
        redmine_parser.set_defaults(which=SubCmd.redmine)

        netflow_filebeat_parser = subparsers.add_parser(SubCmd.netflow_filebeat,
                                                help="This subcommand can be used to install netflow-filebeat on your Kit's servers.")
        add_args_from_instance(netflow_filebeat_parser, NetflowFilebeatSettings())
        netflow_filebeat_parser.set_defaults(which=SubCmd.netflow_filebeat)
