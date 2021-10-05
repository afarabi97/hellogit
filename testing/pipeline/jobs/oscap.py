import os

from models.ctrl_setup import ControllerSetupSettings
from models.kit import KitSettingsV2
from util.ansible_util import power_on_vms
from util.connection_mngs import FabricConnectionWrapper, MongoConnectionManager
from util.ssh import test_nodes_up_and_alive

PROJECT_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../../../"

class OSCAPScanJob:
    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kit_settings: KitSettingsV2):
        self.ctrl_settings = ctrl_settings
        self.kit_settings = kit_settings

    def run_scan(self):
        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        report_name = "oscap_report_ctrl.html"
        directory = "/opt/tfplenum"
        cmd = 'oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_stig --report {} --oval-results /usr/share/xml/scap/ssg/content/ssg-rhel8-ds.xml'
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            with client.cd(directory):
                client.run(cmd.format(report_name), warn=True, shell=True)
                client.get("{}/{}".format(directory, report_name), report_name)

        with MongoConnectionManager(self.ctrl_settings.node.ipaddress) as mongo_manager:
            nodes = mongo_manager.mongo_node.find({})
            for node in nodes: # type : Dict
                ipaddress = node["ip_address"]
                hostname = node["hostname"]

                username = "root"
                user_dir = "/root"
                report_name = "oscap_report_{}.html".format(hostname)
                with FabricConnectionWrapper(username,
                                             self.kit_settings.settings.password,
                                             ipaddress) as client:
                    with client.cd(user_dir):
                        client.run(cmd.format(report_name), warn=True, shell=True)
                        client.get("{}/{}".format(user_dir, report_name), report_name)

