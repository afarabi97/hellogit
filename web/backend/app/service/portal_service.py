import re
from typing import List

from app.common import cursor_to_json_response
from app.models.common import COMMON_SUCCESS_MESSAGE
from app.models.nodes import Node
from app.models.portal_link import PortalLinkModel
from app.models.portal_link_user import UserPortalLinkModel
from app.utils.collections import mongo_catalog_saved_values, mongo_user_links
from app.utils.connection_mngs import KubernetesWrapper
from app.utils.constants import NODE_TYPES
from app.utils.elastic import get_elastic_password
from app.utils.exceptions import NotFoundError
from app.utils.logging import logger
from app.utils.utils import get_domain
from bson import ObjectId
from flask import Response, request

DISCLUDES = (
    "elasticsearch",
    "elasticsearch-headless",
    "elastic-maps-server",
    "mysql",
    "logstash",
    "chartmuseum",
    "elasticsearch-data",
    "netflow-filebeat",
    "kube-dns-external",
)

HTTPS_STR = "https://"


def get_app_credentials(app: str, user_key: str, pass_key: str):
    username = ""
    password = ""
    application = mongo_catalog_saved_values().find_one({"application": app})
    if application and "values" in application:
        if pass_key in application["values"]:
            password = application["values"][pass_key]
        if user_key in application["values"]:
            username = application["values"][user_key]
        if username == "" and password == "":
            return ""
        return "{}/{}".format(username, password)
    return "??/??"


def _append_portal_link(name: str, kit_domain: str, ip: str = None, type: str = None):
    logins = ""
    if name == "hive":
        logins = get_app_credentials(
            "hive", "superadmin_username", "superadmin_password"
        )
    elif name == "cortex":
        logins = get_app_credentials(
            "cortex", "superadmin_username", "superadmin_password"
        )
    elif name == "kibana":
        password = get_elastic_password()
        logins = "elastic/{}".format(password)
    elif name == "redmine":
        logins = "admin/admin"
    elif name == "wikijs":
        logins = get_app_credentials("wikijs", "admin_email", "admin_pass")
    elif name == "mattermost":
        logins = get_app_credentials("mattermost", "admin_user", "admin_pass")
    elif name == "rocketchat":
        logins = get_app_credentials("rocketchat", "admin_user", "admin_pass")
    elif type == NODE_TYPES.minio.value:
        logins = "assessor/<kit password in system settings>"

    fip = HTTPS_STR + str(ip)
    dns = HTTPS_STR + name + "." + kit_domain
    return {"ip": fip, "dns": dns, "logins": logins}


def _is_discluded(dns: str) -> bool:
    """
    Checks to see if the link should be discluded or included.

    :param dns: The dns name we are checking against the DISCLUDES list.
    :return:
    """
    for item in DISCLUDES:
        if dns == item:
            return True
    return False


def get_portal_links() -> List[PortalLinkModel]:
    kit_domain = get_domain()
    portal_links: List[PortalLinkModel] = []
    try:
        minio = Node.load_minio_from_db()
        if minio:
            hostname, domain = minio.hostname.split(".")
            portal_links.append(_append_portal_link(hostname, domain, minio.ip_address, NODE_TYPES.minio.value))
        with KubernetesWrapper() as api:
            services = api.list_service_for_all_namespaces()
            for service in services.items:
                name = service.metadata.name
                if service.status.load_balancer.ingress:
                    svc_ip = service.status.load_balancer.ingress[0].ip
                    if _is_discluded(name):
                        continue
                    portal_links.append(_append_portal_link(name, kit_domain, svc_ip))
    except Exception as e:
        logger.exception(e)
    return portal_links


def get_user_links() -> List[UserPortalLinkModel]:
    user_links = mongo_user_links().find({})
    return cursor_to_json_response(
        user_links, fields=["name", "url", "description"], sort_field="name"
    )


def post_user_links(user_portal_link: UserPortalLinkModel) -> List[UserPortalLinkModel]:
    user_portal_link = request.get_json()
    if not re.match(r"^(http|https)://", user_portal_link.get("url")):
        return Response(
            "URL must start with http:// or https://",
            status=400,
            mimetype="application/json",
        )
    matches = mongo_user_links().find({"name": user_portal_link["name"]}).count()
    matches += mongo_user_links().find({"url": user_portal_link["url"]}).count()
    if matches == 0:
        mongo_user_links().insert_one(user_portal_link)
    return get_user_links()


def delete_user_links(link_id: str) -> COMMON_SUCCESS_MESSAGE:
    document =mongo_user_links().delete_one({"_id": ObjectId(link_id)})
    if document.deleted_count == 0:
        raise NotFoundError
    else:
        return {"success_message": "Deleted user link."}
