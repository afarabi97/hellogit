"""
Main module for handling Agent Builder REST calls.
"""

import os
import requests
import urllib3
import sys
import shutil
import tempfile
import copy
import zipfile

from app import (app, logger, conn_mng, CORE_DIR, TEMPLATE_DIR, AGENT_PKGS_DIR)
from app.common import OK_RESPONSE, ERROR_RESPONSE, cursor_to_json_response
from app.service.job_service import run_command2
from app.service.agent_service import (perform_agent_reinstall,
                                       build_agent_if_not_exists)
from app.middleware import Auth, operator_required
from bson import ObjectId
from celery import chain, group, chord
from copy import copy
from flask import send_file, Response, request, jsonify, json
from jinja2 import Environment, select_autoescape, FileSystemLoader
from pathlib import Path
from pymongo import ReturnDocument
from shared.constants import TARGET_STATES, AGENT_UPLOAD_DIR
from shared.connection_mngs import MongoConnectionManager
from shared.utils import encode_password, fix_hostname, sanitize_dictionary
from typing import Dict, List, Union
from werkzeug.utils import secure_filename

from contextlib import ExitStack
from json.decoder import JSONDecodeError

win_install_cnxn = conn_mng.mongo_windows_installer_configs
win_targets_cnxn = conn_mng.mongo_windows_target_lists


JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


@app.route('/api/custom_windows_installer_packages', methods=['GET'])
def get_app_configs():
    configs = []

    filenames = AGENT_PKGS_DIR.glob('*/appconfig.json')
    with ExitStack() as stack:
        files = [stack.enter_context(open(fname)) for fname in filenames]
        for sfile in files:
            try:
                data = json.load(sfile)
                configs.append(data)
            except JSONDecodeError:
                pass

    return jsonify(configs)


@app.route('/api/generate_windows_installer', methods=['POST'])
@operator_required
def build_installer() -> Response:
    """
    Build the Windows installer for Winlogbeat and Sysmon
    :param: winlog_beat_dest_ip   IP or hostname of Logstash server
    :param: winlogbeat_port Port number to access Logstash server
    :return: Self-extracting archive if succesffuly built, ERROR_RESPONSE otherwise
    """
    payload = request.get_json()
    sanitize_dictionary(payload)
    zip_path = build_agent_if_not_exists(payload)
    logger.debug('Sending file: {}'.format(zip_path))
    return send_file(zip_path,
                     mimetype='zip',
                     attachment_filename='agents.zip')


@app.route('/api/endgame_sensor_profiles', methods=['POST'])
@operator_required
def get_sensor_info() -> Response:
    payload = request.get_json()
    sanitize_dictionary(payload)
    endgame_password = payload['endgame_password']
    endgame_server_ip = payload['endgame_server_ip']
    endgame_port = payload['endgame_port']
    endgame_user_name = payload['endgame_user_name']

    urllib3.disable_warnings( urllib3.exceptions.InsecureRequestWarning )
    session = requests.Session()
    session.verify = False

    #Get authorization token from server, i.e., log in.
    address = '{}:{}'.format(endgame_server_ip, endgame_port)
    url = 'https://{}/api/v1/auth/login'.format(address)
    header = { 'Content-Type': 'application/json' }
    resp = session.post(url, json = { 'username': endgame_user_name, 'password': endgame_password },
                        headers = header, verify=False)
    if(resp.ok):
        auth_token = resp.json()['metadata']['token']
    else:
        failure = resp.json()
        if failure:
            resp = jsonify(failure)
        else:
            resp = jsonify({'error': {'message': 'Failed to connect to Endgame server for uknown reason.', 'code': 520}})
        resp.status_code = 500
        return resp

    header["Authorization"] = "JWT {}".format(auth_token)
    session.headers = header

    url = 'https://{}/api/v1/deployment-profiles'.format(address)
    resp = session.get(url, verify=False)
    if(resp.ok):
        return jsonify(resp.json()['data'])
    else:
        return resp


def save_if_unique_json(payload: Dict, field: str, cnxn, return_func) -> Response:
    matches = cnxn.count({field: payload[field]})
    if matches == 0:
        try:
            cnxn.insert_one(payload)
            return return_func()
        except:
            return "", '500 Could not insert document'
    else:
        return "", '500 "{}" name already in use'.format(payload[field])


