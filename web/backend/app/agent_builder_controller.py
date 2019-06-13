"""
Main module for handling Agent Builder REST calls.
"""

import os
import requests
import urllib3
import sys
import shutil
import tempfile
import json
import copy

from app import (app, logger, conn_mng, CORE_DIR)
from app.common import OK_RESPONSE, ERROR_RESPONSE, cursorToJsonResponse
from app.service.job_service import run_command
from app.service.agent_service import perform_agent_deploy
from bson import ObjectId
from celery import chain, group, chord
from copy import copy
from flask import send_file, Response, request, jsonify
from pathlib import Path
from pymongo import ReturnDocument
from shared.constants import TARGET_STATES, AGENT_UPLOAD_DIR, PLAYBOOK_DIR
from shared.connection_mngs import MongoConnectionManager
from shared.utils import encode_password, decode_password
from typing import Dict, List
from werkzeug.utils import secure_filename


win_install_cnxn = conn_mng.mongo_windows_installer_configs
win_targets_cnxn = conn_mng.mongo_windows_target_lists


def _get_extra_vars_build(payload: Dict, install_path_str: str):
    installer_config = payload['installer_config']
    extra_vars = {
        "winlog_beat_dest_ip": "" if installer_config['winlog_beat_dest_ip'] == None else installer_config['winlog_beat_dest_ip'].strip(),
        "system_arch": "" if installer_config['system_arch'] == None else installer_config['system_arch'].strip(),
        "installer_dir": install_path_str,
        "winlog_beat_dest_port": "" if installer_config['winlog_beat_dest_port'] == None else installer_config['winlog_beat_dest_port'].strip(),
        "install_winlogbeat": installer_config['install_winlogbeat'],
        "install_sysmon": installer_config['install_sysmon'],
        "install_endgame": installer_config['install_endgame'],
        "endgame_server": "" if installer_config['endgame_server_ip'] == None else installer_config['endgame_server_ip'].strip(),
        "endgame_port": "" if installer_config['endgame_port'] == None else installer_config['endgame_port'].strip(),
        "endgame_user": "" if installer_config['endgame_user_name'] == None else installer_config['endgame_user_name'].strip(),
        "endgame_password": decode_password(installer_config['endgame_password']).replace('$', '\\$'),
        "endgame_sensor_id": installer_config['endgame_sensor_id'],
        "targets": []
    }
    return extra_vars


def _build_agent_if_not_exists(agent_dir: Path, payload: Dict):
    if not agent_dir.exists():
        agent_dir.mkdir(parents=True, exist_ok=True)
        extra_vars = _get_extra_vars_build(payload, str(agent_dir))
        command = "ansible-playbook winlogbeat.yml -i inventory.yml -t winlogbeat \
                    --extra-vars '{}'".format(extra_vars)
        logger.debug("Command: {}".format(command))

        stdout = run_command(command, working_dir = str(PLAYBOOK_DIR))
        if stdout:
            logger.debug(stdout)


@app.route('/api/generate_windows_installer', methods=['POST'])
def build_installer() -> Response:
    """
    Build the Windows installer for Winlogbeat and Sysmon
    :param: winlog_beat_dest_ip   IP or hostname of Logstash server
    :param: winlogbeat_port Port number to access Logstash server
    :return: Self-extracting archive if succesffuly built, ERROR_RESPONSE otherwise
    """
    payload = request.get_json()
    installer_config = payload['installer_config']
    folder_name = installer_config['_id']
    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + folder_name)
    _build_agent_if_not_exists(agent_dir, payload)

    agent_path = Path('{}/{}'.format(str(agent_dir), 'monitor_install.exe'))
    logger.debug('Sending file: {}'.format(agent_path))
    ret_value = send_file(str(agent_path), mimetype='application/vnd.microsoft.portable-executable')
    return ret_value


@app.route('/api/endgame_sensor_profiles', methods=['POST'])
def get_sensor_info() -> Response:
    payload = request.get_json()
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
                       headers = header)
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
    resp = session.get(url)
    if(resp.ok):
        return jsonify(resp.json()['data'])
    else:
        return resp


