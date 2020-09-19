import sys
import traceback
import logging

from argparse import ArgumentParser, Namespace
from jobs.ctrl_setup import ControllerSetupJob, checkout_latest_code
from jobs.drive_creation import DriveCreationJob, DriveHashCreationJob
from jobs.kickstart import KickstartJob, MIPKickstartJob, GIPKickstartJob
from jobs.mip_config import MIPConfigJob
from jobs.mip_save_kit import MIPSaveKitJob
from jobs.catalog import CatalogJob
from jobs.kit import KitJob
from jobs.integration_tests import IntegrationTestsJob, PowerFailureJob
from jobs.export import (ConfluenceExport, ControllerExport,
                         MIPControllerExport, GIPServiceExport, ReposyncServerExport,
                         ReposyncWorkstationExport, MinIOExport)
from jobs.gip_creation import GipCreationJob
from jobs.minio import StandAloneMinIO
from jobs.rhel_repo_creation import RHELCreationJob, RHELExportJob
from jobs.rhel_workstation_creation import WorkstationCreationJob, WorkstationExportJob
from jobs.stig import StigJob
from jobs.robot import RobotJob
from models import add_args_from_instance
from models.ctrl_setup import ControllerSetupSettings
from models.kit import KitSettings
from models.catalog import CatalogSettings
from models.common import BasicNodeCreds, NodeSettings, VCenterSettings, RepoSettings
from models.kickstart import KickstartSettings, MIPKickstartSettings, GIPKickstartSettings
from models.mip_config import MIPConfigSettings

from models.export import ExportSettings, ExportLocSettings
from models.drive_creation import DriveCreationSettings, DriveCreationHashSettings
from models.constants import SubCmd
from models.gip_settings import GIPServiceSettings, GIPKitSettings
from models.rhel_repo_vm import RHELRepoSettings
from models.stig import STIGSettings
from models.robot import RobotSettings
from util.yaml_util import YamlManager
from util.ansible_util import delete_vms, create_nightly


