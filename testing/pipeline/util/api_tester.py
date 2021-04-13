import json
import logging
import requests
import time
from time import sleep
import pymongo
import os
import tempfile

from datetime import datetime, timedelta
from util.connection_mngs import MongoConnectionManager
from typing import Union, List, Dict

from models.ctrl_setup import ControllerSetupSettings
from models.kickstart import KickstartSettings, MIPKickstartSettings
from models.kit import KitSettings
from models.catalog import (ArkimeCaptureSettings, ArkimeViewerSettings, ZeekSettings, SuricataSettings,
WikijsSettings, MispSettings, HiveSettings, CortexSettings, RocketchatSettings, CatalogSettings,
MattermostSettings, NifiSettings, RedmineSettings, NetflowFilebeatSettings)
from models.mip_config import MIPConfigSettings
from models.common import NodeSettings
from util.kubernetes_util import wait_for_jobs_to_complete, wait_for_deployments_to_ready
from util.connection_mngs import FabricConnectionWrapper
from util.network import retry

from pprint import pprint

SERVER_ANY = "Server - Any"
SENSOR = "Sensor"
INSTALL = "install"
REINSTALL = "reinstall"
UNINSTALL = "uninstall"

def zero_pad(num: int) -> str:
    """
    Zeros pads the numbers that are lower than 10.

    :return: string of the new number.
    """
    if num < 10:
        return "0" + str(num)
    return str(num)


class APIFailure(Exception):
    pass


def print_json(something: Union[Dict, List]) -> None:
    print("Printing Response back:")
    print(json.dumps(something, indent=4, sort_keys=True))


