"""
Main module for handling all of the config map REST calls.
"""
from typing import List, Union

from app.middleware import controller_maintainer_required
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.kubernetes import (KUBERNETES_NS, AssociatedPodModel,
                                   ConfigMapSave)
from app.service.configmap_service import bounce_pods
from app.utils.connection_mngs import KitFormNotFound, KubernetesWrapper
from app.utils.logging import logger
from flask import Response, jsonify, request
from flask_restx import Resource, api
from kubernetes import client
from kubernetes.client.models.v1_pod_list import V1PodList


def get_config_maps_tags(repo: str) -> List[str]:
    url = 'http://localhost:5000/v2/{}/tags/list'.format(repo)
    response = request.get(url) # type: Response
    if response.status_code == 200:
        return response.json()["tags"]
    return []


def get_imageid_and_size(repo: str, tag: str) -> Union[str, float]:
    url = 'http://localhost:5000/v2/{repo}/manifests/{tag}'.format(repo=repo, tag=tag)
    headers = {'Accept': 'application/vnd.docker.distribution.manifest.v2+json'}
    response = request.get(url, headers=headers) # type: Response
    if response.status_code == 200:
        manifest = response.json()
        image_id = manifest['config']['digest'][7:19]
        total = manifest['config']['size']
        for layer in manifest['layers']:
            total += layer['size']

        #Covert it back to MB
        total = total / 1000 / 1000
        return image_id, round(total, 2)
    return "", 0.0


@KUBERNETES_NS.route('/associated/pods/<config_map_name>')
class AssociatedPodsCtrl(Resource):

    @KUBERNETES_NS.response(200, 'AssociatedPod', [AssociatedPodModel.DTO])
    def get(self, config_map_name: str) -> List:
        ret_val = []
        with KubernetesWrapper() as kube_apiv1:
            api_response = kube_apiv1.list_pod_for_all_namespaces() # type: V1PodList
            for item in  api_response.items:
                for volume in item.spec.volumes:
                    if volume.config_map and config_map_name == volume.config_map.name:
                        ret_val.append({"podName": item.metadata.name, "namespace": item.metadata.namespace})

        return ret_val


@KUBERNETES_NS.route('/configmaps')
class GetConfigMapsOnly(Resource):

    @KUBERNETES_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KUBERNETES_NS.response(200, 'GetConfigMaps')
    @KUBERNETES_NS.doc(description="Get all the config map data.")
    def get(self) -> Response:
        try:
            with KubernetesWrapper() as kube_apiv1:
                api_response = kube_apiv1.list_config_map_for_all_namespaces()
                return jsonify(api_response.to_dict())
        except KitFormNotFound as exception:
            logger.exception(exception)
            return {"error_message": "KitFormNotFound"}


@KUBERNETES_NS.route("/configmap")
class ConfigMapCtrl(Resource):

    @KUBERNETES_NS.doc(description="Saves a config map to the Kubernetes cluster.")
    @KUBERNETES_NS.response(200, 'SaveConfigMaps')
    @KUBERNETES_NS.expect([ConfigMapSave.DTO])
    @controller_maintainer_required
    def put(self) -> Response:
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

        with KubernetesWrapper() as kube_apiv1:
            kube_apiv1.replace_namespaced_config_map(config_map_name, config_map_namespace, body)
            bounce_pods.delay(associated_pods)
            return {'name': config_map_name}
