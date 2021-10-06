from typing import List

from app.utils.connection_mngs import KubernetesWrapper2
from app.utils.db_mngs import conn_mng
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
HTTP_STR = 'http://'

def get_app_credentials(app: str, user_key: str, pass_key: str):
    username = ""
    password = ""
    collection = conn_mng.mongo_catalog_saved_values
    application = collection.find_one({'application': app})
    if application and "values" in application:
        if pass_key in application['values']:
            password = application['values'][pass_key]
        if user_key in application['values']:
            username = application['values'][user_key]
        if username == "" and password == "":
            return ""
        return "{}/{}".format(username, password)
    return "??/??"

def _append_portal_link(portal_links: List, dns: str, ip: str = None):
    short_dns = dns.split('.')[0]
    if short_dns == "arkime":
        logins = get_app_credentials('arkime-viewer','username','password')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "hive":
        logins = get_app_credentials('hive','superadmin_username','superadmin_password')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "cortex":
        logins = get_app_credentials('cortex','superadmin_username','superadmin_password')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "kibana":
        password = get_elastic_password()
        logins = 'elastic/{}'.format(password)
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "redmine":
        logins = 'admin/admin'
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "misp":
        logins = get_app_credentials('misp','admin_user','admin_pass')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "wikijs":
        logins = get_app_credentials('wikijs','admin_email','admin_pass')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "mattermost":
        logins = get_app_credentials('mattermost','admin_user','admin_pass')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "rocketchat":
        logins = get_app_credentials('rocketchat','admin_user','admin_pass')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "nifi":
        logins = ''
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR +  dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    else:
        if ip:
            portal_links.append({'ip': HTTP_STR + ip, 'dns': HTTP_STR + dns, 'logins': ''})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': ''})

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
    portal_links = []
    try:
        kit_domain = get_domain()
        with KubernetesWrapper2(conn_mng) as api:
            kube_api = api.core_V1_API
            services = kube_api.list_service_for_all_namespaces()
            for service in services.items:
                name = service.metadata.name
                if service.status.load_balancer.ingress:
                    svc_ip = service.status.load_balancer.ingress[0].ip
                    if _is_discluded(name):
                        continue
                    _append_portal_link(portal_links, "{}.{}".format(name, kit_domain), svc_ip)
    except Exception as e:
        logger.exception(e)
    return portal_links
