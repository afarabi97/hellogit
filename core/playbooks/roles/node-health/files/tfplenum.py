from base64 import b64decode
from kubernetes import client, config
import requests
import logging
import os

config.load_kube_config()

logger = logging.getLogger('metrics-logger')
os.environ['REQUESTS_CA_BUNDLE'] = "/etc/pki/tls/certs/ca-bundle.crt"

def _get_elastic_password():
    v1 = client.CoreV1Api()
    response = v1.read_namespaced_secret('tfplenum-es-elastic-user', 'default')
    password = b64decode(response.data['elastic']).decode('utf-8')
    return password

def _get_controller_api_key():
    v1 = client.CoreV1Api()
    response = v1.read_namespaced_secret('metrics-api-key', 'default')
    api_key = b64decode(response.data['api-key']).decode('utf-8')
    return api_key

class TFPlenum:
    def __init__(self, controller):
        self._controller = controller
        self._api_key = _get_controller_api_key()

    def update_metrics(self, data):
        resource = "https://{controller}/api/health/metrics".format(controller=self._controller)
        headers = {"Authorization": f"Bearer {self._api_key}"}
        response = requests.post(resource, json=data, headers=headers)
        if response.status_code == 200:
            logger.info(str(response))
        else:
            logger.warning(str(response))