def save_if_unique_json(payload: Dict, field: str, cnxn, return_func) -> Response:
    matches = cnxn.count({field: payload[field]})
    if matches == 0:
        try:
            result = cnxn.insert_one(payload)
            return return_func()
        except:
            return "", '500 Could not insert document'
    else:
        return "", '500 "{}" name already in use'.format(payload[field])


def save_if_unique(rqst, field: str, cnxn, return_func) -> Response:
    payload = rqst.get_json()
    return save_if_unique_json(payload, field, cnxn, return_func)


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
    return cursorToJsonResponse(target_lists, sort_field = 'name')


@app.route('/api/save_agent_installer_target_list', methods=['POST'])
def save_agent_installer_target_list() -> Response:
    return replace_record(
        rqst = request,
        field='name',
        cnxn = win_targets_cnxn,
        return_func = get_agent_installer_target_lists)

@app.route('/api/delete_agent_installer_target_list/<name>', methods=['DELETE'])
def delete_agent_installer_target_list(name: str) -> Response:
    win_targets_cnxn.delete_one({'name': name})
    return get_agent_installer_target_lists()


def _is_host_duplicate(target_config: Dict, host_to_add: Dict) -> bool:
    try:
        for old_host in target_config["targets"]:
            if old_host["hostname"].lower() == host_to_add["hostname"].lower():
                return True
    except KeyError as e:
        pass

    return False


@app.route('/api/add_host/<target_config_id>', methods=['POST'])
def add_host_to_target_config(target_config_id: str) -> Response:
    hosts_to_add = request.get_json()
    if hosts_to_add['hostnames'] and len(hosts_to_add['hostnames']) > 0:
        to_insert = []
        for hostname in hosts_to_add['hostnames'].split('\n'):
            if hostname == "":
                continue

            host_to_add = {}
            host_to_add["hostname"] = hostname
            target_config = win_targets_cnxn.find_one({'_id': ObjectId(target_config_id)})
            if target_config:
                if _is_host_duplicate(target_config, host_to_add):
                    continue

                host_to_add['state'] = TARGET_STATES.uninstalled.value
                host_to_add['last_state_change'] = ""
                to_insert.append(host_to_add)

        ret_val = win_targets_cnxn.find_one_and_update({'_id': ObjectId(target_config_id)},
                                                       {'$push': {'targets': { '$each': to_insert }}},
                                                       return_document=ReturnDocument.AFTER)
        if ret_val:
            ret_val["_id"] = str(ret_val["_id"])
            return jsonify(ret_val)
    return jsonify({"error_message": "Failed to add a hosts to target configuration {}.".format(target_config['name'])})


@app.route('/api/delete_host/<target_config_id>', methods=['POST'])
def delete_host_from_target_config(target_config_id: str) -> Response:
    host_to_delete = request.get_json()
    ret_val = win_targets_cnxn.update_one({'_id': ObjectId(target_config_id)},
                                          {'$pull': {'targets': {'hostname': host_to_delete['hostname']}}})
    if ret_val.modified_count == 1:
        return jsonify({"success_message": "Successfully deleted {} from the target configuration.".format(host_to_delete['hostname'])})
    return jsonify({"error_message": "Failed to delete {} from the target configuration.".format(host_to_delete['hostname'])})


@app.route('/api/save_agent_installer_config', methods=['POST'])
def save_agent_installer_config() -> Response:
    payload = request.get_json()
    payload['endgame_password'] = encode_password(payload['endgame_password'])
    return save_if_unique_json(
        payload=payload,
        field='config_name',
        cnxn=win_install_cnxn,
        return_func=get_agent_installer_configs)


@app.route('/api/delete_agent_installer_config/<config_id>', methods=['DELETE'])
def delete_agent_installer_config(config_id: str) -> Response:
    win_install_cnxn.delete_one({'_id': ObjectId(config_id)})

    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + config_id)
    if agent_dir.exists() and agent_dir.is_dir():
        shutil.rmtree(str(agent_dir))

    return get_agent_installer_configs()


@app.route('/api/get_agent_installer_configs', methods=['GET'])
def get_agent_installer_configs() -> Response:
    saved_configs = win_install_cnxn.find({})
    return cursorToJsonResponse(saved_configs, sort_field = 'config_name')


