import requests
import psutil

import logging
from logging.handlers import RotatingFileHandler
from logging import Logger

import socket
import configparser

from datetime import datetime, timezone
from pathlib import Path
from elasticsearch import Elasticsearch
import aniso8601

from base64 import b64decode

from kubernetes import client, config
config.load_kube_config()

logger = logging.getLogger('metrics_logger')
LOG_FILENAME = '/var/log/health_metrics.log'

def _setup_logger(log_handle: Logger, max_bytes: int=1000000, backup_count: int=2):
    log_handle.setLevel(logging.INFO)
    handler = RotatingFileHandler(LOG_FILENAME, maxBytes=max_bytes, backupCount=backup_count)
    formatter = logging.Formatter('%(levelname)7s:%(asctime)s:%(filename)20s:%(funcName)20s():%(lineno)5s:%(message)s')
    handler.setFormatter(formatter)
    log_handle.addHandler(handler)

def post_metrics(controller_hostname, documents):
    url = "https://{controller_hostname}/api/metrics".format(controller_hostname=controller_hostname)

    response = requests.post(url, json=documents, verify=False)
    if response.status_code == 200:
        logger.info('Posted metrics.')
    else:
        logger.info('A problem occured while posting metrics.')


class PsutilMetrics():
    def __init__(self, hostname):
        self._hostname = hostname

    def create_psutil_document(self, name, value):
        return {"name": name, "value": value, "type": "psutil", "node": self._hostname}
    
    def get_metrics(self):
        documents = []
        documents.append(self.create_psutil_document("memory", list(psutil.virtual_memory())))
        documents.append(self.create_psutil_document("root_usage", list(psutil.disk_usage('/'))))
        documents.append(self.create_psutil_document("data_usage", list(psutil.disk_usage('/data'))))
        documents.append(self.create_psutil_document("cpu_percent", psutil.cpu_percent()))
        return documents

class ElasticPipeline():
    _MESSAGE = "No events"

    def __init__(self, es, hostname, suricata_deployment):
        self._hostname = hostname
        self._shorthostname = hostname.split('.', 1)[0]
        self._suricata_deployment = suricata_deployment
        self._es = es

    def get_last_elastic_event(self, index, query):
        body = \
        {
            "size": 1,
            "_source": "@timestamp",
            "sort": [{"@timestamp": "desc"}],
            "query": {
                "query_string" : {
                    "query" : query
                }
            }
        }
        try:
            result = self._es.search(index, body)
            elastic_timestamp = result['hits']['hits'][0]['_source']['@timestamp']
            date = aniso8601.parse_datetime(elastic_timestamp)
            return date.strftime('%Y-%m-%d %H:%M:%S %z')
        except IndexError:
            return self._MESSAGE

    def get_last_log_event(self, path, pattern):
        log_files = list(Path(path).glob(pattern))
        if log_files:
            log_files.sort(key=lambda x: x.stat().st_mtime, reverse = True)
            mtime = log_files[0].stat().st_mtime
            date = datetime.fromtimestamp(mtime, tz=timezone.utc)
            return date.strftime('%Y-%m-%d %H:%M:%S %z')
        else:
            return self._MESSAGE

    def create_event_document(self, name, value):
        return {"name": name, "value": value, "type": "elastic", "node": self._hostname}

    def get_events(self):
        documents = []

        last_zeek_elastic_events = self.get_last_elastic_event('logstash-zeek-*', 'sensor_name:{}'.format(self._hostname))
        last_suricata_elastic_events = self.get_last_elastic_event('filebeat-*', 'agent.name:"{}" AND tags:suricata'.format(self._suricata_deployment))
        last_moloch_elastic_events = self.get_last_elastic_event('sessions2*', 'node:{}'.format(self._shorthostname))
        last_zeek_log_event = self.get_last_log_event('/data/zeek', '**/conn*.log')
        last_suricata_log_event = self.get_last_log_event('/data/suricata', 'eve*.json')
        last_pcap_log_event = self.get_last_log_event('/data/pcap', '*.pcap')

        documents.append(self.create_event_document('last_zeek_elastic_events', last_zeek_elastic_events))
        documents.append(self.create_event_document('last_suricata_elastic_events', last_suricata_elastic_events))
        documents.append(self.create_event_document('last_moloch_elastic_events', last_moloch_elastic_events))
        documents.append(self.create_event_document('last_zeek_log_event', last_zeek_log_event))
        documents.append(self.create_event_document('last_suricata_log_event', last_suricata_log_event))
        documents.append(self.create_event_document('last_pcap_log_event', last_pcap_log_event))

        return documents

def get_suricata_deployment(hostname):
    v1 = client.AppsV1Api()
    deployments = v1.list_deployment_for_all_namespaces(watch=False)
    for deployment in deployments.items:
        init_container = deployment.spec.template.spec.init_containers and deployment.spec.template.spec.init_containers[0]
        if init_container:
            name = deployment.spec.template.spec.init_containers[0].name
            if name == "init-suricata":
                deployment_host = deployment.spec.template.spec.affinity.node_affinity.required_during_scheduling_ignored_during_execution.node_selector_terms[0].match_expressions[0].values[0]
                if deployment_host == hostname:
                    return deployment.metadata.name
    return ""

def get_elastic_password(name='tfplenum-es-elastic-user', namespace='default'):
    v1 = client.CoreV1Api()
    response = v1.read_namespaced_secret(name, namespace)
    password = b64decode(response.data['elastic']).decode('utf-8')
    return password

def main():
    mconfig = configparser.ConfigParser()
    mconfig.read('metrics.ini')

    hostname = socket.gethostname()
    controller_hostname = mconfig['DEFAULT']['controller_hostname']
    node_type = mconfig['DEFAULT']['node_type']
    elastic_shortname = mconfig['DEFAULT']['elastic_shortname']
    suricata_deployment = get_suricata_deployment(hostname)

    _setup_logger(logger)
    try:

        metrics = PsutilMetrics(hostname)
        data = metrics.get_metrics()
        post_metrics(controller_hostname, data)

        if node_type == 'sensor':
            password = get_elastic_password()
            es = Elasticsearch([elastic_shortname], scheme="https", port=9200, http_auth=('elastic', password), use_ssl=True, verify_certs=False)
            elastic = ElasticPipeline(es, hostname, suricata_deployment)
            data = elastic.get_events()
            post_metrics(controller_hostname, data)  
      
    except Exception as e:
        logger.exception(e)


if __name__ == "__main__":
    main()
