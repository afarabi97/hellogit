import os
import sys

from models.ctrl_setup import ControllerSetupSettings
from typing import Dict
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import execute_playbook, take_snapshot
from util.network import retry


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"


class ControllerSetupJob:
    def __init__(self, ctrl_settings: ControllerSetupSettings):
        self.ctrl_settings = ctrl_settings

    @retry()
    def _set_hostname(self, client):
        client.run("hostnamectl set-hostname controller.lan")

    def _run_bootstrap(self):
        curl_cmd = ''
        if 'di2e' in self.ctrl_settings.repo.url:
            curl_cmd = "curl -m 30 -o /root/bootstrap.sh -u {username}:'{password}' " \
                        "https://bitbucket.di2e.net/projects/THISISCVAH/repos/tfplenum" \
                        "/raw/bootstrap.sh?at={branch_name}".format(branch_name=self.ctrl_settings.repo.branch_name,
                                                                    username=self.ctrl_settings.repo.username,
                                                                    password=self.ctrl_settings.repo.password)
        else:
            curl_cmd = "curl -m 30 -k -o /root/bootstrap.sh --header 'PRIVATE-TOKEN: RT8FscKP1ZQ8NcgTdcas' \
                        'https://gitlab.sil.lab/api/v4/projects/1/repository/files/bootstrap.sh/raw?ref={}'".format(self.ctrl_settings.repo.branch_name)

        bootstrap_cmd = ("export BRANCH_NAME='" + self.ctrl_settings.repo.branch_name + "' && \
                         export TFPLENUM_SERVER_IP=" + self.ctrl_settings.node.ipaddress + " && \
                         export GIT_USERNAME='" + self.ctrl_settings.repo.username + "' && \
                         export RUN_TYPE=full && \
                         export RHEL_SOURCE_REPO='" + self.ctrl_settings.rhel_source_repo + "' && \
                         export PASSWORD='" + self.ctrl_settings.repo.password + "' && \
                         export GIT_PASSWORD='" + self.ctrl_settings.repo.password + "' && \
                         export TFPLENUM_BRANCH_NAME='" + self.ctrl_settings.repo.branch_name + "' && \
                         export USE_FORK='no' && \
                         export SYSTEM_NAME='" + self.ctrl_settings.system_name + "' && \
                         export REPO_URL='" + self.ctrl_settings.repo.url +"' && \
                         bash /root/bootstrap.sh")

        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            self._set_hostname(client)
            ret_val = client.run(curl_cmd, shell=True)
            if ret_val.return_code != 0:
                eprint("Failed to fetch the bootstrap script from bitbucket.")
                exit(ret_val.return_code)

            ret_val = client.run(bootstrap_cmd, shell=True)
            if ret_val.return_code != 0:
                eprint("Failed to execute bootstrap.")
                exit(ret_val.return_code)

    @retry()
    def _update_code(self, client):
        client.run("git config --global --unset credential.helper", warn=True)
        client.run("""
cat <<EOF > ~/credential-helper.sh
#!/bin/bash
echo username="{}"
echo password="{}"
EOF
    """.format(self.ctrl_settings.repo.username, self.ctrl_settings.repo.password))
        self._set_hostname(client)
        client.run('git config --global credential.helper "/bin/bash ~/credential-helper.sh"')
        client.run('cd /opt/tfplenum && git fetch', warn=True)
        client.run('cd /opt/tfplenum && git checkout {}'.format(self.ctrl_settings.repo.branch_name))
        client.run('cd /opt/tfplenum && git pull --rebase')
        client.run('git config --global --unset credential.helper', warn=True)
        # TODO make this more efficient we do not need to run redeploy if there were not code changes.
        client.run('/opt/tfplenum/web/setup/redeploy.sh')

    def _update_nightly_controller(self):
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            self._update_code(client)

    def setup_controller(self):
        execute_playbook([PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.ctrl_settings.to_dict())
        test_nodes_up_and_alive([self.ctrl_settings.node], 30)
        if self.ctrl_settings.run_type == self.ctrl_settings.valid_run_types[0]:
            self._run_bootstrap()
        elif self.ctrl_settings.run_type == self.ctrl_settings.valid_run_types[1]:
            self._update_nightly_controller()
        else:
            raise ValueError("Invalid run type." + self.ctrl_settings.valid_run_types)

        take_snapshot(self.ctrl_settings.vcenter, self.ctrl_settings.node)
