from typing import Union
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.catalog import CatalogSettings
from models.kit import KitSettingsV2
from models.node import NodeSettingsV2
from models.constants import SubCmd
from util.api_tester import APITesterV2
import logging
from typing import List

class CatalogJob:

    def __init__(self,
                 ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                 kit_settings: KitSettingsV2,
                 catalog_settings: CatalogSettings,
                 nodes: List[NodeSettingsV2]):
        self.ctrl_settings = ctrl_settings
        self.kit_settings = kit_settings
        self.catalog_settings = catalog_settings
        self.nodes = nodes
        self.runner = APITesterV2(self.ctrl_settings,
                                  self.kit_settings,
                                  self.catalog_settings,
                                  self.nodes)

    def run_catalog(self, application: str, process: str):
        if process == SubCmd.install:
            logging.info("Installing "+application.title())
            if application == SubCmd.mattermost:
                self.runner.install_mattermost()
            elif application == SubCmd.nifi:
                self.runner.install_nifi()
            elif application == SubCmd.jcat_nifi:
                self.runner.install_jcat_nifi()
            elif application == SubCmd.redmine:
                self.runner.install_redmine()
            elif application == SubCmd.netflow_filebeat:
                self.runner.install_netflow_filebeat()
            else:
                logging.info("Cannot install "+application.title()+". The function has not been coded")
