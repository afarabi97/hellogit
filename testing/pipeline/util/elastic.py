from util.connection_mngs import MongoConnectionManager, KubernetesWrapper
from base64 import b64decode
from typing import Tuple


GENERAL_SETTINGS_ID = "general_settings_form"


def get_domain(ctrl_ip: str) -> str:
    with MongoConnectionManager(ctrl_ip) as mongo_manager:
        mongo_document = mongo_manager.mongo_settings.find_one({"_id": GENERAL_SETTINGS_ID})
        if mongo_document and "domain" in mongo_document:
            return mongo_document["domain"]
    return None


def get_elastic_password(api: KubernetesWrapper, name='tfplenum-es-elastic-user', namespace='default'):
    response = api.core_V1_API.read_namespaced_secret(name, namespace)
    password = b64decode(response.data['elastic']).decode('utf-8')
    return password


def get_elastic_service_ip(api: KubernetesWrapper, name='elasticsearch', namespace='default') -> Tuple[str, int]:
    response = api.core_V1_API.read_namespaced_service(name, namespace)

    # Try to get the external ip
    ip_address = response.spec.external_i_ps
    if ip_address is None:
        ip_address = response.spec.load_balancer_ip
    if ip_address is None:
        ip_address = response.status.load_balancer.ingress[0].ip

    # Get the port
    port = response.spec.ports[0].port
    return ip_address, port
