from argparse import ArgumentParser, Namespace
from models import Model
from models.constants import SubCmd
from models.common import VCenterSettings, NodeSettings
from util.network import IPAddressManager


class RHELRepoSettings(Model):

    def __init__(self):
        super().__init__()
        self.vcenter = None # type: VCenterSettings
        self.node = None # type: NodeSettings
        self.system_name = None # type: str
        self.subscription = None
        self.orgnumber = None
        self.activationkey = None

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--subscription", dest="subscription", #required=True,
                            help="RHEL subscription method (standard or developer).")
        parser.add_argument("--orgnumber", dest="orgnumber", #required=True,
                            help="Organization number used to register RHEL server.")
        parser.add_argument("--activationkey", dest="activationkey", #required=True,
                            help="Activation key used to register RHEL server.")
        VCenterSettings.add_args(parser)
        NodeSettings.add_args(parser, True)

    def from_namespace(self, namespace: Namespace, is_server: bool):
        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)

        self.system_name = namespace.system_name

        self.node = NodeSettings()
        self.node.from_namespace(namespace, NodeSettings.valid_node_types[7])
        self.node.cpu = 4
        self.node.memory = 4096
        if is_server:
            self.node.ipaddress = IPAddressManager(self.node.network_id, self.node.network_block_index).get_next_node_address()

        self.subscription = namespace.subscription
        self.orgnumber = namespace.orgnumber
        self.activationkey = namespace.activationkey