def quotesForEmpty(s: str, quotes:str = "''") -> str:
    return (quotes if s == '' else s)


def _get_extra_vars_deploy(payload: Dict, install_path_str: str):
    target_config = payload['target_config']
    window_domain_creds = payload['windows_domain_creds']
    extra_vars = {
        "installer_dir": install_path_str,
        "targets": [],
        "windows_username": "" if window_domain_creds['user_name'] == None else window_domain_creds['user_name'].strip(),
        "windows_password": window_domain_creds['password'],
        "domain_name": "" if target_config['domain_name'] == None else target_config['domain_name'].strip(),
        "key_controller": "" if target_config['key_controller'] == None else target_config['key_controller'].strip(),
        "admin_server": "" if target_config['admin_server'] == None else target_config['admin_server'].strip(),
        "windows_dns": "" if target_config['dns_server'] == None else target_config['dns_server'].strip()
    }
    return extra_vars


def _add_deploy_task(hostname: str, action: str, deploy_extra_vars: Dict, target_id: str, tasks: List):
    valid_actions = ['install', 'uninstall']
    if action not in valid_actions:
        raise ValueError("Invalid action passed in.")

    deploy_extra_vars["targets"] = [hostname]
    deploy_extra_vars["docker_tags"] = action
    deploy_command = "ansible-playbook -i windows_inventory.yml windows_remote_install.yml --extra-vars '{}'".format(deploy_extra_vars)
    tasks.append(perform_agent_deploy.si(deploy_command, hostname, target_id, action))


@app.route('/api/uninstall_agents', methods=['POST'])
def uninstall_agents() -> Response:
    tasks = []
    payload = request.get_json()
    action = "uninstall"
    target_config = payload['target_config']

    targets = [target['hostname'] for target in target_config['targets']]
    folder_name = target_config['_id']
    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + folder_name)
    if not agent_dir.exists():
        return ERROR_RESPONSE

    deploy_extra_vars = _get_extra_vars_deploy(payload, str(agent_dir))
    for hostname in targets:
        _add_deploy_task(hostname, action, deploy_extra_vars, target_config['_id'], tasks)

    chain(tasks)()
    return OK_RESPONSE

@app.route('/api/uninstall_agent', methods=['POST'])
def uninstall_agent() -> Response:
    tasks = []
    payload = request.get_json()
    action = "uninstall"
    target_config = payload['target_config']
    target = payload['target']

    folder_name = target_config['_id']
    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + folder_name)
    if not agent_dir.exists():
        return ERROR_RESPONSE

    deploy_extra_vars = _get_extra_vars_deploy(payload, str(agent_dir))
    _add_deploy_task(target['hostname'], action, deploy_extra_vars, target_config['_id'], tasks)
    chain(tasks)()
    return OK_RESPONSE


@app.route('/api/install_agents', methods=['POST'])
def install_agents() -> Response:
    tasks = []
    payload = request.get_json()
    target_config = payload['target_config']

    targets = [target['hostname'] for target in target_config['targets']]
    folder_name = target_config['_id']
    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + folder_name)
    _build_agent_if_not_exists(agent_dir, payload)

    deploy_extra_vars = _get_extra_vars_deploy(payload, str(agent_dir))
    for hostname in targets:
        _add_deploy_task(hostname, "uninstall", deploy_extra_vars, target_config['_id'], tasks)
        _add_deploy_task(hostname, "install", deploy_extra_vars, target_config['_id'], tasks)

    chain(tasks)()
    return OK_RESPONSE


@app.route('/api/reinstall_agent', methods=['POST'])
def reinstall_agent() -> Response:
    tasks = []
    payload = request.get_json()
    target_config = payload['target_config']
    target = payload['target']

    folder_name = target_config['_id']
    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + folder_name)
    _build_agent_if_not_exists(agent_dir, payload)

    deploy_extra_vars = _get_extra_vars_deploy(payload, str(agent_dir))
    hostname = target['hostname']

    _add_deploy_task(hostname, "uninstall", deploy_extra_vars, target_config['_id'], tasks)
    _add_deploy_task(hostname, "install", deploy_extra_vars, target_config['_id'], tasks)

    chain(tasks)()
    return OK_RESPONSE
