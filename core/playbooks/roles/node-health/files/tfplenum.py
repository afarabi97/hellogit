from base64 import b64decode
from elasticsearch import Elasticsearch
from kubernetes import client, config
import requests
import logging

defaultNamespace = 'default'
secret = 'tfplenum-es-elastic-user'

config.load_kube_config()

logger = logging.getLogger('metrics-logger')

def _getElasticPassword(name=secret, namespace=defaultNamespace):
    v1 = client.CoreV1Api()
    response = v1.read_namespaced_secret(name, namespace)
    password = b64decode(response.data['elastic']).decode('utf-8')
    return password

def _getSuricataDeployment(hostname):
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

class TFPlenum:
    def __init__(self, controller, elasticsearch):
        self._controller = controller
        self._elasticsearch = elasticsearch

    def updateMetrics(self, data):
        resource = "https://{controller}/api/metrics".format(controller=self._controller)

        response = requests.post(resource, json=data, verify=False)

        if response.status_code == 200:
            logger.info(str(response))
        else:
            logger.warning(str(response))

    def getSuricataDeployment(seld, hostname):
        deployment = _getSuricataDeployment(hostname)
        return deployment

    def getElasticsearch(self):
        username = 'elastic'
        password = _getElasticPassword()
        auth = (username, password)
        hosts = [self._elasticsearch]
        elasticsearch = Elasticsearch(hosts, scheme="https", port=9200, http_auth=auth, use_ssl=True, verify_certs=False)
        return elasticsearch

