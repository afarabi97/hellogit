import getpass
import os
import sys

from ansible import context
from ansible.cli import CLI
from ansible.module_utils.common.collections import ImmutableDict
from ansible.executor.playbook_executor import PlaybookExecutor
from ansible.parsing.dataloader import DataLoader
from ansible.inventory.manager import InventoryManager
from ansible.vars.manager import VariableManager
from typing import List, Dict, Union
from models.common import NodeSettings, VCenterSettings


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
POWER_CONTROL_NODES = PIPELINE_DIR + "playbooks/power_control_nodes.yml"
REVERT_AND_POWER_CONTROL_NODES = PIPELINE_DIR + "playbooks/revert_snapshot_and_power_control_nodes.yml"

class Target:
    def __init__(self, name: str, ipaddress: str, port:int=22):
        self.name = name
        self.ipaddress = ipaddress
        self.port = port


def execute_playbook(playbooks: List, extra_vars: Dict={}, inventory_file: str=None, targets: Union[Target, List[Target]]=None, tags=[], timeout=10):
    print("execute_playbook")
    loader = DataLoader()
    context.CLIARGS = ImmutableDict(tags=tags,
                                    listtags=False,
                                    listtasks=False,
                                    listhosts=False,
                                    syntax=False,
                                    connection='ssh',
                                    module_path=None,
                                    forks=100,
                                    remote_user='xxx',
                                    private_key_file=None,
                                    ssh_common_args='-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no',
                                    ssh_extra_args='-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no',
                                    sftp_extra_args=None,
                                    scp_extra_args=None,
                                    become=True,
                                    become_method='sudo',
                                    become_user=getpass.getuser(),
                                    verbosity=True,
                                    check=False,
                                    start_at_task=None,
                                    timeout=timeout)

    inventory = InventoryManager(loader=loader)
    if targets:
        if isinstance(targets, Target):
            targets = [targets]

        for myhost in targets:
            inventory.add_host(myhost.name, port=myhost.port)
            host = inventory.get_host(myhost.name)
            host.address = myhost.ipaddress
    elif inventory_file:
        inventory = InventoryManager(loader=loader, sources=(inventory_file,))

    variable_manager = VariableManager(loader=loader,
                                       inventory=inventory,
                                       version_info=CLI.version_info(gitinfo=False))
    variable_manager._extra_vars = extra_vars
    pbex = PlaybookExecutor(playbooks=playbooks,
                            inventory=inventory,
                            variable_manager=variable_manager,
                            loader=loader,
                            passwords=None)
    status_code = pbex.run()
    if status_code != 0:
        print("Failed to run {}".format(str(playbooks)))
        exit(status_code)


def revert_to_baseline_and_power_on_vms(vcenter: VCenterSettings, nodes: Union[NodeSettings, List[NodeSettings]], snapshot_name:str='baseline'):
    if isinstance(nodes, NodeSettings):
        nodes = [nodes]

    nodes_ary = [node.to_dict() for node in nodes]
    extra_vars = { 'nodes': nodes_ary, 'python_executable': sys.executable, 'state': 'poweredon', 'vcenter': vcenter, 'snapshot_name': snapshot_name}
    execute_playbook([REVERT_AND_POWER_CONTROL_NODES], extra_vars)


def power_on_vms(vcenter: VCenterSettings, nodes: Union[NodeSettings, List[NodeSettings]]):
    if isinstance(nodes, NodeSettings):
        nodes = [nodes]

    nodes_ary = [node.to_dict() for node in nodes]
    extra_vars = { 'nodes': nodes_ary, 'python_executable': sys.executable, 'state': 'poweredon', 'vcenter': vcenter}
    execute_playbook([POWER_CONTROL_NODES], extra_vars)


def power_off_vms(vcenter: VCenterSettings, nodes: Union[NodeSettings, List[NodeSettings]]):
    if isinstance(nodes, NodeSettings):
        nodes = [nodes]

    nodes_ary = [node.to_dict() for node in nodes]
    extra_vars = { 'nodes': nodes_ary, 'python_executable': sys.executable, 'state': 'poweredoff', 'vcenter': vcenter}
    execute_playbook([POWER_CONTROL_NODES], extra_vars)


def power_off_vms_gracefully(vcenter: VCenterSettings, nodes: Union[NodeSettings, List[NodeSettings]]):
    if isinstance(nodes, NodeSettings):
        nodes = [nodes]

    nodes_ary = [node.to_dict() for node in nodes]
    extra_vars = { 'nodes': nodes_ary, 'python_executable': sys.executable, 'vcenter': vcenter}
    execute_playbook([PIPELINE_DIR + "playbooks/power_control_nodes_gracefully.yml"], extra_vars)


def delete_vms(vcenter: VCenterSettings, nodes: Union[NodeSettings, List[NodeSettings]]):
    if isinstance(nodes, NodeSettings):
        nodes = [nodes]

    power_off_vms(vcenter, nodes)
    nodes_ary = [node.to_dict() for node in nodes]
    extra_vars = { 'nodes': nodes_ary, 'python_executable': sys.executable, 'state': 'absent', 'vcenter': vcenter}
    execute_playbook([POWER_CONTROL_NODES], extra_vars)


def take_snapshot(vcenter: VCenterSettings, node: NodeSettings, snapshot_name: str="baseline"):
    extra_vars = { 'node': node.to_dict(), 'python_executable': sys.executable, 'vcenter': vcenter, 'snapshot_name': snapshot_name}
    execute_playbook([PIPELINE_DIR + "playbooks/take_snapshot.yml"], extra_vars)

def create_template(vcenter: VCenterSettings, node: NodeSettings, template_name: str="Test_Template"):
    extra_vars = { 'node': node.to_dict(), 'python_executable': sys.executable, 'vcenter': vcenter, 'template_name': template_name}
    execute_playbook([PIPELINE_DIR + "playbooks/create_template.yml"], extra_vars)

def create_nightly(vcenter: VCenterSettings, node: NodeSettings, system_name: str=None):
    if system_name == "DIP":
        controller = "nightly-dip-ctrl"
    elif system_name == "MIP":
        controller = "nightly-mip-ctrl"
    elif system_name == "GIP":
        controller = "nightly-gip-ctrl"
    else:
        controller = None

    extra_vars = { 'node': node.to_dict(), 'python_executable': sys.executable, 'vcenter': vcenter, 'controller': controller}
    print(extra_vars)
    execute_playbook([PIPELINE_DIR + "playbooks/create_nightly.yml"], extra_vars)
