import sys
import traceback
import logging

from argparse import ArgumentParser, Namespace
from jobs.ctrl_setup import ControllerSetupJob, checkout_latest_code
from jobs.drive_creation import DriveCreationJob, DriveHashCreationJob
from jobs.catalog import CatalogJob
from jobs.internal_vdd import InternalVDDJob
from jobs.kit import KitSettingsJob
from jobs.oscap import OSCAPScanJob
from jobs.integration_tests import IntegrationTestsJob, PowerFailureJob
from jobs.export import (ConfluenceExport, ControllerExport, GIPServiceExport,
                         ReposyncServerExport, MinIOExport)
from jobs.gip_creation import GipCreationJob
from jobs.minio import StandAloneMinIO
from jobs.rhel_repo_creation import RHELCreationJob, RHELExportJob
from jobs.robot import RobotJob
from models.ctrl_setup import ControllerSetupSettings
from models.internal_vdd import InternalVDDSettings
from models.kit import KitSettingsV2
from models.catalog import CatalogSettings
from models.common import RepoSettings
from models.node import NodeSettingsV2

from models.export import ExportSettings
from models.drive_creation import DriveCreationSettings, DriveCreationHashSettings
from models.constants import SubCmd
from models.gip_settings import GIPServiceSettings
from models.rhel_repo_vm import RHELRepoSettings
from models.robot import RobotSettings
from models.minio import MinIOSettings
from util.yaml_util import YamlManager
from util.ansible_util import delete_vms
from util.constants import MINIO_PREFIX


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
        subparsers = parser.add_subparsers(help='commands')
        setup_ctrl_parser = subparsers.add_parser(SubCmd.setup_ctrl,
                                                  help="This command is used to setup a controller \
                                                        either from scratch or is cloned from nightly")
        ControllerSetupSettings.add_args(setup_ctrl_parser)
        setup_ctrl_parser.set_defaults(which=SubCmd.setup_ctrl)

        kit_settings_parser = subparsers.add_parser(SubCmd.run_kit_settings,
                                                      help="This command is used to setup the Kits settings.")
        KitSettingsV2.add_args(kit_settings_parser)
        kit_settings_parser.set_defaults(which=SubCmd.run_kit_settings)

        control_plane_parser = subparsers.add_parser(SubCmd.setup_control_plane,
                                                     help="This command is used to setup the Kits control plane node.")
        control_plane_parser.set_defaults(which=SubCmd.setup_control_plane)

        add_node_parser = subparsers.add_parser(SubCmd.add_node,
                                                help="This command is used to setup an arbitrary node.")
        NodeSettingsV2.add_args(add_node_parser)
        add_node_parser.set_defaults(which=SubCmd.add_node)

        deploy_kit_parser = subparsers.add_parser(SubCmd.deploy_kit,
                                                help="This command is used to deploy the kit after two servers have been setup.")
        deploy_kit_parser.set_defaults(which=SubCmd.deploy_kit)

        oscap_parser = subparsers.add_parser(SubCmd.run_oscap_scans,
                                             help="This command is used to run oscap scans on each node.")
        oscap_parser.set_defaults(which=SubCmd.run_oscap_scans)

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
            SubCmd.run_export, help="This command is used to export various artifacts from the pipeline.")
        ExportSettings.add_args(export_parser)
        export_parser.set_defaults(which=SubCmd.run_export)

        catalog_parser = subparsers.add_parser(
            SubCmd.run_catalog, help="This subcommand installs applications on your Kit.")
        CatalogSettings.add_args(catalog_parser)
        catalog_parser.set_defaults(which=SubCmd.run_catalog)

        cleanup_parser = subparsers.add_parser(
            SubCmd.run_cleanup, help="This subcommand powers off and deletes all VMs.")
        cleanup_parser.set_defaults(which=SubCmd.run_cleanup)

        gip_setup_parser = subparsers.add_parser(SubCmd.gip_setup,
                                                  help="Configures GIP VMs and other related commands.")
        gip_setup_subparsers = gip_setup_parser.add_subparsers(help="gip setup commands")
        GIPServiceSettings.add_args(gip_setup_subparsers) # Creates a parser and adds arguments to it.

        minio_setup_parser = subparsers.add_parser(SubCmd.setup_minio, help="Creates a stand alone MinIO server.")
        minio_setup_parser.set_defaults(which=SubCmd.setup_minio)
        MinIOSettings.add_args(minio_setup_parser)

        test_server_vm_parser = subparsers.add_parser(
            SubCmd.test_server_repository_vm, help="Tests the reposync server repository VM.")
        RHELRepoSettings.add_args(test_server_vm_parser)
        test_server_vm_parser.set_defaults(
            which=SubCmd.test_server_repository_vm)

        build_server_for_export_parser = subparsers.add_parser(
            SubCmd.build_server_for_export, help="Builds the reposync server for export.")
        RHELRepoSettings.add_args(build_server_for_export_parser)
        build_server_for_export_parser.set_defaults(
            which=SubCmd.build_server_for_export)

        robot_test_parser = subparsers.add_parser(SubCmd.run_robot, help="Apply Robot Tests To The System.")
        RobotSettings.add_args(robot_test_parser)
        robot_test_parser.set_defaults(which=SubCmd.run_robot)

        latest_code_parser = subparsers.add_parser(
            SubCmd.checkout_latest_code, help="Pulls the latest git commit of your branch.")
        RepoSettings.add_args(latest_code_parser)
        latest_code_parser.set_defaults(which=SubCmd.checkout_latest_code)

        # Internal VDD Parser
        internal_vdd_parser = subparsers.add_parser(
            SubCmd.pull_internal_vdd, help="Pulls the target releases internal vdd")
        InternalVDDSettings.add_args(internal_vdd_parser)
        internal_vdd_parser.set_defaults(which=SubCmd.pull_internal_vdd)

        args = parser.parse_args()

        try:
            if args.which == SubCmd.setup_minio:
                minio_settings = MinIOSettings(args)
                YamlManager.save_to_yaml(minio_settings)
                StandAloneMinIO(minio_settings).create()
            elif args.which == SubCmd.export_minio:
                minio_settings = YamlManager.load_minio_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                minio_settings.export_loc = export_settings.export_loc
                minio_settings.release_template_name = minio_settings.export_loc.render_export_name(MINIO_PREFIX, minio_settings.commit_hash)[0:-4]
                MinIOExport(minio_settings).export_minio()
            elif args.which == SubCmd.test_server_repository_vm:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args, True)
                executor = RHELCreationJob(repo_settings)
                executor.execute()
            elif args.which == SubCmd.build_server_for_export:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args, True)
                YamlManager.save_reposync_settings_from_yaml(repo_settings)
                executor = RHELExportJob(repo_settings)
                executor.build_export()
            elif args.which == SubCmd.export_reposync_server:
                server_repo_settings = YamlManager.load_reposync_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor_server = ReposyncServerExport( server_repo_settings, export_settings.export_loc)
                executor_server.export_reposync_server()

            elif args.which == SubCmd.export_gip_service_vm:
                gip_service_settings = YamlManager.load_gip_service_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor = GIPServiceExport( gip_service_settings, export_settings.export_loc)
                executor.export_gip_service_vm()
            elif args.which == SubCmd.create_gip_service_vm:
                service_settings = GIPServiceSettings()
                service_settings.from_namespace(args)

                YamlManager.save_to_yaml(service_settings)
                executor = GipCreationJob(service_settings)
                executor.execute()

            elif args.which == SubCmd.setup_ctrl:
                ctrl_settings = ControllerSetupSettings()
                ctrl_settings.from_namespace(args)
                YamlManager.save_to_yaml(ctrl_settings)

                executor = ControllerSetupJob(ctrl_settings)
                executor.setup_controller()
            elif args.which == SubCmd.run_kit_settings:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = KitSettingsV2()
                kit_settings.from_namespace(args)
                YamlManager.save_to_yaml(kit_settings)

                job = KitSettingsJob(ctrl_settings, kit_settings)
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
                nodes = NodeSettingsV2.initalize_node_array(kit_settings, args)
                YamlManager.save_nodes_to_yaml_files(nodes)

                job = KitSettingsJob(ctrl_settings, kit_settings)
                job.add_node(nodes)
            elif args.which == SubCmd.deploy_kit:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                job = KitSettingsJob(ctrl_settings, kit_settings)
                job.deploy_kit()
            elif args.which == SubCmd.run_oscap_scans:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                job = OSCAPScanJob(ctrl_settings, kit_settings)
                job.run_scan()

            # INTERNAL VDD SETTINGS
            elif args.which == SubCmd.pull_internal_vdd:
                internal_vdd_settings = InternalVDDSettings()
                internal_vdd_settings.from_namespace(args)
                job = InternalVDDJob(internal_vdd_settings)
                job.pull_internal_vdd()

            # ROBOT SETTINGS
            elif args.which == SubCmd.run_robot:
                robot_settings = RobotSettings()
                robot_settings.from_namespace(args)
                job = RobotJob(robot_settings)
                job.run_robot()

            elif args.which == SubCmd.run_unit_tests:
                pass
                # TODO
                # ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                # try:
                #     kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
                # except FileNotFoundError:
                #     kickstart_settings = None

                # executor = IntegrationTestsJob( ctrl_settings, kickstart_settings)
                # executor.run_unit_tests()
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
                executor = PowerFailureJob(ctrl_settings, kit_settings, nodes)
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
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
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
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)

                executor = ControllerExport(
                    ctrl_settings, export_settings.export_loc)
                executor.export_controller()
            elif args.which == SubCmd.create_master_drive_hashes:
                print("Starting hash files")
                drive_hash_settings = DriveCreationHashSettings()
                drive_hash_settings.from_namespace(args)
                executor = DriveHashCreationJob(drive_hash_settings)
                executor.execute()
            elif args.which == SubCmd.check_master_drive_hashes:
                drive_hash_settings = DriveCreationHashSettings()
                drive_hash_settings.from_namespace(args)
                executor = DriveHashCreationJob(drive_hash_settings)
                executor.run_verification_script()
            elif args.which == SubCmd.create_master_drive:
                drive_settings = DriveCreationSettings()
                drive_settings.from_namespace(args)
                executor = DriveCreationJob(drive_settings)
                executor.execute()
            elif args.which == SubCmd.run_cleanup:
                pass
                # TODO
                #     ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                #     try:
                #         kickstart_settings = YamlManager.load_kickstart_settings_from_yaml()
                #         kickstart_settings.nodes.append(ctrl_settings.node)
                #         delete_vms(ctrl_settings.vcenter,
                #                    kickstart_settings.nodes)
                #     except FileNotFoundError:
                #         delete_vms(ctrl_settings.vcenter, ctrl_settings.node)
            elif args.which == SubCmd.run_catalog:
                catalog_parser.print_help()
            elif args.which == SubCmd.run_export:
                export_parser.print_help()
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
            exit(1)


def main():
    print("Starting pipeline.py process")
    runner = Runner()
    runner._setup_logging()
    runner._setup_args()


if __name__ == "__main__":
    main()
