import os
from models.rhel_repo_vm import RHELRepoSettings
from util.ansible_util import execute_playbook, take_snapshot
from util.ssh import test_nodes_up_and_alive
from util.connection_mngs import FabricConnectionWrapper
from util.vmware_util import get_vms_in_folder
from util.constants import REPO_SYNC_PREFIX


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
TESTING_DIR = PIPELINE_DIR + "/../"
ROOT_DIR = TESTING_DIR + "/../"


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
            remote_shell.run('mkdir -p /opt/tfplenum/rhel8-stigs/templates')
            remote_shell.put('rhel8-stigs/rhel8-playbook-stig.yml', '/opt/tfplenum/rhel8-stigs')
            remote_shell.put('rhel8-stigs/site.yml', '/opt/tfplenum/rhel8-stigs')
            remote_shell.put('rhel8-stigs/ansible.cfg', '/opt/tfplenum/rhel8-stigs')
            remote_shell.put('rhel8-stigs/templates/logon-banner.j2', '/opt/tfplenum/rhel8-stigs/templates')
            remote_shell.run(rhelrepo_cmd)

    def execute(self):
        print("Executing RHEL Repos Creation job")
        execute_playbook([PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.repo_settings.to_dict())
        test_nodes_up_and_alive([self.repo_settings.node], 10)
        self._run_repo_script()
        take_snapshot(self.repo_settings.vcenter, self.repo_settings.node)


class RHELExportJob(RHELCreationJob):

    def __init__(self, repo_settings: RHELRepoSettings):
        self.repo_settings = repo_settings

    def _is_built_already(self) -> bool:
        commit_hash = self.repo_settings.node.commit_hash
        vms = get_vms_in_folder("Releases", self.repo_settings.vcenter)
        for vm_name in vms:
            if REPO_SYNC_PREFIX in vm_name and commit_hash in vm_name:
                return True
        return False

    def build_export(self):
        if self.repo_settings.node.pipeline == "export-all" and self._is_built_already():
            pass
        else:
            print("Building RHEL server for export")
            execute_playbook([PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.repo_settings.to_dict())
            test_nodes_up_and_alive([self.repo_settings.node], 10)
            self._run_repo_script()
            take_snapshot(self.repo_settings.vcenter, self.repo_settings.node)
