from argparse import Namespace, ArgumentParser
from models import Model
from models.common import VCenterSettings, NodeSettings, RepoSettings, ESXiSettings, HwNodeSettings
from models.remote_node import RemoteNodeSettings


class ControllerSetupSettings(Model):

    def __init__(self):
        super().__init__()
        self.node = None # type: NodeSettings
        self.vcenter = None # type: VCenterSettings
        self.repo = None # type: RepoSettings

    def from_namespace(self, namespace: Namespace):
        self.rhel_source_repo = namespace.rhel_source_repo

        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)

        self.node = NodeSettings()
        self.node.from_namespace(namespace)

        self.repo = RepoSettings()
        self.repo.from_namespace(namespace)

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--rhel-source-repo', dest='rhel_source_repo', default="labrepo",
                            help="Use labrepo for SIL network otherwise pass in public.")
        VCenterSettings.add_args(parser)
        RepoSettings.add_args(parser)
        NodeSettings.add_args(parser, True)


class HwControllerSetupSettings(ControllerSetupSettings):
    def __init__(self):
        super().__init__()
        self.esxi = None
        self.esxi_ctrl_name = None
        self.esxi_unemployed_ctrls = None #List
        self.node = None
        self.remote_node_settings = None

    def from_namespace(self, namespace: Namespace):
        self.rhel_source_repo = namespace.rhel_source_repo

        self.esxi = ESXiSettings()
        self.esxi.from_namespace(namespace)

        self.node = HwNodeSettings()
        self.node.from_namespace(namespace)

        self.repo = RepoSettings()
        self.repo.from_namespace(namespace)

        self.remote_node_settings = RemoteNodeSettings()
        self.remote_node_settings.from_namespace(namespace)

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--rhel-source-repo', dest='rhel_source_repo', default="labrepo",
                            help="Use labrepo for SIL network otherwise pass in public.")
        ESXiSettings.add_args(parser)
        RepoSettings.add_args(parser)
        HwNodeSettings.add_args(parser, True)
        RemoteNodeSettings.add_args(parser)
