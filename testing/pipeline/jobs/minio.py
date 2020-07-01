import os
import sys
from util.ssh import wait_for_connection
from util.ansible_util import execute_playbook, Target
from util.connection_mngs import FabricConnectionWrapper
from models.common import NodeSettings, VCenterSettings

JOBS_DIR = os.path.dirname(os.path.realpath(__file__))
PIPELINE_DIR = JOBS_DIR + "/../"
TESTING_DIR = PIPELINE_DIR + "/../"
ROOT_DIR = TESTING_DIR + "/../"
GIP_DIR = ROOT_DIR + "/gip/"
MINIO_DIR = GIP_DIR + "/minio/"
MINIO_PLAYBOOK = MINIO_DIR + 'site.yml'
CLONE_VM = PIPELINE_DIR + 'playbooks/create_virtual_machine_from_template.yml'

class CloneTemplate:
    def __init__(self, vmware_guest_params):
        self._vmware_guest_params = vmware_guest_params

    def clone(self):
        execute_playbook([CLONE_VM], {**self._vmware_guest_params, 'python_executable': sys.executable})

class StandAloneMinIO:
    def __init__(self, vcenter: VCenterSettings, node: NodeSettings, controller=None):
        self._controller = controller
        self._vmware_guest_params = create_vmware_guest_params(vcenter, node)
        self._ip = node.ipaddress
        self._user = node.username
        self._password = node.password

    def grow(self):
        with FabricConnectionWrapper(self._user, self._password, self._ip) as remote_shell:
          remote_shell.run('pvcreate /dev/sdb; vgextend rhel /dev/sdb; lvextend -l  +100%PVS /dev/rhel/root /dev/sdb; xfs_growfs /root')
    
    def create(self):
        CloneTemplate(self._vmware_guest_params).clone()
        wait_for_connection(self._ip, 22, 30)
        self.grow()
        execute_playbook([MINIO_PLAYBOOK],
                         extra_vars={'ansible_user': self._user, 'ansible_password': self._password},
                         targets=Target("minio", self._ip),
                         tags=['install'],
                         timeout=300)

    def create_certificate(self):
        execute_playbook([MINIO_PLAYBOOK],
                         extra_vars={'ansible_user': self._user, 'ansible_password': self._password, 'controller': self._controller},
                         targets=Target("minio", self._ip),
                         tags=['create-certificate'],
                         timeout=300)

def create_vmware_guest_params(vcenter: VCenterSettings, node: NodeSettings):
    params = {}

    params['vcenter'] = {}
    params['vcenter']['hostname'] = vcenter.ipaddress
    params['vcenter']['username'] = vcenter.username
    params['vcenter']['password'] = vcenter.password

    params['datacenter'] = vcenter.datacenter
    params['cluster'] = vcenter.cluster
    params['folder'] = node.folder
    params['template'] = node.template
    params['vmname'] = node.hostname

    params['networks'] = networks_for(node)
    params['customization'] = customization_for(node)
    params['hardware'] = hardware_for(node)
    params['disks'] = disks_for(node)

    return params

def networks_for(node: NodeSettings):
    network = {}
    
    network['name'] = node.portgroup
    network['ip'] = node.ipaddress
    network['gateway'] = node.gateway
    network['netmask'] = node.netmask
    network['start_connected'] = True

    networks = [network]

    return networks

def customization_for(node: NodeSettings):
    customization = {}

    customization['dns_servers'] = node.dns_servers
    customization['password'] = node.password
    customization['hostname'] = node.hostname.split('.', 1)[0]
    customization['auto_login'] = 'no'
    customization['domain'] = 'lan'

    return customization

def hardware_for(node: NodeSettings):
    hardware = {}

    hardware['memory_mb'] = node.memory
    hardware['num_cpus'] = node.cpu

    return hardware

def disks_for(node: NodeSettings):
    disks = []

    disks.append({'size_gb': node.disk_size, 'datastore': node.datastore, 'type': 'thin'})
    disks.extend(map(lambda size: {'size_gb': size, 'datastore': node.datastore, 'type': 'thin'}, node.extra_disks))

    return disks
