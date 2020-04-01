import io
import yaml
import traceback

from app import celery, conn_mng
from app.service.socket_service import NotificationMessage, NotificationCode
from datetime import datetime, timedelta
from elasticsearch.exceptions import TransportError
from fabric import Connection
from shared.connection_mngs import ElasticsearchManager, FabricConnectionWrapper
from time import sleep
from typing import Dict
import json
from app.service.scale_service import es_cluster_status, check_scale_status
from kubernetes import client, config, utils
from app.dao import elastic_deploy

_JOB_NAME = "tools"
ELASTIC_OP_GROUP = "elasticsearch.k8s.elastic.co"
ELASTIC_OP_VERSION = "v1"
ELASTIC_OP_NAMESPACE = "default"
ELASTIC_OP_NAME = "tfplenum"
ELASTIC_OP_PLURAL = "elasticsearches"

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

class KubernetesDeploymentYamlModifier:
    repo_path = "/mnt/elastic_snapshots"
    snapshot_volume_name = "elk-snapshot"

    def __init__(self, elk_deployment: Dict):
        self._elk_deployment = elk_deployment # type: Dict

    def _process_container(self, container: Dict):
        if 'volumeMounts' not in container:
            container['volumeMounts'] = []

        for v in container['volumeMounts']:
            if 'name' in v and v['name'] == self.snapshot_volume_name:
                container['volumeMounts'].remove(v)

        if self.snapshot_volume_name not in container['volumeMounts']:
            container['volumeMounts'].append({'mountPath': self.repo_path, 'name': self.snapshot_volume_name})

    def _process_pod_template_spec(self, pod_template: Dict):
        if 'volumes' not in pod_template:
            pod_template['volumes'] = []

        for p in pod_template['volumes']:
            if 'name' in p and p['name'] == self.snapshot_volume_name:
                pod_template['volumes'].remove(p)

        if self.snapshot_volume_name not in pod_template['volumes']:
            pod_template['volumes'].append({
                                                "hostPath": {
                                                    "path": "/mnt/tfplenum_backup/elastic_snapshots",
                                                    "type": "DirectoryOrCreate"
                                                },
                                                "name": self.snapshot_volume_name
                                        })

    def _process_node_set(self, node_set: Dict):
        if 'config' in node_set:
            node_set['config']['path.repo'] = [self.repo_path]
            if 'podTemplate' in node_set and 'spec' in node_set['podTemplate'] and 'containers' in node_set['podTemplate']['spec']:
                self._process_pod_template_spec(node_set['podTemplate']['spec'])
                for container in node_set['podTemplate']['spec']['containers']:
                    self._process_container(container)

    def modify_configuration(self) -> Dict:
        if 'spec'in self._elk_deployment and 'nodeSets' in self._elk_deployment['spec']:
            for node_set in self._elk_deployment['spec']['nodeSets']:
                self._process_node_set(node_set)
        return self._elk_deployment


@celery.task
def finish_repository_registration(service_ip: str):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_status(status=NotificationCode.STARTED.name)
    notification.set_message("Started repository registration routine.")
    notification.post_to_websocket_api()

    try:
        if es_cluster_status() != "Ready":
            failure_msg = "Cluster status is not ready unable to continue."
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(failure_msg)
            notification.post_to_websocket_api()
            return

        deploy_config = elastic_deploy.read()
        modifier = KubernetesDeploymentYamlModifier(deploy_config)
        modified_config = modifier.modify_configuration()
        elastic_deploy.update(data=modified_config)

        apply_es_deployment = apply_es_deploy(run_check_scale_status=False)

        if apply_es_deployment == False:
            failure_msg = "Error appling changes to es cluster"
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(failure_msg)
            notification.post_to_websocket_api()
            return

        future_time = datetime.utcnow() + timedelta(hours=1)
        failure_msg = "Failed to register repository for an unknown reason."
        mng = ElasticsearchManager(service_ip, conn_mng)
        ret_val = {}
        while True:
            if future_time <= datetime.utcnow():
                failure_msg = "Failed to register repository because ELK cluster never came back up after 60 minutes."
                break

            try:
                sleep(5)
                if es_cluster_status() == "Ready":
                    ret_val = mng.register_repository()
                    break
            except TransportError as e:
                pass

        if ret_val['acknowledged']:
            notification.set_status(status=NotificationCode.COMPLETED.name)
            notification.set_message("Completed Elasticsearch repository registration.")
            notification.post_to_websocket_api()
        else:
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(failure_msg)
            notification.post_to_websocket_api()
    except Exception as e:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
