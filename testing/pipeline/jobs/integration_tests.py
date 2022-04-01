import asyncio
import logging
import os
import time
from datetime import datetime, timedelta
from typing import List, Union

import pytest
import requests
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionTimeout, TransportError
from fabric import Connection
from models.ctrl_setup import (ControllerSetupSettings,
                               HwControllerSetupSettings)
from models.kit import KitSettingsV2
from models.node import (HardwareNodeSettingsV2, NodeSettingsV2,
                         get_control_plane_node)
from util import redfish_util as redfish
from util.ansible_util import power_off_vms, power_on_vms
from util.api_tester import (APITesterV2, _clean_up, check_web_ca, get_api_key,
                             get_web_ca)
from util.connection_mngs import FabricConnectionWrapper, KubernetesWrapper
from util.elastic import get_elastic_password, get_elastic_service_ip
from util.kubernetes_util import wait_for_pods_to_be_alive
from util.network import IPAddressManager
from util.ssh import test_nodes_up_and_alive

TIMER_START_THRESHOLD = 60
TIMER_TIMEOUT_MINUTES = 30
ELASIC_DISK_THRESHOLD_CHECK = 99
NODE_DISK_THRESHOLD_CHECK = 99
MAX_THRESHOLD_COUNT = 15

PCAPS = ["2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap", "2019-03-06-Flawed-Ammyy-traffic.pcap",
         "2019-05-01-password-protected-doc-infection-traffic.pcap", "2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap",
         "2019-08-12-Rig-EK-sends-MedusaHTTP-malware.pcap", "2019-09-03-password-protected-Word-doc-pushes-Remcos-RAT.pcap",
         "wannacry.pcap", "dns-dnskey.trace", "get.trace", "smb1_transaction_request.pcap", "zeek_it_intel.pcap"
         ]


class NodeDiskFillup(Exception):
    pass


class ElasticDiskFillup(Exception):
    pass


