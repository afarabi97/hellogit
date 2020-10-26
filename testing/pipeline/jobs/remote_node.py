import os
from util.connection_mngs import FabricConnectionWrapper
from models.kickstart import HwKickstartSettings
from models.ctrl_setup import HwControllerSetupSettings
from random import randrange
from util.ssh import SSHClient
from datetime import datetime, timedelta
import logging
import time

class RemoteNode:
    def __init__(self,
                 ctrl_settings:HwControllerSetupSettings,
                 kickstart:HwKickstartSettings):
        self.ctrl_settings = ctrl_settings
        self.remote_node = kickstart.remote_node

    def change_external_to_internal(self):
        switch_batch = "/home/assessor/pre_kitconfig_switch.cmd"
        user = self.remote_node.management_user
        password = self.remote_node.management_password
        switch_ip = self.remote_node.switch_ip
        pfsense_ip = self.remote_node.pfsense_ip

        os.system(f'ssh-keygen -f "/root/.ssh/known_hosts" -R "{pfsense_ip}"')
        os.system(f"sshpass -p {password} \
                    scp /mnt/drive_creation/scripts/pre_kitconfig_switch.cmd \
                    {user}@{pfsense_ip}:/home/assessor")

        with FabricConnectionWrapper(user, password, pfsense_ip) as client:
            client.run(f"scp {switch_batch} {user}@{switch_ip}:pre_kitconfig_switch.cmd")
            client.run(f"rm {switch_batch}")
            client.run(f"ssh {user}@{switch_ip} batch pre_kitconfig_switch.cmd")

    def _change_internal_to_external(self):
        switch_batch = "/home/assessor/post_kitconfig_switch.cmd"
        user = self.remote_node.management_user
        password = self.remote_node.management_password
        switch_ip = self.remote_node.switch_ip
        pfsense_ip = self.remote_node.pfsense_ip

        os.system(f"sshpass -p {password} \
                    scp /mnt/drive_creation/scripts/post_kitconfig_switch.cmd \
                    {user}@{pfsense_ip}:/home/assessor")

        with FabricConnectionWrapper(user, password, pfsense_ip) as client:
            client.run(f"scp {switch_batch} {user}@{switch_ip}:post_kitconfig_switch.cmd")
            client.run(f"rm {switch_batch}")
            client.run(f"ssh {user}@{switch_ip} batch post_kitconfig_switch.cmd")

    def remote_node_config(self):
        ctrl_ip = self.ctrl_settings.node.ipaddress
        password = self.ctrl_settings.node.password
        username = self.ctrl_settings.node.username
        mp_gateway = self.remote_node.mp_gateway
        mp_external_ip = self.remote_node.mp_external_ip
        random_octet = randrange(40,253)
        
        os.system(f'ssh-keygen -f "/root/.ssh/known_hosts" -R "{ctrl_ip}"')
        os.system(f"sshpass -p {password} \
                    scp /mnt/drive_creation/scripts/remote_node_vpn.sh \
                    {username}@{ctrl_ip}:/root")

        with FabricConnectionWrapper(username, password, ctrl_ip) as client:
            getnodes= client.run('kubectl get nodes -o jsonpath={.items..status.addresses[0].address}').stdout.strip()
            nodes = sorted(getnodes.split())
            remote_sensor = nodes[-1]
            interface = client.run(f"ssh {remote_sensor} \
                                    nmcli dev status | grep ethernet | head -n 1 | awk '{{print $4,$5}}'").stdout.strip().split()
            interface = r'{}\ {}'.format(interface[0],interface[1])

            client.run(f'ssh {remote_sensor} \'echo "@reboot sleep 30;systemctl restart crio kubelet" >> /var/spool/cron/root\'')
            client.run(f'ssh {remote_sensor} nmcli con mod "{str(interface)}" ipv4.address 10.96.0.{random_octet}/24')
            client.run(f'ssh {remote_sensor} nmcli con mod "{str(interface)}" ipv4.gateway {mp_gateway}')
            client.run (f'ssh {remote_sensor} nmcli con mod "{str(interface)}" ipv4.dns {ctrl_ip}')
            client.run(f"scp /root/remote_node_vpn.sh {remote_sensor}:/root")
            client.run(f"ssh {remote_sensor} yum -y install screen")
            #script is executed on remote node after 30 seconds
            client.run(f'ssh {remote_sensor} "screen -d -m bash /root/remote_node_vpn.sh {mp_external_ip} && exit"')

        self._change_internal_to_external()

        print("Waiting for remote node to start....")
        time.sleep(60 * 2)
        self._test_remote_node(username, password, ctrl_ip)

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
