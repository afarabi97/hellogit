import traceback
from typing import List

from app.models.kubernetes import (AssociatedPodModel, ConfigMapListModel,
                                   ConfigMapSavedModel, ConfigMapSaveModel)
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import REDIS_CLIENT, KubernetesWrapper
from app.utils.utils import get_app_context
from flask import jsonify
from kubernetes import client
from kubernetes.client.models.v1_pod_list import V1PodList
from rq.decorators import job
from app.utils.logging import rq_logger

_JOB_NAME = "tools"

def get_associated_pods(config_map_name: str) -> List[AssociatedPodModel]:
    associated_pods = []
    with KubernetesWrapper() as kube_apiv1:
        api_response = kube_apiv1.list_pod_for_all_namespaces()  # type: V1PodList
        for item in api_response.items:
            for volume in item.spec.volumes:
                if volume.config_map and config_map_name == volume.config_map.name:
                    associated_pods.append({
                        "podName": item.metadata.name,
                        "namespace": item.metadata.namespace,
                    })
    return associated_pods


def get_config_maps() -> List[ConfigMapListModel]:
    with KubernetesWrapper() as kube_apiv1:
        api_response = kube_apiv1.list_config_map_for_all_namespaces()
        return jsonify(api_response.to_dict())


def put_config_map(config_map_save_model: ConfigMapSaveModel) -> ConfigMapSavedModel:
    config_map = config_map_save_model["configMap"]
    associated_pods = config_map_save_model["associatedPods"]
    metadata = client.V1ObjectMeta(
        name=config_map["metadata"]["name"],
        namespace=config_map["metadata"]["namespace"],
    )
    body = client.V1ConfigMap(
        api_version="v1",
        kind="ConfigMap",
        data=config_map["data"],
        metadata=metadata,
    )
    config_map_name = config_map["metadata"]["name"]
    config_map_namespace = config_map["metadata"]["namespace"]

    with KubernetesWrapper() as kube_apiv1:
        kube_apiv1.replace_namespaced_config_map(
            config_map_name, config_map_namespace, body
        )
        _bounce_pods.delay(associated_pods)
        return {"name": config_map_name}


@job("default", connection=REDIS_CLIENT, timeout="30m")
def _bounce_pods(associated_pods: List):
    get_app_context().push()
    notification = NotificationMessage(role=_JOB_NAME)
    for pod in associated_pods:
        notification.set_status(status=NotificationCode.STARTED.name)
        notification.set_message(
            "Started pod bounce for {}.".format(pod["podName"]))
        notification.post_to_websocket_api()
        stdout, ret_code = run_command2(
            "kubectl delete pod {} -n {}".format(
                pod["podName"], pod["namespace"])
        )

        try:
            if ret_code != 0:
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_message(
                    "Failed to bounce pod {} with ret_val: {} and error: {}.".format(
                        pod["podName"], ret_code, stdout
                    )
                )
                notification.post_to_websocket_api()
            else:
                notification.set_status(status=NotificationCode.COMPLETED.name)
                notification.set_message(
                    "Completed pod bounce for {}.".format(pod["podName"])
                )
                notification.post_to_websocket_api()

        except Exception as e:
            traceback.print_exc()
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(str(e))
            notification.post_to_websocket_api()
