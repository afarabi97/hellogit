import json
import logging
import requests
import time
from time import sleep
import pymongo
import os
import tempfile
from pymongo.errors import ConnectionFailure

from datetime import datetime, timedelta
from util.connection_mngs import MongoConnectionManager
from typing import Union, List, Dict

from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.kit import KitSettingsV2
from models.node import NodeSettingsV2
from util.kubernetes_util import wait_for_jobs_to_complete, wait_for_deployments_to_ready
from util.connection_mngs import FabricConnectionWrapper
from util.network import retry

from pprint import pprint

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

@retry()
def get_request(url: str) -> Union[List, Dict]:
    headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
    # root_ca = check_web_ca()
    response = requests.get(url, verify=False, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise APIFailure(url + ' FAILED!\n' + str(response.status_code))

@retry()
def post_request(url: str, payload: Dict) -> Union[List, Dict]:
    headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
    # root_ca = check_web_ca()
    response = requests.post(url, json=payload, verify=False, headers=headers)
    if response.status_code == 200 or response.status_code == 202:
        return response.json()
    else:
        raise APIFailure(url + ' FAILED!\n' + str(response.status_code))

@retry()
def put_request(url: str, payload: Dict) -> Union[List, Dict]:
    headers = { 'Authorization': 'Bearer '+os.environ['CONTROLLER_API_KEY'] }
    # root_ca = check_web_ca()
    response = requests.put(url, json=payload, verify=False, headers=headers)
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
        logging.info(response_dict)
        if response_dict["status"] == 'finished':
            return
        elif response_dict["status"] == 'failed':
            logging.error("Job failed horribly.  See /var/log/tfplenum/rq.log for details.")
            exit(2)

@retry()
def get_jobs(mongo_manager: MongoConnectionManager, node_id: str) -> list:
    return list(mongo_manager.mongo_jobs.find({"node_id": node_id}))

@retry()
def get_node_id(mongo_manager: MongoConnectionManager, node_to_check: dict) -> str:
 return mongo_manager.mongo_node.find_one(node_to_check)["_id"]

def wait_for_next_job_in_chain(controller_ip: str, node_to_check: Dict, timeout:int=30):
    job_found = False
    with MongoConnectionManager(controller_ip) as mongo_manager:
        node_id = get_node_id(mongo_manager, node_to_check) # type: str
        while True:
            try:
                jobs_completed = 0
                jobs = get_jobs(mongo_manager, node_id) # type: list
                num_jobs = len(jobs)
                for job in jobs:
                    if job["error"]:
                        logging.error("A job has failed exiting")
                        exit(1)
                    elif job["inprogress"] and job["description"] and job["job_id"]:
                        job_found = True
                        wait_for_job_to_finish(job["description"], "https://{}{}".format(controller_ip, "/api/jobs/" + job["job_id"]), timeout)
                    elif job["complete"]:
                        jobs_completed += 1
                sleep(1)
                if num_jobs == jobs_completed:
                    # If all the jobs for a given node are completed, then we dont care and pass this edge case.
                    job_found = True
                    break
            except ConnectionFailure:
                logging.exception("Job chain is exploding but we dont care keep trying...")
                sleep(1)
                pass


    if not job_found:
        logging.error("The next job in chain was not found. Failing")
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
        api_gen_cmd = '/opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --roles "controller-admin,controller-maintainer,operator" --exp 4'
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

class APITesterV2:

    def __init__(self,
                 ctrl_settings: ControllerSetupSettings,
                 kit_settings: KitSettingsV2,
                 nodes: List[NodeSettingsV2]=None):
        self._kit_settings = kit_settings
        self._ctrl_settings = ctrl_settings
        self._controller_ip = ctrl_settings.node.ipaddress
        self._nodes = nodes
        self._url = "https://" + self._controller_ip + "{}"

        try:
            api_key = get_api_key(ctrl_settings)
        except Exception as e:
            logging.error('SSH to controller failed.  Unable to get API Key.  Exiting.')
            logging.error(e)
            exit(1)
        # try:
        #     root_ca = get_web_ca(ctrl_settings)
        # except Exception as e:
        #     logging.error(e)
        #     logging.error('Falling back to verify=False.')
        self._url = "https://" + self._controller_ip + "{}"

    def run_vmware_api_test(self):
        payload = self._kit_settings.to_vmware_settings_api_payload()
        response = post_request(self._url.format("/api/settings/esxi/test"), payload)
        print(response)

    def run_vmware_api_save(self):
        payload = self._kit_settings.to_vmware_settings_api_payload()
        response = post_request(self._url.format("/api/settings/esxi"), payload)
        print(response)

    def run_kit_api_post(self):
        payload = self._kit_settings.to_kit_settings_api_payload()
        response_dict = post_request(self._url.format("/api/settings/kit"), payload)
        wait_for_job_to_finish("Kit Settings setup", self._url.format("/api/jobs/" + response_dict['job_id']), 60)
        _clean_up(wait=0)

    def run_mip_api_post(self):
        payload = self._kit_settings.to_mip_settings_api_payload()
        post_request(self._url.format("/api/settings/mip"), payload)

    def run_general_settings_api_post(self):
        payload = self._kit_settings.to_general_settings_api_payload()
        response_dict = post_request(self._url.format("/api/settings/general"), payload)
        wait_for_job_to_finish("General Settings setup", self._url.format("/api/jobs/" + response_dict['job_id']), 60)
        _clean_up(wait=0)

    def run_control_plane_post(self):
        response_dict = post_request(self._url.format("/api/kit/control-plane"), None)
        wait_for_job_to_finish("Creating Kickstart Profiles", self._url.format("/api/jobs/" + response_dict['job_id']), 60)
        wait_for_next_job_in_chain(self._controller_ip, {"node_type": "Control-Plane"})
        _clean_up(wait=0)

    def run_add_node_post(self, node: NodeSettingsV2):
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_node.delete_one({"hostname": node.hostname})

        payload = node.to_node_api_payload()
        response_dict = post_request(self._url.format("/api/kit/node"), payload)
        wait_for_job_to_finish("Adding node", self._url.format("/api/jobs/" + response_dict['job_id']), 60)

    def run_add_virtual_node_post(self, node: NodeSettingsV2):
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_node.delete_one({"hostname": node.hostname})

        payload = node.to_node_api_payload()
        print(payload)
        response_dict = post_request(self._url.format("/api/kit/node"), payload)
        wait_for_job_to_finish("Adding virtual node", self._url.format("/api/jobs/" + response_dict['job_id']), 60)

    def run_add_virtual_mip_post(self, node: Union[NodeSettingsV2, HwControllerSetupSettings]):
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_node.delete_one({"hostname": node.hostname})

        payload = node.to_mip_api_payload()
        print(payload)
        response_dict = post_request(self._url.format("/api/kit/mip"), payload)
        wait_for_job_to_finish("Adding virtual mip", self._url.format("/api/jobs/" + response_dict['job_id']), 60)

    def _get_control_plane_node(self) -> NodeSettingsV2:
        for node in self._nodes:
            if node.is_control_plane():
                return node
        raise Exception("Impossible you MUST have a control plane node.")

    def run_kit_deploy(self):
        response_dict = get_request(self._url.format("/api/kit/deploy"))
        wait_for_job_to_finish("Kit Deploy", self._url.format("/api/jobs/" + response_dict['job_id']), 60)

    def _get_sensor_hostinfo(self) -> dict:
        sensors = get_request(self._url.format("/api/policy/sensor/info"))
        return sensors

    def _sync_rules(self) -> None:
        get_request(self._url.format("/api/policy/rulesets/sync"))

    def _get_rule_id(self, app: str) -> str:
        rule_sets = get_request(self._url.format("/api/policy/ruleset"))
        for rule in rule_sets:
            if rule["appType"] == app:
                return rule['_id']

    def update_ruleset(self, app: str) -> None:
        sensors = self._get_sensor_hostinfo()

        if app == "zeek":
            rule_id = self._get_rule_id("Zeek Scripts")
            payload = {
                    "_id": rule_id,
                    "appType": "Zeek Scripts",
                    "name":"Zeek Sample Scripts",
                    "clearance":"Unclassified",
                    "isEnabled":True,
                    "sensors": sensors
                  }
        elif app == "suricata":
            rule_id = self._get_rule_id("Suricata")
            payload = {
                        "_id": rule_id,
                        "appType": "Suricata",
                        "name":"Emerging Threats",
                        "clearance":"Unclassified",
                        "isEnabled":True,
                        "sensors": sensors
                    }

        put_request(self._url.format("/api/policy/ruleset"), payload)
        self._sync_rules()
