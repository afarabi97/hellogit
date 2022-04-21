from argparse import Namespace, ArgumentParser
from models import Model


class MandiantSettings(Model):

    def __init__(self):
        self.mandiant_password = ''
        self.mandiant_username = ''
        self.mandiant_ipaddress = ''
        self.ctrl_username = "root"
        self.ctrl_password = ''
        self.ctrl_ipaddress = ''
        self.run_all_actions = None
        self.run_common_detections = None
        self.num_of_actions = 40

    def from_namespace(self, namespace: Namespace):
        self.mandiant_password = self.b64decode_string(namespace.mandiant_password)
        self.mandiant_username = namespace.mandiant_username
        self.mandiant_ipaddress = namespace.mandiant_ipaddress
        self.run_all_actions = namespace.run_all_actions == "yes"
        self.run_common_detections = namespace.run_common_detections == "yes"
        self.num_of_actions = namespace.num_of_actions
        self.ctrl_password =  self.b64decode_string(namespace.ctrl_password)
        self.ctrl_ipaddress = namespace.ctrl_ipaddress

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--mandiant-password", dest="mandiant_password", help="enter mandiant password", required=True)
        parser.add_argument("--mandiant-username", dest="mandiant_username", help="enter mandiant username", required=True)
        parser.add_argument("--mandiant-ipaddress", dest="mandiant_ipaddress", help="enter mandiant instance ip address", required=True)
        parser.add_argument("--run-all-actions", dest="run_all_actions", choices=["yes","no"], default="no", help="runs all actions in mandiant database", required=True)
        parser.add_argument("--run-common-detections", dest="run_common_detections", choices=["yes","no"], default="no",help="runs all actions that are considered common detections", required=True)
        parser.add_argument("--num-of-actions", dest="num_of_actions", type=int, choices=range(1, 2500), help="actions are randomly sampled from list of network actions")
        parser.add_argument("--ctrl-password", dest="ctrl_password", help="The root password for ctrl and node.", required=True)
        parser.add_argument("--ctrl-ipaddress", dest="ctrl_ipaddress", help="ipaddress for the controller.", required=True)
