import os
import logging
import requests

from models.kickstart import KickstartSettings
from models.ctrl_setup import ControllerSetupSettings
from models.catalog import CatalogSettings
from models.common import NodeSettings
from models.constants import SubCmd

from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import power_off_vms, power_on_vms
from invoke.exceptions import UnexpectedExit
from util.kubernetes_util import wait_for_pods_to_be_alive


class IntegrationTestsJob:

    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kickstart_settings: KickstartSettings):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings

    def _replay_pcaps(self):
        for sensor in self.kickstart_settings.sensors: # type: NodeSettings
            payload = {"pcap":"dns-dnskey.trace", "sensor": sensor.ipaddress, "ifaces": ["ens224"]}
            payload2 = {"pcap":"get.trace", "sensor": sensor.ipaddress, "ifaces": ["ens224"]}
            payload3 = {"pcap":"smb1_transaction_request.pcap", "sensor": sensor.ipaddress, "ifaces": ["ens224"]}

            response = requests.post('https://{}/api/replay_pcap'.format(self.ctrl_settings.node.ipaddress), json=payload, verify=False)
            response2 = requests.post('https://{}/api/replay_pcap'.format(self.ctrl_settings.node.ipaddress), json=payload2, verify=False)
            response3 = requests.post('https://{}/api/replay_pcap'.format(self.ctrl_settings.node.ipaddress), json=payload3, verify=False)
            if response.status_code != 200 or response2.status_code != 200 or response3.status_code != 200:
                raise Exception("Failed to replay pcap.")

    def run_integration_tests(self):
        wait_for_pods_to_be_alive(self.kickstart_settings.get_master_kubernetes_server(), 30)
        self._replay_pcaps()
        current_path=os.getcwd()
        reports_destination="reports/"
        if "jenkins" not in current_path and "workspace" not in current_path:
            reports_destination=""
        reports_source = "/opt/tfplenum/testing/playbooks/reports"
        cmd_to_list_reports = ("for i in " + reports_source + "/*; do echo $i; done")
        cmd_to_mkdir = ("mkdir -p reports")
        cmd_to_execute = ("export JUNIT_OUTPUT_DIR='"+ reports_source +"' && \
            export JUNIT_FAIL_ON_CHANGE='true' && \
            ansible-playbook -i /opt/tfplenum/core/playbooks/inventory.yml -e ansible_ssh_pass='" +
                self.kickstart_settings.servers[0].password + "' site.yml")

        error = False
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as ctrl_cmd:
            with ctrl_cmd.cd("/opt/tfplenum/testing/playbooks"):
                ctrl_cmd.run(cmd_to_mkdir)
            with ctrl_cmd.cd("/opt/tfplenum/testing/playbooks"):
                try:
                    ctrl_cmd.run(cmd_to_execute, shell=True)
                except UnexpectedExit as e:
                    print(e)
                    error = True

            reports_string_ = ctrl_cmd.run(cmd_to_list_reports).stdout.strip()
            reports = reports_string_.replace("\r","").split("\n")
            for report in reports:
                filename = report.replace(reports_source + "/", "")
                results = ctrl_cmd.get(report, reports_destination + filename)

        if error:
            raise Exception("Tests failed.")

        return True

    def run_unit_tests(self):
        ctrl_node = self.ctrl_settings.node
        with FabricConnectionWrapper(ctrl_node.username,
                                     ctrl_node.password,
                                     ctrl_node.ipaddress) as ctrl_shell:
            with ctrl_shell.cd("/opt/tfplenum/web/backend/tests"):
                ctrl_shell.run("/opt/tfplenum/web/tfp-env/bin/python controller_test.py")
                ctrl_shell.run("zip -r htmlcov.zip htmlcov/")
                ctrl_shell.run("mv htmlcov/ /var/www/html/")

            ctrl_shell.get("/opt/tfplenum/web/backend/tests/htmlcov.zip", "./htmlcov.zip")

        print("Navigate to http://{}/htmlcov/ to see full unit test coverage report.".format(ctrl_node.ipaddress))


class PowerFailureJob:

    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kickstart_settings: KickstartSettings):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings

    def simulate_power_failure(self):
        self.kickstart_settings.nodes.append(self.ctrl_settings.node)
        power_off_vms(self.kickstart_settings.vcenter, self.kickstart_settings.nodes)
        power_on_vms(self.kickstart_settings.vcenter, self.kickstart_settings.nodes)
        test_nodes_up_and_alive(self.kickstart_settings.nodes, 30)
        wait_for_pods_to_be_alive(self.kickstart_settings.get_master_kubernetes_server(), 30)
