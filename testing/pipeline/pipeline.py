import logging
import sys
import traceback
from argparse import ArgumentParser

from jobs.ctrl_setup import ControllerSetupJob, checkout_latest_code
from jobs.drive_creation import DriveCreationJobv2, DriveHashCreationJob
from jobs.export import (ConfluenceExport, ControllerExport, GIPServiceExport,
                         MinIOExport, ReposyncServerExport)
from jobs.gip_creation import GipCreationJob
from jobs.integration_tests import IntegrationTestsJob, PowerFailureJob
from jobs.kit import KitSettingsJob
from jobs.manifest import BuildManifestJob, VerifyManifestJob
from jobs.oscap import OSCAPScanJob
from jobs.rhel_repo_creation import RHELCreationJob, RHELExportJob
from jobs.vm_builder import StandAloneKali, StandAloneMinIO, StandAloneREMnux
from models.common import RepoSettings
from models.constants import SubCmd
from models.ctrl_setup import ControllerSetupSettings
from models.drive_creation import DriveCreationSettingsv2
from models.export import ExportSettings
from models.gip_settings import GIPServiceSettings
from models.kit import KitSettingsV2
from models.manifest import ManifestSettings
from models.node import NodeSettingsV2
from models.rhel_repo_vm import RHELRepoSettings
from models.vm_builder import VMBuilderSettings
from util.ansible_util import delete_vms
from util.constants import MINIO_PREFIX
from util.yaml_util import YamlManager


