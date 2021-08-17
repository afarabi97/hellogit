import os

from argparse import Namespace, ArgumentParser
from models import Model
from util.yaml_util import YamlManager


class InternalVDDSettings(Model):
    def __init__(self):
        super().__init__()
        self.target_version = None              # from_namespace
        self.confluence_username = None         # from_namespace
        self.confluence_password = None         # from_namespace
        self.model_settings = None               # from _get_ctrl_settings_from_yaml


    @staticmethod
    def add_args(parser: ArgumentParser):
        """
            target_version          --target-version
            confluence_username     --confluence-username
            confluence_password     --confluence-password
        """
        parser.add_argument('--target-version', dest='target_version', help="The target release version of the system")
        parser.add_argument('--confluence-username', dest='confluence_username', help='CONFLUENCE_USERNAME')
        parser.add_argument('--confluence-password', dest='confluence_password', help='CONFLUENCE_PASSWORD')


    def from_namespace(self, namespace: Namespace):
        self.target_version = namespace.target_version
        self.confluence_username = namespace.confluence_username
        self.confluence_password = self.b64decode_string(namespace.confluence_password)

