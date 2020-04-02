import os
from models.gip_settings import GipSettings
from util.ansible_util import execute_playbook, take_snapshot, Target
from util.ssh import test_nodes_up_and_alive

PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
GIP_DIR = PIPELINE_DIR + "/../../gip/"


class GipCreationJob:

    def __init__(self, gip_settings: GipSettings):
        self.gip_settings = gip_settings

    def _run_setup_playbook(self):
        extra_vars = {"ansible_ssh_pass": self.gip_settings.node.password, "ansible_user": self.gip_settings.node.username}
        execute_playbook([GIP_DIR + 'site.yml'],
                         extra_vars=extra_vars,
                         targets=Target("gipsvc", self.gip_settings.node.ipaddress))

    def _run_stigs_playbook(self):
        pass

    def execute(self):
        print("Executing gip job")
        execute_playbook([PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.gip_settings.to_dict())
        test_nodes_up_and_alive([self.gip_settings.node], 10)
        self._run_setup_playbook()
