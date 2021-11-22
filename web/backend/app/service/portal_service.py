from typing import List

from app.utils.connection_mngs import KubernetesWrapper
from app.utils.collections import mongo_catalog_saved_values
from app.utils.elastic import get_elastic_password
from app.utils.logging import logger
from app.utils.utils import get_domain

DISCLUDES = ("elasticsearch",
        "elasticsearch-headless",
        "elastic-maps-server",
        "mysql",
        "logstash",
        "chartmuseum",
        "elasticsearch-data",
        "netflow-filebeat",
        "kube-dns-external")

HTTPS_STR = 'https://'

def get_app_credentials(app: str, user_key: str, pass_key: str):
    username = ""
    password = ""
    application = mongo_catalog_saved_values().find_one({'application': app})
    if application and "values" in application:
        if pass_key in application['values']:
            password = application['values'][pass_key]
        if user_key in application['values']:
            username = application['values'][user_key]
        if username == "" and password == "":
            return ""
        return "{}/{}".format(username, password)
    return "??/??"

def _append_portal_link(name: str, kit_domain: str, ip: str = None):
    if name == "arkime":
        logins = get_app_credentials('arkime-viewer','username','password')
    elif name == "hive":
        logins = get_app_credentials('hive','superadmin_username','superadmin_password')
    elif name == "cortex":
        logins = get_app_credentials('cortex','superadmin_username','superadmin_password')
    elif name == "kibana":
        password = get_elastic_password()
        logins = 'elastic/{}'.format(password)
    elif name == "redmine":
        logins = 'admin/admin'
    elif name == "misp":
        logins = get_app_credentials('misp','admin_user','admin_pass')
    elif name == "wikijs":
        logins = get_app_credentials('wikijs','admin_email','admin_pass')
    elif name == "mattermost":
        logins = get_app_credentials('mattermost','admin_user','admin_pass')
    elif name == "rocketchat":
        logins = get_app_credentials('rocketchat','admin_user','admin_pass')
    elif name == "nifi":
        logins = ''
    fip = HTTPS_STR + ip
    dns = HTTPS_STR + name + "." + kit_domain
    return {'ip': fip, 'dns': dns, 'logins': logins}

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

def get_portal_links():
    kit_domain = get_domain()
    portal_links = []
    try:
        with KubernetesWrapper() as api:
            services = api.list_service_for_all_namespaces()
            for service in services.items:
                name = service.metadata.name
                if service.status.load_balancer.ingress:
                    svc_ip = service.status.load_balancer.ingress[0].ip
                    if _is_discluded(name):
                        continue
                    portal_links.append(_append_portal_link(name, kit_domain, svc_ip))
    except Exception:
        pass
    return portal_links
