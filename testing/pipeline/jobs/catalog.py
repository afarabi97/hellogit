from models.settings import KickstartSettings, ControllerSetupSettings, CatalogSettings
from models.constants import SubCmd
from util.api_tester import APITester

class CatalogJob:

    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kickstart_settings: KickstartSettings,
                 catalog_settings: CatalogSettings):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings
        self.catalog_settings = catalog_settings
        self.runner = APITester(self.ctrl_settings,
                                self.kickstart_settings,
                                catalog_settings=self.catalog_settings)

    def run_catalog(self, application: str):
        if application == SubCmd.suricata:
            self.runner.install_suricata()
        elif application == SubCmd.moloch_viewer:
            self.runner.install_moloch_viewer()
        elif application == SubCmd.moloch_capture:
            self.runner.install_moloch_capture()
        elif application == SubCmd.zeek:
            self.runner.install_zeek()
        elif application == SubCmd.logstash:
            self.runner.install_logstash()
