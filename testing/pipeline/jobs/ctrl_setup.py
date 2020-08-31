import os
import sys
import subprocess

from typing import Union
from invoke.exceptions import UnexpectedExit
from fabric import Connection
from models.ctrl_setup import ControllerSetupSettings
from models.common import RepoSettings
from time import sleep
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from typing import Dict
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import execute_playbook, take_snapshot
from util.network import retry

from pyVim.connect import SmartConnectNoSSL,Disconnect,vim

PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"


def checkout_latest_code(repo_settings: RepoSettings):
    cred_file_cmd = """
cat <<EOF > ~/credential-helper.sh
#!/bin/bash
echo username="{}"
echo password="{}"
EOF
    """.format(repo_settings.username, repo_settings.password)

    commands = ['git config --global --unset credential.helper',
                cred_file_cmd,
                'git config --global credential.helper "/bin/bash ~/credential-helper.sh"',
                'git fetch --unshallow',
                'git checkout {} --force'.format(repo_settings.branch_name),
                'git pull --rebase',
                'git config --global --unset credential.helper',
                'git rev-parse HEAD']

    for index, cmd in enumerate(commands):
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        stdout, _ = proc.communicate()
        if index == len(commands) - 1:
            print("CHECKED OUT COMMIT HASH: {}".format(stdout.decode('utf-8')))

class ControllerSetupJob:
    def __init__(self, ctrl_settings: Union[ControllerSetupSettings,HwControllerSetupSettings]):
        self.ctrl_settings = ctrl_settings

    def _run_pings_to_fix_network(self, client: Connection, flag):
        if flag:
            pos = self.ctrl_settings.node.network_id.rfind(".")
            hack_ping_ip = self.ctrl_settings.node.network_id[0:pos+1] + "3"
            client.run("ping {} -c 3".format(hack_ping_ip), shell=True, warn=True)
            client.run("ping {} -c 3".format(self.ctrl_settings.node.dns_servers[0]), shell=True, warn=True)
            client.run("ping {} -c 3".format("gitlab.sil.lab"), shell=True, warn=True)
        else:
            pass

    def _set_hostname(self, client:Connection):
        cmd = "hostnamectl set-hostname {system_name}-controller.{domain}".format(system_name=self.ctrl_settings.system_name.lower(),domain=self.ctrl_settings.node.domain)
        client.run(cmd)

    def _run_bootstrap(self, flag=True):
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
            self._run_pings_to_fix_network(client, flag)
            self._set_hostname(client)
            ret_val = client.run(curl_cmd, shell=True, warn=True)
            if ret_val.return_code != 0:
                print(ret_val.return_code)
                print("Failed to fetch the bootstrap script with {}.".format(curl_cmd))
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
        client.run('cd /opt/tfplenum && git checkout {}'.format(self.ctrl_settings.repo.branch_name))
        #client.run('cd /opt/tfplenum && git reset --hard origin/{}'.format(self.ctrl_settings.repo.branch_name))
        client.run('cd /opt/tfplenum && git stash')
        client.run('cd /opt/tfplenum && git pull --rebase')
        client.run('git config --global --unset credential.helper', warn=True)
        # TODO make this more efficient we do not need to run redeploy if there were not code changes.
        if self.ctrl_settings.system_name in ["DIP", "GIP"]:
            client.run('cd /opt/tfplenum/bootstrap/playbooks && make build_helm_charts')
        client.run('cd /opt/tfplenum/bootstrap/playbooks && make nightly_clone_rebuild_frontend')
        # client.run('/opt/tfplenum/web/setup/redeploy.sh')
        client.run("""
cat <<EOF > /etc/resolv.conf
# Generated by tfplenum bootstrap
search {}
nameserver 127.0.0.1
EOF
        """.format(self.ctrl_settings.node.domain))
        client.run('systemctl restart network NetworkManager')
        client.run('/opt/tfplenum/web/tfp-env/bin/python3 /opt/sso-idp/update_portal_client.py')

    def _update_nightly_controller(self, flag=True):
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            self._run_pings_to_fix_network(client, flag)
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

class BaremetalControllerSetup(ControllerSetupJob):

    def __init__(self, baremetal_ctrl_settings: HwControllerSetupSettings):
        self.baremetal_ctrl_settings = baremetal_ctrl_settings

    def create_smart_connect_client(self) -> vim.ServiceInstance:
    # This will connect us to vCenter
        return SmartConnectNoSSL(host=self.baremetal_ctrl_settings.esxi.ipaddress,
                                user=self.baremetal_ctrl_settings.esxi.username,
                                pwd=self.baremetal_ctrl_settings.esxi.password,
                                port=443)

    def get_vm_list(self):
        # make connection
        service_instance = self.create_smart_connect_client()

        # create list of machines
        content = service_instance.RetrieveContent()
        containerView = content.viewManager.CreateContainerView(content.rootFolder, [vim.VirtualMachine], True)
        children = containerView.view
        vm_list = []
        for child in children:
            summary = child.summary
            if summary.config.name !=None:
                vm_list.append(summary.config.name)
        Disconnect(service_instance)
        return vm_list

    def get_controller_name(self):
        for name in self.get_vm_list():
            if "DIP" in name or "dip" in name or "controller" in name or "Controller" in name:
                return name

    def copy_controller(self,build_type) -> None:
        if build_type == self.baremetal_ctrl_settings.valid_run_types[0]:
            path_type = str(self.baremetal_ctrl_settings.node.template_path) + str(self.baremetal_ctrl_settings.node.template)
        else:
            path_type = str(self.baremetal_ctrl_settings.node.ctrl_path) + str(self.baremetal_ctrl_settings.node.ctrl_name)

        cmd = ("ovftool --noSSLVerify --network=Internal \
                --datastore='{datastore}' --diskMode=thin '{path}' \
                vi://'{username}':'{password}'@'{ipaddress}'"
                .format(datastore=self.baremetal_ctrl_settings.node.datastore,
                path=path_type,
                username=self.baremetal_ctrl_settings.esxi.username,
                password=self.baremetal_ctrl_settings.esxi.password,
                ipaddress=self.baremetal_ctrl_settings.esxi.ipaddress))

        result = os.system(cmd)
        if result != 0:
            sys.exit(1)

        execute_playbook([PIPELINE_DIR + 'playbooks/ctrl_config.yml'],
                         self.baremetal_ctrl_settings.to_dict())

    def setup_controller(self) -> None:
        hwsettings = ControllerSetupJob(self.baremetal_ctrl_settings)
        #Sets controller name found on esxi server
        self.baremetal_ctrl_settings.esxi_ctrl_name = self.get_controller_name()
        if self.baremetal_ctrl_settings.run_type == self.baremetal_ctrl_settings.valid_run_types[1]:
                execute_playbook([PIPELINE_DIR + 'playbooks/power_control_esxi.yml'],
                                 self.baremetal_ctrl_settings.to_dict())
                self.copy_controller(self.baremetal_ctrl_settings.run_type)
                #hwsettings._update_nightly_controller(False)

        elif self.baremetal_ctrl_settings.run_type == self.baremetal_ctrl_settings.valid_run_types[0]:
                execute_playbook([PIPELINE_DIR + 'playbooks/power_control_esxi.yml'],
                                 self.baremetal_ctrl_settings.to_dict())
                self.copy_controller(self.baremetal_ctrl_settings.run_type)
                execute_playbook([PIPELINE_DIR + 'playbooks/rename_ctrl.yml'],
                                 self.baremetal_ctrl_settings.to_dict())
                hwsettings._run_bootstrap(False)
