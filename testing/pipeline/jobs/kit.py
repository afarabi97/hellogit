import asyncio
import os
import logging
import sys
import time
from typing import Union, List
from models.common import HwNodeSettings

from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.kit import KitSettingsV2
from models.node import NodeSettingsV2, HardwareNodeSettingsV2
from jobs.remote_node import RemoteNode
from util import redfish_util as redfish
from util.ansible_util import execute_playbook
from util.api_tester import APITesterV2, wait_for_next_job_in_chain
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive, test_nodes_up_and_alive_async
from random import randrange
from util.ansible_util import power_on_vms

TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'
PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"


class KitSettingsJob:

    def __init__(self,
                 ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                 kit_settings: KitSettingsV2=None,
                 is_virtual: bool=True):
        self.ctrl_settings = ctrl_settings
        self.kit_settings = kit_settings
        self.is_virtual = is_virtual

    def _open_test_ports(self):
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            client.put(TEMPLATES_DIR + "mongod.conf", '/etc/mongod.conf')
            client.run('systemctl restart mongod')
            client.run("firewall-cmd --permanent --add-port=27017/tcp") # Opens mongo port
            client.run('firewall-cmd --reload')

    def _close_test_ports(self):
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            client.put(TEMPLATES_DIR + "mongod.conf", '/etc/mongod.conf')
            client.run('systemctl restart mongod')
            client.run("firewall-cmd --permanent --remove-port=27017/tcp") # Closes mongo port
            client.run('firewall-cmd --reload')

    def _clear_net_on_hwnode(self, node: HardwareNodeSettingsV2):
        with FabricConnectionWrapper('root',
                                     self.kit_settings.settings.password,
                                     node.ip_address) as client:
            client.run('mv /etc/sysconfig/network-scripts /etc/sysconfig/network-scripts-disable')
            client.run('ls /etc/sysconfig | grep net')

    def _set_boot_order_and_reboot(self, node: HardwareNodeSettingsV2):
        token = redfish.get_token(node.idrac_ip_address, node.redfish_user, node.redfish_password)
        logging.info("Setting boot order for {}".format(node.idrac_ip_address))
        redfish.set_pxe_boot(node.idrac_ip_address, token, node.pxe_type)
        logging.info("Restarting server {}".format(node.idrac_ip_address))
        result = redfish.restart_server(node.idrac_ip_address, token)
        redfish.logout(token)
        return result

    async def _install_vmware_tools(self, node: NodeSettingsV2):
        with FabricConnectionWrapper(node.username,
                                     node.kit_settings.settings.password,
                                     node.ip_address) as client:
            client.run("yum -y install perl open-vm-tools", shell=True, warn=True)

    def save_vmware_settings(self):
        if self.is_virtual:
            power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
            test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        self.api = APITesterV2(self.ctrl_settings, self.kit_settings)
        self.api.run_vmware_api_test()
        self.api.run_vmware_api_save()

    def save_kit_settings(self):
        self.api = APITesterV2(self.ctrl_settings, self.kit_settings)
        self.api.run_general_settings_api_post()
        self.api.run_kit_api_post()
        self.api.run_mip_api_post()

    def setup_control_plane(self):
        self.api = APITesterV2(self.ctrl_settings, self.kit_settings)
        self._open_test_ports()
        self.api.run_control_plane_post()

    def run_hw_mip_boot(self, node:HardwareNodeSettingsV2):
        with FabricConnectionWrapper(node.username,
                                     self.kit_settings.settings.password,
                                     node.ip_address) as client:
            logging.info("Setting boot order {}".format(node.ip_address))
            # Set boot manager to use IPV4 netboot on next startup
            client.run("efibootmgr -o `efibootmgr | grep IPV4 | awk '{print $1}' | sed 's/[^0-9]*//g'`")
            # Reboot after 1 minute to avoid so we can get the return value of the command and not error out
            client.run('shutdown -r +1')

    async def _run_add_baremetal_node(self, node: NodeSettingsV2):
        logging.info("Adding {}".format(node.hostname))
        self.api = APITesterV2(self.ctrl_settings, self.kit_settings)

        self.api.run_add_node_post(node)
        await asyncio.sleep(5)
        logging.info("Creating VM...")
        execute_playbook([PIPELINE_DIR + 'playbooks/add_node.yml'],
                         node.to_vmware_playbook_payload())
        await test_nodes_up_and_alive_async(node, 30)
        await self._install_vmware_tools(node)
        if node.node_type == "Sensor" or node.node_type == "Service":
            wait_for_next_job_in_chain(self.ctrl_settings.node.ipaddress, {"hostname": node.hostname})

    async def _run_add_node_virtual(self, node: NodeSettingsV2):
        logging.info("Adding virtual node {}".format(node.hostname))
        self.api = APITesterV2(self.ctrl_settings, self.kit_settings)
        if node.is_mip():
            self.api.run_add_virtual_mip_post(node)
        else:
            self.api.run_add_virtual_node_post(node)
        wait_for_next_job_in_chain(self.ctrl_settings.node.ipaddress, {"hostname": node.hostname})

    async def _do_virtual_add_node_work(self, nodes: List[NodeSettingsV2]):
        tasks = []
        for node in nodes: # type: NodeSettingsV2
            if node.deployment_type == NodeSettingsV2.DEPLOYMENT_TYPES[1]: #Virtual deployment type
                tasks.append(self._run_add_node_virtual(node))
            elif node.deployment_type == NodeSettingsV2.DEPLOYMENT_TYPES[0]: # Baremetal deployment type
                tasks.append(self._run_add_baremetal_node(node))
            else:
                raise ValueError("Invalid deployment type it needs to be {} but was {}".format(str(NodeSettingsV2.DEPLOYMENT_TYPES)), node.deployment_type)

        await asyncio.gather(*tasks)

    def add_node(self, nodes: List[NodeSettingsV2]):
        loop = asyncio.new_event_loop()
        loop.run_until_complete(self._do_virtual_add_node_work(nodes))

    async def _run_add_hardware_node(self, node:HardwareNodeSettingsV2):
        self._open_test_ports()
        self.api = APITesterV2(self.ctrl_settings, self.kit_settings)
        self.api.run_add_node_post(node)
        await asyncio.sleep(5)

        if node.is_mip():
            self.run_hw_mip_boot(node)
        else:
            logging.info("Setting boot order and rebooting machines.")
            # redfish
            try:
                self._clear_net_on_hwnode(node)
            except Exception as e:
                logging.warn(str(e))
            self._set_boot_order_and_reboot(node)

        logging.info("Waiting for nodes to pxe boot....")
        await asyncio.sleep(60 * 13)
        logging.info("Waiting for nodes to respond....")
        await test_nodes_up_and_alive_async(node, 30)

        if node.node_type == "Sensor" or node.node_type == "Service" or node.node_type == "MIP":
            wait_for_next_job_in_chain(self.ctrl_settings.node.ipaddress, {"hostname": node.hostname})

        try:
            sys.exit(0)
        except SystemExit:
            logging.info("Kickstart finished")

    async def _do_hardware_add_nodes_work(self, nodes: List[HardwareNodeSettingsV2]):
        tasks = []
        remote_node = RemoteNode(self.ctrl_settings, self.kit_settings)

        if self.ctrl_settings.remote_node_settings.run_remote_node:
            remote_node.change_external_to_internal()

        for node in nodes:
            if node.deployment_type == NodeSettingsV2.DEPLOYMENT_TYPES[1]: #Virtual deployment type
                tasks.append(self._run_add_node_virtual(node))
            elif node.deployment_type == NodeSettingsV2.DEPLOYMENT_TYPES[0]: # Baremetal deployment type
                tasks.append(self._run_add_hardware_node(node))
            else:
                raise ValueError("Invalid deployment type it needs to be {} but was {}".format(str(NodeSettingsV2.DEPLOYMENT_TYPES)), node.deployment_type)

        await asyncio.gather(*tasks)

    def add_hardware_nodes(self, nodes: List[HardwareNodeSettingsV2]):
        loop = asyncio.new_event_loop()
        loop.run_until_complete(self._do_hardware_add_nodes_work(nodes))

    def deploy_kit(self):
        self.api = APITesterV2(self.ctrl_settings, self.kit_settings)
        self.api.run_kit_deploy()

    def run_test_teardown(self):
        self._close_test_ports()
