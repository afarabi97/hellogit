import os
from fabric import Connection
from util.connection_mngs import FabricConnectionWrapper
from util.ansible_util import execute_playbook, Target
from util.ssh import test_nodes_up_and_alive
from models.gip_settings import GIPServiceSettings

JOBS_DIR = os.path.dirname(os.path.realpath(__file__))
PIPELINE_DIR = JOBS_DIR + "/../"
TESTING_DIR = PIPELINE_DIR + "/../"
ROOT_DIR = TESTING_DIR + "/../"
GIP_DIR = ROOT_DIR + "/gip/"
SERVICES_DIR = GIP_DIR + "/services/"
SERVICES_PLAYBOOK = SERVICES_DIR + 'site.yml'
MINIO_DIR = GIP_DIR + "/minio/"
MINIO_PLAYBOOK = MINIO_DIR + 'site.yml'
CLONE_CTRL = PIPELINE_DIR + 'playbooks/clone_ctrl.yml'

class GipCreationJob:
    def __init__(self, service_settings: GIPServiceSettings):
        self.service_settings = service_settings

    def _run_setup_playbook(self):
        extra_vars = {"ansible_ssh_pass": self.service_settings.node.password,
                      "ansible_user": self.service_settings.node.username}

        execute_playbook([SERVICES_PLAYBOOK],
                         extra_vars=extra_vars,
                         targets=Target("gipsvc", self.service_settings.node.ipaddress),
                         tags=['required-packages'], timeout=300)

        extra_vars['minio_binding_ip'] = self.service_settings.node.ipaddress
        execute_playbook([MINIO_PLAYBOOK],
                         extra_vars=extra_vars,
                         targets=Target("minio", self.service_settings.node.ipaddress),
                         tags=['install'],
                         timeout=300)

    def _copy(self, src, dest, remote_shell: Connection):
        print("Copying {} to {}".format(src,dest))
        remote_shell.put(src, dest)

    def execute(self):
        print("Executing gip job")
        execute_playbook(
            [CLONE_CTRL], self.service_settings.to_dict())
        test_nodes_up_and_alive([self.service_settings.node], 30)
        self._run_setup_playbook()
        with FabricConnectionWrapper(self.service_settings.node.username,
                                     self.service_settings.node.password,
                                     self.service_settings.node.ipaddress) as remote_shell:
            self._copy(ROOT_DIR + 'playbooks.zip', '/tmp', remote_shell)
            remote_shell.run('unzip -d /opt /tmp/playbooks.zip'  )
