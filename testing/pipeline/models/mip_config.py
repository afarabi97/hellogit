from argparse import Namespace, ArgumentParser
from models import Model


class MIPConfigSettings(Model):
    def __init__(self):
        self.password = ''
        self.operator_type = ''
        self.safe_kit = 'No'

    def from_namespace(self, namespace: Namespace):
        self.password = namespace.mip_config_password
        self.operator_type = namespace.mip_config_operator_type
        self.save_kit = namespace.save_kit

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--password', dest='mip_config_password', default='we.are.tfplenum',
                            help="The password given to the accounts with predefined roles.")
        parser.add_argument('--operator-type', dest='mip_config_operator_type', default='MDT',
                            choices=['CPT', 'MDT'], help="Controls the type of MIP being created.")
        parser.add_argument('--save-kit', dest='save_kit', required=False, help="Allows for saving a template of a functional MIP kit.")
