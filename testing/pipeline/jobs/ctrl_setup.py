import os
import sys
import subprocess

from invoke.exceptions import UnexpectedExit
from models.ctrl_setup import ControllerSetupSettings
from time import sleep
from typing import Dict
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import execute_playbook, take_snapshot
from util.network import retry


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"


def checkout_latest_code(ctrl_settings):
    cred_file_cmd = """
cat <<EOF > ~/credential-helper.sh
#!/bin/bash
echo username="{}"
echo password="{}"
EOF
    """.format(ctrl_settings.repo.username, ctrl_settings.repo.password)

    commands = ['git config --global --unset credential.helper',
                cred_file_cmd,
                'git config --global credential.helper "/bin/bash ~/credential-helper.sh"',
                'git fetch',
                'git checkout {} --force'.format(ctrl_settings.repo.branch_name),
                'git pull --rebase',
                'git config --global --unset credential.helper',
                'git rev-parse HEAD']

    for index, cmd in enumerate(commands):
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        stdout, _ = proc.communicate()
        if index == len(commands) - 1:
            print("CHECKED OUT COMMIT HASH: {}".format(stdout.decode('utf-8')))


class ControllerSetupJob:
    def __init__(self, ctrl_settings: ControllerSetupSettings):
        self.ctrl_settings = ctrl_settings

    @retry()
    def _set_hostname(self, client):
        cmd = "hostnamectl set-hostname controller.{}".format(self.ctrl_settings.node.domain)
        client.run(cmd)

    def _run_bootstrap(self):
        curl_cmd = ''
        if 'di2e' in self.ctrl_settings.repo.url:
            curl_cmd = "curl -s -o /root/bootstrap.sh -u {username}:'{password}' " \
                        "https://bitbucket.di2e.net/projects/THISISCVAH/repos/tfplenum" \
                        "/raw/bootstrap.sh?at={branch_name}".format(branch_name=self.ctrl_settings.repo.branch_name,
                                                                    username=self.ctrl_settings.repo.username,
                                                                    password=self.ctrl_settings.repo.password)
        else:
            curl_cmd = "curl -s -k -o /root/bootstrap.sh --header 'PRIVATE-TOKEN: RT8FscKP1ZQ8NcgTdcas' \
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

            pos = self.ctrl_settings.node.network_id.rfind(".")

            #This is hack to get around some weird layer 2 issues we have to live with on the SILs network
            hack_ping_ip = self.ctrl_settings.node.network_id[0:pos+1] + "3"
            client.run("ping {} -c 3".format(hack_ping_ip), shell=True, warn=True)
            client.run("ping {} -c 3".format(self.ctrl_settings.node.dns_servers[0]), shell=True, warn=True)
            client.run("ping {} -c 3".format("gitlab.sil.lab"), shell=True, warn=True)
            ret_val = client.run(curl_cmd, shell=True, warn=True)
            if ret_val.return_code != 0:
                print("Failed to fetch the bootstrap script from bitbucket with {}.".format(curl_cmd))
                exit(ret_val.return_code)

            ret_val = client.run(bootstrap_cmd, shell=True, warn=True)
            if ret_val.return_code != 0:
                print("Failed to execute bootstrap.")
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
        client.run('cd /opt/tfplenum && git checkout {} --force'.format(self.ctrl_settings.repo.branch_name))
        #client.run('cd /opt/tfplenum && git reset --hard origin/{}'.format(self.ctrl_settings.repo.branch_name))
        client.run('cd /opt/tfplenum && git pull --rebase')
        client.run('git config --global --unset credential.helper', warn=True)
        # TODO make this more efficient we do not need to run redeploy if there were not code changes.
        if self.ctrl_settings.system_name in ["DIP", "GIP"]:
            client.run('cd /opt/tfplenum/bootstrap/playbooks && make build_helm_charts')
        client.run('/opt/tfplenum/web/setup/redeploy.sh')
        client.run('/opt/tfplenum/web/tfp-env/bin/python3 /opt/sso-idp/update_portal_client.py')
        client.run("""
cat <<EOF > /etc/resolv.conf
# Generated by tfplenum bootstrap
search {}
nameserver 127.0.0.1
EOF
        """.format(self.ctrl_settings.node.domain))
        client.run('systemctl restart network NetworkManager')

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
