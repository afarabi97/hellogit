import os
from models.gip_settings import GIPServiceSettings
from util.ansible_util import execute_playbook, take_snapshot, Target
from util.ssh import test_nodes_up_and_alive

from fabric import Connection
from util.connection_mngs import FabricConnectionWrapper
import tarfile


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
GIP_DIR = PIPELINE_DIR + "/../../gip/"
ROOT_DIR = PIPELINE_DIR + "/../../"


class GipCreationJob:

    def __init__(self, service_settings: GIPServiceSettings):
        self.service_settings = service_settings

    def _run_setup_playbook(self):
        extra_vars = {"ansible_ssh_pass": self.service_settings.node.password,
                      "ansible_user": self.service_settings.node.username}
        execute_playbook([GIP_DIR + 'site.yml'],
                         extra_vars=extra_vars,
                         targets=Target("gipsvc", self.service_settings.node.ipaddress),
                         tags=['packages'])

    def _run_stigs_playbook(self):
        pass

    def _copy(self, src, dest, remote_shell: Connection):
        print("Copying {} to {}".format(src,dest))
        remote_shell.put(src, dest)

    def execute(self):
        print("Executing gip job")
        print(self.service_settings.to_dict())
        execute_playbook(
            [PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.service_settings.to_dict())
        test_nodes_up_and_alive([self.service_settings.node], 30)
        self._run_setup_playbook()
        with FabricConnectionWrapper(self.service_settings.node.username, self.service_settings.node.password, self.service_settings.node.ipaddress) as remote_shell:
          remote_shell.run('mkdir -p /opt/service-vm-playbook')
          self._copy(ROOT_DIR + 'playbooks.zip', '/tmp', remote_shell)
          remote_shell.run('unzip -d /opt /tmp/playbooks.zip'  )

