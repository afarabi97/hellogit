"""
Main module for handling all of the config map REST calls.
"""
import json
import requests
import multiprocessing
from app import app, logger, conn_mng
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.service.configmap_service import bounce_pods
from flask import jsonify, Response, request
from kubernetes import client, config
from kubernetes.client.models.v1_pod_list import V1PodList
from kubernetes.client.models.v1_pod import V1Pod
from shared.connection_mngs import KubernetesWrapper, KitFormNotFound, objectify
from typing import Dict, List
from app.middleware import Auth, controller_maintainer_required


@app.route('/api/get_associated_pods/<config_map_name>', methods=['GET'])
def get_associated_pods(config_map_name: str) -> List:
    ret_val = []
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        api_response = kube_apiv1.list_pod_for_all_namespaces() # type: V1PodList
        for item in  api_response.items:
            for volume in item.spec.volumes:
                if volume.config_map and config_map_name == volume.config_map.name:
                    ret_val.append({"podName": item.metadata.name, "namespace": item.metadata.namespace})

    return jsonify(ret_val)


@app.route('/api/get_config_maps', methods=['GET'])
def get_config_maps() -> Response:
    """
    Get all the config map data.

    :return: Response object with a json dictionary.
    """
    try:
        with KubernetesWrapper(conn_mng) as kube_apiv1:
            api_response = kube_apiv1.list_config_map_for_all_namespaces()
            return jsonify(api_response.to_dict())
    except KitFormNotFound as e:
        logger.exception(e)
        return jsonify([])

    return ERROR_RESPONSE


def _get_configmap_data(search_dict: Dict, namespace: str, config_name: str, data_name: str):
    for i in search_dict['items']:
        if i['metadata']['namespace'] == namespace and i['metadata']['name'] == config_name:
            return i['data'][data_name]
    return ''


@app.route('/api/get_config_map/<namespace>/<config_name>/<data_name>', methods=['GET'])
def get_config_map(namespace: str, config_name:str, data_name: str) -> Response:
    """
    Get all the config map data.

    :return: Response object with a json dictionary.
    """
    try:
        with KubernetesWrapper(conn_mng) as kube_apiv1:
            api_response = kube_apiv1.list_config_map_for_all_namespaces()
            config_map = _get_configmap_data(api_response.to_dict(), namespace, config_name, data_name)
            return jsonify(config_map)
    except KitFormNotFound as e:
        logger.exception(e)
        return jsonify([])

    return ERROR_RESPONSE


@app.route('/api/save_config_map', methods=['POST'])
@controller_maintainer_required
def save_config_map() -> Response:
    """
    Saves a config map to the Kubernetes cluster.

    :return Response:
    """
    payload = request.get_json()
    config_map = payload["configMap"]
    associated_pods = payload["associatedPods"]
    metadata = client.V1ObjectMeta(name=config_map['metadata']['name'], namespace=config_map['metadata']['namespace'])

    body = client.V1ConfigMap(
        api_version="v1",
        kind="ConfigMap",
        data=config_map['data'],
        metadata=metadata
    )

    config_map_name = config_map['metadata']['name']
    config_map_namespace = config_map['metadata']['namespace']

    with KubernetesWrapper(conn_mng) as kube_apiv1:
        kube_apiv1.replace_namespaced_config_map(config_map_name, config_map_namespace, body)
        bounce_pods.delay(associated_pods)
        return jsonify({'name': config_map_name})

    return ERROR_RESPONSE


@app.route('/api/create_config_map', methods=['POST'])
@controller_maintainer_required
def create_config_map() -> Response:
    """
    Creates a config map

    :return: Returns the newly created configmap or it fails with a server 500 error response.
    """
    payload = request.get_json()
    namespace = payload['metadata']['namespace']
    name = payload['metadata']['name']
    metadata = client.V1ObjectMeta(name=name, namespace=namespace)

    body = client.V1ConfigMap(
        api_version="v1",
        kind="ConfigMap",
        metadata=metadata
    )

    with KubernetesWrapper(conn_mng) as kube_apiv1:
        api_response = kube_apiv1.create_namespaced_config_map(namespace, body)
        return jsonify(api_response.to_dict())

    return ERROR_RESPONSE


@app.route('/api/delete_config_map/<namespace>/<name>', methods=['DELETE'])
@controller_maintainer_required
def delete_config_map(namespace: str, name: str) -> Response:
    """
    Delets a config map based on the name and namespace.

    :param namespace: The namespace of the config map belongs to.
    :param name: The name of the config map

    :return Response
    """
    body = client.V1DeleteOptions()
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        kube_apiv1.delete_namespaced_config_map(name, namespace, body=body)
        return OK_RESPONSE

    return ERROR_RESPONSE