class Runner:

    parser = ArgumentParser(description="This application is used to run TFPlenum's CI pipeline. \
                                             It can setup Kits, export docs, export controller OVA and does \
                                             other various actions.")

    subparsers = parser.add_subparsers(help='commands')

    def _setup_logging(self):
        kit_builder = logging.getLogger()
        kit_builder.setLevel(logging.INFO)
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        kit_builder.addHandler(ch)

    def _set_parser(self, sub_command, help, settings=None):
        parser = self.subparsers.add_parser(sub_command, help=help)
        if settings:
            settings.add_args(parser)
        parser.set_defaults(which=sub_command)

    def _setup_args(self):
        self._set_parser(
            SubCmd.setup_ctrl,
            "This command is used to setup a controller either from scratch or is cloned from nightly",
            ControllerSetupSettings
        )

        self._set_parser(
            SubCmd.run_kit_settings,
            "This command is used to setup the Kits settings.",
            KitSettingsV2
        )

        self._set_parser(
            SubCmd.setup_control_plane,
            "This command is used to setup the Kits control plane node.",
        )

        self._set_parser(
            SubCmd.add_node,
            "This command is used to setup an arbitrary node.",
            NodeSettingsV2
        )

        self._set_parser(
            SubCmd.deploy_kit,
            "This command is used to deploy the kit after two servers have been setup."
        )

        self._set_parser(
            SubCmd.run_oscap_scans,
            "This command is used to run oscap scans on each node."
        )

        self._set_parser(
            SubCmd.run_integration_tests,
            "This command is used to run integration tests."
        )

        self._set_parser(
            SubCmd.run_disk_fillup_tests,
            "This command is used to run disk fillup tests on a given DIP kit."
        )

        self._set_parser(
            SubCmd.simulate_power_failure,
            "This command is used to simulate a power failures on a Kit."
        )

        self._set_parser(
            SubCmd.run_export,
            "This command is used to export various artifacts from the pipeline.",
            ExportSettings
        )

        self._set_parser(
            SubCmd.verify_manifest,
            "This command is used to verify all the files within the manifest exist.",
            ManifestSettings
        )

        self._set_parser(
            SubCmd.build_manifest,
            "This command is used build the release candidate from the release manifest.",
            ManifestSettings
        )

        self._set_parser(
            SubCmd.run_cleanup,
            "This subcommand powers off and deletes all VMs."
        )

        gip_setup_parser = self.subparsers.add_parser(SubCmd.gip_setup,
                                                      help="Configures GIP VMs and other related commands.")
        gip_setup_subparsers = gip_setup_parser.add_subparsers(
            help="gip setup commands")
        # Creates a parser and adds arguments to it.
        GIPServiceSettings.add_args(gip_setup_subparsers)

        self._set_parser(
            SubCmd.setup_minio,
            "Creates a stand alone MinIO server.",
            VMBuilderSettings
        )

        self._set_parser(
            SubCmd.setup_kali,
            "Creates a stand alone Kali VM",
            VMBuilderSettings
        )

        self._set_parser(
            SubCmd.setup_remnux,
            "Creates a stand alone REMnux VM",
            VMBuilderSettings
        )

        self._set_parser(
            SubCmd.test_server_repository_vm,
            "Tests the reposync server repository VM.",
            RHELRepoSettings
        )

        export_parser = self._set_parser(
            SubCmd.build_server_for_export,
            "Builds the reposync server for export.",
            RHELRepoSettings
        )

        self._set_parser(
            SubCmd.checkout_latest_code,
            "Pulls the latest git commit of your branch.",
            RepoSettings
        )

        self._set_parser(
            SubCmd.acceptance_tests,
            "Setups up environment to run acceptance tests."
        )

        args = self.parser.parse_args()

        try:
            if args.which == SubCmd.acceptance_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = YamlManager.load_nodes_from_yaml_files(
                    ctrl_settings, kit_settings)
                executor = IntegrationTestsJob(
                    ctrl_settings, kit_settings, nodes)
                executor.setup_acceptance_tests()
            elif args.which == SubCmd.export_minio:
                minio_settings = YamlManager.load_minio_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                minio_settings.export_loc = export_settings.export_loc
                minio_settings.release_template_name = minio_settings.export_loc.render_export_name(
                    MINIO_PREFIX, minio_settings.commit_hash)[0:-4]
                MinIOExport(minio_settings).export_minio()
            elif args.which == SubCmd.test_server_repository_vm:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args)
                executor = RHELCreationJob(repo_settings)
                executor.execute()
            elif args.which == SubCmd.build_server_for_export:
                repo_settings = RHELRepoSettings()
                repo_settings.from_namespace(args)
                YamlManager.save_reposync_settings_from_yaml(repo_settings)
                executor = RHELExportJob(repo_settings)
                executor.build_export()
            elif args.which == SubCmd.export_reposync_server:
                server_repo_settings = YamlManager.load_reposync_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor_server = ReposyncServerExport(
                    server_repo_settings, export_settings.export_loc)
                executor_server.export_reposync_server()
            elif args.which == SubCmd.export_gip_service_vm:
                gip_service_settings = YamlManager.load_gip_service_settings_from_yaml()
                export_settings = ExportSettings()
                export_settings.from_namespace(args)
                executor = GIPServiceExport(
                    gip_service_settings, export_settings.export_loc)
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
            elif args.which == SubCmd.run_disk_fillup_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = YamlManager.load_nodes_from_yaml_files(
                    ctrl_settings, kit_settings)
                executor = IntegrationTestsJob(
                    ctrl_settings, kit_settings, nodes)
                executor.run_disk_fillup_tests()
            elif args.which == SubCmd.run_integration_tests:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = YamlManager.load_nodes_from_yaml_files(
                    ctrl_settings, kit_settings)
                executor = IntegrationTestsJob(
                    ctrl_settings, kit_settings, nodes)
                executor.run_integration_tests()
            elif args.which == SubCmd.simulate_power_failure:
                ctrl_settings = YamlManager.load_ctrl_settings_from_yaml()
                kit_settings = YamlManager.load_kit_settingsv2_from_yaml()
                nodes = YamlManager.load_nodes_from_yaml_files(
                    ctrl_settings, kit_settings)
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
                drive_hash_settings = DriveCreationSettingsv2()
                drive_hash_settings.from_namespace(args)
                executor = DriveHashCreationJob(drive_hash_settings)
                executor.execute()
            elif args.which == SubCmd.check_master_drive_hashes:
                drive_hash_settings = DriveCreationSettingsv2()
                drive_hash_settings.from_namespace(args)
                executor = DriveHashCreationJob(drive_hash_settings)
                executor.run_verification_script()
            elif args.which == SubCmd.create_drives:
                drive_settings = DriveCreationSettingsv2()
                drive_settings.from_namespace(args)
                executor = DriveCreationJobv2(drive_settings)
                executor.execute()
            elif args.which == SubCmd.verify_manifest:
                manifest_settings = ManifestSettings()
                manifest_settings.from_namespace(args)
                executor = VerifyManifestJob(manifest_settings)
                executor.execute()
            elif args.which == SubCmd.build_manifest:
                manifest_settings = ManifestSettings()
                manifest_settings.from_namespace(args)
                executor = BuildManifestJob(manifest_settings)
                executor.execute()
            elif args.which == SubCmd.setup_minio:
                minio_settings = VMBuilderSettings(args)
                YamlManager.save_to_yaml(minio_settings)
                StandAloneMinIO(minio_settings).create()
            elif args.which == SubCmd.setup_kali:
                vm_builds_settings = VMBuilderSettings(args)
                YamlManager.save_to_yaml(vm_builds_settings)
                StandAloneKali(vm_builds_settings).create()
            elif args.which == SubCmd.setup_remnux:
                vm_builds_settings = VMBuilderSettings(args)
                YamlManager.save_to_yaml(vm_builds_settings)
                StandAloneREMnux(vm_builds_settings).create()
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
            elif args.which == SubCmd.run_export:
                export_parser.print_help()
            elif args.which == SubCmd.checkout_latest_code:
                repo_settings = RepoSettings()
                repo_settings.from_namespace(args)
                checkout_latest_code(repo_settings)
        except ValueError as e:
            logging.exception(e)
            exit(1)
        except AttributeError as e:
            self.parser.print_help()
            traceback.print_exc()
            exit(1)


def main():
    print("Starting pipeline.py process")
    runner = Runner()
    runner._setup_logging()
    runner._setup_args()


if __name__ == "__main__":
    main()
