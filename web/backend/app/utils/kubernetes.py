import os
from typing import Dict

from app.utils.connection_mngs import KubernetesWrapper
from app.utils.constants import KUBE_CONFIG_LOCATION
from app.utils.exceptions import ConfigNotFound
from app.utils.logging import rq_logger
from kubernetes import client, config
from kubernetes.client.exceptions import ApiException


def _get_pod_name(ip_address: str, component: str) -> str:
    with KubernetesWrapper() as kube_apiv1:
        api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
        for pod in api_response.to_dict()["items"]:
            if ip_address == pod["status"]["host_ip"]:
                try:
                    if component == pod["metadata"]["labels"]["component"]:
                        return pod["metadata"]["name"]
                except KeyError:
                    rq_logger.exception("key error in get pod name")
                    pass

    raise ValueError(f"Failed to find {component} pod name.")


def get_suricata_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "suricata")


def get_zeek_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "zeek")


def get_arkime_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "arkime")


def get_kubernetes_secret(name, namespace="default") -> client.V1Secret:
    if not os.path.isfile(KUBE_CONFIG_LOCATION):
        raise ConfigNotFound
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    api_instance = client.CoreV1Api()
    api_response = api_instance.read_namespaced_secret(name, namespace)
    return api_response


def patch_kubernetes_secret(name, body, namespace="default") -> client.V1Secret:
    if not os.path.isfile(KUBE_CONFIG_LOCATION):
        raise ConfigNotFound
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    api_instance = client.CoreV1Api()
    api_response = api_instance.patch_namespaced_secret(name, namespace, body)
    return api_response


def create_kubernetes_secret(secret_name: str, data: Dict, namespace="default") -> client.V1Secret:
    if not os.path.isfile(KUBE_CONFIG_LOCATION):
        raise ConfigNotFound
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)

    body = client.V1Secret()
    body.api_version = 'v1'
    body.data = data
    body.kind = 'Secret'
    body.metadata = {'name': secret_name}
    api_instance = client.CoreV1Api()
    api_response = api_instance.create_namespaced_secret(namespace, body)
    return api_response


def create_or_patch_kubernetes_secret(secret_name: str, data: Dict, namespace="default") -> client.V1Secret:
    try:
        get_kubernetes_secret(secret_name, namespace)
        return patch_kubernetes_secret(secret_name, {"data": data}, namespace)
    except ApiException as e:
        if e.status == 404:
            return create_kubernetes_secret(secret_name, data, namespace)
    raise Exception("Unhandeled error for create_or_patch_kubernetes_secret()")
