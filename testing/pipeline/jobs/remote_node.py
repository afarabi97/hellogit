import os
from util.connection_mngs import FabricConnectionWrapper
from models.kickstart import HwKickstartSettings
from models.ctrl_setup import HwControllerSetupSettings
from random import randrange
from util.ssh import SSHClient
from datetime import datetime, timedelta
import logging
import time
import sys

class RemoteNode:
    def __init__(self,
                 ctrl_settings:HwControllerSetupSettings,
                 kickstart:HwKickstartSettings):

        self.ctrl_ip = ctrl_settings.node.ipaddress
        self.ctrl_password = ctrl_settings.node.password
        self.ctrl_username = ctrl_settings.node.username
        self.switch_ip = kickstart.remote_node.switch_ip
        self.mp_external_ip = kickstart.remote_node.mp_external_ip
        self.mp_gateway = kickstart.remote_node.mp_gateway
        self.pfsense_ip = kickstart.remote_node.pfsense_ip
        self.mgt_password = kickstart.remote_node.management_password
        self.mgt_user = kickstart.remote_node.management_user

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
            client.run(f"sed -i 's/kitnum/{kitnum}/g' {SCRIPT_DIR}/pre_kitconfig_switch.cmd")
            client.run(f"sed -i 's/kitnum/{kitnum}/g' {SCRIPT_DIR}/post_kitconfig_switch.cmd")
            client.run(f"sshpass -p {self.mgt_password} \
                        scp -o StrictHostKeyChecking=no \
                        {SCRIPT_DIR}/pre_kitconfig_switch.cmd \
                        {self.mgt_user}@{self.pfsense_ip}:/home/assessor")
            client.run(f"sshpass -p {self.mgt_password} \
                        scp -o StrictHostKeyChecking=no \
                        {SCRIPT_DIR}/post_kitconfig_switch.cmd \
                        {self.mgt_user}@{self.pfsense_ip}:/home/assessor")

    def change_external_to_internal(self):

        switch_batch = "/home/assessor/pre_kitconfig_switch.cmd"
        #Checks to see if required remote node variables are set prior to kickstart
        self._check_remote_node_vars()
        #Batch scripts are modified with correct vlan and copied to pfsense
        self._copy_scripts_to_pfsense()

        with FabricConnectionWrapper(self.mgt_user, self.mgt_password, self.pfsense_ip) as client:
            client.run(f"scp {switch_batch} {self.mgt_user}@{self.switch_ip}:pre_kitconfig_switch.cmd")
            client.run(f"ssh {self.mgt_user}@{self.switch_ip} batch pre_kitconfig_switch.cmd")

    def _change_internal_to_external(self):

        switch_batch = "/home/assessor/post_kitconfig_switch.cmd"

        with FabricConnectionWrapper(self.mgt_user, self.mgt_password, self.pfsense_ip) as client:
            client.run(f"scp {switch_batch} {self.mgt_user}@{self.switch_ip}:post_kitconfig_switch.cmd")
            client.run(f"ssh {self.mgt_user}@{self.switch_ip} batch post_kitconfig_switch.cmd")

    def remote_node_config(self):

        random_octet = randrange(40,253)

        with FabricConnectionWrapper(self.ctrl_username, self.ctrl_password, self.ctrl_ip) as client:
            getnodes = client.run('kubectl get nodes -o jsonpath={.items..status.addresses[0].address}').stdout.strip()
            nodes = sorted(getnodes.split())
            remote_sensor = nodes[-1]
            interface = client.run(f"ssh {remote_sensor} \
                                    nmcli dev status | grep ethernet | head -n 1 | awk '{{print $4,$5}}'").stdout.strip().split()
            interface = r'{}\ {}'.format(interface[0],interface[1])

            client.run(f'ssh {remote_sensor} nmcli con mod "{str(interface)}" ipv4.address 10.96.0.{random_octet}/24')
            client.run(f'ssh {remote_sensor} nmcli con mod "{str(interface)}" ipv4.gateway {self.mp_gateway}')
            client.run (f'ssh {remote_sensor} nmcli con mod "{str(interface)}" ipv4.dns {self.ctrl_ip}')
            client.run(f"scp /opt/tfplenum/testing/pipeline/scripts/remote_node_vpn.sh {remote_sensor}:/root")
            client.run(f"ssh {remote_sensor} yum -y install screen")
            #script is executed on remote node after 30 seconds
            client.run(f'ssh {remote_sensor} "screen -d -m bash /root/remote_node_vpn.sh {self.mp_external_ip} && exit"')

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
