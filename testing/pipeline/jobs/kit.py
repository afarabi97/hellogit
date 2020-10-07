import os
import logging
from typing import Union

from models.kickstart import KickstartSettings, HwKickstartSettings
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.kit import KitSettings, HwKitSettings
from jobs.remote_node import RemoteNode
from models.remote_node import RemoteNodeSettings
from util.ansible_util import execute_playbook
from util.api_tester import APITester
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from random import randrange

TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'


class KitJob:
    def __init__(self,
                 ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                 kickstart_settings: Union[KickstartSettings, HwKickstartSettings],
                 kit_settings: Union[KitSettings,HwKitSettings]):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings
        self.kit_settings = kit_settings

    def install_vmware_tools(self):
        for node in self.kickstart_settings.nodes:
            with FabricConnectionWrapper(node.username,
                                         node.password,
                                         node.ipaddress) as client:
                client.run("yum -y install perl open-vm-tools", shell=True, warn=True)

    def run_kit(self, virtual=True):
        runner = APITester(self.ctrl_settings, self.kickstart_settings, self.kit_settings)
        runner.run_kit_api_call()
        if virtual:
            self.install_vmware_tools()

        #This class will only excute in baremetal
        if "remote_node" in self.kickstart_settings.__dict__ and self.kickstart_settings.remote_node.run_remote_node:
            remote_node = RemoteNode(self.ctrl_settings, self.kickstart_settings)
            remote_node.remote_node_config()