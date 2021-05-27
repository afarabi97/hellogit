from argparse import Namespace, ArgumentParser
from models import Model


class BPSettings(Model):
    def __init__(self):
        self.bphost = ''
        self.bpuser = ''
        self.bppass = ''
        self.bptest = ''

    def from_namespace(self, namespace: Namespace):
        self.bphost = namespace.bphost
        self.bptest = namespace.bptest
        self.bpuser = namespace.bpuser
        self.bppass = self.b64decode_string(namespace.bppass)

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--bp-user', dest='bpuser', help="Breaking point user.", default="admin")
        parser.add_argument('--bp-host', dest='bphost', required=True, help="Breaking point IP address.")
        parser.add_argument('--bp-pass', dest='bppass', required=True, help="Breaking point password.")
        parser.add_argument('--bp-test', dest='bptest', required=True, help="Breaking point test name.")
