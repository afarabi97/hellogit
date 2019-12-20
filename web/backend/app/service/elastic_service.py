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

_JOB_NAME = "tools"

class KubernetesDeploymentYamlModifier:
    repo_path = "/mnt/elastic_snapshots"
    snapshot_volume_name = "elk-snapshot"

    def __init__(self, elk_deployment: io.BytesIO):
        self._elk_deployment = yaml.safe_load_all(elk_deployment.getvalue()) # type: generator

    def _process_container(self, container: Dict):
        if 'volumeMounts' not in container:
            container['volumeMounts'] = []
        container['volumeMounts'].append({'mountPath': self.repo_path, 'name': self.snapshot_volume_name})

    def _process_pod_template_spec(self, pod_template: Dict):
        if 'volumes' not in pod_template:
            pod_template['volumes'] = []
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

    def modify_configuration(self) -> io.StringIO:
        documents = []
        for elk_obj in self._elk_deployment:
            if 'spec'in elk_obj and 'nodeSets' in elk_obj['spec']:
                for node_set in elk_obj['spec']['nodeSets']:
                    self._process_node_set(node_set)
            documents.append(elk_obj)

        result_file = io.StringIO()
        yaml.dump_all(documents, result_file, default_flow_style=False)
        return result_file


@celery.task
def finish_repository_registration(service_ip: str):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.setStatus(status=NotificationCode.STARTED.name)
    notification.setMessage("Started repository registration routine.")
    notification.post_to_websocket_api()

    try:
        kubernetes_elk_deployment_path = "/opt/tfplenum/elasticsearch/deploy_snapshot.yml"
        original_config = io.BytesIO()
        with FabricConnectionWrapper(conn_mng) as master_shell: # type: Connection
            master_shell.get("/opt/tfplenum/elasticsearch/deploy.yml", original_config)
            modifier = KubernetesDeploymentYamlModifier(original_config)
            modified_config = modifier.modify_configuration()
            master_shell.put(modified_config, kubernetes_elk_deployment_path)
            master_shell.run("kubectl apply -f {}".format(kubernetes_elk_deployment_path))

        future_time = datetime.utcnow() + timedelta(hours=1)
        failure_msg = "Failed to register repository for an unknown reason."
        mng = ElasticsearchManager(service_ip, conn_mng)
        while True:
            if future_time <= datetime.utcnow():
                failure_msg = "Failed to register repository because ELK cluster never came back up after 60 minutes."
                break

            try:
                sleep(5)
                if mng.is_cluster_green() or mng.is_cluster_yellow():
                    ret_val = mng.register_repository()
                break
            except TransportError as e:
                pass

        if ret_val['acknowledged']:
            notification.setStatus(status=NotificationCode.COMPLETED.name)
            notification.setMessage("Completed Elasticsearch repository registration.")
            notification.post_to_websocket_api()
        else:
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setMessage(failure_msg)
            notification.post_to_websocket_api()
    except Exception as e:
        traceback.print_exc()
        notification.setStatus(status=NotificationCode.ERROR.name)
        notification.setMessage(str(e))
        notification.post_to_websocket_api()
