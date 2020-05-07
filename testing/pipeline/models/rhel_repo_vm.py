from argparse import ArgumentParser, Namespace
from models import Model
from models.constants import SubCmd
from models.common import VCenterSettings, NodeSettings


class RHELRepoSettings(Model):

    def __init__(self):
        super().__init__()
        self.vcenter = None # type: VCenterSettings
        self.node = None # type: NodeSettings
        self.subscription = None
        self.orgnumber = None
        self.activationkey = None

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--subscription", dest="subscription", required=True,
                            help="RHEL subscription method (standard or developer).")
        parser.add_argument("--orgnumber", dest="orgnumber", required=True,
                            help="Organization number used to register RHEL server.")
        parser.add_argument("--activationkey", dest="activationkey", required=True,
                            help="Activation key used to register RHEL server.")
        VCenterSettings.add_args(parser)
        NodeSettings.add_args(parser, True)

    def from_namespace(self, namespace: Namespace):
        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)

        self.node = NodeSettings()
        self.node.from_namespace(namespace, NodeSettings.valid_node_types[7])

        self.subscription = namespace.subscription
        self.orgnumber = namespace.orgnumber
        self.activationkey = namespace.activationkey