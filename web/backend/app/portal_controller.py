"""
Main module that controls the REST calls for the portal page.
"""
import json

from app import (app, conn_mng, logger)
from app.common import OK_RESPONSE, ERROR_RESPONSE, cursor_to_json_response
from fabric.runners import Result
from flask import jsonify, Response
from shared.connection_mngs import FabricConnectionWrapper, KubernetesWrapper2, get_elastic_password
from shared.constants import PORTAL_ID
from typing import List
from flask import send_file, Response, request, jsonify
from bson import ObjectId
from app.middleware import Auth, operator_required

DISCLUDES = ("elasticsearch",
        "elasticsearch-headless",
        "mysql",
        "logstash",
        "chartmuseum",
        "elasticsearch-data",
        "netflow-filebeat")

HTTPS_STR = 'https://'
HTTP_STR = 'http://'

def get_app_credentials(app: str, user_key: str, pass_key: str):
    username = ""
    password = ""
    collection = conn_mng.mongo_catalog_saved_values
    application = collection.find_one({'application': app})
    if pass_key in application['values']:
        password = application['values'][pass_key]
    if user_key in application['values']:
        username = application['values'][user_key]
    if username == "" and password == "":
        return ""
    return "{}/{}".format(username, password)

def _append_portal_link(portal_links: List, dns: str, ip: str = None):
    short_dns = dns.split('.')[0]
    if short_dns == "grr-frontend":
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': 'admin/password'})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': 'admin/password'})
    elif short_dns == "moloch":
        logins = get_app_credentials('moloch-viewer','username','password')
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif short_dns == "kubernetes-dashboard":
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': ''})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': ''})
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
        password = get_elastic_password(conn_mng)
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
        short_dns = dns.split('.')[0]
        if short_dns == item:
            return True
    return False

@app.route('/api/get_portal_links', methods=['GET'])
def get_portal_links() -> Response:
    """
    Gets the portal links that were generated by the a fabric cron job.

    :return:
    """
    try:
        portal_links = []
        with open('/etc/dnsmasq_hosts/kube_hosts', 'r') as file:
            lines = file.readlines()
            for line in lines:
                try:
                    ip_addr, dns = line.split(' ')
                    if _is_discluded(dns):
                        continue
                    _append_portal_link(portal_links, dns, ip_addr)
                except ValueError:
                    pass
        return jsonify(portal_links)
    except Exception as e:
        logger.exception(e)
        return jsonify([])

    return ERROR_RESPONSE


@app.route('/api/get_user_links', methods=['GET'])
def get_user_links() -> Response:
    """
    Send all links in mongo_user_links.
    :return: flask.Response containing all link data.
    """
    user_links = conn_mng.mongo_user_links.find({})
    return cursor_to_json_response(user_links, fields = ['name', 'url', 'description'], sort_field = 'name')

@app.route('/api/add_user_link', methods=['POST'])
@operator_required
def add_user_link() -> Response:
    """
    Add a new link to mongo_user_links.
    :return: flask.Response containing all user link data, including the new
    one.
    """
    link_data = request.get_json()
    matches = conn_mng.mongo_user_links.find({'name': link_data['name']}).count()
    matches += conn_mng.mongo_user_links.find({'url': link_data['url']}).count()
    if matches == 0:
        conn_mng.mongo_user_links.insert_one(link_data)
    return get_user_links()


@app.route('/api/remove_user_link/<link_id>', methods=['DELETE'])
@operator_required
def remove_user_link(link_id: str) -> Response:
    """
    Remove a user link from mong_user_links.
    :param link_id: String with the '_id' value of the link to be removed.
    :return: flask.Response containing all user link data, with the specified
    link removed.
    """
    conn_mng.mongo_user_links.delete_one({'_id': ObjectId(link_id)})
    return get_user_links()
