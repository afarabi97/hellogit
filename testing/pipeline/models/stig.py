from argparse import Namespace, ArgumentParser
from models import Model


class STIGSettings(Model):
    def __init__(self):
        pass

    def from_namespace(self, namespace: Namespace):
        pass

    @staticmethod
    def add_args(parser: ArgumentParser):
        # parser.add_argument('--password', dest='mip_config_password', default='we.are.tfplenum',
        #                     help="The password given to the accounts with predefined roles.")
        # parser.add_argument('--operator-type', dest='mip_config_operator_type', default='MDT',
        #                     choices=['CPT', 'MDT'], help="Controls the type of MIP being created.")
        pass
