import os
import logging

from models.kickstart import MIPKickstartSettings
from models.ctrl_setup import ControllerSetupSettings
from models.mip_config import MIPConfigSettings
from paramiko.ssh_exception import NoValidConnectionsError
from util.ansible_util import execute_playbook
from util.api_tester import MIPAPITester
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import create_template


TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'


class MIPSaveKitJob:
    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 mip_kickstart_settings: MIPKickstartSettings):
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
            self._prep_install_vmware_tools()
            self.install_vmware_tools()

            mip = self.mip_kickstart_settings.mips[0]
            create_template(self.ctrl_settings.vcenter, mip, mip_template_name)
        except NoValidConnectionsError as e:
            logging.warn("Failed to save MIP template due to SSH connection issue.")
            logging.exception(e)
