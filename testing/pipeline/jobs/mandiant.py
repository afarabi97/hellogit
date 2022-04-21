import random
import sys
import time
import requests
import urllib3

from typing import List
from models.mandiant import MandiantSettings
from util.connection_mngs import FabricConnectionWrapper

class MandiantJob:

    def __init__(self,
                 mandiant_settings:MandiantSettings):
        self.mandiant_settings = mandiant_settings
        self.mandiant_password = mandiant_settings.mandiant_password
        self.mandiant_ip = mandiant_settings.mandiant_ipaddress
        self.mandiant_username = mandiant_settings.mandiant_username
        self.ctrl_username = mandiant_settings.ctrl_username
        self.ctrl_password = mandiant_settings.ctrl_password
        self.ctrl_ipaddress = mandiant_settings.ctrl_ipaddress
        self.num_of_actions = int(mandiant_settings.num_of_actions)
        self.session = self._connection(self.mandiant_username, self.mandiant_password)
        self.elastic_secret, self.elastic_ip = self._get_es_info()
        self.run_all_actions = mandiant_settings.run_all_actions
        self.run_common_detections = mandiant_settings.run_common_detections


    def _connection(self, username:str, password:str) -> object:
        with requests.Session() as session:
            session.auth = (username, password)
            session.timeout = 60
        return session

    def _get_es_info(self) -> tuple:
        with FabricConnectionWrapper(self.ctrl_username,
                                     self.ctrl_password,
                                     self.ctrl_ipaddress) as client:
            es_secret = client.run("kubectl get secret tfplenum-es-elastic-user -o jsonpath='{.data.elastic}' | base64 -d", hide=True).stdout.strip()
            elastic_ip = client.run("kubectl get services | grep elasticsearch | grep -i LoadBalancer | awk '{print $4}'", hide=True).stdout.strip()

        return es_secret, elastic_ip

    def _get_eval_id(self) -> str:
        evaluation = self.session.get(f"https://{self.mandiant_ip}/simulations.json?sim_type=eval", verify=False)
        for evals in evaluation.json():
            if evals['name'].strip() == "Pipeline Evalulation":
                return evals['id']

    def _get_integration_id(self) -> str:
        integrations = self.session.get(f"https://{self.mandiant_ip}/integrations.json", verify=False)
        for integration in integrations.json():
            if integration['host'] == self.elastic_ip:
                return integration['id']

    def _get_action_ids(self) -> list:
        action_ids = []
        malicious_dns_ids = []
        actions = self.session.get(f"https://{self.mandiant_ip}/manage_sims/actions.json", verify=False)

        for action in actions.json():
            for tree in action['trees']:
                if tree['name'] == "Malicious DNS Query":
                    malicious_dns_ids.append(action['id'])

        for action in actions.json():
            if  action['action_type'] != "captive_ioc_url" \
                and action['action_type'] != "email" \
                and action['action_type'] != "host_cli" \
                and action['id'] not in malicious_dns_ids:

                action_ids.append(action['id'])

        return action_ids

    def _delete_eval(self,eval_id):
        self.session.delete(f"https://{self.mandiant_ip}/simulations/{eval_id}.json")

    def _delete_integration(self, integration_id:str):
        if integration_id != None:
            self.session.delete(f"https://{self.mandiant_ip}/integrations/{integration_id}.json")

    def _get_sample_ids(self, num_of_actions: int) -> list:
        action_ids = self._get_action_ids()
        sample = random.sample(action_ids, num_of_actions)
        time.sleep(5)

        return sample

    def _get_common_detections(self):
        detection_alerts = []
        action_ids = self._get_action_ids()

        for action in action_ids:
            info = self.session.get(f"https://{self.mandiant_ip}/library/actions.json?id={action}", verify=False)
            if len(info.json()["preview_props"]["detection_alerts"]) > 0:
                detection_alerts.append(info.json()["preview_props"]["id"])
        return detection_alerts

    def _get_simulation_info(self, ids_list) -> tuple:
        steps = {}
        groups = []

        if len(ids_list) > 40:
            split_ids = [ids_list[x:x+40] for x in range(0, len(ids_list), 40)]
            for count, ids in enumerate(split_ids):
                steps.update({f"{count}": ids})
                groups.append("Group" + str(count + 1))

            return steps, groups
        else:
            steps = {"0": ids_list}
            groups = ["Group 1"]

            return steps, groups

    def _create_eval(self, ids_list) -> dict:
        steps, groups = self._get_simulation_info(ids_list)

        data = {
                    "simulation": {
                    "sim_type":"eval",
                    "name": "Pipeline Evalulation",
                    "desc": "Evaluation created for pipeline",
                    "steps": steps,
                    "step_names": groups
                    }
                }

        eval_info = self.session.post(f"https://{self.mandiant_ip}/simulations.json",
                                      json=data, verify=False)
        time.sleep(5)
        return eval_info.json()

    def _build_evalulation(self) -> dict:
        print("Building Pipeline Evalulation....")
        eval_info = {}
        if self.run_all_actions:
            action_ids = self._get_action_ids()
        elif self.run_common_detections:
            action_ids = self._get_common_detections()
        else:
            action_ids = self._get_sample_ids(self.num_of_actions)
        evaluation = self._create_eval(action_ids)
        eval_info['id'] = evaluation['id']
        eval_info['num_of_groups'] = len(evaluation["group_names"])

        return eval_info

    def _get_actor_ids(self) -> list:
        actor_ids = []

        actors = self.session.get(f"https://{self.mandiant_ip}/nodes/actor_tables.json", verify=False)
        for actor in actors.json()['network']['data']:
            actor_ids.append(actor['id'])

        return actor_ids

    def _node_payload(self) -> dict:
        sim_info = self._build_evalulation()

        data = {
                "sim_id": f"{sim_info['id']}",
                "schedule_run_now_selector": "run_now",
               }

        for num in range(1, sim_info['num_of_groups'] + 1):
            actor_ids = self._get_actor_ids()
            random.shuffle(actor_ids)
            data[f'attack_node_id_{num}'] = f"{actor_ids.pop()}"
            data[f'target_node_id_{num}'] = f"{actor_ids.pop()}"

        return data

    def _simulation_status(self, job_id:str):
        while True:
            job_status = self.session.get(f"https://{self.mandiant_ip}/jobs/{job_id}.json", verify=False)
            simulation_status = job_status.json()['status']
            print(simulation_status)
            if simulation_status == "completed" or simulation_status == "cancelled":
                print(simulation_status)
                print(f"Proceed to {self.mandiant_ip} to review job: {job_id}")
                sys.exit(0)
            elif simulation_status == "errored":
                print(simulation_status)
                sys.exit(1)
            else:
                print(simulation_status)

    def _create_elastic_intergration(self):
        print("Building Elastic integration....")
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
        self.session.post(f"https://{self.mandiant_ip}/integrations.json?integration_type=ElasticSearchServer", json=payload, verify=False)
        time.sleep(5)

    def _run_simulation(self) -> str:
        data = self._node_payload()
        run_simulation = self.session.post(f"https://{self.mandiant_ip}/jobs/run_now.json",json=data,verify=False)
        time.sleep(5)

        return run_simulation.json()['job_actions'][0]['job_id']


    def run_job(self):
        #Disables errors for self signed SSL certs
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        eval_id = self._get_eval_id()
        self._delete_eval(eval_id)

        # Returns old integration id for kit
        integration_id = self._get_integration_id()
        # Deletes old kit integration for elastic if it exists
        self._delete_integration(integration_id)
        # Creates new elastic integration within mandiant
        self._create_elastic_intergration()
        execute = self._run_simulation()
        self._simulation_status(execute)
