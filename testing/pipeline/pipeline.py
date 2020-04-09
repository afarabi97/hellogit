import sys
import traceback
import logging

from argparse import ArgumentParser, Namespace
from jobs.ctrl_setup import ControllerSetupJob
from jobs.drive_creation import DriveCreationJob
from jobs.kickstart import KickstartJob, MIPKickstartJob
from jobs.mip_config import MIPConfigJob
from jobs.catalog import CatalogJob
from jobs.kit import KitJob
from jobs.integration_tests import IntegrationTestsJob, PowerFailureJob
from jobs.export import ConfluenceExport, ControllerExport, generate_versions_file, MIPControllerExport

from models import add_args_from_instance
from models.ctrl_setup import ControllerSetupSettings
from models.kit import KitSettings
from models.catalog import CatalogSettings
from models.common import BasicNodeCreds
from models.kickstart import KickstartSettings, MIPKickstartSettings
from models.mip_config import MIPConfigSettings

from models.export import ExportSettings, ExportLocSettings
from models.drive_creation import DriveCreationSettings
from models.constants import SubCmd
from util.yaml_util import YamlManager
from util.ansible_util import delete_vms


class Runner:

    def _setup_logging(self):
        kit_builder = logging.getLogger()
        kit_builder.setLevel(logging.INFO)
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        kit_builder.addHandler(ch)

    def _run_catalog(self, application: str, args: Namespace):
        ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
        kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
        catalog_settings = CatalogSettings()
        catalog_settings.set_from_kickstart(kickstart_settings, args)
        YamlManager.save_to_yaml(catalog_settings)

        executor = CatalogJob(ctrl_settings, kickstart_settings, catalog_settings)
        executor.run_catalog(application)

    def _setup_args(self):
        parser = ArgumentParser(description="This application is used to run TFPlenum's CI pipeline. \
                                             It can setup Kits, export docs, export controller OVA and does \
                                             other various actions.")
        subparsers = parser.add_subparsers()
        setup_ctrl_parser = subparsers.add_parser(SubCmd.setup_ctrl, help="This command is used to setup a controller \
                                                                           either from scratch or is cloned from nightly")
        ControllerSetupSettings.add_args(setup_ctrl_parser)
        setup_ctrl_parser.set_defaults(which=SubCmd.setup_ctrl)

        kickstart_ctrl_parser = subparsers.add_parser(SubCmd.run_kickstart, help="This command is used to Kickstart/PXE \
                                                                                  boot the nodes for the DIP kit.")
        KickstartSettings.add_args(kickstart_ctrl_parser)
        kickstart_ctrl_parser.set_defaults(which=SubCmd.run_kickstart)

        mip_kickstart_ctrl_parser = subparsers.add_parser(SubCmd.run_mip_kickstart, help="This command is used to Kickstart/PXE \
                                                                           boot the nodes for the MIP.")
        MIPKickstartSettings.add_mip_args(mip_kickstart_ctrl_parser)
        mip_kickstart_ctrl_parser.set_defaults(which=SubCmd.run_mip_kickstart)

        kit_ctrl_parser = subparsers.add_parser(SubCmd.run_kit, help="This command is used to Kickstart/PXE \
                                                                      boot the nodes for the DIP kit.")
        KitSettings.add_args(kit_ctrl_parser)
        kit_ctrl_parser.set_defaults(which=SubCmd.run_kit)

        integration_tests_parser = subparsers.add_parser(SubCmd.run_integration_tests, help="This command is used to run integration tests.")
        integration_tests_parser.set_defaults(which=SubCmd.run_integration_tests)

        unittest_parser = subparsers.add_parser(SubCmd.run_unit_tests, help="This command is used to run unit tests on a given controller.")
        unittest_parser.set_defaults(which=SubCmd.run_unit_tests)

        powerfailure_parser = subparsers.add_parser(SubCmd.simulate_power_failure, help="This command is used to simulate a power failures on a Kit.")
        powerfailure_parser.set_defaults(which=SubCmd.simulate_power_failure)

        export_parser = subparsers.add_parser(SubCmd.run_export, help="This command is used to export varius artifacts from the pipeline.")
        ExportSettings.add_args(export_parser)
        export_parser.set_defaults(which=SubCmd.run_export)

        catalog_parser = subparsers.add_parser(SubCmd.run_catalog, help="This subcommand installs applications on your Kit.")
        CatalogSettings.add_args(catalog_parser)
        catalog_parser.set_defaults(which=SubCmd.run_catalog)

        cleanup_parser = subparsers.add_parser(SubCmd.run_cleanup, help="This subcommand powers off and deletes all VMs.")
        cleanup_parser.set_defaults(which=SubCmd.run_cleanup)

        drive_parser = subparsers.add_parser(SubCmd.create_master_drive, help="This subcommand will create a master drive.  Before running this subcommand please make sure you have an external USB drive plugged into a Ubuntu server or desktop.")
        drive_parser.set_defaults(which=SubCmd.create_master_drive)
        add_args_from_instance(drive_parser, DriveCreationSettings(), True)

        mip_config_parser = subparsers.add_parser(SubCmd.run_mip_config, help="Configures Kickstarted MIPs by using the api/execute_mip_config_inventory endpoint.")
        MIPConfigSettings.add_args(mip_config_parser)
        mip_config_parser.set_defaults(which=SubCmd.run_mip_config)

        parser.add_argument('--system-name', dest='system_name',
                            choices=['DIP','MIP','GIP'],
                            help="Selects which component your controller should be built for.")
        args = parser.parse_args()

        try:
            if args.which == SubCmd.setup_ctrl:
                ctrl_settings = ControllerSetupSettings()
                ctrl_settings.from_namespace(args)

                YamlManager.save_to_yaml(ctrl_settings, args.system_name)
                executor = ControllerSetupJob(ctrl_settings)
                executor.setup_controller()
            elif args.which == SubCmd.run_kickstart:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)

                kickstart_settings = KickstartSettings()
                kickstart_settings.from_namespace(args)
                YamlManager.save_to_yaml(kickstart_settings)

                executor = KickstartJob(ctrl_settings, kickstart_settings)
                executor.run_kickstart()
            elif args.which == SubCmd.run_kit:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()

                kit_settings = KitSettings()
                kit_settings.from_kickstart(kickstart_settings)
                YamlManager.save_to_yaml(kit_settings)

                executor = KitJob(ctrl_settings, kickstart_settings, kit_settings)
                executor.run_kit()
            elif args.which == SubCmd.run_unit_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()

                executor = IntegrationTestsJob(ctrl_settings, kickstart_settings)
                executor.run_unit_tests()
            elif args.which == SubCmd.run_integration_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()

                executor = IntegrationTestsJob(ctrl_settings, kickstart_settings)
                executor.run_integration_tests()
            elif args.which == SubCmd.simulate_power_failure:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
                executor = PowerFailureJob(ctrl_settings, kickstart_settings)
                executor.simulate_power_failure()
            elif args.which == SubCmd.export_html_docs:
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor = ConfluenceExport(export_settings)
                executor.export_html_docs()
            elif args.which == SubCmd.export_single_page_pdf:
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor = ConfluenceExport(export_settings)
                executor.export_pdf_docs()
            elif args.which == SubCmd.add_docs_to_controller:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = ConfluenceExport(export_settings)
                executor.add_docs_to_controller(ctrl_settings)
            elif args.which == SubCmd.unset_perms:
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = ConfluenceExport(export_settings)
                executor.set_perms_unrestricted_on_page()
            elif args.which == SubCmd.set_perms:
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = ConfluenceExport(export_settings)
                executor.set_perms_restricted_on_page()
            elif args.which == SubCmd.export_ctrl:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = ControllerExport(ctrl_settings, export_settings.export_loc)
                executor.export_controller()
            elif args.which == SubCmd.generate_versions_file:
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                generate_versions_file(export_settings.export_loc)
            elif args.which == SubCmd.create_master_drive:
                drive_settings = DriveCreationSettings()
                drive_settings.from_namespace(args)
                executor = DriveCreationJob(drive_settings)
                executor.execute()
            elif args.which == SubCmd.export_mip_ctrl:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = MIPControllerExport(ctrl_settings, export_settings.export_loc)
                executor.export_mip_controller()
            elif args.which == SubCmd.run_cleanup:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                try:
                    kickstart_settings = None
                    if args.system_name == "DIP":
                        kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
                    elif args.system_name == "MIP":
                        kickstart_settings = YamlManager.load_mip_kickstart_settings_from_yaml()
                    else:
                        raise ValueError("System type is not supported for cleanup.")

                    kickstart_settings.nodes.append(ctrl_settings.node)
                    delete_vms(ctrl_settings.vcenter, kickstart_settings.nodes)
                except FileNotFoundError:
                    delete_vms(ctrl_settings.vcenter, ctrl_settings.node)
            elif args.which == SubCmd.run_catalog:
                catalog_parser.print_help()
            elif args.which == SubCmd.run_export:
                export_parser.print_help()
            elif args.which == SubCmd.run_mip_kickstart:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)

                mip_kickstart_settings = MIPKickstartSettings()
                mip_kickstart_settings.from_mip_namespace(args)
                YamlManager.save_to_yaml(mip_kickstart_settings)

                executor = MIPKickstartJob(ctrl_settings, mip_kickstart_settings)
                executor.run_mip_kickstart()
            elif args.which == SubCmd.run_mip_config:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                kickstart_settings = YamlManager.load_mip_kickstart_settings_from_yaml()

                mip_config_settings = MIPConfigSettings()
                mip_config_settings.from_namespace(args)
                YamlManager.save_to_yaml(mip_config_settings)

                executor = MIPConfigJob(ctrl_settings, kickstart_settings, mip_config_settings)
                executor.run_mip_config()
            else:
                self._run_catalog(args.which, args)
        except ValueError as e:
            logging.exception(e)
            exit(1)
        except AttributeError as e:
            parser.print_help()
            traceback.print_exc()


def main():
    runner = Runner()
    runner._setup_logging()
    runner._setup_args()


if __name__ == "__main__":
    main()
