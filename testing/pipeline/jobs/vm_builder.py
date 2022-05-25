import logging
import os
import shlex
import subprocess

import ruamel.yaml as yaml
from models.vm_builder import VMBuilderSettings
from util.ansible_util import Target, execute_playbook
from util.connection_mngs import FabricConnectionWrapper
from util.constants import (MINIO_PREFIX, ROOT_DIR,
                            SKIP_MINIO_BUILD_AND_TEMPLATE, VM_BUILDER_DIR)
from util.general import encryptPassword
from util.ssh import wait_for_connection
from util.vmware_util import get_vms_in_folder

VM_BUILDER_PLAYBOOK = VM_BUILDER_DIR + "playbooks/site.yml"
MASTER_DRIVE_CREATION_PATH = "/mnt/drive_creation"


def get_manifest(type: str):
    file = ROOT_DIR + "manifest.yaml"
    with open (file, 'r') as file:
        data = yaml.safe_load(file)
    return data[type]

def get_cvah_version():
    file = ROOT_DIR + "manifest.yaml"
    with open (file, 'r') as file:
        data = yaml.safe_load(file)
    return data["VERSION"]

def get_export_dir(vmname:str, manifest: dict):
    for i in manifest:
        if vmname in i['app'].lower():
            dir = "/".join(i['src'][0].split("/")[:4])

    return MASTER_DRIVE_CREATION_PATH + "/" + dir

def export_vm(settings: VMBuilderSettings, export_path: str):
    username = settings.vcenter.username.replace("@", "%40")
    cmd = ("ovftool --noSSLVerify --maxVirtualHardwareVersion=14 --diskMode=thin vi://{username}:'{password}'@{vsphere_ip}"
            "/DEV_Datacenter/vm/{folder}/{vm_name} \"{destination}\""
            .format(username=username,
                    password=settings.vcenter.password,
                    vsphere_ip=settings.vcenter.ipaddress,
                    folder=settings.folder,
                    vm_name=settings.vmname,
                    destination=export_path)
            )
    logging.info("Exporting OVA file to %s. This can take a few minutes" % export_path)
    proc = subprocess.Popen(shlex.split(cmd), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    sout, serr = proc.communicate()
    logging.info(sout)

def create_template(settings: VMBuilderSettings):
    execute_playbook([VM_BUILDER_PLAYBOOK],
                extra_vars={**settings.to_dict()},
                tags=['template'],
                timeout=1200)

class StandAloneKali:

    def __init__(self, settings: VMBuilderSettings):
        self.settings = settings

    def _is_built_already(self, export_path: str) -> bool:
        return os.path.exists(export_path)

    def create(self):
        execute_playbook([VM_BUILDER_PLAYBOOK],
                        extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password,
                                    **self.settings.to_dict()},
                        targets=Target("kali", self.settings.ip),
                        tags=['kali'],
                        timeout=1200)
        with FabricConnectionWrapper("root", self.settings.password, self.settings.ip) as remote_shell:
            vm_version = remote_shell.run("lsb_release -r | awk '{print $2}'").stdout.strip()

        #Vars used for exporting
        manifest = get_manifest("CPT")
        export_dir = get_export_dir("kali", manifest)
        cvah_version = get_cvah_version()
        kali_vm_dir = os.path.join(export_dir, vm_version)
        self.settings.vmname = "kali-linux-{}".format(vm_version)
        ova_path = os.path.join(kali_vm_dir, (self.settings.vmname + ".ova"))
        encrypted_password = encryptPassword(self.settings.export_password)

        if self._is_built_already(ova_path):
            print("{} has already been built. Skipping export".format(ova_path))
        else:
            execute_playbook([VM_BUILDER_PLAYBOOK],
                        extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password,
                                    'vm_version': vm_version,'cvah_version': cvah_version,
                                    'vm_dir': kali_vm_dir, 'encrypted_password': encrypted_password, **self.settings.to_dict()},
                        tags=['kali-export'],
                        timeout=1200)
            export_vm(self.settings, ova_path)
            create_template(self.settings)

class StandAloneMinIO:

    def __init__(self, settings: VMBuilderSettings):
        self.settings = settings

    def _is_built_already(self) -> bool:
        commit_hash = self.settings.commit_hash
        vms = get_vms_in_folder("Releases", self.settings.vcenter)
        for vm_name in vms:
            if MINIO_PREFIX in vm_name and commit_hash in vm_name:
                return True
        return False

    def create(self):
        if self.settings.pipeline == "export-all" and self._is_built_already():
            print("The Minio template is already built. Skipping")
            # This file is created and saved in pipeline artifacts so that export stage can check to see if we need to recreate the template or not.
            with open(SKIP_MINIO_BUILD_AND_TEMPLATE, 'w') as f:
                pass
        else:
            execute_playbook([VM_BUILDER_PLAYBOOK], self.settings.to_dict(), tags=['minio-clone'])
            wait_for_connection(self.settings.ip, 22, 30)
            with FabricConnectionWrapper("root", self.settings.password, self.settings.ip) as remote_shell:
                remote_shell.run('pvcreate /dev/sdb; vgextend rhel /dev/sdb; lvextend -l  +100%PVS /dev/rhel/root /dev/sdb; xfs_growfs /')
            execute_playbook([VM_BUILDER_PLAYBOOK],
                            extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password, **self.settings.to_dict()},
                            targets=Target("minio", self.settings.ip),
                            tags=['minio'],
                            timeout=300)