def replace_record(rqst, field: str, cnxn, return_func) -> Response:
    payload = rqst.get_json()
    matches = cnxn.count({field: payload[field]})
    if matches == 0:
        cnxn.insert_one(payload)
    else:
        cnxn.find_one_and_replace({field: payload[field]}, payload)
    return return_func()


@app.route('/api/get_agent_installer_target_lists', methods=['GET'])
def get_agent_installer_target_lists() -> Response:
    target_lists = win_targets_cnxn.find({})
    return cursor_to_json_response(target_lists, sort_field = 'name')


@app.route('/api/save_agent_installer_target_list', methods=['POST'])
@operator_required
def save_agent_installer_target_list() -> Response:
    return replace_record(
        rqst = request,
        field='name',
        cnxn = win_targets_cnxn,
        return_func = get_agent_installer_target_lists)


@app.route('/api/delete_agent_installer_target_list/<name>', methods=['DELETE'])
@operator_required
def delete_agent_installer_target_list(name: str) -> Response:
    win_targets_cnxn.delete_one({'name': name})
    return get_agent_installer_target_lists()


def _is_host_duplicate(target_config: Dict, host_to_add: Dict) -> bool:
    try:
        for old_host in target_config["targets"]:
            if old_host["hostname"].lower() == host_to_add["hostname"].lower():
                return True
    except KeyError:
        pass

    return False


def _get_unique_hosts_to_add(target_config: Dict, hosts_to_add: Dict) -> List[Dict]:
    to_insert = []
    unique_hostnames = set(hosts_to_add['hostnames'].lower().split('\n'))
    for hostname in unique_hostnames:
        if hostname == "":
            continue

        host_to_add = {}
        host_to_add["hostname"] = hostname
        if target_config:
            if _is_host_duplicate(target_config, host_to_add):
                continue

            host_to_add['state'] = TARGET_STATES.uninstalled.value
            host_to_add['last_state_change'] = ""
            to_insert.append(host_to_add)
    return to_insert


@app.route('/api/add_host/<target_config_id>', methods=['POST'])
@operator_required
def add_host_to_target_config(target_config_id: str) -> Response:
    hosts_to_add = request.get_json()
    if hosts_to_add['hostnames'] and len(hosts_to_add['hostnames']) > 0:
        target_config = win_targets_cnxn.find_one({'_id': ObjectId(target_config_id)})
        to_insert = _get_unique_hosts_to_add(target_config, hosts_to_add)
        ret_val = win_targets_cnxn.find_one_and_update({'_id': ObjectId(target_config_id)},
                                                       {'$push': {'targets': { '$each': to_insert }}},
                                                       return_document=ReturnDocument.AFTER)
        if ret_val:
            ret_val["_id"] = str(ret_val["_id"])
            return jsonify(ret_val)
    return jsonify({"error_message": "Failed to add a hosts to target configuration {}.".format(target_config['name'])})


@app.route('/api/delete_host/<target_config_id>', methods=['POST'])
@operator_required
def delete_host_from_target_config(target_config_id: str) -> Response:
    host_to_delete = request.get_json()
    ret_val = win_targets_cnxn.update_one({'_id': ObjectId(target_config_id)},
                                          {'$pull': {'targets': {'hostname': host_to_delete['hostname']}}})
    if ret_val.modified_count == 1:
        return jsonify({"success_message": "Successfully deleted {} from the target configuration.".format(host_to_delete['hostname'])})
    return jsonify({"error_message": "Failed to delete {} from the target configuration.".format(host_to_delete['hostname'])})


@app.route('/api/save_agent_installer_config', methods=['POST'])
@operator_required
def save_agent_installer_config() -> Response:
    payload = request.get_json()
    sanitize_dictionary(payload)
    payload['endgame_password'] = encode_password(payload['endgame_password'])
    return save_if_unique_json(
        payload=payload,
        field='config_name',
        cnxn=win_install_cnxn,
        return_func=get_agent_installer_configs)


@app.route('/api/delete_agent_installer_config/<config_id>', methods=['DELETE'])
@operator_required
def delete_agent_installer_config(config_id: str) -> Response:
    win_install_cnxn.delete_one({'_id': ObjectId(config_id)})

    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + config_id)
    if agent_dir.exists() and agent_dir.is_dir():
        shutil.rmtree(str(agent_dir))

    return get_agent_installer_configs()


@app.route('/api/get_agent_installer_configs', methods=['GET'])
def get_agent_installer_configs() -> Response:
    saved_configs = win_install_cnxn.find({})
    return cursor_to_json_response(saved_configs, sort_field = 'config_name')


