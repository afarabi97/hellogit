from argparse import Namespace, ArgumentParser
from models import Model, populate_model_from_namespace, add_args_from_instance
from models.constants import SubCmd
from models.drive_creation import DriveCreationSettingsv2


class ConfluenceSettings(Model):

    def __init__(self):
        self.url = 'https://confluence.levelup.cce.af.mil'
        self.bearer_token = ''


class ExportLocSettings(Model):

    def __init__(self):
        self.cpt_export_path = './cpt'
        self.mdt_export_path = './mdt'
        self.staging_export_path = './staging'
        self.export_version = 'RC'

    def render_export_name(self,
                           export_prefix: str,
                           export_hash: str,
                           export_suffix: str=".ova") -> str:
        return (export_prefix + "_" + self.export_version + "_" + export_hash + export_suffix)


class HtmlExportSettings(Model):

    def __init__(self):
        self.confluence = ConfluenceSettings()
        self.export_loc = ExportLocSettings()
        self.page_title = ''

    @property
    def page_titles_ary(self):
        result = self.page_title.split(',')
        return [i.strip() for i in result]


class PDFExportSettings(Model):

    def __init__(self):
        self.confluence = ConfluenceSettings()
        self.export_loc = ExportLocSettings()
        self.page_titles = ''

    @property
    def page_titles_ary(self):
        result = self.page_titles.split(',')
        return [i.strip() for i in result]

class DocsExportSettings(Model):

    def __init__(self):
        self.confluence = ConfluenceSettings()
        self.export_loc = ExportLocSettings()
        self.export_type = 'DIP'
        self.sub_pages = 'False'

