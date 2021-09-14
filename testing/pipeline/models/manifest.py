from argparse import Namespace, ArgumentParser
from models import Model
import datetime

class ManifestSettings(Model):

    def __init__(self):
        self.version = ''
        self.type = ''
        self.manifest_file = ''
        self.drive_creation_path = ''

    def from_namespace(self, namespace: Namespace):
        self.drive_creation_path = namespace.drive_creation_path
        self.type = namespace.type
        self.version = namespace.version
        self.manifest_file= 'manifest.yaml'

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--version', dest='version',
                            help="Drive creation folder version")
        parser.add_argument('--type', dest='type', required=True,
                            help="Operator type", choices=['MDT','CPT','GIP','MULTIBOOT'])
        parser.add_argument('--drive-creation-path', dest='drive_creation_path', required=True,
                            help="drive creation absolute path")