class Runner:

    def _setup_logging(self):
        kit_builder = logging.getLogger()
        kit_builder.setLevel(logging.INFO)
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        kit_builder.addHandler(ch)

    def _run_catalog(self, application: str, process: str, args: Namespace):
        ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
            args.system_name)
        kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
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
        subparsers = parser.add_subparsers(help='commands')
        setup_ctrl_parser = subparsers.add_parser(SubCmd.setup_ctrl,
                                                  help="This command is used to setup a controller \
                                                        either from scratch or is cloned from nightly")
        ControllerSetupSettings.add_args(setup_ctrl_parser)
        setup_ctrl_parser.set_defaults(which=SubCmd.setup_ctrl)

        kickstart_ctrl_parser = subparsers.add_parser(SubCmd.run_kickstart,
                                                      help="This command is used to Kickstart/PXE \
                                                            boot the nodes for the DIP kit.")
        KickstartSettings.add_args(kickstart_ctrl_parser)
        kickstart_ctrl_parser.set_defaults(which=SubCmd.run_kickstart)

        mip_kickstart_ctrl_parser = subparsers.add_parser(SubCmd.run_mip_kickstart,
                                                          help="This command is used to Kickstart/PXE \
                                                                boot the nodes for the MIP.")
        MIPKickstartSettings.add_mip_args(mip_kickstart_ctrl_parser)
        mip_kickstart_ctrl_parser.set_defaults(which=SubCmd.run_mip_kickstart)

        kit_ctrl_parser = subparsers.add_parser(SubCmd.run_kit,
                                                help="This command is used to Kickstart/PXE \
                                                      boot the nodes for the DIP kit.")
        KitSettings.add_args(kit_ctrl_parser)
        kit_ctrl_parser.set_defaults(which=SubCmd.run_kit)

        integration_tests_parser = subparsers.add_parser(
            SubCmd.run_integration_tests, help="This command is used to run integration tests.")
        integration_tests_parser.set_defaults(
            which=SubCmd.run_integration_tests)

        unittest_parser = subparsers.add_parser(
            SubCmd.run_unit_tests, help="This command is used to run unit tests on a given controller.")
        unittest_parser.set_defaults(which=SubCmd.run_unit_tests)

        powerfailure_parser = subparsers.add_parser(
            SubCmd.simulate_power_failure, help="This command is used to simulate a power failures on a Kit.")
        powerfailure_parser.set_defaults(which=SubCmd.simulate_power_failure)

        export_parser = subparsers.add_parser(
            SubCmd.run_export, help="This command is used to export varius artifacts from the pipeline.")
        ExportSettings.add_args(export_parser)
        export_parser.set_defaults(which=SubCmd.run_export)

        catalog_parser = subparsers.add_parser(
            SubCmd.run_catalog, help="This subcommand installs applications on your Kit.")
        CatalogSettings.add_args(catalog_parser)
        catalog_parser.set_defaults(which=SubCmd.run_catalog)

        publish_nightly_parser = subparsers.add_parser(SubCmd.run_publish_nightly,
                                                       help="This subcommand publishes VMs to the template folder for the nightly build process.")
        publish_nightly_parser.set_defaults(which=SubCmd.run_publish_nightly)
        publish_nightly_parser.add_argument('--nightly-prefix', dest='nightly_prefix', required=True,
                                            help="Creates nightly controllers after before cleanup ('Yes' or 'No')")

        cleanup_parser = subparsers.add_parser(
            SubCmd.run_cleanup, help="This subcommand powers off and deletes all VMs.")
        cleanup_parser.set_defaults(which=SubCmd.run_cleanup)

        mip_config_parser = subparsers.add_parser(
            SubCmd.run_mip_config,
            help="Configures Kickstarted MIPs by using the api/execute_mip_config_inventory endpoint.")
        MIPConfigSettings.add_args(mip_config_parser)
        mip_config_parser.set_defaults(which=SubCmd.run_mip_config)

        gip_setup_parser = subparsers.add_parser( SubCmd.gip_setup,
                                                  help="Configures GIP VMs and other related commands.")
        gip_setup_subparsers = gip_setup_parser.add_subparsers(help="gip setup commands")
        GIPKickstartSettings.add_args(gip_setup_subparsers) # Creates a parser and adds arguments to it.
        GIPServiceSettings.add_args(gip_setup_subparsers) # Creates a parser and adds arguments to it.
        GIPKitSettings.add_args(gip_setup_subparsers) # Creates a parser and adds arguments to it.

        # minio
        minio_parser = gip_setup_subparsers.add_parser(SubCmd.minio_command)
        minio_parser.set_defaults(application='minio')
        # minio commands
        minio_commands = minio_parser.add_subparsers(help="Commands for creating a stand alone MinIO server.")
        # setup minio
        minio_setup_parser = minio_commands.add_parser(
            SubCmd.setup_minio.name,
            help="Creates a stand alone MinIO server.")
        minio_setup_parser.set_defaults(which=SubCmd.setup_minio.id)
        NodeSettings.add_args(minio_setup_parser, True)
        VCenterSettings.add_args(minio_setup_parser)
        # create certificate minio
        minio_create_certificate_parser = minio_commands.add_parser(
            SubCmd.create_certificate_minio.name,
            help="Creates a TLS certificate on the MinIO server.")
        minio_create_certificate_parser.set_defaults(which=SubCmd.create_certificate_minio.id)

        test_server_vm_parser = subparsers.add_parser(
            SubCmd.test_server_repository_vm, help="Tests the reposync server repository VM.")
        RHELRepoSettings.add_args(test_server_vm_parser)
        test_server_vm_parser.set_defaults(
            which=SubCmd.test_server_repository_vm)

        test_workstation_vm_parser = subparsers.add_parser(
            SubCmd.test_workstation_repository_vm, help="Tests the reposync workstation respository VM.")
        RHELRepoSettings.add_args(test_workstation_vm_parser)
        test_workstation_vm_parser.set_defaults(
            which=SubCmd.test_workstation_repository_vm)

        build_server_for_export_parser = subparsers.add_parser(
            SubCmd.build_server_for_export, help="Builds the reposync server for export.")
        RHELRepoSettings.add_args(build_server_for_export_parser)
        build_server_for_export_parser.set_defaults(
            which=SubCmd.build_server_for_export)

        build_workstation_for_export_parser = subparsers.add_parser(
            SubCmd.build_workstation_for_export, help="Builds the reposync workstation for export.")
        RHELRepoSettings.add_args(build_workstation_for_export_parser)
        build_workstation_for_export_parser.set_defaults(
            which=SubCmd.build_workstation_for_export)

        # ROBOTS BEING RAN
        robot_test_parser = subparsers.add_parser(SubCmd.run_robot, help="Apply Robot Tests To The System.")
        RobotSettings.add_args(robot_test_parser)
        robot_test_parser.set_defaults(which=SubCmd.run_robot)

        # STIGS BEING APPLIED
        stig_ctrl_parser = subparsers.add_parser(
            SubCmd.run_stigs, help="This command is used to apply STIGs to the nodes for a given system.")
        STIGSettings.add_args(stig_ctrl_parser)
        stig_ctrl_parser.set_defaults(which=SubCmd.run_stigs)

        latest_code_parser = subparsers.add_parser(
            SubCmd.checkout_latest_code, help="Pulls the latest git commit of your branch.")
        RepoSettings.add_args(latest_code_parser)
        latest_code_parser.set_defaults(which=SubCmd.checkout_latest_code)

        parser.add_argument('--system-name', dest='system_name',
                            choices=['DIP', 'MIP', 'GIP', 'REPO'],
                            help="Selects which component your controller should be built for.")

        args = parser.parse_args()

        try:
            if args.which == SubCmd.setup_minio.id:
                vcenter = VCenterSettings()
                vcenter.from_namespace(args)
                node = NodeSettings()
                node.from_namespace(args, args.application)
                StandAloneMinIO(vcenter, node).create()
                YamlManager.save_to_yaml(vcenter, args.application)
                YamlManager.save_to_yaml(node, args.application)
            elif args.which == SubCmd.create_certificate_minio.id:
                StandAloneMinIO(
                    YamlManager.load_vcenter_settings(args.application),
                    YamlManager.load_node_settings(args.application),
                    YamlManager.load_ctrl_settings_from_yaml('dip').node.ipaddress) \
                .create_certificate()
            elif args.which == SubCmd.export_minio.id:
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                MinIOExport(
                    YamlManager.load_node_settings(args.application),
                    YamlManager.load_vcenter_settings(args.application),
                    export_settings.export_loc) \
                .export()
            elif args.which == SubCmd.test_server_repository_vm:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args, True)
                executor = RHELCreationJob(repo_settings)
                executor.execute()
            elif args.which == SubCmd.test_workstation_repository_vm:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args, False)
                executor = WorkstationCreationJob(repo_settings)
                executor.execute()
            elif args.which == SubCmd.build_server_for_export:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args, True)
                YamlManager.save_to_yaml(repo_settings, "server")
                executor = RHELExportJob(repo_settings)
                executor.build_export()
            elif args.which == SubCmd.build_workstation_for_export:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args, False)
                YamlManager.save_to_yaml(repo_settings, "workstation")
                executor = WorkstationExportJob(repo_settings)
                executor.build_export()
            elif args.which == SubCmd.export_reposync_server:
                server_repo_settings = YamlManager.load_reposync_settings_from_yaml( "server")
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor_server = ReposyncServerExport( server_repo_settings, export_settings.export_loc)
                executor_server.export_reposync_server()
            elif args.which == SubCmd.export_reposync_workstation:
                workstation_repo_settings = YamlManager.load_reposync_settings_from_yaml( "workstation")
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor_workstation = ReposyncWorkstationExport( workstation_repo_settings,
                                                                  export_settings.export_loc)
                executor_workstation.export_reposync_workstation()

            elif args.which == SubCmd.export_gip_service_vm:
                gip_service_settings = YamlManager.load_gip_service_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor = GIPServiceExport( gip_service_settings, export_settings.export_loc)
                executor.export_gip_service_vm()
            elif args.which == SubCmd.run_gip_kickstart:
                gip_controller_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                controller_settings = gip_controller_settings.controller_settings

                gip_kickstart_settings = GIPKickstartSettings()
                gip_kickstart_settings.from_namespace(args)
                YamlManager.save_to_yaml(gip_kickstart_settings)
                executor = GIPKickstartJob( controller_settings, gip_kickstart_settings)
                executor.run_kickstart()
            elif args.which == SubCmd.run_gip_kit:
                controller_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                gip_kickstart_settings = YamlManager.load_gip_kickstart_settings_from_yaml()
                gip_kit_settings = GIPKitSettings()
                gip_kit_settings.from_kickstart(gip_kickstart_settings)

                YamlManager.save_to_yaml(gip_kit_settings)
                kit_settings = gip_kit_settings.kit_settings
                executor = KitJob(controller_settings, gip_kickstart_settings, kit_settings)
                executor.run_kit()
            elif args.which == SubCmd.create_gip_service_vm:
                service_settings = GIPServiceSettings()
                service_settings.from_namespace(args)

                YamlManager.save_to_yaml(service_settings)
                executor = GipCreationJob(service_settings)
                executor.execute()

            elif args.which == SubCmd.setup_ctrl:
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
                executor = KitJob( ctrl_settings, kickstart_settings, kit_settings)
                executor.run_kit()
            elif args.which == SubCmd.run_stigs:
                stig_settings = STIGSettings()
                stig_settings.from_namespace(args)
                executor = StigJob(stig_settings)
                executor.run_stig()
                stig_settings.take_snapshot_for_certain_systems()
            elif args.which == SubCmd.run_robot:
                robot_settings = RobotSettings()
                robot_settings.from_namespace(args)
                executor = RobotJob(robot_settings)
                executor.run_robot()
            elif args.which == SubCmd.run_unit_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                try:
                    kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
                except FileNotFoundError:
                    kickstart_settings = None

                executor = IntegrationTestsJob( ctrl_settings, kickstart_settings)
                executor.run_unit_tests()
            elif args.which == SubCmd.run_integration_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()

                executor = IntegrationTestsJob(
                    ctrl_settings, kickstart_settings)
                executor.run_integration_tests()
            elif args.which == SubCmd.simulate_power_failure:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name)
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
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name)
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
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name)
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = ControllerExport(
                    ctrl_settings, export_settings.export_loc)
                executor.export_controller()
            elif args.which == SubCmd.create_master_drive_hashes:
                drive_hash_settings = DriveCreationHashSettings()
                drive_hash_settings.from_namespace(args)
                executor = DriveHashCreationJob(drive_hash_settings)
                executor.execute()
            elif args.which == SubCmd.check_master_drive_hashes:
                drive_hash_settings = DriveCreationHashSettings()
                drive_hash_settings.from_namespace(args)
                executor = DriveHashCreationJob(drive_hash_settings)
                executor.create_verification_script_and_validate()
            elif args.which == SubCmd.create_master_drive:
                drive_settings = DriveCreationSettings()
                drive_settings.from_namespace(args)
                executor = DriveCreationJob(drive_settings)
                executor.execute()
            elif args.which == SubCmd.export_mip_ctrl:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name)
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = MIPControllerExport(
                    ctrl_settings, export_settings.export_loc)
                executor.export_mip_controller()

            elif args.which == SubCmd.run_publish_nightly:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)

                if args.system_name == "MIP":
                    kickstart_settings = YamlManager.load_mip_kickstart_settings_from_yaml()
                    executor = MIPSaveKitJob(ctrl_settings,
                                             kickstart_settings)
                    nightly_mip = "{}-operator-mip".format(args.nightly_prefix)
                    executor.save_mip_kit(nightly_mip)

                nightly_vm_name = "{}-{}-ctrl".format(args.nightly_prefix, args.system_name.lower())
                create_nightly(ctrl_settings.vcenter,
                               ctrl_settings.node,
                               nightly_vm_name)
            elif args.which == SubCmd.run_cleanup:
                if args.system_name == "DIP":
                    ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                    try:
                        kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
                        kickstart_settings.nodes.append(ctrl_settings.node)
                        delete_vms(ctrl_settings.vcenter,
                                   kickstart_settings.nodes)
                    except FileNotFoundError:
                        delete_vms(ctrl_settings.vcenter, ctrl_settings.node)

                elif args.system_name == "MIP":
                    ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                        args.system_name)
                    try:
                        kickstart_settings = YamlManager.load_mip_kickstart_settings_from_yaml()
                        kickstart_settings.mips.append(ctrl_settings.node)
                        delete_vms(ctrl_settings.vcenter,
                                   kickstart_settings.mips)
                    except FileNotFoundError:
                        delete_vms(ctrl_settings.vcenter, ctrl_settings.node)
                elif args.system_name == "GIP":
                    try:
                        gip_settings = YamlManager.load_ctrl_settings_from_yaml(args.system_name)
                        delete_vms(gip_settings.vcenter, gip_settings.node)
                    except FileNotFoundError:
                        pass
            elif args.which == SubCmd.run_catalog:
                catalog_parser.print_help()
            elif args.which == SubCmd.run_export:
                export_parser.print_help()
            elif args.which == SubCmd.run_mip_kickstart:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name)
                mip_kickstart_settings = MIPKickstartSettings()
                mip_kickstart_settings.from_mip_namespace(args)
                YamlManager.save_to_yaml(mip_kickstart_settings)

                executor = MIPKickstartJob(
                    ctrl_settings, mip_kickstart_settings)
                executor.run_mip_kickstart()
            elif args.which == SubCmd.run_mip_config:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml(
                    args.system_name)
                kickstart_settings = YamlManager.load_mip_kickstart_settings_from_yaml()

                mip_config_settings = MIPConfigSettings()
                mip_config_settings.from_namespace(args)
                YamlManager.save_to_yaml(mip_config_settings)

                executor = MIPConfigJob(
                    ctrl_settings, kickstart_settings, mip_config_settings)
                executor.run_mip_config()
            elif args.which == SubCmd.checkout_latest_code:
                repo_settings = RepoSettings()
                repo_settings.from_namespace(args)
                checkout_latest_code(repo_settings)
            else:
                self._run_catalog(args.which, args.process, args)
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
