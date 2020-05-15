import os
import logging

from models.kickstart import KickstartSettings
from models.ctrl_setup import ControllerSetupSettings
from util.api_tester import APITester
from util.connection_mngs import FabricConnectionWrapper


class StigJob:
    def __init__(self, ctrl_settings: ControllerSetupSettings):
        self.ctrl_settings = ctrl_settings

    def _execute_stigs(self):
        if self.ctrl_settings.system_name == "DIP":
            with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                         self.ctrl_settings.node.password,
                                         self.ctrl_settings.node.ipaddress) as client:
                with client.cd("/opt/tfplenum/stigs/playbooks"):
                    client.run("make dip-stigs", shell=True)
        elif self.ctrl_settings.system_name == "MIP":
            with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                         self.ctrl_settings.node.password,
                                         self.ctrl_settings.node.ipaddress) as client:
                with client.cd("/opt/tfplenum/stigs/playbooks"):
                    client.run("make mip-stigs", shell=True)
        elif self.ctrl_settings.system_name == "GIP":
            # with FabricConnectionWrapper(self.ctrl_settings.node.username,
            #                              self.ctrl_settings.node.password,
            #                              self.ctrl_settings.node.ipaddress) as client:
            #     with client.cd("/opt/tfplenum/stigs/playbooks"):
            #         client.run("make gip-stigs", shell=True)
            pass
    def run_stig(self):
        self._execute_stigs()
