import os
import logging

from models.settings import KickstartSettings, ControllerSetupSettings, KitSettings
from util.ansible_util import execute_playbook
from util.api_tester import APITester
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive

TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'


class KitJob:
    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kickstart_settings: KickstartSettings,
                 kit_settings: KitSettings):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings
        self.kit_settings = kit_settings

    def run_kit(self):
        runner = APITester(self.ctrl_settings, self.kickstart_settings, self.kit_settings)
        runner.run_kit_api_call()
