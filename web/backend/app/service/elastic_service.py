import io
import yaml
import traceback
from time import sleep
from typing import Dict
import json
from datetime import datetime, timedelta
from elasticsearch.exceptions import TransportError
from elasticsearch import Elasticsearch
from fabric import Connection
from rq.decorators import job
from kubernetes import client, config, utils
from app import conn_mng, REDIS_CLIENT, logger
from app.service.socket_service import NotificationMessage, NotificationCode
from app.utils.connection_mngs import ElasticsearchManager, FabricConnectionWrapper
from app.service.scale_service import es_cluster_status, check_scale_status, get_elastic_password, get_elastic_fqdn
from app.dao import elastic_deploy

from kubernetes.client.rest import ApiException
from pprint import pprint
import base64
import os

_JOB_NAME = "tools"
ELASTIC_OP_GROUP = "elasticsearch.k8s.elastic.co"
ELASTIC_OP_VERSION = "v1"
ELASTIC_OP_NAMESPACE = "default"
ELASTIC_OP_NAME = "tfplenum"
ELASTIC_OP_PLURAL = "elasticsearches"
KUBE_CONFIG_LOCATION = "/root/.kube/config"

class ConfigNotFound(Exception):
    def __init__(self, *args, **kwargs):
        super().__init__("Config file does not exist: {}".format(KUBE_CONFIG_LOCATION), *args, **kwargs)

class Timeout(Exception):
    pass

def apply_es_deploy(run_check_scale_status: bool=True):
    notification = NotificationMessage(role=_JOB_NAME)
    try:
        deploy_config = elastic_deploy.read()
        deploy_config_yaml = yaml.dump(deploy_config)
        if not config.load_kube_config():
            config.load_kube_config()
        api = client.CustomObjectsApi()
        api.patch_namespaced_custom_object(group=ELASTIC_OP_GROUP,
                    version=ELASTIC_OP_VERSION,
                    plural=ELASTIC_OP_PLURAL,
                    namespace=ELASTIC_OP_NAMESPACE,
                    name=ELASTIC_OP_NAME,
                    body=yaml.load(deploy_config_yaml,Loader=yaml.FullLoader))
        if run_check_scale_status:
            check_scale_status.delay("Elastic")

        return True
    except Exception as e:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
    return False

def string_to_base64(message):
    message_bytes = message.encode('utf-8')
    base64_bytes = base64.b64encode(message_bytes)
    base64_message = base64_bytes.decode('utf-8')
    return base64_message

def get_secret(name, namespace='default'):
    if not os.path.isfile(KUBE_CONFIG_LOCATION):
        raise ConfigNotFound
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    api_instance = client.CoreV1Api()
    api_response = api_instance.read_namespaced_secret(name, namespace)
    return api_response

def patch_secret(name, body, namespace='default'):
    if not os.path.isfile(KUBE_CONFIG_LOCATION):
        raise ConfigNotFound
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    api_instance = client.CoreV1Api()
    api_response = api_instance.patch_namespaced_secret(name, namespace, body)
    return api_response

def create_s3_repository_settings(bucket, endpoint, protocol):
    return {
        "type": "s3",
        "settings": {
            "bucket": bucket,
            "client": "default",
            "endpoint": endpoint,
            "protocol": protocol
        }
    }

def get_elasticsearch_status():
    if not os.path.isfile(KUBE_CONFIG_LOCATION):
        raise ConfigNotFound
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    api_instance = client.CustomObjectsApi()
    api_response = api_instance.get_namespaced_custom_object_status(group=ELASTIC_OP_GROUP,
        version=ELASTIC_OP_VERSION,
        plural=ELASTIC_OP_PLURAL,
        namespace=ELASTIC_OP_NAMESPACE,
        name=ELASTIC_OP_NAME)
    return api_response

def get_number_of_elasticsearch_nodes():
    elasticsearch = get_elasticsearch_status()
    spec = elasticsearch['spec']
    node_sets = spec['nodeSets']

    total = 0
    for node in node_sets:
        count = node['count']
        total += count

    return total

