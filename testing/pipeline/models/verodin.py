from argparse import Namespace, ArgumentParser
from models import Model


class VerodinSettings(Model):

    def __init__(self):
        self.verodin_password = ''
        self.verodin_username = ''
        self.verodin_ipaddress = ''
        self.sequence_name = ''
        self.num_of_actions = 0
        self.action_sample = ''


    def from_namespace(self, namespace: Namespace):
        self.verodin_password = self.b64decode_string(namespace.verodin_password)
        self.verodin_username = namespace.verodin_username
        self.verodin_ipaddress = namespace.verodin_ipaddress
        self.sequence_name = namespace.sequence_name
        self.num_of_actions = namespace.num_of_actions
        self.action_sample = namespace.action_sample == "yes"

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument("--verodin-password", dest='verodin_password', help="enter verodin password")
        parser.add_argument("--verodin-username", dest='verodin_username', help="enter verodin username")
        parser.add_argument("--verodin-ipaddress", dest='verodin_ipaddress', help="enter verodin instance ip address")
        parser.add_argument("--sequence-name", dest='sequence_name', help="name of sequence found within verodin library")
        parser.add_argument("--num-of-actions", dest='num_of_actions', type=int, choices=range(1, 200), help="actions are randomly sampled from list of network actions")
        parser.add_argument("--run-action-sample", dest='action_sample', help="runs evalulation based on the number of actions user chooses to run")