def _authenticate_with_kinit(username: str, password: str, dns_suffix: str):
    dns_suffix = dns_suffix.upper()
    #TODO make sure special characters like ! work.
    cmd = "echo '{password}' | kinit {username}@{dns_suffix}".format(password=password,
                                                                     username=username,
                                                                     dns_suffix=dns_suffix)
    output, ret_val = run_command2(cmd, use_shell=True)
    if ret_val != 0:
        raise ValueError(output)


def _create_kerberos_configuration(target_config: Dict):
    template = JINJA_ENV.get_template('krb5.conf')
    key_controller = fix_hostname(target_config["kerberos"]["domain_name"],
                                  target_config["kerberos"]["key_controller"])

    admin_srv = fix_hostname(target_config["kerberos"]["domain_name"],
                             target_config["kerberos"]["admin_server"])

    myctx = {"dns_suffix": target_config["kerberos"]["domain_name"],
             "key_controller": key_controller,
             "admin_server": admin_srv
    }

    kerberos_template = template.render(template_ctx=myctx)
    with open('/etc/krb5.conf', "w") as kerberos_file:
        kerberos_file.write(kerberos_template)


def _create_and_run_celery_tasks(payload: Dict,
                                 targets: Union[List, str],
                                 do_uninstall_only:bool=False):
    if isinstance(targets, str):
        targets = [targets]

    target_config = payload['target_config']
    if target_config["protocol"] == "kerberos":
        _create_kerberos_configuration(target_config)
        username = payload["windows_domain_creds"]["user_name"]
        password = payload["windows_domain_creds"]["password"]
        dns_suffix = target_config["kerberos"]["domain_name"]
        _authenticate_with_kinit(username, password, dns_suffix)

    if target_config["protocol"] == "ntlm":
        # tasks = []
        # pos = 0
        # count = 0
        # result = []
        # while True:
        #     count += 3
        #     block = targets[pos: count]
        #     pos += 3
        #     if len(block) == 0:
        #         break
        #     tasks.append(perform_agent_reinstall.si(payload, block, do_uninstall_only))
        # chain(*tasks)()
        perform_agent_reinstall.apply_async(args=[payload, targets, do_uninstall_only], kwargs={}, time_limit=600, soft_time_limit=580)
    else:
        for hostname_or_ip in targets:
            perform_agent_reinstall.apply_async(args=[payload, hostname_or_ip, do_uninstall_only], kwargs={}, time_limit=120, soft_time_limit=110)


@app.route('/api/uninstall_agents', methods=['POST'])
@operator_required
def uninstall_agents() -> Response:
    payload = request.get_json()
    sanitize_dictionary(payload)
    target_config = payload['target_config']

    targets = [target['hostname'] for target in target_config.pop('targets')]
    if len(targets) == 0:
        return jsonify({"message": "Failed to initiate uninstall task. No targets were specified for this configuration. Did you forget to add them?"})

    _create_and_run_celery_tasks(payload, targets, do_uninstall_only=True)
    return jsonify({"message": "Initiated uninstall task. Open the notification manager to track its progress."})


@app.route('/api/uninstall_agent', methods=['POST'])
@operator_required
def uninstall_agent() -> Response:
    payload = request.get_json()
    sanitize_dictionary(payload)
    target = payload['target']

    _create_and_run_celery_tasks(payload, target['hostname'], do_uninstall_only=True)
    return jsonify({"message": "Initiated uninstall task on {}. \
                    Open the notification manager to track its progress.".format(target["hostname"])})


@app.route('/api/install_agents', methods=['POST'])
@operator_required
def install_agents() -> Response:
    payload = request.get_json()
    sanitize_dictionary(payload)
    target_config = payload['target_config']
    targets = [target['hostname'] for target in target_config.pop('targets')]
    if len(targets) == 0:
        return jsonify({"message": "Failed to initiated install task. No targets were specified for this configuration. Did you forget to add them?"})

    _create_and_run_celery_tasks(payload, targets)
    return jsonify({"message": "Initiated install task. Open the notification manager to track its progress."})


@app.route('/api/reinstall_agent', methods=['POST'])
@operator_required
def reinstall_agent() -> Response:
    payload = request.get_json()
    sanitize_dictionary(payload)
    target = payload['target']
    hostname = target['hostname']

    _create_and_run_celery_tasks(payload, hostname)
    return jsonify({"message": "Initiated reinstall task on {}. \
                                Open the notification manager to track its progress.".format(hostname)})
