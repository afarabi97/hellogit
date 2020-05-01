from argparse import ArgumentParser, Namespace
from models import add_args_from_instance, Model
from models.constants import SubCmd
from models.common import VCenterSettings, NodeSettings
from models.ctrl_setup import ControllerSetupSettings
from models.kickstart import GIPKickstartSettings
from models.kit import KitSettings

class GIPServiceSettings(Model):
    def __init__(self):
        super().__init__()
        self.vcenter = None # type: VCenterSettings
        self.node = None # type: NodeSettings

    @staticmethod
    def add_args(parser: ArgumentParser):
        gip_service_vm_parser = parser.add_parser(SubCmd.create_gip_service_vm,
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
        self.node.hostname = "{}-services.lan".format(namespace.vm_prefix)

class GIPControllerSettings(Model):
    def __init__(self):
        super().__init__()
        self.controller_settings = None # type: ControllerSetupSettings

    @staticmethod
    def add_args(parser: ArgumentParser):
        gip_controller_setup_parser = parser.add_parser(SubCmd.setup_gip_ctrl,
                                                            help="Builds a GIP controller.")
        gip_controller_setup_parser.set_defaults(which=SubCmd.setup_gip_ctrl)
        ControllerSetupSettings.add_args(gip_controller_setup_parser)

    def from_namespace(self, namespace: Namespace):
        self.controller_settings = ControllerSetupSettings()
        self.controller_settings.from_namespace(namespace)

class GIPKitSettings(Model):
    def __init__(self):
        super().__init__()
        self.kit_settings = None # type: KitSettings
    
    @staticmethod
    def add_args(parser: ArgumentParser):
        gip_kit_parser = parser.add_parser(SubCmd.run_gip_kit,
                                                            help="Builds a Kit from an existing GIP controller. This requires Kickstart to have already been setup on the GIP controller.")
        gip_kit_parser.set_defaults(which=SubCmd.run_gip_kit)
        # KitSettings.add_args(gip_kit_parser)

    def from_kickstart(self, gip_kickstart_settings: GIPKickstartSettings):
        self.kit_settings = KitSettings()
        self.kit_settings.from_kickstart(gip_kickstart_settings)
        self.kit_settings.use_proxy_pool = True
