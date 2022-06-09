import logging
import os
import shlex
import subprocess

import ruamel.yaml as yaml
from models.vm_builder import VMBuilderSettings
from util.ansible_util import Target, execute_playbook
from util.connection_mngs import FabricConnectionWrapper
from util.constants import (ROOT_DIR, VM_BUILDER_DIR)
from util.general import encryptPassword


VM_BUILDER_PLAYBOOK = VM_BUILDER_DIR + "playbooks/site.yml"
MASTER_DRIVE_CREATION_PATH = "/mnt/drive_creation"
DEFAULT_INTERFACE_NAME = "Wired connection 1"
DEFAULT_USERNAME = "assessor"
REMNUX_USERNAME = "remnux"
KALI_DEVICE_NAME = "eth0"
REMNUX_DEVICE_NAME = "ens33"

def is_built_already(export_path: str) -> bool:
    return os.path.exists(export_path)

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

cvah_version = get_cvah_version()
cpt_manifest = get_manifest("CPT")
mdt_manifest = get_manifest("MDT")

class StandAloneKali:

    def __init__(self, settings: VMBuilderSettings):
        self.settings = settings

    def create(self):
        execute_playbook([VM_BUILDER_PLAYBOOK],
                        extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password,
                                    'interface_name': DEFAULT_INTERFACE_NAME, 'username': DEFAULT_USERNAME,
                                    **self.settings.to_dict()},
                        targets=Target("kali", self.settings.ip),
                        tags=['kali'],
                        timeout=1200)
        with FabricConnectionWrapper("root", self.settings.password, self.settings.ip) as remote_shell:
            vm_version = remote_shell.run("lsb_release -r | awk '{print $2}'").stdout.strip()

        #Vars used for exporting
        export_dir = get_export_dir("kali", cpt_manifest)
        kali_vm_dir = os.path.join(export_dir, vm_version)
        default_vm_name = self.settings.vmname
        self.settings.vmname = "kali-linux-{}".format(vm_version)
        ova_path = os.path.join(kali_vm_dir, (self.settings.vmname + ".ova"))
        encrypted_password = encryptPassword(self.settings.export_password)

        if is_built_already(ova_path):
            print("{} has already been built. Skipping export".format(ova_path))
        else:
            execute_playbook([VM_BUILDER_PLAYBOOK],
                        extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password,
                                    'vm_version': vm_version,'cvah_version': cvah_version,
                                    'vm_dir': kali_vm_dir, 'encrypted_password': encrypted_password,
                                    'default_vm_name': default_vm_name, 'interface_name': DEFAULT_INTERFACE_NAME,
                                    'device_name': KALI_DEVICE_NAME, 'username': DEFAULT_USERNAME, **self.settings.to_dict()},
                        tags=['kali-export'],
                        timeout=1200)
            export_vm(self.settings, ova_path)
            create_template(self.settings)

class StandAloneREMnux:
    def __init__(self, settings: VMBuilderSettings):
        self.settings = settings

    def create(self):
        execute_playbook([VM_BUILDER_PLAYBOOK],
                        extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password,
                                    'interface_name': "", 'device_name': REMNUX_DEVICE_NAME,
                                    'username': REMNUX_USERNAME, **self.settings.to_dict()},
                        targets=Target("remnux", self.settings.ip),
                        tags=['remnux'],
                        timeout=1200)
        with FabricConnectionWrapper("root", self.settings.password, self.settings.ip) as remote_shell:
            vm_version = remote_shell.run("runuser -u remnux -- remnux version | grep version | awk '{print $3}'").stdout.strip().lstrip("v")

        #Vars used for exporting
        export_dir = get_export_dir("remnux", cpt_manifest)
        remnux_vm_dir = os.path.join(export_dir, vm_version)
        default_vm_name = self.settings.vmname
        self.settings.vmname = "remnux-v7-focal-{}".format(vm_version)
        ova_path = os.path.join(remnux_vm_dir, (self.settings.vmname + ".ova"))
        encrypted_password = encryptPassword(self.settings.export_password)

        if is_built_already(ova_path):
            print("{} has already been built. Skipping export".format(ova_path))
        else:
            execute_playbook([VM_BUILDER_PLAYBOOK],
                        extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password,
                                    'vm_version': vm_version,'cvah_version': cvah_version,
                                    'vm_dir': remnux_vm_dir, 'encrypted_password': encrypted_password,
                                    'default_vm_name': default_vm_name, 'interface_name': "",
                                    'username': REMNUX_USERNAME, **self.settings.to_dict()},
                        tags=['remnux-export'],
                        timeout=1200)
            export_vm(self.settings, ova_path)
            create_template(self.settings)

