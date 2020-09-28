from argparse import Namespace, ArgumentParser
from models import Model, add_args_from_instance

class RemoteNodeSettings(Model):
    def __init__(self):
        super().__init__()
        self.pfsense_ip = ''
        self.switch_ip = ''
        self.management_password = ''
        self.management_user = ''
        self.run_remote_node = ''
        self.mp_gateway = ''
        self.mp_external_ip = ''

    def from_namespace(self, namespace: Namespace):

        self.pfsense_ip = namespace.pfsense_ip
        self.switch_ip = namespace.switch_ip
        self.management_user = namespace.management_user
        self.management_password = self.b64decode_string(namespace.management_password)
        self.run_remote_node = namespace.run_remote_node == 'yes'
        self.mp_gateway = namespace.mp_gateway
        self.mp_external_ip = namespace.mp_external_ip

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--management-password', dest='management_password', help="password for management devides <switch/pfsense>")
        parser.add_argument('--management-user', dest='management_user', help="management user", default="assessor")
        parser.add_argument('--run-remote-node', dest='run_remote_node', help="option allows you to run remote node", default="no")
        parser.add_argument("--mp-gateway", dest='mp_gateway', help="mission partnet network gateway", default="10.96.0.254")
        parser.add_argument("--mp-external-ip", dest='mp_external_ip', help="mission partner external interface ip address")
        parser.add_argument("--pfsense-ip", dest='pfsense_ip', help="kits firewall ip")
        parser.add_argument("--switch-ip", dest='switch_ip', help="kits switch ip")


    