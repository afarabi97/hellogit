from argparse import Namespace, ArgumentParser
from datetime import datetime
from models import Model, populate_model_from_namespace, add_args_from_instance
from models.constants import SubCmd
from models.drive_creation import DriveCreationSettings, DriveCreationHashSettings


class ConfluenceSettings(Model):

    def __init__(self):
        self.url = 'https://confluence.di2e.net'
        self.password = ''
        self.username = ''


class ExportLocSettings(Model):
    export_date_str = None

    def __init__(self):
        self.cpt_export_path = './'
        self.mdt_export_path = './'
        self.export_version = 'RC'
        self.export_hash = ''

    @property
    def export_date(self) -> str:
        if self.export_date_str is None:
            self.export_date_str = datetime.now()

        return self.export_date_str.strftime("%m-%d-%Y")

    def render_export_name(self, export_prefix: str, export_suffix: str=".ova") -> str:
        return (export_prefix + "_" + self.export_version + "_" +
                self.export_date + "_" + self.export_hash + export_suffix)


class HtmlExportSettings(Model):

    def __init__(self):
        self.confluence = ConfluenceSettings()
        self.export_loc = ExportLocSettings()
        self.page_title = ''


class PDFExportSettings(Model):

    def __init__(self):
        self.confluence = ConfluenceSettings()
        self.export_loc = ExportLocSettings()
        self.page_titles = ''

    @property
    def page_titles_ary(self):
        result = self.page_titles.split(',')
        return [i.strip() for i in result]