def wait_for_elastic_cluster_ready(minutes=10):
    total_nodes = get_number_of_elasticsearch_nodes()

    if minutes > 0:
        # The operator doesn't work instantaneously.
        sleep(30)

    future_time = datetime.utcnow() + timedelta(minutes=minutes)

    check_cluster_status = True
    while check_cluster_status:
        elasticsearch = get_elasticsearch_status()
        status = elasticsearch['status']
        available_nodes = status['availableNodes']
        health = status['health']
        phase = status['phase']

        if phase == "Ready" and health == "green" and available_nodes == total_nodes:
            check_cluster_status = False
        elif future_time <= datetime.utcnow():
            raise Timeout("The Elastic cluster took longer to start than expected.")
        else:
            sleep(10)

@job('default', connection=REDIS_CLIENT, timeout="30m")
def setup_s3_repository(service_ip: str, repository_settings: Dict):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("Updating the Elastic S3 repository settings.")
    notification.set_status(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()
    try:
        base64_s3_access_key = get_secret("s3-access-key").data["s3.client.default.access_key"]
        base64_s3_secret_key = get_secret("s3-secret-key").data["s3.client.default.secret_key"]

        s3_access_key = repository_settings['access_key']
        s3_secret_key = repository_settings['secret_key']

        secrets_changed = False

        if base64_s3_access_key != string_to_base64(s3_access_key):
            body = {"data":{"s3.client.default.access_key": string_to_base64(s3_access_key)}}
            patch_secret("s3-access-key", body)
            secrets_changed = True

        if base64_s3_secret_key != string_to_base64(s3_secret_key):
            body = {"data":{"s3.client.default.secret_key": string_to_base64(s3_secret_key)}}
            patch_secret("s3-secret-key", body)
            secrets_changed = True

        if secrets_changed:
            wait_for_elastic_cluster_ready()

        elasticsearch_manager = ElasticsearchManager(service_ip, conn_mng)
        body = create_s3_repository_settings(repository_settings['bucket'], repository_settings['endpoint'], repository_settings['protocol'])
        elasticsearch_manager.register_repository(body)

        notification.set_message("Updated Elastic S3 repository settings.")
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
    except Exception as e:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()

def get_elasticsearch_license() -> dict:
    password = get_elastic_password()
    elastic_fqdn, port = get_elastic_fqdn()
    es = Elasticsearch(elastic_fqdn, scheme="https", port=port, http_auth=('elastic', password), use_ssl=True, verify_certs=True, ca_certs=os.environ['REQUESTS_CA_BUNDLE'])
    return es.license.get()

@job('default', connection=REDIS_CLIENT, timeout="30m")
def check_elastic_license(current_license: dict):
    future_time = datetime.utcnow() + timedelta(minutes=10)
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("Checking for Elastic license updates")
    notification.set_status(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()
    try:
        while True:
            sleep(10)
            new_license = get_elasticsearch_license()
            if new_license != current_license:
                lic = new_license['license']
                notification = NotificationMessage(role=_JOB_NAME)
                notification.set_message("Elastic License Updated. Type: {type}, Status: {status}, Expiration: {exp}.".format(type=lic['type'],status=lic['status'],exp=lic['expiry_date']))
                notification.set_status(NotificationCode.COMPLETED.name)
                notification.post_to_websocket_api()
                return True
            elif future_time <= datetime.utcnow():
                notification = NotificationMessage(role=_JOB_NAME)
                notification.set_message("Elastic License hasn't changed for 10 minutes. See Elastic Operator and/or Elasticsearch logs.")
                notification.set_status(NotificationCode.ERROR.name)
                notification.post_to_websocket_api()
                logger.info('Possibly issue applying new Elastic License.')
                logger.info('Original license: ' + current_license)
                logger.info('License Now: ' + new_license)
                return False
        return False
    except Exception as e:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
