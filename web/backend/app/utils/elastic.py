import os
from base64 import b64decode
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch
from time import sleep
from typing import Dict, Tuple
from app.utils.constants import KUBE_CONFIG_LOCATION, CA_BUNDLE
from app.utils.exceptions import ConfigNotFound
from app.utils.utils import get_domain
from kubernetes import client, config


ELASTIC_OP_GROUP = "elasticsearch.k8s.elastic.co"
ELASTIC_OP_VERSION = "v1"
ELASTIC_OP_NAMESPACE = "default"
ELASTIC_OP_NAME = "tfplenum"
ELASTIC_OP_PLURAL = "elasticsearches"


class Timeout(Exception):
    """Default timeout used for waiting.

    Args:
        Exception (_type_): _description_
    """
    pass


def get_elastic_password(name="tfplenum-es-elastic-user", namespace="default") -> str:
    """Retrieves the elasticsearch password from Kubernetes secrets.

    Args:
        name (str, optional): Name of the secret. Defaults to "tfplenum-es-elastic-user".
        namespace (str, optional): Kubernetes namespace. Defaults to "default".

    Returns:
        str: elasticsearch admin password
    """
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_secret(name, namespace)
    password = b64decode(response.data["elastic"]).decode("utf-8")
    return password


def get_elastic_service_ip(name="elasticsearch", namespace="default") -> Tuple[str, str]:
    """Retrieves elasticsearchs external IP address from the Kubernetes service.

    Args:
        name (str, optional): Name of service. Defaults to "elasticsearch".
        namespace (str, optional): Kubernetes namespace. Defaults to "default".

    Returns:
        Tuple[str, str]: _description_
    """
    ip_address = None
    port = None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    # Try to get the external ip
    ip_address = response.spec.external_i_ps
    if ip_address is None:
        ip_address = response.spec.load_balancer_ip
    if ip_address is None:
        ip_address = response.status.load_balancer.ingress[0].ip

    # Get the port
    port = response.spec.ports[0].port

    return ip_address, port


def get_kibana_fqdn(name="kibana", namespace="default"):
    fqdn = None
    port = None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    fqdn = "{name}.{domain}".format(name=name, domain=get_domain())
    # Get the port
    port = response.spec.ports[0].port

    return fqdn, port


def get_elastic_fqdn(name="elasticsearch", namespace="default"):
    fqdn = None
    port = None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    fqdn = "{name}.{domain}".format(name=name, domain=get_domain())
    # Get the port
    port = response.spec.ports[0].port

    return fqdn, port


def ElasticWrapper(timeout: int = 30) -> Elasticsearch:
    password = get_elastic_password()
    elastic_fqdn, port = get_elastic_fqdn()
    return Elasticsearch(
        elastic_fqdn,
        scheme="https",
        port=port,
        http_auth=("elastic", password),
        use_ssl=True,
        verify_certs=True,
        ca_certs=CA_BUNDLE,
        timeout=timeout,
    )


def get_elasticsearch_status():
    if not os.path.isfile(KUBE_CONFIG_LOCATION):
        raise ConfigNotFound
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    api_instance = client.CustomObjectsApi()
    api_response = api_instance.get_namespaced_custom_object_status(
        group=ELASTIC_OP_GROUP,
        version=ELASTIC_OP_VERSION,
        plural=ELASTIC_OP_PLURAL,
        namespace=ELASTIC_OP_NAMESPACE,
        name=ELASTIC_OP_NAME,
    )
    return api_response


def get_number_of_elasticsearch_nodes():
    elasticsearch = get_elasticsearch_status()
    spec = elasticsearch["spec"]
    node_sets = spec["nodeSets"]

    total = 0
    for node in node_sets:
        count = node["count"]
        total += count

    return total


def wait_for_elastic_cluster_ready(minutes=20):
    """Checks the elasticsearch nodes and ensure each one in kubernetes is in a ready state.
    This function is primarly used when updating the deployment in kuberentes.

    Args:
        minutes (int, optional): Timeout in minutes. Defaults to 10.

    Raises:
        Timeout: Default Timeout exception
    """
    total_nodes = get_number_of_elasticsearch_nodes()

    if minutes > 0:
        # The operator doesn't work instantaneously.
        sleep(30)

    future_time = datetime.utcnow() + timedelta(minutes=minutes)

    check_cluster_status = True
    while check_cluster_status:
        elasticsearch = get_elasticsearch_status()
        status = elasticsearch["status"]
        available_nodes = status["availableNodes"]
        health = status["health"]
        phase = status["phase"]

        if phase == "Ready" and health == "green" and available_nodes == total_nodes:
            check_cluster_status = False
        elif future_time <= datetime.utcnow():
            raise Timeout(
                "The Elastic cluster took longer to start than expected.")
        else:
            sleep(10)
