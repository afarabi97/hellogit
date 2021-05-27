import os
import logging

from models.ctrl_setup import ControllerSetupSettings
from paramiko.ssh_exception import NoValidConnectionsError
from util.connection_mngs import FabricConnectionWrapper
from util.ansible_util import create_template


TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'

# TODO bring this back in some form
class MIPSaveKitJob:
    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 mip_kickstart_settings):
        self.ctrl_settings = ctrl_settings
        self.mip_kickstart_settings = mip_kickstart_settings

    def install_vmware_tools(self):
        node = self.mip_kickstart_settings.mips[0]
        with FabricConnectionWrapper("assessor",
                                     node.password,
                                     node.ipaddress) as client:
            client.sudo("yum -y install perl open-vm-tools", shell=True, warn=True)

    def save_mip_kit(self, mip_template_name: str):
        try:
            self.install_vmware_tools()

            mip = self.mip_kickstart_settings.mips[0]
            create_template(self.ctrl_settings.vcenter, mip, mip_template_name)
        except NoValidConnectionsError as e:
            logging.warn("Failed to save MIP template due to SSH connection issue.")
            logging.exception(e)
