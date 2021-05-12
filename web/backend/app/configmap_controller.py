"""
Main module for handling all of the config map REST calls.
"""
from typing import Dict, List
from flask import jsonify, Response, request
from flask_restx import Resource, fields
from kubernetes import client
from kubernetes.client.models.v1_pod_list import V1PodList
from app import app, logger, conn_mng, KUBERNETES_NS
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.service.configmap_service import bounce_pods
from app.middleware import controller_maintainer_required
from app.utils.connection_mngs import KubernetesWrapper, KitFormNotFound
from app.models.kubernetes import (ConfigMapViewModel, ConfigMapSave, ConfigMapSaveMetaData, ConfigMapSavePods,
                                   ConfigMapCreateMetaData, ConfigMapCreatePost, ConfigMapCreateDataNested, AssociatedPodModel)


def get_config_maps_tags(repo: str) -> List[str]:
    url = 'http://localhost:5000/v2/{}/tags/list'.format(repo)
    response = request.get(url) # type: Response
    if response.status_code == 200:
        return response.json()["tags"]
    return []


def get_imageid_and_size(repo: str, tag: str) -> [str, float]:
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
        with KubernetesWrapper(conn_mng) as kube_apiv1:
            api_response = kube_apiv1.list_pod_for_all_namespaces() # type: V1PodList
            for item in  api_response.items:
                for volume in item.spec.volumes:
                    if volume.config_map and config_map_name == volume.config_map.name:
                        ret_val.append({"podName": item.metadata.name, "namespace": item.metadata.namespace})

        return ret_val


@KUBERNETES_NS.route('/configmaps')
class GetConfigMapsOnly(Resource):

    @KUBERNETES_NS.doc(description="Get all the config map data.")
    def get(self) -> Response:
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


@KUBERNETES_NS.route('/configmap/data/<namespace>/<config_name>/<data_name>')
class GetConfigMapCtrl(Resource):

    @KUBERNETES_NS.response(200,
                            "The content / value of the Kubernetes configmap or a blank string.",
                            fields.String(example="app: local-volume-provisioner\n2331"))
    @KUBERNETES_NS.response(500, "Error")
    def get(self,
            namespace: str,
            config_name:str,
            data_name: str) -> Response:
        try:
            with KubernetesWrapper(conn_mng) as kube_apiv1:
                api_response = kube_apiv1.list_config_map_for_all_namespaces()
                config_map = _get_configmap_data(api_response.to_dict(), namespace, config_name, data_name)
                return config_map
        except KitFormNotFound as e:
            logger.exception(e)
            return []

        return ERROR_RESPONSE


@KUBERNETES_NS.route("/configmap")
class ConfigMapCtrl(Resource):

    @KUBERNETES_NS.doc(description="Saves a config map to the Kubernetes cluster.")
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

        with KubernetesWrapper(conn_mng) as kube_apiv1:
            kube_apiv1.replace_namespaced_config_map(config_map_name, config_map_namespace, body)
            bounce_pods.delay(associated_pods)
            return jsonify({'name': config_map_name})

        return ERROR_RESPONSE

    @KUBERNETES_NS.doc(description="Creates a config map.")
    @KUBERNETES_NS.expect(ConfigMapCreatePost.DTO)
    @controller_maintainer_required
    def post(self) -> Response:
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


@KUBERNETES_NS.route('/configmap/<namespace>/<name>')
class DeleteConfigMapCtrl(Resource):

    @KUBERNETES_NS.doc(description="Delets a config map based on the name and namespace.")
    @KUBERNETES_NS.response(200, "Success")
    @KUBERNETES_NS.response(500, "Error")
    @controller_maintainer_required
    def delete(self, namespace: str, name: str) -> Response:
        body = client.V1DeleteOptions()
        with KubernetesWrapper(conn_mng) as kube_apiv1:
            kube_apiv1.delete_namespaced_config_map(name, namespace, body=body)
            return OK_RESPONSE

        return ERROR_RESPONSE
