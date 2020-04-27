from argparse import ArgumentParser, Namespace
from models import add_args_from_instance, Model
from models.constants import SubCmd
from models.common import VCenterSettings, NodeSettings
from models.ctrl_setup import ControllerSetupSettings
from models.kickstart import GIPKickstartSettings
from models.kit import KitSettings

class GipSettings(Model):

    def __init__(self):
        super().__init__()
        self.vcenter = None # type: VCenterSettings
        self.node = None # type: NodeSettings

        self.controller_settings = None # type: ControllerSetupSettings
        self.gip_kickstart_settings = None # type: GIPKickstartSettings
        self.kit_settings = None # type: KitSettings

    @staticmethod
    def add_args(parser: ArgumentParser):
        subparsers = parser.add_subparsers()

        gip_service_vm_parser = subparsers.add_parser(SubCmd.create_gip_service_vm,
                                                      help="This subcommand can be used to create the GIP service VM.")
        gip_service_vm_parser.set_defaults(which=SubCmd.create_gip_service_vm)
        VCenterSettings.add_args(gip_service_vm_parser)
        NodeSettings.add_args(gip_service_vm_parser, True)

        gip_controller_setup_parser = subparsers.add_parser(SubCmd.setup_gip_ctrl,
                                                            help="Builds a GIP controller.")
        ControllerSetupSettings.add_args(gip_controller_setup_parser)
        gip_controller_setup_parser.set_defaults(which=SubCmd.setup_gip_ctrl)


        gip_kickstart_parser = subparsers.add_parser(SubCmd.run_gip_kickstart,
                                                        help="Configures a GIP controller for Kickstart.")
        GIPKickstartSettings.add_args(gip_kickstart_parser)
        gip_kickstart_parser.set_defaults(which=SubCmd.run_gip_kickstart)

        gip_kit_parser = subparsers.add_parser(SubCmd.run_gip_kit,
                                                            help="Builds a Kit from an existing GIP controller. This requires Kickstart to have already been setup on the GIP controller.")
        gip_kit_parser.set_defaults(which=SubCmd.run_gip_kit)
        KitSettings.add_args(gip_kit_parser)
        gip_kit_parser.set_defaults(which=SubCmd.run_gip_kit)

    def from_namespace(self, namespace: Namespace):
        if namespace.which == SubCmd.create_gip_service_vm:
            self.vcenter = VCenterSettings()
            self.vcenter.from_namespace(namespace)

            self.node = NodeSettings()
            self.node.from_namespace(namespace)
            self.node.disk_size = 250
            self.node.hostname = "{}-services.lan".format(namespace.vm_prefix)

        if namespace.which == SubCmd.setup_gip_ctrl:
            self.controller_settings = ControllerSetupSettings()
            self.controller_settings.from_namespace(namespace)

        if namespace.which == SubCmd.run_gip_kickstart:
            self.gip_kickstart_settings = GIPKickstartSettings()
            self.gip_kickstart_settings.from_namespace(namespace)
