"""
Main module that controls the REST calls for the portal page.
"""
import json

from app import (app, conn_mng, logger)
from app.common import OK_RESPONSE, ERROR_RESPONSE, cursorToJsonResponse
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
        "elasticsearch-data.lan")

def get_moloch_credentials():
    collection = conn_mng.mongo_catalog_saved_values
    application = collection.find_one({'application': 'moloch-viewer'})
    password = application['values']['password']
    username = application['values']['username']
    return "{}/{}".format(username, password)

def _append_portal_link(portal_links: List, dns: str, ip: str = None):
    if dns == "grr-frontend.lan":
        if ip:
            portal_links.append({'ip': 'https://' + ip, 'dns': 'https://' + dns, 'logins': 'admin/password'})
        else:
            portal_links.append({'ip': '', 'dns': 'https://' + dns, 'logins': 'admin/password'})
    elif dns == "moloch.lan":
        credentials = get_moloch_credentials()
        if ip:
            portal_links.append({'ip': 'http://' + ip, 'dns': 'http://' + dns, 'logins': credentials})
        else:
            portal_links.append({'ip': '', 'dns': 'http://' + dns, 'logins': credentials})
    elif dns == "kubernetes-dashboard.lan":
        if ip:
            portal_links.append({'ip': 'https://' + ip, 'dns': 'https://' + dns, 'logins': ''})
        else:
            portal_links.append({'ip': '', 'dns': 'https://' + dns, 'logins': ''})
    elif dns == "hive.lan":
        if ip:
            portal_links.append({'ip': 'http://' + ip, 'dns': 'http://' + dns, 'logins': ''})
        else:
            portal_links.append({'ip': '', 'dns': 'http://' + dns, 'logins': ''})
    elif dns == "cortex.lan":
        if ip:
            portal_links.append({'ip': 'http://' + ip + ":9001", 'dns': 'http://' + dns + ":9001", 'logins': ''})
        else:
            portal_links.append({'ip': '', 'dns': 'http://' + dns, 'logins': ''})
    elif dns == "kibana.lan":
        password = get_elastic_password(conn_mng)
        logins = 'elastic/{}'.format(password)
        if ip:
            portal_links.append({'ip': 'https://' + ip, 'dns': 'https://' + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': 'https://' + dns, 'logins': logins})
    elif dns == "redmine.lan":
        logins = 'admin/admin'
        if ip:
            portal_links.append({'ip': 'http://' + ip, 'dns': 'http://' + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': 'http://' + dns, 'logins': logins})
    elif dns == "misp.lan":
        logins = 'admin@admin.test/admin'
        if ip:
            portal_links.append({'ip': 'http://' + ip, 'dns': 'http://' + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': 'http://' + dns, 'logins': logins})
    elif dns == "wikijs.lan":
        logins = 'admin@dip.local/password!'
        if ip:
            portal_links.append({'ip': 'http://' + ip, 'dns': 'http://' + dns, 'logins': logins})
        else:
            portal_links.append({'ip': '', 'dns': 'http://' + dns, 'logins': logins})
    else:
        if ip:
            portal_links.append({'ip': 'http://' + ip, 'dns': 'http://' + dns, 'logins': ''})
        else:
            portal_links.append({'ip': '', 'dns': 'http://' + dns, 'logins': ''})

def _isDiscluded(dns: str) -> bool:
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
            ret_val = ssh_conn.run('cat /etc/dnsmasq_kube_hosts', hide=True)  # type: Result
            for line in ret_val.stdout.split('\n'):
                try:
                    ip, dns = line.split(' ')
                    if _isDiscluded(dns):
                        continue
                    _append_portal_link(portal_links, dns, ip)
                except ValueError as e:
                    pass
            return jsonify(portal_links)
    except Exception as e:
        return jsonify([])

    return ERROR_RESPONSE


@app.route('/api/get_user_links', methods=['GET'])
def get_user_links() -> Response:
    """
    Send all links in mongo_user_links.
    :return: flask.Response containing all link data.
    """
    user_links = conn_mng.mongo_user_links.find({})
    return cursorToJsonResponse(user_links, fields = ['name', 'url', 'description'], sort_field = 'name')

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
