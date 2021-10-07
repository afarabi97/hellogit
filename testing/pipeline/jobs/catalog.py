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
            if application == SubCmd.suricata:
                self.runner.install_suricata()
                self.runner.update_ruleset(application)
            elif application == SubCmd.arkime_viewer:
                self.runner.install_arkime_viewer()
            elif application == SubCmd.arkime_capture:
                self.runner.install_arkime_capture()
            elif application == SubCmd.zeek:
                self.runner.install_zeek()
                self.runner.update_ruleset(application)
            elif application == SubCmd.logstash:
                self.runner.install_logstash()
            elif application == SubCmd.wikijs:
                self.runner.install_wikijs()
            elif application == SubCmd.misp:
                self.runner.install_misp()
            elif application == SubCmd.hive:
                self.runner.install_hive()
            elif application == SubCmd.cortex:
                self.runner.install_cortex()
            elif application == SubCmd.rocketchat:
                self.runner.install_rocketchat()
            elif application == SubCmd.mattermost:
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
        elif process == SubCmd.reinstall:
            logging.info("Reinstalling "+application.title())
            if application == SubCmd.wikijs:
                self.runner.reinstall_wikijs()
            elif application == SubCmd.suricata:
                self.runner.reinstall_suricata()
            else:
                logging.info("Cannot reinstall "+application.title()+". The function has not been coded")