def get_request(url: str) -> Union[List, Dict]:
    headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
    root_ca = check_web_ca()
    response = requests.get(url, verify=root_ca, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise APIFailure(url + ' FAILED!\n' + str(response.status_code))


def post_request(url: str, payload: Dict) -> Union[List, Dict]:
    headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
    root_ca = check_web_ca()
    response = requests.post(url, json=payload, verify=root_ca, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        pprint(response.json())
        raise APIFailure(url + ' FAILED!\n' + str(response.status_code))

def put_request(url: str, payload: Dict) -> Union[List, Dict]:
    headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
    root_ca = check_web_ca()
    response = requests.put(url, json=payload, verify=root_ca, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        pprint(response.json())
        raise APIFailure(url + ' FAILED!\n' + str(response.status_code))


def wait_for_job_to_finish(job_name: str, url: str, minutes_timeout: int):
    future_time = datetime.utcnow() + timedelta(minutes=minutes_timeout)

    while True:
        if future_time <= datetime.utcnow():
            print("The {} took way too long.".format(job_name))
            exit(3)

        logging.info("Waiting for {} to complete sleeping 5 seconds then rechecking.".format(job_name))
        sleep(5)
        response_dict = get_request(url.format(job_name))
        if response_dict["status"] == 'finished':
            return
        elif response_dict["status"] == 'failed':
            logging.error("Job failed horribly.  See /var/log/tfplenum/rq.log for details.")
            exit(2)


def get_api_key(ctrl_settings: ControllerSetupSettings) -> str:
    """
    SSH's to controller and generate JWT API Key

    :param ctrl_settings (ControllerSetupSettings): Controller Node Object
    :return API Key (str): Returns API key
    """
    api_key = ''
    logging.info('SSHing to controller to get API key.')
    with FabricConnectionWrapper(ctrl_settings.node.username, ctrl_settings.node.password, ctrl_settings.node.ipaddress) as remote_shell:
        api_gen_cmd = '/opt/tfplenum/web/tfp-env/bin/python3 /opt/sso-idp/gen_api_token.py --roles "controller-admin,controller-maintainer,operator" --exp 4'
        ret_val = remote_shell.run(api_gen_cmd,hide=True)
        api_key = ret_val.stdout.strip()
    if api_key != '':
        logging.info('Retrieved API Key')
        os.environ['CONTROLLER_API_KEY'] = api_key
        return api_key
    logging.error('API Key is blank or wasn\'t able to be retrieved.')
    raise APIFailure('API Key is blank or wasn\'t able to be retrieved.')

def get_web_ca(ctrl_settings: ControllerSetupSettings) -> str:
    """
    SSH's to controller and generate JWT API Key

    :param ctrl_settings (ControllerSetupSettings): Controller Node Object
    :return API Key (str): Returns API key
    """
    root_ca = False
    logging.info('SSHing to controller to get the Web Root CA.')
    with FabricConnectionWrapper(ctrl_settings.node.username, ctrl_settings.node.password, ctrl_settings.node.ipaddress) as remote_shell:
        try:
            tf = tempfile.NamedTemporaryFile(delete=False)
            ca_file = '/etc/pki/ca-trust/source/anchors/webCA.crt'
            ca_exists = remote_shell.get(ca_file,tf.name)
            tf.close()
            root_ca = True
        except Exception as e:
            root_ca = False
            logging.error(e)
    if root_ca:
        logging.info('Retrieved Root CA')
        os.environ['WEB_ROOT_CA_PATH'] = tf.name
        return root_ca
    raise APIFailure('Root CA is blank or wasn\'t able to be retrieved.')

def check_web_ca():
    root_ca = False
    if 'WEB_ROOT_CA_PATH' in os.environ and os.path.isfile(os.environ['WEB_ROOT_CA_PATH']):
        root_ca = os.environ['WEB_ROOT_CA_PATH']
    return root_ca


def _clean_up(wait: int = 60):
    if 'WEB_ROOT_CA_PATH' in os.environ and os.path.isfile(os.environ['WEB_ROOT_CA_PATH']):
        os.remove(os.environ['WEB_ROOT_CA_PATH'])
    if wait > 0:
        time.sleep(wait)

class KickstartPayloadGenerator:

    def __init__(self, ctrl_settings: ControllerSetupSettings, kickstart_settings: KickstartSettings):
        self._ctrl_settings = ctrl_settings
        self._kickstart_settings = kickstart_settings

    def _construct_node_part(self, node: NodeSettings) -> Dict:
        boot_drive = "sda"
        data_drive = "sdb"
        data = {
            "hostname": node.hostname,
            "ip_address": node.ipaddress,
            "mac_address": node.mng_mac,
            "boot_drives": [boot_drive],
            "data_drives": [data_drive],
            "raid_drives": [boot_drive, data_drive],
            "os_raid": node.os_raid,
            "pxe_type": node.boot_mode,
            "os_raid_root_size": 0
        }
        if node.os_raid:
            data["raid_drives"] = boot_drive + "," + data_drive
        return data

    def _construct_node_parts(self) -> List[Dict]:
        ret_val = []
        for node in self._kickstart_settings.nodes:
            # if node.type == Node.valid_node_types[2]:
            #     #if the node is the controller ignore it
            #     continue
            ret_val.append(self._construct_node_part(node))
        return ret_val

    def generate(self) -> Dict:
        return {
            "dhcp_range": self._kickstart_settings.dhcp_ip_block,
            "gateway": self._kickstart_settings.node_defaults.gateway,
            "netmask": self._kickstart_settings.node_defaults.netmask,
            "root_password": self._kickstart_settings.node_defaults.password,
            "controller_interface":  self._ctrl_settings.node.ipaddress,
            "nodes": self._construct_node_parts(),
            "domain": self._ctrl_settings.node.domain,
            "upstream_dns": self._kickstart_settings.upstream_dns,
            "upstream_ntp": self._kickstart_settings.upstream_ntp
        }


class MIPKickstartPayloadGenerator:

    def __init__(self, ctrl_settings: ControllerSetupSettings, mip_kickstart_settings: MIPKickstartSettings):
        self._ctrl_settings = ctrl_settings
        self._mip_kickstart_settings = mip_kickstart_settings

    def _construct_node_part(self, node: NodeSettings) -> Dict:

        return {
            "hostname": node.hostname,
            "ip_address": node.ipaddress,
            "mac_address": node.mng_mac,
            "pxe_type": node.boot_mode
        }

    def _construct_node_parts(self) -> List[Dict]:
        ret_val = []
        for node in self._mip_kickstart_settings.mips:
            ret_val.append(self._construct_node_part(node))
        return ret_val

    def generate(self) -> Dict:
        return {
            "dhcp_range": self._mip_kickstart_settings.dhcp_ip_block,
            "gateway": self._mip_kickstart_settings.node_defaults.gateway,
            "netmask": self._mip_kickstart_settings.node_defaults.netmask,
            "root_password": self._mip_kickstart_settings.node_defaults.password,
            "luks_password": self._mip_kickstart_settings.node_defaults.luks_password,
            "controller_interface": self._ctrl_settings.node.ipaddress,
            "nodes": self._construct_node_parts(),
            "dns": self._mip_kickstart_settings.node_defaults.dns_servers[0]
        }


class MIPConfigPayloadGenerator:
    def __init__(self, ctrl_settings, mip_kickstart_settings, mip_config_settings):
        self._ctrl_settings = ctrl_settings
        self._mip_kickstart_settings = mip_kickstart_settings
        self._mip_config_settings = mip_config_settings

    def _construct_mips_part(self):
        mips = []
        for mip in self._mip_kickstart_settings.mips:
            mips.append({'address': mip.ipaddress})
        return mips

    def generate(self) -> Dict:
        return {
            "mips": self._construct_mips_part(),
            "type": self._mip_config_settings.operator_type,
            "passwords": [{"password": self._mip_config_settings.password, "confirm_password": self._mip_config_settings.password}],
            "singlePassword": True
        }


class KitPayloadGenerator:

    def __init__(self, ctrl_settings: ControllerSetupSettings,
                 kickstart_settings: KickstartSettings,
                 kit_settings: KitSettings):
        self._dns_ips = ctrl_settings.node.dns_servers # type: List[str]
        self._controller_ip = ctrl_settings.node.ipaddress
        self._url = "https://" + self._controller_ip + "{}"
        self._kickstart_settings = kickstart_settings
        self._kit_settings = kit_settings
        self._device_facts_map = {}

    def _request_device_facts(self, node: NodeSettings) -> Dict:
        ret_val = get_request(self._url.format("/api/gather-device-facts/"+node.ipaddress))
        return ret_val

    def _set_device_facts_ip_map(self) -> None:
        self._device_facts_map = {}
        for node in self._kickstart_settings.servers: # type: NodeSettings
            self._device_facts_map[node.ipaddress] = self._request_device_facts(node)

        for node in self._kickstart_settings.sensors():
            self._device_facts_map[node.ipaddress] = self._request_device_facts(node)

    def _construct_server_part(self, node: NodeSettings) -> Dict:
        if node.node_type not in NodeSettings.valid_server_types:
            raise ValueError("You passed an invalid node type inot this methods. "
                             "It must be %s" % str(NodeSettings.valid_server_types))

        is_master = node.node_type == NodeSettings.valid_node_types[0]
        # node_fqdn = "{}.{}".format(node.hostname, node.domain)
        return {
            "node_type": "Server",
            "hostname": node.hostname,
            "ip_address": node.ipaddress,
            "is_master_server": is_master,
            'mac_address': node.mng_mac,
            'os_raid': node.os_raid,
            'pxe_type': node.boot_mode,
            "deviceFacts": self._device_facts_map[node.ipaddress]
        }

    def _construct_sensor_part(self, node: NodeSettings) -> Dict:
        if node.node_type not in NodeSettings.valid_sensor_types:
            raise ValueError("You passed an invalid node type inot this methods. "
                             "It must be %s" % str(NodeSettings.valid_sensor_types))

        # node_fqdn = "{}.{}".format(node.hostname, node.domain)
        return {
            "node_type": SENSOR,
            "hostname": node.hostname,
            "ip_address": node.ipaddress,
            'mac_address': node.mng_mac,
            'os_raid': node.os_raid,
            'pxe_type': node.boot_mode,
            "deviceFacts": self._device_facts_map[node.ipaddress]
        }

    def _construct_time_part(self) -> Dict:
        time = datetime.utcnow()
        return {
            "date": {
                "year": time.year,
                "month": time.month,
                "day": time.day
            },
            "time": "{}:{}:00".format(zero_pad(time.hour), zero_pad(time.minute)),
            "timezone": "UTC"
        }

    def _set_device_facts_ip_map(self) -> None:
        self._device_facts_map = {}
        for node in self._kickstart_settings.servers:
            self._device_facts_map[node.ipaddress] = self._request_device_facts(node)

        for node in self._kickstart_settings.sensors:
            self._device_facts_map[node.ipaddress] = self._request_device_facts(node)

    def _construct_kit_payload(self) -> Dict:
        node_parts = []
        for sensor in self._kickstart_settings.sensors:
            ses_part = self._construct_sensor_part(sensor)
            node_parts.append(ses_part)

        for server in self._kickstart_settings.servers:
            srv_part = self._construct_server_part(server)
            node_parts.append(srv_part)

        return {
            "nodes": node_parts,
            "kubernetes_services_cidr": self._kit_settings.kubernetes_cidr
        }

    def generate(self) -> Dict:
        self._set_device_facts_ip_map()
        return self._construct_kit_payload()


class CatalogPayloadGenerator:

    def __init__(self,
                 controller_ip: str,
                 kickstart_settings: KickstartSettings,
                 catalog_settings: CatalogSettings):
        self._controller_ip = controller_ip
        self._url = "https://" + controller_ip + "{}"
        self._catalog_settings = catalog_settings
        self._kickstart_settings = kickstart_settings
        self._device_facts_map = {}

    def _request_device_facts(self, node: NodeSettings) -> Dict:
        nodes = None
        ret_val = None
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            nodes = mongo_manager.mongo_node.find()

        if nodes:
            for kit_node in nodes:
                # node_fqdn = "{}.{}".format(node.hostname, node.domain)
                if kit_node["hostname"] == node.hostname:
                    ret_val = kit_node["deviceFacts"]
                    break

        if ret_val is None:
            raise ValueError("Kit form was not found.")

        return ret_val

    def _set_device_facts_ip_map(self) -> None:
        self._device_facts_map = {}
        for node in self._kickstart_settings.servers: # type: NodeSettings
            self._device_facts_map[node.ipaddress] = self._request_device_facts(node)

        for node in self._kickstart_settings.sensors: # type: NodeSettings
            self._device_facts_map[node.ipaddress] = self._request_device_facts(node)

    def _get_deployment_name(self, role:str, node: NodeSettings) -> str:
        if role == 'suricata':
            suricata_settings = self._catalog_settings.suricata_settings.get(node.hostname) # type: SuricataSettings
            return suricata_settings.deployment_name
        elif role == 'arkime-viewer':
            return self._catalog_settings.arkime_viewer_settings.deployment_name
        elif role == 'arkime':
            arkime_capture_settings = self._catalog_settings.arkime_capture_settings.get(node.hostname) # type: ArkimeCaptureSettings
            return arkime_capture_settings.deployment_name
        elif role == 'zeek':
            zeek_settings = self._catalog_settings.zeek_settings.get(node.hostname) # type: ZeekSettings
            return zeek_settings.deployment_name
        elif role == 'logstash':
            return self._catalog_settings.logstash_settings.deployment_name
        elif role == 'wikijs':
            return self._catalog_settings.wikijs_settings.deployment_name # type: WikijsSettings
        elif role == 'misp':
            return self._catalog_settings.misp_settings.deployment_name
        elif role == 'hive':
            return self._catalog_settings.hive_settings.deployment_name
        elif role == 'cortex':
            return self._catalog_settings.cortex_settings.deployment_name
        elif role == 'rocketchat':
            return self._catalog_settings.rocketchat_settings.deployment_name
        elif role == 'mattermost':
            return self._catalog_settings.mattermost_settings.deployment_name
        elif role == 'nifi':
            return self._catalog_settings.nifi_settings.deployment_name
        elif role == 'redmine':
            return self._catalog_settings.redmine_settings.deployment_name
        elif role == 'netflow-filebeat':
            return self._catalog_settings.netflow_filebeat_settings.deployment_name

    def _get_catalog_dict(self, role: str, node: NodeSettings) -> Dict:
        if role == 'suricata':
            return self._catalog_settings.suricata_settings.get(node.hostname).to_dict()
        elif role == 'arkime-viewer':
            return self._catalog_settings.arkime_viewer_settings.to_dict()
        elif role == 'arkime':
            return self._catalog_settings.arkime_capture_settings.get(node.hostname).to_dict()
        elif role == 'zeek':
            return self._catalog_settings.zeek_settings.get(node.hostname).to_dict()
        elif role == 'logstash':
            return self._catalog_settings.logstash_settings.to_dict()
        elif role == 'wikijs':
            return self._catalog_settings.wikijs_settings.to_dict()
        elif role == 'misp':
            return self._catalog_settings.misp_settings.to_dict()
        elif role == 'hive':
            return self._catalog_settings.hive_settings.to_dict()
        elif role == 'cortex':
            return self._catalog_settings.cortex_settings.to_dict()
        elif role == 'rocketchat':
            return self._catalog_settings.rocketchat_settings.to_dict()
        elif role == 'mattermost':
            return self._catalog_settings.mattermost_settings.to_dict()
        elif role == 'nifi':
            return self._catalog_settings.nifi_settings.to_dict()
        elif role == 'redmine':
            return self._catalog_settings.redmine_settings.to_dict()
        elif role == 'netflow-filebeat':
            return self._catalog_settings.netflow_filebeat_settings.to_dict()

    def _construct_selected_node_part(self, node_affinity: str, role: str) -> List[Dict]:
        all_parts = []
        if node_affinity == 'Server - Any':
            for server in self._kickstart_settings.servers: # type: NodeSettings
                is_master = server.node_type == NodeSettings.valid_node_types[0]
                if is_master:
                    srv_part = self._device_facts_map[server.ipaddress]
                    deployment_name = self._get_deployment_name(role, server)
                    device_facts = { "deviceFacts": srv_part,
                                    "hostname" : "server",
                                    "node_type" : "Server",
                                    "deployment_name": deployment_name,
                                    "ip_address": server.ipaddress}
                    all_parts.append(device_facts)
        if node_affinity == 'Sensor':
            for sensor in self._kickstart_settings.sensors: # type: NodeSettings
                ses_part = self._device_facts_map[sensor.ipaddress]
                deployment_name = self._get_deployment_name(role, sensor)
                device_facts = { "deviceFacts": ses_part,
                                "hostname" : sensor.hostname,
                                "node_type" : node_affinity,
                                "deployment_name": deployment_name,
                                "ip_address": sensor.ipaddress,
                                "is_remote": False}
                all_parts.append(device_facts)

        return all_parts

    def _construct_config_part(self, node_affinity: str, role: str) -> List[Dict]:
        node_parts = []
        if node_affinity == 'Server - Any':
            for server in self._kickstart_settings.servers:
                is_master = server.node_type == NodeSettings.valid_node_types[0]
                if is_master:
                    deployment_name = self._get_deployment_name(role, server)
                    thedict = self._get_catalog_dict(role, server)
                    srv_part = { deployment_name : thedict }
                    node_parts.append(srv_part)

        if node_affinity == 'Sensor':
            for sensor in self._kickstart_settings.sensors:
                deployment_name = self._get_deployment_name(role, sensor)
                thedict = self._get_catalog_dict(role, sensor)
                ses_part = { deployment_name : thedict }
                node_parts.append(ses_part)
        return node_parts

    def _construct_catalog_part(self, role: str, process: str, node_affinity: str) -> Dict:
        payload = {
            "role": role,
            "process": {
                "selectedProcess":  process,
                "selectedNodes": self._construct_selected_node_part(node_affinity, role),
            },
            "configs": self._construct_config_part(node_affinity, role)
        }
        print_json(payload)
        ret_val = post_request(self._url.format("/api/catalog/generate_values"), payload)
        values_payload = {
            "role": role,
            "process": {
                "selectedProcess":  process,
                "selectedNodes": self._construct_selected_node_part(node_affinity, role),
                "node_affinity": node_affinity
            },
            "values": ret_val
        }
        print_json(values_payload)
        return values_payload

    def generate(self, role: str, process: str, node_affinity: str) -> Dict:
        self._set_device_facts_ip_map()
        return self._construct_catalog_part(role, process, node_affinity)

class APITester:

    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kickstart_settings: KickstartSettings,
                 kit_settings: KitSettings=None,
                 catalog_settings: CatalogSettings=None):
        self._controller_ip = ctrl_settings.node.ipaddress
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
        self._url = "https://" + self._controller_ip + "{}"
        self._catlog_install_url = self._url.format("/api/catalog/install")
        self._catlog_reinstall_url = self._url.format("/api/catalog/reinstall")
        self._device_facts_map = {}
        self._kickstart_settings = kickstart_settings
        self._kickstart_payload_generator = KickstartPayloadGenerator(ctrl_settings, kickstart_settings)
        self._kit_payload_generator = KitPayloadGenerator(ctrl_settings, kickstart_settings, kit_settings)
        self._catalog_payload_generator = CatalogPayloadGenerator(self._controller_ip, kickstart_settings, catalog_settings)

    def install_logstash(self) -> None:
        payload = self._catalog_payload_generator.generate("logstash", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_suricata(self) -> None:
        payload = self._catalog_payload_generator.generate("suricata", INSTALL, SENSOR)
        self.install_app(payload)

    def reinstall_suricata(self) -> None:
        payload = self._catalog_payload_generator.generate("suricata", REINSTALL, SENSOR)
        self.install_app(payload)

    def install_arkime_viewer(self):
        payload = self._catalog_payload_generator.generate("arkime-viewer", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_arkime_capture(self):
        payload = self._catalog_payload_generator.generate("arkime", INSTALL, SENSOR)
        self.install_app(payload)

    def install_zeek(self):
        payload = self._catalog_payload_generator.generate("zeek", INSTALL, SENSOR)
        self.install_app(payload)

    def install_wikijs(self) -> None:
        payload = self._catalog_payload_generator.generate("wikijs", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def reinstall_wikijs(self) -> None:
        payload = self._catalog_payload_generator.generate("wikijs", REINSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_misp(self) -> None:
        payload = self._catalog_payload_generator.generate("misp", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_hive(self):
        payload = self._catalog_payload_generator.generate("hive", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_cortex(self):
        payload = self._catalog_payload_generator.generate("cortex", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_rocketchat(self):
        payload = self._catalog_payload_generator.generate("rocketchat", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_mattermost(self):
        payload = self._catalog_payload_generator.generate("mattermost", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_nifi(self):
        payload = self._catalog_payload_generator.generate("nifi", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_redmine(self):
        payload = self._catalog_payload_generator.generate("redmine", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_netflow_filebeat(self):
        payload = self._catalog_payload_generator.generate("netflow-filebeat", INSTALL, SERVER_ANY)
        self.install_app(payload)

    def install_app(self, payload):
        post_request(self._catlog_install_url, payload)
        _clean_up(wait=0)
        deployments = []
        for deployment in payload['values']:
            deployment_name = list(deployment.keys())[0]
            deployments.append(deployment_name)
        wait_for_deployments_to_ready(deployments, self._kickstart_settings.get_master_kubernetes_server(), 10)
        wait_for_jobs_to_complete(deployments, self._kickstart_settings.get_master_kubernetes_server(), 10)

    # @retry()
    def run_kit_api_call(self) -> None:
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_kit.drop()

        payload = self._kit_payload_generator.generate()
        print("Kit config payload")
        pprint(payload)
        response_dict = post_request(self._url.format("/api/kit"), payload)
        wait_for_job_to_finish("Kit", self._url.format("/api/job/" + response_dict['job_id']), 60)
        _clean_up(wait=0)

    def run_kickstart_api_call(self) -> None:
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_kickstart.drop()

        payload = self._kickstart_payload_generator.generate()
        print("Kickstart payload")
        pprint(payload)
        response_dict = post_request(self._url.format("/api/kickstart"), payload)
        wait_for_job_to_finish("Kickstart", self._url.format("/api/job/" + response_dict['job_id']), 30)
        _clean_up(wait=0)

    def _get_sensor_hostinfo(self) -> dict:
        sensors = get_request(self._url.format("/api/get_sensor_hostinfo"))
        return sensors

    def _sync_rules(self) -> None:
        get_request(self._url.format("/api/rulesets/sync"))

    def _get_suricata_rule_id(self) -> str:
        rule_sets = get_request(self._url.format("/api/ruleset"))
        for rule in rule_sets:
            if rule["appType"] == "Suricata":
                return rule['_id']

    def update_ruleset(self) -> None:
        sensors = self._get_sensor_hostinfo()
        suricata_rule_id = self._get_suricata_rule_id()
        payload = {
                    "_id": int(suricata_rule_id),
                    "appType": "Suricata",
                    "name":"Emerging Threats",
                    "clearance":"Unclassified",
                    "isEnabled":True
                  }
        payload['sensors'] = sensors
        print(payload)
        update_rules = put_request(self._url.format("/api/ruleset"), payload)
        self._sync_rules()

class MIPAPITester(APITester):

    def __init__(self, ctrl_settings: ControllerSetupSettings, mip_kickstart: MIPKickstartSettings, mip_config: MIPConfigSettings=None):
        super().__init__(ctrl_settings, None, None, None)
        self._kickstart_payload_generator = MIPKickstartPayloadGenerator(ctrl_settings, mip_kickstart)
        self._mip_config_payload_generator = MIPConfigPayloadGenerator(ctrl_settings, mip_kickstart, mip_config)

    def run_mip_kickstart_api_call(self) -> None:
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_kickstart.drop()

        payload = self._kickstart_payload_generator.generate()
        response_dict = post_request(self._url.format("/api/kickstart/mip"), payload)
        wait_for_job_to_finish("MIP Kickstart", self._url.format("/api/job/" + response_dict['job_id']), 30)
        _clean_up(wait=0)

    def run_mip_config_api_call(self) -> None:
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_mip_config.drop()

        payload = self._mip_config_payload_generator.generate()
        response_dict = post_request(self._url.format("/api/execute_mip_config_inventory"), payload)
        wait_for_job_to_finish("MIP Kit", self._url.format("/api/job/" + response_dict['job_id']), 180)
        _clean_up(wait=0)
