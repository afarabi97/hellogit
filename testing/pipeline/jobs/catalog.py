from typing import Union
from models.kickstart import KickstartSettings, HwKickstartSettings
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.catalog import CatalogSettings
from models.constants import SubCmd
from util.api_tester import APITester
import logging

class CatalogJob:

    def __init__(self,
                 ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                 kickstart_settings: Union[KickstartSettings, HwKickstartSettings],
                 catalog_settings: CatalogSettings):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings
        self.catalog_settings = catalog_settings
        self.runner = APITester(self.ctrl_settings,
                                self.kickstart_settings,
                                catalog_settings=self.catalog_settings)

    def run_catalog(self, application: str, process: str):
        if process == SubCmd.install:
            logging.info("Installing "+application.title())
            if application == SubCmd.suricata:
                self.runner.install_suricata()
            elif application == SubCmd.arkime_viewer:
                self.runner.install_arkime_viewer()
            elif application == SubCmd.arkime_capture:
                self.runner.install_arkime_capture()
            elif application == SubCmd.zeek:
                self.runner.install_zeek()
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
