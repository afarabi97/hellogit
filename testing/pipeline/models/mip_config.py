from argparse import Namespace, ArgumentParser
from models import Model


class MIPConfigSettings(Model):
    def __init__(self):
        self.password = ''
        self.operator_type = ''

    def from_namespace(self, namespace: Namespace):
        self.password = self.b64decode_string(namespace.mip_config_password)
        self.operator_type = namespace.mip_config_operator_type

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--password', dest='mip_config_password', required=True,
                            help="The password given to the accounts with predefined roles.")
        parser.add_argument('--operator-type', dest='mip_config_operator_type', default='MDT',
                            choices=['CPT', 'MDT'], help="Controls the type of MIP being created.")
