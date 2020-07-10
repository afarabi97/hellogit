import os
import logging

from models.kickstart import MIPKickstartSettings
from models.ctrl_setup import ControllerSetupSettings
from models.mip_config import MIPConfigSettings
from util.ansible_util import execute_playbook
from util.api_tester import MIPAPITester
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
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

    def run_mip_config(self):
        runner = MIPAPITester(self.ctrl_settings, self.mip_kickstart_settings, self.mip_config_settings)
        runner.run_mip_config_api_call()