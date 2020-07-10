import os
import logging

from models.kickstart import MIPKickstartSettings
from models.ctrl_setup import ControllerSetupSettings
from models.mip_config import MIPConfigSettings
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

    def _prep_install_vmware_tools(self):
        node = self.mip_kickstart_settings.mips[0]
        with FabricConnectionWrapper(node.username,
                                         node.password,
                                         node.ipaddress) as client:
                client.run("yum-config-manager -q --add-repo http://yum.labrepo.sil.lab/rhel/workstation/rhel-7-workstation-rpms", shell=True, warn=True)
                client.run("yum-config-manager -q --enable \*", shell=True, warn=True)

    def install_vmware_tools(self):
        for node in self.mip_kickstart_settings.mips:
            with FabricConnectionWrapper(node.username,
                                         node.password,
                                         node.ipaddress) as client:
                client.run("yum -y install perl open-vm-tools", shell=True, warn=True)

    def save_mip_kit(self):
        self.mip_kickstart_settings.nodes = self.mip_kickstart_settings.mips
        self._prep_install_vmware_tools()
        self.install_vmware_tools()

        template_ctrl_settings = self.ctrl_settings
        template_ctrl_settings.node = self.mip_kickstart_settings.mips[0]
        create_template(self.ctrl_settings.vcenter, template_ctrl_settings.node, "MIP_Kit_Template")
