import os

from models.ctrl_setup import ControllerSetupSettings
from models.common import NodeSettings
from models.kickstart import HwKickstartSettings, KickstartSettings, MIPKickstartSettings
from util.ansible_util import power_on_vms
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from typing import Union


PROJECT_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../../../"


class OSCAPScanJob:
    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kickstart_settings: Union[KickstartSettings, HwKickstartSettings, MIPKickstartSettings]):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings

    def run_scan(self):
        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)

        report_name = "oscap_report_ctrl.html"
        cmd = 'oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_stig --report {} --oval-results /usr/share/xml/scap/ssg/content/ssg-rhel8-ds.xml'
        cmd2 = 'cp {} /tmp/{}'
        cmd3 = 'chmod 555 /tmp/{}'
        cmd4 = 'rm -fr /tmp/{}'
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            with client.cd("/opt/tfplenum"):
                client.sudo(cmd.format(report_name), warn=True, shell=True)
                client.sudo(cmd2.format(report_name,report_name), warn=True, shell=True)
                client.sudo(cmd3.format(report_name), warn=True, shell=True)
                client.get("/tmp/{}".format(report_name), "{}/{}".format(PROJECT_DIR, report_name))
                client.sudo(cmd4.format(report_name), warn=True, shell=True)

        if isinstance(self.kickstart_settings, MIPKickstartSettings):
            nodes = self.kickstart_settings.mips
        else:
            nodes = self.kickstart_settings.nodes

        for node in nodes: # type : NodeSettings
            username = node.username
            user_dir = "/root"
            #if node.is_mip():
                #username = node.mip_username
                #user_dir = "/home/{}".format(username)

            report_name = "oscap_report_{}.html".format(node.hostname)
            with FabricConnectionWrapper(username,
                                         node.password,
                                         node.ipaddress) as client:
                with client.cd(user_dir):
                    client.sudo(cmd.format(report_name), warn=True, shell=True)
                    client.sudo(cmd2.format(report_name,report_name), warn=True, shell=True)
                    client.sudo(cmd3.format(report_name), warn=True, shell=True)
                    client.get("/tmp/{}".format(report_name), "{}/{}".format(PROJECT_DIR, report_name))
                    client.sudo(cmd4.format(report_name), warn=True, shell=True)