class ExportSettings(Model):

    def __init__(self):
        self.html_export = HtmlExportSettings()
        self.pdf_export = PDFExportSettings()
        self.export_loc = ExportLocSettings()
        self.doc_export = DocsExportSettings()

    def from_namespace(self, namespace: Namespace):
        if ( namespace.which == SubCmd.export_html_docs or
             namespace.which == SubCmd.add_docs_to_controller or
             namespace.which == SubCmd.set_perms or
             namespace.which == SubCmd.unset_perms ):
             populate_model_from_namespace(self.html_export, namespace)
             #self.html_export.confluence.password = self.b64decode_string(self.html_export.confluence.password)

        if namespace.which == SubCmd.export_single_page_pdf:
             populate_model_from_namespace(self.pdf_export, namespace)
             #self.pdf_export.confluence.password = self.b64decode_string(self.pdf_export.confluence.password)
        if namespace.which == SubCmd.export_docs:
            populate_model_from_namespace(self.doc_export, namespace)

        if ( namespace.which == SubCmd.export_ctrl or
             namespace.which == SubCmd.export_mip_ctrl or
             namespace.which == SubCmd.export_gip_service_vm or
             namespace.which == SubCmd.export_reposync_server ):
             populate_model_from_namespace(self.export_loc, namespace)

    @staticmethod
    def add_args(parser: ArgumentParser):
        subparsers = parser.add_subparsers(help='export commands')
        export_html_docs_help="This subcommand can be used to export html confluence documents."
        export_html_parser = subparsers.add_parser(SubCmd.export_html_docs,
                                                   help=export_html_docs_help)
        add_args_from_instance(export_html_parser, HtmlExportSettings(), True)
        export_html_parser.set_defaults(which=SubCmd.export_html_docs)

        export_single_page_pdf_help="This subcommand can be used to export pdf confluence documents."
        export_pdf_parser = subparsers.add_parser(SubCmd.export_single_page_pdf,
                                                  help=export_single_page_pdf_help)
        add_args_from_instance(export_pdf_parser, PDFExportSettings(), True)
        export_pdf_parser.set_defaults(which=SubCmd.export_single_page_pdf)

        export_docs_help="This subcommand can be used to export pdf confluence documents using the manifest."
        export_docs_parser = subparsers.add_parser(SubCmd.export_docs,
                                                  help=export_docs_help)
        add_args_from_instance(export_docs_parser, DocsExportSettings(), True)
        export_docs_parser.set_defaults(which=SubCmd.export_docs)

        add_docs_to_controller_help="This subcommand can be used to publish html documentation to your Kits controller."
        publish_html_doc_parser = subparsers.add_parser(SubCmd.add_docs_to_controller,
                                                        help=add_docs_to_controller_help)
        add_args_from_instance(publish_html_doc_parser, HtmlExportSettings(), True)
        publish_html_doc_parser.set_defaults(which=SubCmd.add_docs_to_controller)

        set_perms_help="This subcommand can be used to recursively restrict access on pages within confluence."
        set_perms_parser = subparsers.add_parser(SubCmd.set_perms,
                                                 help=set_perms_help)
        add_args_from_instance(set_perms_parser, HtmlExportSettings(), True)
        set_perms_parser.set_defaults(which=SubCmd.set_perms)

        unset_perms_help="This subcommand can be used to recursively unrestrict access on pages within confluence."
        unset_perms_parser = subparsers.add_parser(SubCmd.unset_perms,
                                                   help=unset_perms_help)
        add_args_from_instance(unset_perms_parser, HtmlExportSettings(), True)
        unset_perms_parser.set_defaults(which=SubCmd.unset_perms)

        export_ctrl_help="This subcommand will prep and export your DIP controller to the provided location."
        export_ctrl_parser = subparsers.add_parser(SubCmd.export_ctrl,
                                                   help=export_ctrl_help)
        add_args_from_instance(export_ctrl_parser, ExportLocSettings(), True)
        export_ctrl_parser.set_defaults(which=SubCmd.export_ctrl)

        export_mip_ctrl_help="This subcommand will prep and export your MIP controller to the provided location."
        export_mip_ctrl_parser = subparsers.add_parser(SubCmd.export_mip_ctrl,
                                                       help=export_mip_ctrl_help)
        add_args_from_instance(export_mip_ctrl_parser, ExportLocSettings(), True)
        export_mip_ctrl_parser.set_defaults(which=SubCmd.export_mip_ctrl)

        export_gip_service_vm_help="This subcommand will prep and export your GIP controller to the provided location."
        export_gip_service_parser = subparsers.add_parser(SubCmd.export_gip_service_vm,
                                                          help=export_gip_service_vm_help)
        add_args_from_instance(export_gip_service_parser, ExportLocSettings(), True)
        export_gip_service_parser.set_defaults(which=SubCmd.export_gip_service_vm)

        export_reposync_server_help="This subcommand will prep and export your Reposync server VM to the provided location."
        export_reposync_server_parser = subparsers.add_parser(SubCmd.export_reposync_server,
                                                              help=export_reposync_server_help)
        add_args_from_instance(export_reposync_server_parser, ExportLocSettings(), True)
        export_reposync_server_parser.set_defaults(which=SubCmd.export_reposync_server)

        create_master_drive_hashes_help="This subcommand will create the hashes file needed for the master drive."
        drive_hash_parser = subparsers.add_parser(SubCmd.create_master_drive_hashes,
                                                  help=create_master_drive_hashes_help)
        drive_hash_parser.set_defaults(which=SubCmd.create_master_drive_hashes)
        add_args_from_instance(drive_hash_parser, DriveCreationSettingsv2(), True)

        check_master_drive_hashes_help="This subcommand will create a shell script which can then be used to validate the drive."
        drive_check_parser = subparsers.add_parser(SubCmd.check_master_drive_hashes,
                                                   help=check_master_drive_hashes_help)
        drive_check_parser.set_defaults(which=SubCmd.check_master_drive_hashes)
        add_args_from_instance(drive_check_parser, DriveCreationSettingsv2(), True)

        drive_parser2 = subparsers.add_parser(SubCmd.create_drives,
                                              help="This subcommand will create multiple master drives. ")
        drive_parser2.set_defaults(which=SubCmd.create_drives)
        add_args_from_instance(drive_parser2, DriveCreationSettingsv2(), True)

