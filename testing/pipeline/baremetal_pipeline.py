import logging
import sys
import traceback
from argparse import ArgumentParser, Namespace

from jobs.integration_tests import IntegrationTestsJob, HwPowerFailureJob
from jobs.ctrl_setup import BaremetalControllerSetup
from jobs.kickstart import HwKickstartJob
from jobs.kit import KitJob
from jobs.catalog import CatalogJob
from models import add_args_from_instance
from models.common import BasicNodeCreds
from models.constants import SubCmd
from models.ctrl_setup import HwControllerSetupSettings
from models.kickstart import HwKickstartSettings
from models.kit import HwKitSettings
from models.catalog import CatalogSettings
from util.ansible_util import delete_vms
from util.yaml_util import YamlManager

import os
from os import listdir
from os.path import isfile, join

class BaremetalRunner():

    def _run_catalog(self, application: str, process: str, args: Namespace):
        ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
            args.system_name,HwControllerSetupSettings)
        kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
        catalog_settings = CatalogSettings()
        catalog_settings.set_from_kickstart(kickstart_settings, args)
        YamlManager.save_to_yaml(catalog_settings)

        executor = CatalogJob(
            ctrl_settings, kickstart_settings, catalog_settings)
        executor.run_catalog(application, process)

    def _setup_args(self):
        parser = ArgumentParser(description="This application is used to run TFPlenum's CI pipeline. \
                                                It can setup Kits, export docs, export controller OVA and does \
                                                other various actions.")

        
        subparsers = parser.add_subparsers()
        setup_ctrl_parser = subparsers.add_parser(SubCmd.setup_baremetal_ctrl,
            help="This command is used to setup a controller either from \
                    scratch or is cloned from nightly")
        HwControllerSetupSettings.add_args(setup_ctrl_parser)
        setup_ctrl_parser.set_defaults(which=SubCmd.setup_baremetal_ctrl)

        kickstart_parser = subparsers.add_parser(SubCmd.run_kickstart,
                help="")
        HwKickstartSettings.add_args(kickstart_parser)
        kickstart_parser.set_defaults(which=SubCmd.run_kickstart)

        kit_ctrl_parser = subparsers.add_parser(SubCmd.run_kit, help="This command is used to run kit configuration\
                                                                        for the DIP kit.")
        kit_ctrl_parser.set_defaults(which=SubCmd.run_kit)

        integration_tests_parser = subparsers.add_parser(
        SubCmd.run_integration_tests, help="This command is used to run integration tests.")
        integration_tests_parser.set_defaults(which=SubCmd.run_integration_tests)

        powerfailure_parser = subparsers.add_parser(
        SubCmd.simulate_power_failure, help="This command is used to simulate a power failures on a Kit.")
        powerfailure_parser.set_defaults(which=SubCmd.simulate_power_failure)

        catalog_parser = subparsers.add_parser(
            SubCmd.run_catalog, help="This subcommand installs applications on your Kit.")
        CatalogSettings.add_args(catalog_parser)
        catalog_parser.set_defaults(which=SubCmd.run_catalog)

        parser.add_argument('--system-name', dest='system_name', choices=['DIP','MIP'],
                            help="Selects which component your controller should be built for.")
        args = parser.parse_args()
        self.args = args
        try:
            if args.which == SubCmd.setup_baremetal_ctrl:
                self.ctrl_settings = HwControllerSetupSettings()
                self.ctrl_settings.from_namespace(args)
                YamlManager.save_to_yaml(self.ctrl_settings, args.system_name)
            elif args.which == SubCmd.run_kickstart:
                self.ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name,HwControllerSetupSettings)
                self.kickstart_settings = HwKickstartSettings()
                self.kickstart_settings.from_namespace(args)
                YamlManager.save_to_yaml(self.kickstart_settings)
            elif args.which == SubCmd.run_kit:
                self.ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                args.system_name, HwControllerSetupSettings)
                self.kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
                self.kit_settings = HwKitSettings()
                self.kit_settings.from_kickstart(self.kickstart_settings)
                YamlManager.save_to_yaml(self.kit_settings)
            elif args.which == SubCmd.run_integration_tests:
                self.ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name,HwControllerSetupSettings)
                self.kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
            elif args.which == SubCmd.simulate_power_failure:
                self.kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
            elif args.which == SubCmd.run_catalog:
                catalog_parser.print_help()
            else:
                self._run_catalog(args.which, args.process, args)
        except ValueError as e:
            logging.exception(e)
            print(e)
            sys.exit(1)
        except AttributeError as e:
            parser.print_help()
            traceback.print_exc()
            sys.exit(1)

    def _run(self):
        try:
            if self.args.which == SubCmd.setup_baremetal_ctrl:
                executor = BaremetalControllerSetup(self.ctrl_settings)
                executor.setup_controller()
            elif self.args.which == SubCmd.run_kickstart:
                executor = HwKickstartJob(self.ctrl_settings, self.kickstart_settings)
                executor.run_kickstart()
            elif self.args.which == SubCmd.run_kit:
                executor = KitJob(
                            self.ctrl_settings,
                            self.kickstart_settings,
                            self.kit_settings
                            )
                executor.run_kit(virtual=False)
            elif self.args.which == SubCmd.run_integration_tests:
                executor = IntegrationTestsJob(
                                self.ctrl_settings, 
                                self.kickstart_settings
                                )
                executor.run_integration_tests()
            elif self.args.which == SubCmd.simulate_power_failure:
                executor = HwPowerFailureJob(self.kickstart_settings)
                executor.run_power_cycle()
                
        except Exception as e:
            print("\n** ERROR:")
            print(e)
            raise e
            sys.exit(1)

def main():
    baremetalrunner = BaremetalRunner()
    baremetalrunner._setup_args()
    baremetalrunner._run()

if __name__ == "__main__":
    main()
