import os
import logging
import requests
import time

from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.node import NodeSettingsV2, get_control_plane_node, HardwareNodeSettingsV2
from models.kit import KitSettingsV2

from typing import Union, List
from util.connection_mngs import FabricConnectionWrapper
from util.ssh import test_nodes_up_and_alive
from util.ansible_util import power_off_vms, power_on_vms
from util.kubernetes_util import wait_for_pods_to_be_alive
import os, logging
from util.api_tester import get_api_key, get_web_ca, check_web_ca, _clean_up
from util import redfish_util as redfish


class IntegrationTestsJob:

    def __init__(self,
                 ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                 kit_settings: KitSettingsV2,
                 nodes: List[NodeSettingsV2]):
        self.ctrl_settings = ctrl_settings
        self.kit_settings = kit_settings
        self.nodes = nodes

    def _replay_pcaps(self):
        headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
        root_ca = check_web_ca()
        REPLAY_PACAP_URL = 'https://{}/api/pcap/replay'.format(self.ctrl_settings.node.ipaddress)
        for node in self.nodes: # type: NodeSettingsV2
            if node.is_sensor():
                payloads = [
                    {"pcap":"dns-dnskey.trace", "sensor": node.ip_address, "ifaces": node.monitoring_interfaces, "sensor_hostname": node.hostname, "preserve_timestamp": False},
                    {"pcap":"get.trace", "sensor": node.ip_address, "ifaces": node.monitoring_interfaces, "sensor_hostname": node.hostname, "preserve_timestamp": False},
                    {"pcap":"smb1_transaction_request.pcap", "sensor": node.ip_address, "ifaces": node.monitoring_interfaces, "sensor_hostname": node.hostname, "preserve_timestamp": False}
                ]
                for payload in payloads:
                    response = requests.post(REPLAY_PACAP_URL, json=payload, verify=root_ca, headers=headers)
                    if response.status_code != 200:
                        logging.error(str(response.status_code) + ': ' + response.text)
                        raise Exception("Failed to replay pcap.")

    def _set_api_keys_to_environment(self):
        try:
            api_key = get_api_key(self.ctrl_settings)
        except Exception as e:
            logging.error('SSH to controller failed.  Unable to get API Key.  Exiting.')
            logging.error(e)
            exit(1)
        try:
            root_ca = get_web_ca(self.ctrl_settings)
        except Exception as e:
            logging.error(e)
            logging.error('Falling back to verify=False.')

    def run_integration_tests(self):
        self._set_api_keys_to_environment()
        control_node = get_control_plane_node(self.nodes)
        wait_for_pods_to_be_alive(control_node, 30)
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
            ansible-playbook -i /opt/tfplenum/core/playbooks/inventory/ -e ansible_ssh_pass='" +
                self.kit_settings.settings.password + "' site.yml")

        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as ctrl_cmd:
            with ctrl_cmd.cd("/opt/tfplenum/testing/playbooks"):
                ctrl_cmd.run(cmd_to_mkdir)
            with ctrl_cmd.cd("/opt/tfplenum/testing/playbooks"):
                ctrl_cmd.run(cmd_to_execute, shell=True)

            reports_string_ = ctrl_cmd.run(cmd_to_list_reports).stdout.strip()
            reports = reports_string_.replace("\r","").split("\n")
            for report in reports:
                filename = report.replace(reports_source + "/", "")
                ctrl_cmd.get(report, reports_destination + filename)

        return True

    def run_unit_tests(self):
        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        ctrl_node = self.ctrl_settings.node
        with FabricConnectionWrapper(ctrl_node.username,
                                     ctrl_node.password,
                                     ctrl_node.ipaddress) as ctrl_shell:
            with ctrl_shell.cd("/opt/tfplenum/web/backend/"):
                ctrl_shell.run("/opt/tfplenum/web/tfp-env/bin/python run_unit_tests.py")

        print("Navigate to http://{}/htmlcov/ to see full unit test coverage report.".format(ctrl_node.ipaddress))
        _clean_up(wait = 0)


class PowerFailureJob:

    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kit_settings: KitSettingsV2,
                 nodes: List[NodeSettingsV2]):
        self.ctrl_settings = ctrl_settings
        self.kit_settings = kit_settings
        self.nodes = nodes

    def simulate_power_failure(self):
        power_off_vms(self.kit_settings.vcenter, self.ctrl_settings.node)
        power_off_vms(self.kit_settings.vcenter, self.nodes)

        # Wait for controller to come up first
        power_on_vms(self.kit_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 20)

        # Power on kubernetes primary control plane and wait for it to come up before other nodes.
        control_plane = get_control_plane_node(self.nodes)
        power_on_vms(self.kit_settings.vcenter, control_plane)
        test_nodes_up_and_alive(control_plane, 20)

        # Power on the remaining kubernetes servers.
        remaining_srvs_to_power_on = []
        for node in self.nodes: # type: NodeSettingsV2
            if node.is_server() or node.is_service():
                remaining_srvs_to_power_on.append(node)

        power_on_vms(self.kit_settings.vcenter, remaining_srvs_to_power_on)
        test_nodes_up_and_alive(remaining_srvs_to_power_on, 20)

        # Power on the remaining kubernetes sensors.
        sensors = []
        for node in self.nodes:
            if node.is_sensor():
                sensors.append(node)
        power_on_vms(self.kit_settings.vcenter, sensors)
        test_nodes_up_and_alive(sensors, 20)
        control_plane = get_control_plane_node(self.nodes)
        wait_for_pods_to_be_alive(control_plane, 20)


class HwPowerFailureJob:

    def __init__(self, kit_settings: KitSettingsV2, nodes: List[HardwareNodeSettingsV2]):
        self.nodes = nodes
        self.kit_settings = kit_settings

    def run_power_cycle(self):
        for node in self.nodes: # type: HardwareNodeSettingsV2
            if node.is_control_plane():
                power_off_vms(self.kit_settings.vcenter, node)
                power_on_vms(self.kit_settings.vcenter, node)
            else:
                self._power_cycle(
                    node.idrac_ip_address,
                    node.redfish_user,
                    node.redfish_password
                )
        print("Waiting for nodes to respond...")
        time.sleep(60 * 13)
        test_nodes_up_and_alive(self.nodes, 15)
        print("Wating for pods to respond...")
        control_node = get_control_plane_node(self.nodes)
        wait_for_pods_to_be_alive(control_node, 30)
        print("All servers and sensors are up!")

    def _power_cycle(self, oob_ip, oob_user, oob_password):
        token = redfish.get_token(oob_ip, oob_user, oob_password)
        print("Restarting server {}".format(oob_ip))
        result = redfish.restart_server(oob_ip, token)
        redfish.logout(token)
        return result
