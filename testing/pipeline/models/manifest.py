from argparse import Namespace, ArgumentParser
from models import Model
import datetime
from models.constants import SubCmd

class ManifestSettings(Model):

    def __init__(self):
        self.version = ''
        self.type = ''
        self.manifest_file = ''
        self.release_doc_manifest_file = ''
        self.drive_creation_path = ''
        self.staging_export_path = ''

    def from_namespace(self, namespace: Namespace):
        self.drive_creation_path = namespace.drive_creation_path
        self.type = namespace.type
        self.version = namespace.version
        self.manifest_file= SubCmd.manifest_file
        self.release_doc_manifest_file = SubCmd.release_doc_manifest_file
        self.staging_export_path = namespace.staging_export_path

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--version',
                            dest='version',
                            help="Drive creation folder version" )
        parser.add_argument('--type',
                            dest='type',
                            help="Operator type",
                            required=True,
                            choices=['MDT','CPT','GIP','MULTIBOOT'] )
        parser.add_argument('--drive-creation-path',
                            dest='drive_creation_path',
                            help="drive creation absolute path",
                            required=True )
        parser.add_argument('--staging-export-path',
                            dest='staging_export_path',
                            help="Staging Directory name",
                            required=True )
