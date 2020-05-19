import os
from models.rhel_repo_vm import RHELRepoSettings
from util.ansible_util import execute_playbook, take_snapshot, Target
from util.ssh import test_nodes_up_and_alive
from util.connection_mngs import FabricConnectionWrapper

PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
TESTING_DIR = PIPELINE_DIR + "/../"


class RHELCreationJob:

    def __init__(self, repo_settings: RHELRepoSettings):
        self.repo_settings = repo_settings

    def _run_repo_script(self):
        rhelrepo_cmd = ("export RHEL_SUB_METHOD='" + self.repo_settings.subscription + "' && \
                         export RHEL_ORGANIZATION='" + self.repo_settings.orgnumber + "' && \
                         export RHEL_ACTIVATIONKEY='" + self.repo_settings.activationkey + "' && \
                         bash /root/reposync_server.sh")

        with FabricConnectionWrapper(self.repo_settings.node.username,
                                     self.repo_settings.node.password,
                                     self.repo_settings.node.ipaddress) as remote_shell:
            remote_shell.put(TESTING_DIR + 'reposync_server.sh', '/root/reposync_server.sh')
            remote_shell.run(rhelrepo_cmd)

    def execute(self):
        print("Executing RHEL Repos Creation job")
        execute_playbook([PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.repo_settings.to_dict())
        test_nodes_up_and_alive([self.repo_settings.node], 10)
        self._run_repo_script()

class RHELExportJob(RHELCreationJob):

    def __init__(self, repo_settings: RHELRepoSettings):
        self.repo_settings = repo_settings

    def _rhel_export(self):
        with FabricConnectionWrapper(self.repo_settings.node.username,
                                     self.repo_settings.node.password,
                                     self.repo_settings.node.ipaddress) as remote_shell:
            remote_shell.put(TESTING_DIR + 'reposync_server.sh', '/root/reposync_server.sh')

    def build_export(self):
        print("Building RHEL server for export")
        execute_playbook([PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.repo_settings.to_dict())
        test_nodes_up_and_alive([self.repo_settings.node], 10)
        self._rhel_export()
