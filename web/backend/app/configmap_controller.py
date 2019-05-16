"""
Main module for handling all of the config map REST calls.
"""
import json
import requests
import multiprocessing
from app import app, logger, conn_mng
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.job_manager import shell
from flask import jsonify, Response, request
from kubernetes import client, config
from shared.connection_mngs import KubernetesWrapper, KitFormNotFound


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


@app.route('/api/save_config_map', methods=['POST'])
def save_config_map() -> Response:
    """
    Saves a config map to the Kubernetes cluster.

    :return Response:
    """
    payload = request.get_json()
    metadata = client.V1ObjectMeta(name=payload['metadata']['name'], namespace=payload['metadata']['namespace'])

    body = client.V1ConfigMap(
        api_version="v1",
        kind="ConfigMap",
        data=payload['data'],
        metadata=metadata
    )

    config_map_name = payload['metadata']['name']
    config_map_namespace = payload['metadata']['namespace']

    with KubernetesWrapper(conn_mng) as kube_apiv1:
        api_response = kube_apiv1.replace_namespaced_config_map(config_map_name, config_map_namespace, body)
        return jsonify({'name': config_map_name})

    return ERROR_RESPONSE


@app.route('/api/create_config_map', methods=['POST'])
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
def delete_config_map(namespace: str, name: str) -> Response:
    """
    Delets a config map based on the name and namespace.

    :param namespace: The namespace of the config map belongs to.
    :param name: The name of the config map

    :return Response
    """
    body = client.V1DeleteOptions()
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        kube_apiv1.delete_namespaced_config_map(name, namespace, body)
        return OK_RESPONSE
    
    return ERROR_RESPONSE
