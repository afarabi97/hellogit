import logging
import sys
import traceback
from argparse import ArgumentParser, Namespace
from jobs.integration_tests import IntegrationTestsJob, HwPowerFailureJob
from jobs.ctrl_setup import BaremetalControllerSetup
from jobs.kit import KitSettingsJob
from jobs.catalog import CatalogJob
from jobs.breakingpoint import BPJob
from jobs.verodin import VerodinJob
from jobs.remote_node import RemoteNode
from models import add_args_from_instance
from models.common import BasicNodeCreds
from models.constants import SubCmd
from models.ctrl_setup import HwControllerSetupSettings
from models.catalog import CatalogSettings
from models.breakingpoint import BPSettings
from models.verodin import VerodinSettings
from models.node import HardwareNodeSettingsV2
from models.kit import KitSettingsV2
from util.ansible_util import delete_vms
from util.yaml_util import YamlManager


class BaremetalRunner():

    def _run_catalog(self, application: str, process: str, args: Namespace):
        ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
        kit_settings = YamlManager.load_kit_settingsv2_from_yaml()

        nodes = YamlManager.load_nodes_from_yaml_files(ctrl_settings, kit_settings)
        catalog_settings = CatalogSettings()
        catalog_settings.set_from_kickstart(nodes, kit_settings, args)
        YamlManager.save_to_yaml(catalog_settings)

        executor = CatalogJob(ctrl_settings, kit_settings, catalog_settings, nodes)
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

        kit_settings_parser = subparsers.add_parser(SubCmd.run_kit_settings,
                                                    help="This command is used to setup the Kits settings.")
        KitSettingsV2.add_args(kit_settings_parser)
        kit_settings_parser.set_defaults(which=SubCmd.run_kit_settings)


        control_plane_parser = subparsers.add_parser(SubCmd.setup_control_plane,
                                                     help="This command is used to setup the Kits control plane node.")
        control_plane_parser.set_defaults(which=SubCmd.setup_control_plane)

        add_node_parser = subparsers.add_parser(SubCmd.add_node,
                                                help="This command is used to setup an arbitrary node.")
        HardwareNodeSettingsV2.add_args(add_node_parser)
        add_node_parser.set_defaults(which=SubCmd.add_node)

        deploy_kit_parser = subparsers.add_parser(SubCmd.deploy_kit,
                                                  help="This command is used to deploy the kit after two servers have been setup.")
        deploy_kit_parser.set_defaults(which=SubCmd.deploy_kit)

        integration_tests_parser = subparsers.add_parser(
        SubCmd.run_integration_tests, help="This command is used to run integration tests.")
        integration_tests_parser.set_defaults(which=SubCmd.run_integration_tests)

        powerfailure_parser = subparsers.add_parser(SubCmd.simulate_power_failure,
                                                    help="This command is used to simulate a power failures on a Kit.")
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

        args = parser.parse_args()
        self.args = args
        try:
            if args.which == SubCmd.setup_baremetal_ctrl:
                ctrl_settings = HwControllerSetupSettings()
                ctrl_settings.from_namespace(args)
                YamlManager.save_to_yaml(ctrl_settings)
                executor = BaremetalControllerSetup(ctrl_settings)
                executor.setup_controller()
            elif args.which == SubCmd.run_kit_settings:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = KitSettingsV2()
                kit_settings.from_namespace(args, ctrl_settings.node.ipaddress)
                YamlManager.save_to_yaml(kit_settings)

                job = KitSettingsJob(ctrl_settings, kit_settings, is_virtual=False)
                job.save_vmware_settings()
                job.save_kit_settings()
            elif args.which == SubCmd.setup_control_plane:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()

                job = KitSettingsJob(ctrl_settings, kit_settings)
                job.setup_control_plane()
            elif args.which == SubCmd.add_node:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = HardwareNodeSettingsV2.initalize_node_array(kit_settings, args, ctrl_settings)
                YamlManager.save_nodes_to_yaml_files(nodes)

                job = KitSettingsJob(ctrl_settings, kit_settings)
                job.add_hardware_nodes(nodes)
            elif args.which == SubCmd.deploy_kit:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                job = KitSettingsJob(ctrl_settings, kit_settings)
                job.deploy_kit()
            elif args.which == SubCmd.run_integration_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = YamlManager.load_nodes_from_yaml_files(ctrl_settings, kit_settings)
                executor = IntegrationTestsJob(ctrl_settings, kit_settings, nodes)
                executor.run_integration_tests()
            elif args.which == SubCmd.simulate_power_failure:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = YamlManager.load_nodes_from_yaml_files(ctrl_settings, kit_settings)
                executor = HwPowerFailureJob(kit_settings, nodes)
                executor.run_power_cycle()
            elif args.which == SubCmd.run_catalog:
                catalog_parser.print_help()
            elif args.which == SubCmd.run_bp:
                bp_settings = BPSettings()
                bp_settings.from_namespace(args)
                executor = BPJob(bp_settings)
                executor.run_test()
            elif args.which == SubCmd.run_remote_node:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                executor = RemoteNode(ctrl_settings, kit_settings)
                executor.remote_node_config()
            elif args.which == SubCmd.run_verodin:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = YamlManager.load_nodes_from_yaml_files(ctrl_settings, kit_settings)

                verodin_settings = VerodinSettings()
                verodin_settings.from_namespace(args)
                executor = VerodinJob(verodin_settings, ctrl_settings,
                                      nodes, kit_settings)
                executor.run_job()
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
