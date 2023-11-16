import string
import time
from typing import List

import urllib3
from app.common import ERROR_RESPONSE
from app.models.health_dashboard import (HealthDashboardModel,
                                         KibanaLoginInfoModel)
from app.service.health_service import client_session, get_kibana_ipaddress
from app.utils.collections import mongo_kit_tokens, mongo_settings
from app.utils.connection_mngs import KubernetesWrapper
from app.utils.elastic import ElasticWrapper, get_elastic_password
from app.utils.logging import logger
from app.utils.utils import get_domain


def get_health_dashboard_status() -> List[HealthDashboardModel]:
    status = []
    elastic_status = {}
    client = ElasticWrapper()
    response = client.cluster.health()
    elastic_status["elasticsearch_status"] = response["status"]

    kibana_ipaddress = get_kibana_ipaddress()
    elastic_password = get_elastic_password()
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    session = client_session("elastic", elastic_password)
    request = session.get(
        "https://{}/api/status".format(kibana_ipaddress), verify=False
    )
    kibana_status = request.json()["status"]["overall"]["state"]
    elastic_status["kibana_status"] = kibana_status
    status.append(elastic_status)
    return status


def get_remote_health_dashboard_status() -> List[HealthDashboardModel]:
    response = []
    for kit_token in mongo_kit_tokens().find():
        kit_token_id = str(kit_token.pop("_id"))
        kit_token["kit_token_id"] = kit_token_id
        response.append(kit_token)

    dashboard_summary = []
    for data in response:
        if data.get("timestamp", 0) > (time.time() - 30):
            dashboard_status = {}
            dashboard_status["ipaddress"] = data["ipaddress"]
            dashboard_status["token"] = data["token"]
            dashboard_status["kit_token_id"] = data["kit_token_id"]
            dashboard_status["elasticsearch_status"] = data["dashboard_status"][
                0
            ]["elasticsearch_status"]
            dashboard_status["kibana_status"] = data["dashboard_status"][0][
                "kibana_status"
            ]
            dashboard_status["hostname"] = data["hostname"]
            dashboard_summary.append(dashboard_status)
        else:
            dashboard_summary.append(
                {
                    "ipaddress": data["ipaddress"],
                    "elasticsearch_status": None,
                    "token": None,
                    "kit_token_id": None,
                    "kibana_status": None,
                    "hostname": None,
                }
            )
    return dashboard_summary


def get_hostname() -> string:
    response = mongo_settings().find_one(
        {"_id": "general_settings_form"})
    hostname = "controller.{}".format(response["domain"])
    return hostname


def get_kibana_login_info() -> KibanaLoginInfoModel:
    kibana_info = {}
    kit_domain = get_domain()
    elastic_password = get_elastic_password()

    with KubernetesWrapper() as api:
        services = api.list_service_for_all_namespaces()
        for service in services.items:
            name = service.metadata.name
            if name == "kibana":
                svc_ip = service.status.load_balancer.ingress[0].ip
                kibana_info["dns"] = "https://{}.{}".format(
                    name, kit_domain)
                kibana_info["ip_address"] = "https://{}".format(svc_ip)
                kibana_info["username_password"] = "elastic/{}".format(
                    elastic_password
                )
    return kibana_info


def get_remote_kibana_login_info(ipaddress: str) -> KibanaLoginInfoModel:
    response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
    kibana_info = response["kibana_info"]
    return kibana_info
