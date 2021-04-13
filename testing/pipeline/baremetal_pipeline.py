import logging
import sys
import traceback
from argparse import ArgumentParser, Namespace

from jobs.integration_tests import IntegrationTestsJob, HwPowerFailureJob
from jobs.ctrl_setup import BaremetalControllerSetup
from jobs.kickstart import HwKickstartJob, HwMIPKickstartJob
from jobs.mip_config import MIPConfigJob
from jobs.kit import KitJob
from jobs.catalog import CatalogJob
from jobs.breakingpoint import BPJob
from jobs.verodin import VerodinJob
from jobs.remote_node import RemoteNode
from models import add_args_from_instance
from models.common import BasicNodeCreds
from models.constants import SubCmd
from models.ctrl_setup import HwControllerSetupSettings
from models.kickstart import HwKickstartSettings
from models.kit import HwKitSettings
from models.catalog import CatalogSettings
from models.breakingpoint import BPSettings
from models.verodin import VerodinSettings
from util.ansible_util import delete_vms
from util.yaml_util import YamlManager
from models.kickstart import HwMIPKickstartSettings
from models.mip_config import MIPConfigSettings

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

        bp_parser = subparsers.add_parser(
            SubCmd.run_bp, help="this subcommand runs breaking point on your kit")
        BPSettings.add_args(bp_parser)
        bp_parser.set_defaults(which=SubCmd.run_bp)

        remote_parser = subparsers.add_parser(
            SubCmd.run_remote_node, help="this subcommand runs remote node")
        remote_parser.set_defaults(which=SubCmd.run_remote_node)


        verodin_parser = subparsers.add_parser(
            SubCmd.run_verodin, help="this subcommand run verodin traffic choosen from endpoint or network actors")
        VerodinSettings.add_args(verodin_parser)
        verodin_parser.set_defaults(which=SubCmd.run_verodin)

        mip_kickstart_ctrl_parser = subparsers.add_parser(SubCmd.run_mip_kickstart,
                                                          help="This command is used to Kickstart/PXE \
                                                                boot the nodes for the MIP.")
        HwMIPKickstartSettings.add_mip_args(mip_kickstart_ctrl_parser)
        mip_kickstart_ctrl_parser.set_defaults(which=SubCmd.run_mip_kickstart)

        mip_config_parser = subparsers.add_parser(
            SubCmd.run_mip_config,
            help="Configures Kickstarted MIPs by using the api/execute_mip_config_inventory endpoint.")
        MIPConfigSettings.add_args(mip_config_parser)
        mip_config_parser.set_defaults(which=SubCmd.run_mip_config)

        parser.add_argument('--system-name', dest='system_name', choices=['DIP','MIP'],
                            help="Selects which component your controller should be built for.")

        args = parser.parse_args()
        self.args = args
        try:
            if args.which == SubCmd.setup_baremetal_ctrl:
                ctrl_settings = HwControllerSetupSettings()
                ctrl_settings.from_namespace(args)
                YamlManager.save_to_yaml(ctrl_settings, args.system_name)
                executor = BaremetalControllerSetup(ctrl_settings)
                executor.setup_controller()
            elif args.which == SubCmd.run_kickstart:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name,HwControllerSetupSettings)
                kickstart_settings = HwKickstartSettings()
                kickstart_settings.from_namespace(args)
                YamlManager.save_to_yaml(kickstart_settings)
                executor = HwKickstartJob(ctrl_settings, kickstart_settings)
                executor.run_kickstart()
            elif args.which == SubCmd.run_kit:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                args.system_name, HwControllerSetupSettings)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
                kit_settings = HwKitSettings()
                kit_settings.from_kickstart(kickstart_settings)
                YamlManager.save_to_yaml(kit_settings)
                executor = KitJob(ctrl_settings, kickstart_settings, kit_settings)
                executor.run_kit(virtual=False)
            elif args.which == SubCmd.run_integration_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name,HwControllerSetupSettings)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
                executor = IntegrationTestsJob(ctrl_settings, kickstart_settings)
                executor.run_integration_tests()
            elif args.which == SubCmd.simulate_power_failure:
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
                executor = HwPowerFailureJob(kickstart_settings)
                executor.run_power_cycle()
            elif args.which == SubCmd.run_catalog:
                catalog_parser.print_help()
            elif args.which == SubCmd.run_bp:
                bp_settings = BPSettings()
                bp_settings.from_namespace(args)
                executor = BPJob(bp_settings)
                executor.run_test()
            elif args.which == SubCmd.run_remote_node:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name,HwControllerSetupSettings)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
                executor = RemoteNode(ctrl_settings, kickstart_settings)
                executor.remote_node_config()
            elif args.which == SubCmd.run_verodin:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name, HwControllerSetupSettings)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml(HwKickstartSettings)
                kit_settings = HwKitSettings()
                verodin_settings = VerodinSettings()
                verodin_settings.from_namespace(args)
                executor = VerodinJob(verodin_settings, ctrl_settings,
                                      kickstart_settings, kit_settings)
                executor.run_job()
            elif args.which == SubCmd.run_mip_kickstart:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name, HwControllerSetupSettings)
                mip_kickstart_settings = HwMIPKickstartSettings()
                mip_kickstart_settings.from_mip_namespace(args)
                YamlManager.save_to_yaml(mip_kickstart_settings)
                executor = HwMIPKickstartJob(
                    ctrl_settings, mip_kickstart_settings)
                executor.run_hw_mip_kickstart()
            elif args.which == SubCmd.run_mip_config:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name, HwControllerSetupSettings)
                kickstart_settings = YamlManager.load_hw_mip_kickstart_settings_from_yaml()
                mip_config_settings = MIPConfigSettings()
                mip_config_settings.from_namespace(args)
                YamlManager.save_to_yaml(mip_config_settings)
                executor = MIPConfigJob(ctrl_settings, kickstart_settings, mip_config_settings)
                executor.run_mip_config()
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
        except Exception as e:
            print("\n** ERROR:")
            print(e)
            raise e

def main():
    baremetalrunner = BaremetalRunner()
    baremetalrunner._setup_args()

if __name__ == "__main__":
    main()