class ExportSettings(Model):

    def __init__(self):
        self.html_export = HtmlExportSettings()
        self.pdf_export = PDFExportSettings()
        self.export_loc = ExportLocSettings()

    def from_namespace(self, namespace: Namespace):
        if (SubCmd.export_html_docs == namespace.which or
                SubCmd.add_docs_to_controller == namespace.which or
                SubCmd.set_perms == namespace.which or
                SubCmd.unset_perms == namespace.which):
            populate_model_from_namespace(self.html_export, namespace)
            self.html_export.confluence.password = self.b64decode_string(self.html_export.confluence.password)

        if SubCmd.export_single_page_pdf == namespace.which:
            populate_model_from_namespace(self.pdf_export, namespace)
            self.pdf_export.confluence.password = self.b64decode_string(self.pdf_export.confluence.password)

        if SubCmd.export_ctrl == namespace.which:
            populate_model_from_namespace(self.export_loc, namespace)

        if SubCmd.generate_versions_file == namespace.which:
            populate_model_from_namespace(self.export_loc, namespace)

        if SubCmd.export_mip_ctrl == namespace.which:
            populate_model_from_namespace(self.export_loc, namespace)

        if SubCmd.export_gip_service_vm == namespace.which:
            populate_model_from_namespace(self.export_loc, namespace)
        
        if namespace.which == SubCmd.export_minio.id:
            populate_model_from_namespace(self.export_loc, namespace)

        if SubCmd.export_reposync_server == namespace.which:
            populate_model_from_namespace(self.export_loc, namespace)

        if SubCmd.export_reposync_workstation == namespace.which:
            populate_model_from_namespace(self.export_loc, namespace)

    @staticmethod
    def add_args(parser: ArgumentParser):
        subparsers = parser.add_subparsers(help='export commands')
        export_html_parser = subparsers.add_parser(SubCmd.export_html_docs,
                                                   help="This subcommand can be used to export html confluence documents.")
        add_args_from_instance(export_html_parser, HtmlExportSettings(), True)
        export_html_parser.set_defaults(which=SubCmd.export_html_docs)

        export_pdf_parser = subparsers.add_parser(SubCmd.export_single_page_pdf,
                                                  help="This subcommand can be used to export pdf confluence documents.")
        add_args_from_instance(export_pdf_parser, PDFExportSettings(), True)
        export_pdf_parser.set_defaults(which=SubCmd.export_single_page_pdf)

        publish_html_doc_parser = subparsers.add_parser(SubCmd.add_docs_to_controller,
                                                        help="This subcommand can be used to publish html documentation to your Kits controller.")
        add_args_from_instance(publish_html_doc_parser, HtmlExportSettings(), True)
        publish_html_doc_parser.set_defaults(which=SubCmd.add_docs_to_controller)

        set_perms_parser = subparsers.add_parser(SubCmd.set_perms,
                                                 help="This subcommand can be used to recursively restrict access on pages within confluence.")
        add_args_from_instance(set_perms_parser, HtmlExportSettings(), True)
        set_perms_parser.set_defaults(which=SubCmd.set_perms)

        unset_perms_parser = subparsers.add_parser(SubCmd.unset_perms,
                                                 help="This subcommand can be used to recursively unrestrict access on pages within confluence.")
        add_args_from_instance(unset_perms_parser, HtmlExportSettings(), True)
        unset_perms_parser.set_defaults(which=SubCmd.unset_perms)

        export_ctrl_parser = subparsers.add_parser(SubCmd.export_ctrl,
                                                   help="This subcommand will prep and export your DIP controller to the provided location.")
        add_args_from_instance(export_ctrl_parser, ExportLocSettings(), True)
        export_ctrl_parser.set_defaults(which=SubCmd.export_ctrl)

        export_ver_parser = subparsers.add_parser(SubCmd.generate_versions_file,
                                                   help="This subcommand will hash all the files in the specified export location directory and generated a versions.txt files.")
        add_args_from_instance(export_ver_parser, ExportLocSettings(), True)
        export_ver_parser.set_defaults(which=SubCmd.generate_versions_file)

        export_mip_ctrl_parser = subparsers.add_parser(SubCmd.export_mip_ctrl,
                                                   help="This subcommand will prep and export your MIP controller to the provided location.")
        add_args_from_instance(export_mip_ctrl_parser, ExportLocSettings(), True)
        export_mip_ctrl_parser.set_defaults(which=SubCmd.export_mip_ctrl)

        export_gip_service_parser = subparsers.add_parser(SubCmd.export_gip_service_vm,
                                                   help="This subcommand will prep and export your GIP controller to the provided location.")
        add_args_from_instance(export_gip_service_parser, ExportLocSettings(), True)
        export_gip_service_parser.set_defaults(which=SubCmd.export_gip_service_vm)

        export_reposync_server_parser = subparsers.add_parser(SubCmd.export_reposync_server,
                                                   help="This subcommand will prep and export your Reposync server VM to the provided location.")
        add_args_from_instance(export_reposync_server_parser, ExportLocSettings(), True)
        export_reposync_server_parser.set_defaults(which=SubCmd.export_reposync_server)

        export_reposync_workstation_parser = subparsers.add_parser(SubCmd.export_reposync_workstation,
                                                   help="This subcommand will prep and export your Reposync workstation VM to the provided location.")
        add_args_from_instance(export_reposync_workstation_parser, ExportLocSettings(), True)
        export_reposync_workstation_parser.set_defaults(which=SubCmd.export_reposync_workstation)

        drive_hash_parser = subparsers.add_parser(
            SubCmd.create_master_drive_hashes, help="This subcommand will create the hashes file needed for the master drive.")
        drive_hash_parser.set_defaults(which=SubCmd.create_master_drive_hashes)
        add_args_from_instance(drive_hash_parser, DriveCreationHashSettings(), True)

        drive_check_parser = subparsers.add_parser(
            SubCmd.check_master_drive_hashes, help="This subcommand will create a shell script which can then be used to validate the drive.")
        drive_check_parser.set_defaults(which=SubCmd.check_master_drive_hashes)
        add_args_from_instance(drive_check_parser, DriveCreationHashSettings(), True)

        drive_parser = subparsers.add_parser(
            SubCmd.create_master_drive, help="This subcommand will create a master drive.  Before running this subcommand please make sure you have an external USB drive plugged into a Ubuntu server or desktop.")
        drive_parser.set_defaults(which=SubCmd.create_master_drive)
        add_args_from_instance(drive_parser, DriveCreationSettings(), True)

        minio = subparsers.add_parser(SubCmd.export_minio.name,
                                                   help="Exports the MinIO server to the provided location.")
        add_args_from_instance(minio, ExportLocSettings(), True)
        minio.set_defaults(which=SubCmd.export_minio.id, application='minio')
