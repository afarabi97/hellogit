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

DISCLUDES = ("elasticsearch.lan",
        "elasticsearch-headless.lan",
        "mysql.lan",
        "logstash.lan",
        "chartmuseum.lan",
        "elasticsearch-data.lan",
        "netflow-filebeat.lan")

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
    if dns == "grr-frontend.lan":
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': 'admin/password'})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': 'admin/password'})
    elif dns == "moloch.lan":
        logins = get_app_credentials('moloch-viewer','username','password')
        if ip:
            portal_links.append({'ip': HTTP_STR + ip, 'dns': HTTP_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': logins})
    elif dns == "kubernetes-dashboard.lan":
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': ''})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': ''})
    elif dns == "hive.lan":
        logins = get_app_credentials('hive','superadmin_username','superadmin_password')
        if ip:
            portal_links.append({'ip': HTTP_STR + ip, 'dns': HTTP_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': logins})
    elif dns == "cortex.lan":
        logins = get_app_credentials('cortex','superadmin_username','superadmin_password')
        if ip:
            portal_links.append({'ip': HTTP_STR + ip + ":9001", 'dns': HTTP_STR + dns + ":9001", 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': logins})
    elif dns == "kibana.lan":
        password = get_elastic_password(conn_mng)
        logins = 'elastic/{}'.format(password)
        if ip:
            portal_links.append({'ip': HTTPS_STR + ip, 'dns': HTTPS_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTPS_STR + dns, 'logins': logins})
    elif dns == "redmine.lan":
        logins = 'admin/admin'
        if ip:
            portal_links.append({'ip': HTTP_STR + ip, 'dns': HTTP_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': logins})
    elif dns == "misp.lan":
        logins = get_app_credentials('misp','admin_user','admin_pass')
        if ip:
            portal_links.append({'ip': HTTP_STR + ip, 'dns': HTTP_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': logins})
    elif dns == "wikijs.lan":
        logins = get_app_credentials('wikijs','admin_email','admin_pass')
        if ip:
            portal_links.append({'ip': HTTP_STR + ip, 'dns': HTTP_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': logins})
    elif dns == "mattermost.lan":
        logins = get_app_credentials('mattermost','admin_user','admin_pass')
        if ip:
            portal_links.append({'ip': HTTP_STR + ip, 'dns': HTTP_STR + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': HTTP_STR + dns, 'logins': logins})
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

@app.route('/api/get_portal_links', methods=['GET'])
def get_portal_links() -> Response:
    """
    Gets the portal links that were generated by the a fabric cron job.

    :return:
    """
    try:
        with FabricConnectionWrapper(conn_mng) as ssh_conn:
            portal_links = []
            ret_val = ssh_conn.run('cat /etc/dnsmasq_hosts/kube_hosts', hide=True)  # type: Result
            for line in ret_val.stdout.split('\n'):
                try:
                    ip, dns = line.split(' ')
                    if _is_discluded(dns):
                        continue
                    _append_portal_link(portal_links, dns, ip)
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
def remove_user_link(link_id: str) -> Response:
    """
    Remove a user link from mong_user_links.
    :param link_id: String with the '_id' value of the link to be removed.
    :return: flask.Response containing all user link data, with the specified
    link removed.
    """
    conn_mng.mongo_user_links.delete_one({'_id': ObjectId(link_id)})
    return get_user_links()
