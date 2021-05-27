import requests
import random
import time
import urllib3
import sys
from util.connection_mngs import FabricConnectionWrapper
from util.api_tester import APITesterV2
from models.verodin import VerodinSettings
from models.ctrl_setup import HwControllerSetupSettings
from models.node import HardwareNodeSettingsV2
from models.kit import KitSettingsV2
from typing import List


class VerodinJob:

    def __init__(self,
                 verodin_settings:VerodinSettings,
                 ctrl_settings:HwControllerSetupSettings,
                 nodes: List[HardwareNodeSettingsV2],
                 kit_settings: KitSettingsV2):
        self.ctrl_settings = ctrl_settings
        self.nodes = nodes
        self.kit_settings = kit_settings
        self.verodin_settings = verodin_settings
        self.verodin_password = verodin_settings.verodin_password
        self.verodin_ip = verodin_settings.verodin_ipaddress
        self.verodin_username = verodin_settings.verodin_username
        self.sequence_name = verodin_settings.sequence_name
        self.num_of_actions = int(verodin_settings.num_of_actions)
        self.action_sample = verodin_settings.action_sample
        self.session = self._connection(self.verodin_username, self.verodin_password)
        self.elastic_secret, self.elastic_ip = self._get_es_info()
        self.sim_type = self._get_sim_type()
        self.api_tester = APITesterV2(self.ctrl_settings, self.kit_settings, nodes=self.nodes)

    def _connection(self, username:str, password:str) -> object:
        with requests.Session() as session:
            session.auth = (username, password)
            session.timeout = 60
        return session

    def _get_es_info(self) -> tuple:
        with FabricConnectionWrapper(self.ctrl_settings.node.username,
                                     self.ctrl_settings.node.password,
                                     self.ctrl_settings.node.ipaddress) as client:
            es_secret = client.run("kubectl get secret tfplenum-es-elastic-user -o jsonpath='{.data.elastic}' | base64 -d", hide=True).stdout.strip()
            elastic_ip = client.run("kubectl get services | grep elasticsearch | grep -i LoadBalancer | awk '{print $4}'", hide=True).stdout.strip()

        return es_secret, elastic_ip

    def _get_sim_type(self) -> str:
        if self.action_sample:
            sim_type = "eval"
            return sim_type
        else:
            sim_type = "sequence"
            return sim_type

    def _get_eval_id(self) -> str:
        evaluation = self.session.get(f"https://{self.verodin_ip}/simulations.json?sim_type=eval", verify=False)
        for evals in evaluation.json():
            if evals['name'].strip() == "Pipeline Evalulation":
                return evals['id']

    def _get_sequence_info(self) -> dict:
        sequences = self.session.get(f"https://{self.verodin_ip}/simulations.json?sim_type=sequence", verify=False)
        sequence_info = {}

        for sequence in sequences.json():
            if sequence['name'] == self.sequence_name.strip():
                sequence_info['id'] = sequence['id']
                sequence_info['num_of_groups'] = int(len(sequence['group_names']))

        return sequence_info

    def _get_integration_id(self) -> str:
        integrations = self.session.get(f"https://{self.verodin_ip}/integrations.json", verify=False)
        for integration in integrations.json():
            if integration['host'] == self.elastic_ip:
                return integration['id']

    def _get_action_id(self, num_of_actions:int) -> list:
        action_ids = []
        exclude = ['Host CLI','Protected Theater','Phishing Email']
        actions = self.session.get(f"https://{self.verodin_ip}/manage_sims/actions.json", verify=False)

        for action_id in actions.json():
            if action_id['name'].split("-")[0].strip() not in exclude and "DNS Query" not in action_id['name']:
                action_ids.append(action_id['id'])

        sample = random.sample(action_ids, num_of_actions)
        time.sleep(5)
        return sample

    def _delete_eval(self,eval_id):
        self.session.delete(f"https://{self.verodin_ip}/simulations/{eval_id}.json")

    def _delete_integration(self, integration_id:str):
        if integration_id != None:
            self.session.delete(f"https://{self.verodin_ip}/integrations/{integration_id}.json")

    def _create_eval(self, ids_list) -> dict:
        data = {
                    "simulation": {
                    "sim_type":"eval",
                    "name": "Pipeline Evalulation",
                    "desc": "Evaluation created for pipeline",
                    "steps": {
                        "0": ids_list
                        },
                        "step_names": [
                            "Group 1"
                        ]
                    }
                }

        eval_info = self.session.post(f"https://{self.verodin_ip}/simulations.json",
                                      json=data, verify=False)
        time.sleep(5)
        return eval_info.json()

    def _create_elastic_intergration(self):
        field_map = {
                    "filebeat*": dict(src_ip='["_source","source","address"]',
                                    dest_ip='["_source","destination","address"]',
                                    src_port='["_source","source","port"]',
                                    dest_port='["_source","destination","port"]',
                                    start_time='["_source", "@timestamp"]',
                                    url='["_source","url","path"]',
                                    email_sender='["_source","sender"]',
                                    email_recipient='["_source","recipient"]',
                                    email_subject='["_source","subject"]',
                                    user='["_source","user"]',
                                    uid='["_id"]',
                                    sid='["_source","suricata","eve","alert","signature_id"]',
                                    description='["_source","suricata","eve","alert","signature"]',
                                    host='["_source","host","name"]'),
                    "__default__": dict(src_ip='["_source", "src_ip"]',
                                    dest_ip='["_source", "dst_ip"]',
                                    src_port='["_source", "source_port"]',
                                    dest_port='["_source", "destination_port"]',
                                    start_time='["_source", "@timestamp"]',
                                    url='[]',
                                    email_sender='[]',
                                    email_recipient='[]',
                                    email_subject='[]',
                                    user='[]',
                                    uid='["_id"]',
                                    sid='["_source", "alert"]',
                                    description='["_source", "message"]',
                                    host='["_source", "host"]')
        }
        payload = {
                    "elastic_search_server": {
                    "discovery_enabled": True,
                    "host": f"{self.elastic_ip}",
                    "password": f"{self.elastic_secret}",
                    "port": 9200,
                    "protocol": "https",
                    "disabled": False,
                    "time_adjustment": 0,
                    "query_min_back": 15,
                    "query_timeout": 180,
                    "delay_time": 0,
                    "query": "{\"query\":{\"query_string\":{\"query\":\"(source.address:(%ACTOR_IPS%) OR destination.address:(%ACTOR_IPS%)) AND @timestamp:[%START_TIME% TO %END_TIME%]\"}}}",
                    "query_frequency": 30,
                    "dns_action_query": "{\"query\":{\"query_string\":{\"query\":\"domain:(%DOMAINS%) AND @timestamp:[%START_TIME% TO %END_TIME%]\"}}}",
                    "dns_action_query_enabled": False,
                    "email_action_query": "{\"query\":{\"query_string\":{\"query\":\"(sender:(%SENDERS%) OR recipient:(%RECIPIENTS%) AND @timestamp:[%START_TIME% TO %END_TIME%]\"}}}",
                    "email_action_query_enabled": False,
                    "username": "elastic",
                    'field_map': field_map
                        }
                    }
        self.session.post(f"https://{self.verodin_ip}/integrations.json?integration_type=ElasticSearchServer", json=payload, verify=False)
        time.sleep(5)

    def _build_evalulation(self) -> dict:
        eval_info = {}
        action_ids_sample = self._get_action_id(self.num_of_actions)
        evaluation = self._create_eval(action_ids_sample)
        eval_info['id'] = evaluation['id']
        eval_info['num_of_groups'] = 1

        return eval_info

    def _run_simulation(self) -> str:
        data = self._node_payload()
        run_simulation = self.session.post(f"https://{self.verodin_ip}/jobs/run_now.json",
                                            data=data,
                                            verify=False)
        time.sleep(5)
        return run_simulation.json()['job_actions'][0]['job_id']

    def _node_payload(self) -> dict:
        if self.sim_type == "sequence":
            sim_info = self._get_sequence_info()
        else:
            sim_info = self._build_evalulation()

        data = {
                "sim_id": f"{sim_info['id']}",
                "schedule_run_now_selector": "run_now",
               }

        for num in range(1, sim_info['num_of_groups'] + 1):
            actor_ids = ["83","86"]
            random.shuffle(actor_ids)
            data[f'attack_node_id_{num}'] = f"{actor_ids.pop()}"
            data[f'target_node_id_{num}'] = f"{actor_ids.pop()}"

        return data

    def _simulation_status(self, job_id:str):
        while True:
            job_status = self.session.get(f"https://{self.verodin_ip}/jobs/{job_id}.json", verify=False)
            simulation_status = job_status.json()['status']
            print(simulation_status)
            if simulation_status == "completed" or simulation_status == "cancelled":
                print(simulation_status)
                print(f"Proceed to {self.verodin_ip} to review job: {job_id}")
                sys.exit(0)
                break
            elif simulation_status == "errored":
                print(simulation_status)
                sys.exit(1)
                break
            else:
                print(simulation_status)

    def run_job(self):
        #Disables errors for self signed SSL certs
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        if self.sim_type == "eval":
            eval_id = self._get_eval_id()
            self._delete_eval(eval_id)

        self.api_tester.update_ruleset()
        # Returns old integration id for kit
        integration_id = self._get_integration_id()
        # Deletes old kit integration for elastic if it exists
        self._delete_integration(integration_id)
        # Creates new elastic integration within verodin
        self._create_elastic_intergration()
        execute = self._run_simulation()
        self._simulation_status(execute)
