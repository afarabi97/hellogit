import os
import logging

from models.kickstart import KickstartSettings, MIPKickstartSettings, GIPKickstartSettings
from models.ctrl_setup import ControllerSetupSettings
from models.common import NodeSettings
from typing import List
from util.ansible_util import execute_playbook, power_on_vms
from util.api_tester import APITester, MIPAPITester
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive

TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'
PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"


def write_to_file(ipaddrlist: List[str], file_name: str):
    with open(file_name, "w") as fhandle:
        fhandle.write(' '.join(ipaddrlist))


class KickstartJob:
    def __init__(self, ctrl_settings: ControllerSetupSettings, kickstart_settings: KickstartSettings):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings

    def _open_mongo_port(self):
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            client.put(TEMPLATES_DIR + "mongod.conf", '/etc/mongod.conf')
            client.run('systemctl restart mongod')
            client.run("firewall-cmd --permanent --add-port=27017/tcp")
            client.run('firewall-cmd --reload')

    def _write_acas_nodes_file(self):
        master_server = None # type: NodeSettings
        sensor_node = None # type: NodeSettings
        for node in self.kickstart_settings.nodes: # type: NodeSettings
            if master_server is None:
                if node.node_type == NodeSettings.valid_node_types[0]:
                    master_server = node

            if sensor_node is None:
                if node.node_type == NodeSettings.valid_node_types[3]:
                    sensor_node = node
            if sensor_node and master_server:
                break

        write_to_file([self.ctrl_settings.node.ipaddress, master_server.ipaddress, sensor_node.ipaddress], "dipnodestoscan.txt")

    def run_kickstart(self):
        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)

        self._open_mongo_port()
        runner = APITester(self.ctrl_settings, self.kickstart_settings)
        runner.run_kickstart_api_call()

        logging.info("Creating VMs...")
        execute_playbook([PIPELINE_DIR + 'playbooks/create_nodes_for_kickstart.yml'], self.kickstart_settings.to_dict())
        test_nodes_up_and_alive(self.kickstart_settings.nodes, 30)
        self._write_acas_nodes_file()


class GIPKickstartJob(KickstartJob):
    def __init__(self, ctrl_settings: ControllerSetupSettings, gip_kickstart_settings: GIPKickstartSettings):
        super().__init__(ctrl_settings, gip_kickstart_settings)

    def _write_acas_nodes_file(self):
        server = None # type: NodeSettings
        for node in self.kickstart_settings.nodes: # type: NodeSettings

            if server == None:
                if node.node_type == NodeSettings.valid_node_types[4]:
                    server = node

            if server:
                break

        write_to_file([self.ctrl_settings.node.ipaddress], "gipnodestoscan.txt")


class MIPKickstartJob(KickstartJob):
    def __init__(self, ctrl_settings: ControllerSetupSettings, mip_kickstart_settings: MIPKickstartSettings):
        super().__init__(ctrl_settings, None)
        self.mip_kickstart_settings = mip_kickstart_settings

    def run_mip_kickstart(self):
        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)

        self._open_mongo_port()
        runner = MIPAPITester(self.ctrl_settings, self.mip_kickstart_settings)
        runner.run_mip_kickstart_api_call()

        logging.info("Creating VMs...")
        execute_playbook([PIPELINE_DIR + 'playbooks/create_nodes_for_mip.yml'], self.mip_kickstart_settings.to_dict())
        test_nodes_up_and_alive(self.mip_kickstart_settings.mips, 30)
        self._write_acas_mips_file()

    def _write_acas_mips_file(self):
        ipList = [self.ctrl_settings.node.ipaddress]
        if len(self.mip_kickstart_settings.mips) > 0:
            ipList.append(self.mip_kickstart_settings.mips[0].ipaddress)
        write_to_file(ipList, "mipnodestoscan.txt")
