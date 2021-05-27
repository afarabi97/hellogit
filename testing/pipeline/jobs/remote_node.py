from util.connection_mngs import FabricConnectionWrapper
from models.ctrl_setup import HwControllerSetupSettings
from models.kit import KitSettingsV2
from util.connection_mngs import MongoConnectionManager
from random import randrange
from util.ssh import SSHClient
from datetime import datetime, timedelta
import logging
import time
import sys


class RemoteNode:
    def __init__(self,
                 ctrl_settings:HwControllerSetupSettings, kit_settings:KitSettingsV2):
        self.kit_settings = kit_settings
        self.ctrl_ip = ctrl_settings.node.ipaddress
        self.ctrl_password = ctrl_settings.node.password
        self.ctrl_username = ctrl_settings.node.username
        self.switch_ip = ctrl_settings.remote_node_settings.switch_ip
        self.mp_external_ip = ctrl_settings.remote_node_settings.mp_external_ip
        self.mp_gateway = ctrl_settings.remote_node_settings.mp_gateway
        self.pfsense_ip = ctrl_settings.remote_node_settings.pfsense_ip
        self.mgt_password = ctrl_settings.remote_node_settings.management_password
        self.mgt_user = ctrl_settings.remote_node_settings.management_user

    def _get_kit_num(self):

        ctrl_ip = self.ctrl_ip.split(".")[1]

        for num in ctrl_ip:
            kitnum = num

        return kitnum

    def _check_remote_node_vars(self):

        if self.mp_external_ip == "" or self.pfsense_ip == "" or self.switch_ip == "" :
            print("Remote node pipeline requires the following variables \
                   MP_EXTERNAL_IP PFSENSE_IP SWITCH_IP")
            sys.exit(1)

    def _copy_scripts_to_pfsense(self):

        SCRIPT_DIR = "/opt/tfplenum/testing/pipeline/scripts"
        kitnum = self._get_kit_num()

        with FabricConnectionWrapper(self.ctrl_username, self.ctrl_password, self.ctrl_ip) as client:
            client.run("sed -i 's/kitnum/{}/g' {}/pre_kitconfig_switch.cmd".format(kitnum, SCRIPT_DIR))
            client.run("sed -i 's/kitnum/{}/g' {}/post_kitconfig_switch.cmd".format(kitnum, SCRIPT_DIR))
            client.run("sshpass -p {password} \
                        scp -o StrictHostKeyChecking=no \
                        {script_dir}/pre_kitconfig_switch.cmd \
                        {user}@{pfsense_ip}:/home/assessor".format(
                                                            password=self.mgt_password,
                                                            script_dir=SCRIPT_DIR,
                                                            user=self.mgt_user,
                                                            pfsense_ip=self.pfsense_ip))
            client.run("sshpass -p {password} \
                        scp -o StrictHostKeyChecking=no \
                        {script_dir}/post_kitconfig_switch.cmd \
                        {user}@{pfsense_ip}:/home/assessor".format(
                                                            password=self.mgt_password,
                                                            script_dir=SCRIPT_DIR,
                                                            user=self.mgt_user,
                                                            pfsense_ip=self.pfsense_ip))

    def change_external_to_internal(self):

        switch_batch = "/home/assessor/pre_kitconfig_switch.cmd"
        #Checks to see if required remote node variables are set prior to kickstart
        self._check_remote_node_vars()
        #Batch scripts are modified with correct vlan and copied to pfsense
        self._copy_scripts_to_pfsense()

        with FabricConnectionWrapper(self.mgt_user, self.mgt_password, self.pfsense_ip) as client:
            client.run("scp -o StrictHostKeyChecking=no {} {}@{}:pre_kitconfig_switch.cmd".format(switch_batch, self.mgt_user, self.switch_ip))
            client.run("ssh {}@{} batch pre_kitconfig_switch.cmd".format(self.mgt_user, self.switch_ip))

    def _change_internal_to_external(self):

        switch_batch = "/home/assessor/post_kitconfig_switch.cmd"

        with FabricConnectionWrapper(self.mgt_user, self.mgt_password, self.pfsense_ip) as client:
            client.run("scp {} {}@{}:post_kitconfig_switch.cmd".format(switch_batch, self.mgt_user, self.switch_ip))
            client.run("ssh {}@{} batch post_kitconfig_switch.cmd".format(self.mgt_user, self.switch_ip))

    def _get_remote_sensor(self):
        nodes = []
        with MongoConnectionManager(self.ctrl_ip) as mongo_manager:
            for node in mongo_manager.mongo_node.find({}):
                if "sensor" in node['hostname']:
                    nodes.append(node['ip_address'])

        remote_sensor = sorted(nodes)[-1]

        return remote_sensor

    def remote_node_config(self):
        random_octet = randrange(40,253)
        remote_sensor = self._get_remote_sensor()

        with FabricConnectionWrapper(self.ctrl_username, self.ctrl_password, self.ctrl_ip) as client:
            client.run("scp -o StrictHostKeyChecking=no /opt/tfplenum/testing/pipeline/scripts/remote_node_vpn.sh {}:/root".format(remote_sensor))

        with FabricConnectionWrapper(self.ctrl_username, self.kit_settings.settings.password, remote_sensor) as client:
            interface = client.run("nmcli dev status | grep ethernet | head -n 1 | awk '{print $4,$5}'").stdout.strip().split()
            interface = '{} {}'.format(interface[0],interface[1])
            client.run('nmcli con mod "{}" ipv4.address 10.96.0.{}/24'.format(str(interface), random_octet))
            client.run('nmcli con mod "{}" ipv4.gateway {}'.format(str(interface), self.mp_gateway))
            client.run('nmcli con mod "{}" ipv4.dns {}'.format(str(interface), self.ctrl_ip))
            client.run("yum -y install screen")
            #script is executed on remote node after 30 seconds
            client.run('screen -d -m bash /root/remote_node_vpn.sh {} && exit'.format(self.mp_external_ip))

        self._change_internal_to_external()

        print("Waiting for remote node to start....")
        time.sleep(60 * 2)
        self._test_remote_node(self.ctrl_username, self.ctrl_password, self.ctrl_ip)

    def _test_remote_node(self, username, password, ctrl_ip):

        future_time = datetime.utcnow() + timedelta(minutes=5)

        while True:
            if future_time <= datetime.utcnow():
                logging.error("The machines took too long to come up")
                exit(3)

            result = SSHClient.test_connection(
                        ctrl_ip,
                        username,
                        password,
                        timeout=5)
            if result:
                with FabricConnectionWrapper(username, password, ctrl_ip) as client:
                    status = client.run("kubectl get nodes --no-headers | awk '{print $2}'" ).stdout.strip().split()
                if "NotReady" in status:
                    time.sleep(5)
                else:
                    print("Remote node up and active.")
                    break
