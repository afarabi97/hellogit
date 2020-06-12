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
from jobs.kit import KitJob

TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'


class MIPConfigJob:
    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 mip_kickstart_settings: MIPKickstartSettings,
                 mip_config_settings: MIPConfigSettings):
        self.ctrl_settings = ctrl_settings
        self.mip_kickstart_settings = mip_kickstart_settings
        self.mip_config_settings = mip_config_settings

    def _prep_install_vmware_tools(self):
        node = self.mip_kickstart_settings.mips[0]
        with FabricConnectionWrapper(node.username,
                                         node.password,
                                         node.ipaddress) as client:
                client.run("yum-config-manager -q --add-repo http://yum.labrepo.sil.lab/rhel/workstation/rhel-7-workstation-rpms", shell=True, warn=True)
                client.run("yum-config-manager -q --enable \*", shell=True, warn=True)

    def run_mip_config(self):
        runner = MIPAPITester(self.ctrl_settings, self.mip_kickstart_settings, self.mip_config_settings)
        runner.run_mip_config_api_call()
        if self.mip_config_settings.save_kit == "Yes":
            self.mip_kickstart_settings.nodes = self.mip_kickstart_settings.mips
            installer = KitJob(self.ctrl_settings, self.mip_kickstart_settings, self.mip_config_settings)
            self._prep_install_vmware_tools()
            installer.install_vmware_tools()

            template_ctrl_settings = self.ctrl_settings
            template_ctrl_settings.node = self.mip_kickstart_settings.mips[0]
            create_template(self.ctrl_settings.vcenter, template_ctrl_settings.node, "MIP_Kit_Template")