class IntegrationTestsJob:

    def __init__(self,
                 ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                 kit_settings: KitSettingsV2,
                 nodes: List[NodeSettingsV2]):
        self.ctrl_settings = ctrl_settings
        self.kit_settings = kit_settings
        self.nodes = nodes
        self._disk_pressure_job_completed = False
        self._timer_triggered = False
        self._threshold_counter = 0
        self.runner = APITesterV2(self.ctrl_settings,
                                  self.kit_settings,
                                  nodes=self.nodes)

    def _replay_pcaps(self):
        headers = {'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY']}
        root_ca = check_web_ca()
        REPLAY_PACAP_URL = 'https://{}/api/policy/pcap/replay'.format(
            self.ctrl_settings.node.ipaddress)
        for node in self.nodes:  # type: NodeSettingsV2
            if node.is_sensor():
                monitoring_ifaces = node.get_monitoring_interfaces_from_mongo()
                payloads = [
                    {"pcap": "dns-dnskey.trace", "sensor_ip": node.ip_address, "ifaces": monitoring_ifaces,
                        "sensor_hostname": node.hostname, "preserve_timestamp": False},
                    {"pcap": "get.trace", "sensor_ip": node.ip_address, "ifaces": monitoring_ifaces,
                        "sensor_hostname": node.hostname, "preserve_timestamp": False},
                    {"pcap": "smb1_transaction_request.pcap", "sensor_ip": node.ip_address,
                        "ifaces": monitoring_ifaces, "sensor_hostname": node.hostname, "preserve_timestamp": False},
                    {"pcap": "wannacry.pcap", "sensor_ip": node.ip_address, "ifaces": monitoring_ifaces,
                        "sensor_hostname": node.hostname, "preserve_timestamp": False},
                ]
                for payload in payloads:
                    response = requests.post(
                        REPLAY_PACAP_URL, json=payload, verify=root_ca, headers=headers)
                    if response.status_code != 200:
                        logging.error(str(response.status_code) +
                                      ': ' + response.text)
                        raise Exception("Failed to replay pcap.")

    def _set_api_keys_to_environment(self):
        try:
            api_key = get_api_key(self.ctrl_settings)
        except Exception as e:
            logging.error(
                'SSH to controller failed.  Unable to get API Key.  Exiting.')
            logging.error(e)
            exit(1)
        try:
            root_ca = get_web_ca(self.ctrl_settings)
        except Exception as e:
            logging.error(e)
            logging.error('Falling back to verify=False.')

    def setup_acceptance_tests(self):
        cmd = ("source /opt/tfplenum/.venv/bin/activate && python3 -m pytest -s --durations=1 --durations-min=600.0 \
            --junitxml=test_results.xml --gherkin-terminal-reporter -W ignore::DeprecationWarning -p pytest_cov \
            --cov=app /opt/tfplenum/web/backend/tests/acceptance")

        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as ctrl_cmd:
            with ctrl_cmd.cd("/opt/tfplenum/web/backend"):
                ctrl_cmd.run(cmd)

    def run_integration_tests(self):
        self._set_api_keys_to_environment()
        control_node = get_control_plane_node(self.nodes)
        wait_for_pods_to_be_alive(control_node, 30)
        self.runner.update_ruleset("suricata")
        self.runner.update_ruleset("zeek")

        self._replay_pcaps()
        _clean_up(wait=0)
        current_path = os.getcwd()
        reports_destination = "reports/"
        if "jenkins" not in current_path and "workspace" not in current_path:
            reports_destination = ""
        reports_source = "/opt/tfplenum/testing/playbooks/reports"
        cmd_to_list_reports = (
            "for i in " + reports_source + "/*; do echo $i; done")
        cmd_to_mkdir = ("mkdir -p reports")
        cmd_to_execute = ("export JUNIT_OUTPUT_DIR='" + reports_source + "' && \
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
            reports = reports_string_.replace("\r", "").split("\n")
            for report in reports:
                filename = report.replace(reports_source + "/", "")
                ctrl_cmd.get(report, reports_destination + filename)

        return True

    async def _check_disk(self, hostname, disk, tokens, remote_shell):
        threshold_exceeded = False
        for x in range(0, 5):
            print("Rechecking disk {} on {}".format(disk, hostname))
            cmd = "df -h {}".format(disk)
            cmd = cmd + "| sed -e /Filesystem/d | awk '{ print $5 }'"
            results = remote_shell.run(cmd, hide=True).stdout.strip()
            usage = results[0:-1]
            if int(usage) > NODE_DISK_THRESHOLD_CHECK:
                threshold_exceeded = True
                print(
                    f"Threshold exceeded waiting to recheck disk {disk} on {hostname}")
            else:
                print(f"Resetting threshold counter")
                threshold_exceeded = False
                self._threshold_counter = 0
                return
            await asyncio.sleep(2)

        if threshold_exceeded:
            print(
                f"Threshold exceeded raising NodeDiskFillup Exception for {disk} on {hostname}")
            self._disk_pressure_job_completed = True
            self._run_docker_cleanup()
            self._clear_elastic_indexes()
            raise NodeDiskFillup(f"Node {hostname} Filesystem: {tokens[0]} mounted on {tokens[5]} exceeded the {NODE_DISK_THRESHOLD_CHECK}% threshold. "
                                 f"Used space was {tokens[2]} with available space {tokens[3]}.")

    async def _check_node_disks_work(self, hostname: str, remote_shell: Connection):
        """
        df -h produces following sample output

        Filesystem                 Size  Used Avail Use% Mounted on
        /dev/mapper/vg_root-root    11G  2.9G  7.8G  27% /
        /dev/mapper/vg_root-tmp    2.7G   52M  2.6G   2% /tmp
        /dev/mapper/vg_data-data    15G  140M   15G   1% /data
        """
        print(f"Peforming disk checks on {hostname}")
        disk_utilization_list = remote_shell.run("df -h", hide=True).stdout
        highest_disk_usage = 0
        highest_disk_usage_info = None
        for index, line in enumerate(disk_utilization_list.split('\n')):
            if index == 0:
                # Skip first line as it is the header in the output
                continue
            tokens = line.split()
            if len(tokens) < 6:
                # If the line is not at least of size 6 we ignore it
                continue

            # Checks percentage usage of a given disk volume against our threshold check.
            disk_usage = int(tokens[4][0:-1])
            if disk_usage >= TIMER_START_THRESHOLD:
                self._timer_triggered = True

            if disk_usage > highest_disk_usage:
                highest_disk_usage = disk_usage
                highest_disk_usage_info = line

            if disk_usage > NODE_DISK_THRESHOLD_CHECK:
                self._threshold_counter += 1
                print(
                    f"Increasing the threshold_counter {self._threshold_counter}")

            if self._threshold_counter > MAX_THRESHOLD_COUNT:
                print("Executing extra disk check")
                await self._check_disk(hostname, tokens[5], tokens, remote_shell)

        print("Highest current disk usage: " + highest_disk_usage_info)
        await asyncio.sleep(20)

    async def _check_node_disks_continuous(self, hostname: str, node: NodeSettingsV2, password: str):
        with FabricConnectionWrapper(node.username,
                                     password,
                                     node.ip_address) as shell:
            while True:
                await self._check_node_disks_work(hostname, shell)
                if self._disk_pressure_job_completed:
                    break

    async def _check_node_disks(self, hostname: str, remote_shell: Connection):
        await self._check_node_disks_work(hostname, remote_shell)

    async def _check_elastic_cluster(self):
        elastic_password = None
        elastic_ip = None
        elastic_port = None
        with KubernetesWrapper(self.ctrl_settings.node.username,
                               self.ctrl_settings.node.password,
                               self.ctrl_settings.node.ipaddress) as api:
            elastic_password = get_elastic_password(api)
            elastic_ip, elastic_port = get_elastic_service_ip(api)

        self._es = Elasticsearch([f"{elastic_ip}:{elastic_port}"],
                                 use_ssl=True,
                                 verify_certs=False,
                                 http_auth=('elastic', elastic_password),
                                 scheme="https",
                                 timeout=30)
        while True:
            try:
                print("Peforming elastic cluster checks")
                allocations = self._es.cat.allocation()
                """
                shards disk.indices disk.used disk.avail disk.total disk.percent host         ip           node
                46        2.9gb       5gb      4.9gb      9.9gb           50 10.233.17.10 10.233.17.10 tfplenum-es-master-1
                46          3gb       5gb      4.9gb      9.9gb           50 10.233.3.6   10.233.3.6   tfplenum-es-master-0
                """
                for line in allocations.split('\n'):
                    tokens = line.split()
                    if len(tokens) > 8:
                        node_name = tokens[8]
                        disk_percentage = int(tokens[5])
                        if disk_percentage >= TIMER_START_THRESHOLD:
                            self._timer_triggered = True

                        if disk_percentage > ELASIC_DISK_THRESHOLD_CHECK:
                            raise ElasticDiskFillup(
                                f"{node_name} exceeded the {ELASIC_DISK_THRESHOLD_CHECK}% threshold")

                print("Current Elastic Allocations:")
                print(allocations)
                health = self._es.cat.health(params={"v": "true"})
                print(health)

            except TransportError as e:
                logging.exception(e)

            await asyncio.sleep(10)
            if self._disk_pressure_job_completed:
                break

    async def _run_cold_log_pressure(self):
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as shell:
            while True:
                shell.run(
                    "/opt/tfplenum/scripts/process_offline_logs.py system -t syslog -z /var/www/html/testfiles/system_logs.zip", shell=True, warn=True)
                await asyncio.sleep(15)

                if self._disk_pressure_job_completed:
                    break

    def _run_docker_cleanup(self):
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as shell:
            shell.run("redis-cli FLUSHALL", shell=True, warn=True)
            shell.run(
                "systemctl restart rqworker@{1..20}", shell=True, warn=True)
            shell.run("docker stop $(docker ps -qa)", shell=True, warn=True)

    async def _run_pcaps_on_sensors(self, node: NodeSettingsV2, password: str):
        with FabricConnectionWrapper(node.username,
                                     password,
                                     node.ip_address) as shell:
            shell.run("mkdir -p /root/pcaps")
            with shell.cd("/root/pcaps"):
                for pcap in PCAPS:
                    shell.run(f"curl -o {pcap} http://controller/pcaps/{pcap}")

                monitoring_iface = node.get_monitoring_interfaces_from_mongo()[
                    0]
                while True:
                    shell.run(
                        f"tcpreplay --mbps=1000 -i {monitoring_iface} --loop=1 *.pcap")
                    await self._check_node_disks(node.hostname, shell)

                    if self._disk_pressure_job_completed:
                        break

    async def _check_timer(self):
        while True:
            if self._timer_triggered:
                future_time = datetime.utcnow() + timedelta(minutes=TIMER_TIMEOUT_MINUTES)
                while True:
                    delta = future_time - datetime.utcnow()
                    minutes = divmod(delta.total_seconds(), 60)
                    print("Time before test passes is minutes: {}, seconeds: {}".format(
                        minutes[0], minutes[1]))

                    if future_time <= datetime.utcnow():
                        self._disk_pressure_job_completed = True
                        print("Disk job completed successfully")
                        break
                    await asyncio.sleep(5)

            if self._disk_pressure_job_completed:
                break
            await asyncio.sleep(20)

    async def _do_disk_fill_up_work(self):
        tasks = []
        tasks.append(self._check_timer())
        tasks.append(self._run_cold_log_pressure())
        tasks.append(self._check_elastic_cluster())
        password = self.kit_settings.settings.password
        for node in self.nodes:  # type: NodeSettingsV2
            if node.is_sensor():
                tasks.append(self._run_pcaps_on_sensors(node, password))
            elif node.is_server():
                tasks.append(self._check_node_disks_continuous(
                    node.hostname, node, password))

        await asyncio.gather(*tasks)

    def _open_or_close_kubernetes_port_on_ctrl_plane(self, is_close=False):
        cmd = "firewall-cmd --add-port=6443/tcp"
        if is_close:
            cmd = "firewall-cmd --remove-port=6443/tcp"
        ctrl_plane_ip = IPAddressManager(self.ctrl_settings.node.network_id,
                                         self.ctrl_settings.node.network_block_index).get_control_plane_ip_address()
        password = self.kit_settings.settings.password
        with FabricConnectionWrapper('root',
                                     password,
                                     ctrl_plane_ip) as client:
            client.run(cmd)

    def _run_forcemerged(self) -> None:
        try:
            self._es.indices.forcemerge(
                params={"only_expunge_deletes": "true", "ignore_unavailable": "true"})
        except Exception as e:
            logging.exception(e)

    def _remove_index_blocks(self, index) -> None:
        try:
            self._es.indices.put_settings(
                index=index, body={"index.blocks.read_only_allow_delete": None})
        except Exception as e:
            logging.exception(e)
        try:
            self._es.indices.put_settings(
                index=index, body={"index.blocks.write": None})
        except Exception as e:
            logging.exception(e)
        try:
            self._es.indices.put_settings(
                index=index, body={"index.blocks.read": None})
        except Exception as e:
            logging.exception(e)

    def _clear_elastic_indexes(self):
        result = self._es.cat.indices(
            params={"s": "store.size:desc", "h": "index"})
        indexes = result.split("\n")
        cold_log_index = "filebeat-external-cold-log-system"
        self._remove_index_blocks(cold_log_index)
        self._es.indices.close(cold_log_index)
        self._es.indices.delete(cold_log_index)
        for i in range(0, len(indexes)):
            index = indexes[i]  # type: str

            # Skip the index we deleted.
            if index == cold_log_index:
                continue

            # Skip the interal indicies as it can cause issues deleting that data.
            if index.startswith(".") or index == "" or index is None:
                continue

            # Skip arkime viewer indicies
            if index.startswith(tuple(['arkime_dstats', 'arkime_stats', 'arkime_hunts', 'arkime_fields', 'arkime_lookups', 'arkime_users', 'arkime_files', 'arkime_queries', 'arkime_sequence'])):
                continue

            idx = self._es.indices.get(index=index)
            aliases = idx[index]["aliases"]
            self._remove_index_blocks(index)
            if aliases:
                is_write_index = False
                alias_name = list(aliases.keys())[0]
                if "is_write_index" in aliases[alias_name]:
                    is_write_index = aliases[alias_name]["is_write_index"]
                if is_write_index:
                    print("Rolling over alias " + alias_name)
                    self._es.indices.rollover(alias_name)
            print("Closing index " + index)
            results = self._es.indices.close(index=index)
            print("Deleting index " + index)
            results = self._es.indices.delete(index=index)
        self._run_forcemerged()

    def run_disk_fillup_tests(self):
        try:
            self._open_or_close_kubernetes_port_on_ctrl_plane(is_close=False)
            loop = asyncio.new_event_loop()
            loop.run_until_complete(self._do_disk_fill_up_work())
            self._run_docker_cleanup()
            retries = 0
            while True:
                print(
                    "Attempting to clear elastic indexes on retry number {}".format(retries))
                try:
                    self._clear_elastic_indexes()
                    break
                except TransportError:
                    if retries >= 10:
                        break

                    time.sleep(60)
                    retries = retries + 1
                    continue
        finally:
            self._open_or_close_kubernetes_port_on_ctrl_plane(is_close=True)


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
        for node in self.nodes:  # type: NodeSettingsV2
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
        for node in self.nodes:  # type: HardwareNodeSettingsV2
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
