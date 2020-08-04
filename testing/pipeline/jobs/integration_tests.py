import os
import logging
import requests
import time
from typing import Union

from models.kickstart import KickstartSettings, HwKickstartSettings
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.catalog import CatalogSettings
from models.common import NodeSettings
from models.constants import SubCmd

from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import power_off_vms, power_on_vms
from invoke.exceptions import UnexpectedExit
from util.kubernetes_util import wait_for_pods_to_be_alive
import os, logging
from util.api_tester import get_api_key, get_web_ca, check_web_ca, _clean_up
from util import redfish_util as redfish

class IntegrationTestsJob:

    def __init__(self,
                 ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                 kickstart_settings: Union[KickstartSettings, HwKickstartSettings]):
        self.ctrl_settings = ctrl_settings
        self.kickstart_settings = kickstart_settings
        try:
            api_key = get_api_key(ctrl_settings)
        except Exception as e:
            logging.error('SSH to controller failed.  Unable to get API Key.  Exiting.')
            logging.error(e)
            exit(1)
        try:
            root_ca = get_web_ca(ctrl_settings)
        except Exception as e:
            logging.error(e)
            logging.error('Falling back to verify=False.')

    def _replay_pcaps(self):
        headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
        root_ca = check_web_ca()
        REPLAY_PACAP_URL = 'https://{}/api/replay_pcap'.format(self.ctrl_settings.node.ipaddress)
        for sensor in self.kickstart_settings.sensors: # type: NodeSettings
            payload = {"pcap":"dns-dnskey.trace", "sensor": sensor.ipaddress, "ifaces": ["ens224"]}
            payload2 = {"pcap":"get.trace", "sensor": sensor.ipaddress, "ifaces": ["ens224"]}
            payload3 = {"pcap":"smb1_transaction_request.pcap", "sensor": sensor.ipaddress, "ifaces": ["ens224"]}
            response = requests.post(REPLAY_PACAP_URL, json=payload, verify=root_ca, headers=headers)
            response2 = requests.post(REPLAY_PACAP_URL, json=payload2, verify=root_ca, headers=headers)
            response3 = requests.post(REPLAY_PACAP_URL, json=payload3, verify=root_ca, headers=headers)
            if response.status_code != 200 or response2.status_code != 200 or response3.status_code != 200:
                raise Exception("Failed to replay pcap.")

    def run_integration_tests(self):
        wait_for_pods_to_be_alive(self.kickstart_settings.get_master_kubernetes_server(), 30)
        self._replay_pcaps()
        _clean_up(wait = 0)
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
                ctrl_cmd.get(report, reports_destination + filename)

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
        _clean_up(wait = 0)


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

class HwPowerFailureJob:

    def __init__(self, kickstart_settings: HwKickstartSettings):
        self.kickstart_settings = kickstart_settings

    def run_power_cycle(self):
        for node in self.kickstart_settings.nodes:
            self._power_cycle(
                node.oob_ip,
                node.oob_user,
                node.oob_password
            )
        print("Waiting for nodes to respond...")
        time.sleep(60 * 13)
        test_nodes_up_and_alive(self.kickstart_settings.nodes, 15)
        print("Wating for pods to respond...")
        wait_for_pods_to_be_alive(self.kickstart_settings.get_master_kubernetes_server(), 30)
        print("All servers and sensors are up!")

    def _power_cycle(self, oob_ip, oob_user, oob_password):
        token = redfish.get_token(oob_ip, oob_user, oob_password)
        print("Restarting server {}".format(oob_ip))
        result = redfish.restart_server(oob_ip, token)
        redfish.logout(token)
        return result
