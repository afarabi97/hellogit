import os
import sys
import subprocess
from typing import Union
from fabric import Connection
from models.common import RepoSettings
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from util.connection_mngs import FabricConnectionWrapper
from util.constants import CONTROLLER_PREFIX, PIPELINE_DIR, ROOT_DIR, SKIP_CTRL_BUILD_AND_TEMPLATE
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import execute_playbook, take_snapshot
from util.vmware_util import get_vms_in_folder
from pyVim.connect import SmartConnectNoSSL,Disconnect,vim


def checkout_latest_code(repo_settings: RepoSettings):
    cred_file_cmd = """
cat <<EOF > ~/credential-helper.sh
#!/bin/bash
echo username="{}"
echo password="{}"
EOF
    """.format(repo_settings.username, repo_settings.password)

    # The git config commands might fail because of a lock file already existing. It shouldn't matter.
    subprocess.Popen('git config --global --unset credential.helper', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT).communicate()
    subprocess.Popen(cred_file_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT).communicate()
    subprocess.Popen('git config --global credential.helper "/bin/bash ~/credential-helper.sh"', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT).communicate()

    commands = ['git fetch --unshallow',
                'git checkout {} --force'.format(repo_settings.branch_name),
                'git pull --rebase',
                'git rev-parse HEAD']

    for index, cmd in enumerate(commands):
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        stdout, _ = proc.communicate()
        if proc.returncode != 0:
            raise Exception(f"Command failed: {cmd}\n{stdout}\nrc = {proc.returncode}")
        if index == len(commands) - 1:
            print("CHECKED OUT COMMIT HASH: {}".format(stdout.decode('utf-8')))

    subprocess.Popen('git config --global --unset credential.helper', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT).communicate()

class ControllerSetupJob:
    def __init__(self, ctrl_settings: Union[ControllerSetupSettings,HwControllerSetupSettings]):
        self.ctrl_settings = ctrl_settings

    def _run_pings_to_fix_network(self, client: Connection, flag):
        if flag:
            pos = self.ctrl_settings.node.network_id.rfind(".")
            hack_ping_ip = self.ctrl_settings.node.network_id[0:pos+1] + "3"
            ping_cmd = "ping {} -c 3"
            client.run(ping_cmd.format(hack_ping_ip), shell=True, warn=True)
            client.run(ping_cmd.format(self.ctrl_settings.node.dns_servers[0]), shell=True, warn=True)
            client.run(ping_cmd.format("gitlab.sil.lab"), shell=True, warn=True)

    def _set_hostname(self, client:Connection):
        cmd = "hostnamectl set-hostname controller.{domain}".format(domain=self.ctrl_settings.node.domain)
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

    def _is_built_already(self) -> bool:
        commit_hash = self.ctrl_settings.node.commit_hash
        vms = get_vms_in_folder("Releases", self.ctrl_settings.vcenter)
        for vm_name in vms:
            if CONTROLLER_PREFIX in vm_name and commit_hash in vm_name:
                return True
        return False

    def setup_controller(self):
        if self.ctrl_settings.node.pipeline == "export-all" and self._is_built_already():
            print("The template is already built. Skipping")
            # This file is created and saved in pipeline artifacts so that export stage can check to see if we need to recreate the template or not.
            with open(SKIP_CTRL_BUILD_AND_TEMPLATE, 'w') as f:
                pass
        else:
            execute_playbook([PIPELINE_DIR + 'playbooks/clone_ctrl.yml'], self.ctrl_settings.to_dict())
            test_nodes_up_and_alive([self.ctrl_settings.node], 30)
            self._run_bootstrap()
            take_snapshot(self.ctrl_settings.vcenter, self.ctrl_settings.node)


class BaremetalControllerSetup(ControllerSetupJob):

    def __init__(self, baremetal_ctrl_settings: HwControllerSetupSettings):
        self.baremetal_ctrl_settings = baremetal_ctrl_settings
        self.ctrl_owner = self.baremetal_ctrl_settings.node.ctrl_owner

    def create_smart_connect_client(self) -> vim.ServiceInstance:
    # This will connect us to vCenter
        return SmartConnectNoSSL(host=self.baremetal_ctrl_settings.esxi.ipaddress,
                                user=self.baremetal_ctrl_settings.esxi.username,
                                pwd=self.baremetal_ctrl_settings.esxi.password,
                                port=443)

    def get_vm_list(self, active_only=False) -> list:
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
                if active_only:
                    if summary.runtime.powerState == 'poweredOn':
                        vm_list.append(summary.config.name)
                else:
                    vm_list.append(summary.config.name)
        Disconnect(service_instance)
        return vm_list


    def get_controller_name(self) -> str:
        for name in self.get_vm_list():
            if f"Pipeline-" in name:
                return name

    def unemployed_ctrls(self) -> list:
        unemployed_controllers = []
        for name in self.get_vm_list():
            if "controller" in name.lower():
                unemployed_controllers.append(name)
        return unemployed_controllers

    def copy_controller(self) -> None:
        if self.baremetal_ctrl_settings.node.build_from_release:
            path_type = self.baremetal_ctrl_settings.node.release_path + "/" + self.baremetal_ctrl_settings.node.release_ova
        else:
            path_type = self.baremetal_ctrl_settings.node.template_path + "/" + self.baremetal_ctrl_settings.node.template

        cmd = ("ovftool --noSSLVerify --network=Internal --overwrite \
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

    def reset_controller(self) -> None:
        with FabricConnectionWrapper(self.baremetal_ctrl_settings.node.username,
                                    self.baremetal_ctrl_settings.node.password,
                                    self.baremetal_ctrl_settings.node.ipaddress) as remote_shell:
            remote_shell.put(PIPELINE_DIR + "scripts/reset_system.sh", "/tmp/reset_system.sh")
            remote_shell.sudo('chmod 755 /tmp/reset_system.sh')
            remote_shell.sudo('/tmp/reset_system.sh --reset-controller --reset-temp-ctrl=yes --hostname={}'.format("controller.lan"))


    # TODO consider removal
    # def _at_controller_limit(self):
    #     vm_list = self.get_vm_list(active_only=True)
    #     controller = self.get_controller_name()
    #     new_list = [name for name in vm_list if 'mip' in name.lower() and 'controller' in name.lower()]
    #     if controller !=None and controller in new_list:
    #         new_list.remove(controller)
    #     ctrl_count = len(new_list)
    #     return ctrl_count >= 3

    def setup_controller(self):
        hwsettings = ControllerSetupJob(self.baremetal_ctrl_settings)
        # TODO consider removal
        # if self.system_name == "MIP":
        #     if self._at_controller_limit():
        #         print("Host already has 3 MIP controllers! Network block indexes full [64,128,192]")
        #         sys.exit(1)
        #Sets controller name found on esxi server
        self.baremetal_ctrl_settings.esxi_ctrl_name = self.get_controller_name()
        #Sets list of unemployed controllers to be powered off
        self.baremetal_ctrl_settings.esxi_unemployed_ctrls = self.unemployed_ctrls()
        execute_playbook([PIPELINE_DIR + 'playbooks/power_control_esxi.yml'],
                            self.baremetal_ctrl_settings.to_dict())
        self.copy_controller()

        if not self.baremetal_ctrl_settings.node.build_from_release:
            hwsettings._run_bootstrap(False)
            execute_playbook([PIPELINE_DIR + 'playbooks/rename_ctrl.yml'],
                            self.baremetal_ctrl_settings.to_dict())

        if self.baremetal_ctrl_settings.node.build_from_release and self.baremetal_ctrl_settings.node.reset_controller:
            self.reset_controller()
