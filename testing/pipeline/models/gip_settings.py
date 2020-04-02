from argparse import ArgumentParser, Namespace
from models import add_args_from_instance, Model
from models.constants import SubCmd
from models.common import VCenterSettings, NodeSettings


class GipSettings(Model):

    def __init__(self):
        super().__init__()
        self.vcenter = None # type: VCenterSettings
        self.node = None # type: NodeSettings

    @staticmethod
    def add_args(parser: ArgumentParser):
        subparsers = parser.add_subparsers()
        gip_service_vm_parser = subparsers.add_parser(SubCmd.create_gip_service_vm,
                                                      help="This subcommand can be used to create the GIP service VM.")
        gip_service_vm_parser.set_defaults(which=SubCmd.create_gip_service_vm)
        VCenterSettings.add_args(gip_service_vm_parser)
        NodeSettings.add_args(gip_service_vm_parser, True)

    def from_namespace(self, namespace: Namespace):
        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)

        self.node = NodeSettings()
        self.node.from_namespace(namespace)
        self.node.disk_size = 250
