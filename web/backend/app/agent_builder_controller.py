"""
Main module for handling Agent Builder REST calls.
"""

import os
import requests
import urllib3
import sys

from app import (app, logger, conn_mng, CORE_DIR)
from app.common import OK_RESPONSE, ERROR_RESPONSE, cursorToJsonResponse
from app.job_manager import shell
from flask import send_file, Response, request, jsonify
from shared.connection_mngs import MongoConnectionManager
from bson import ObjectId
from pprint import PrettyPrinter

@app.route('/api/generate_windows_installer', methods=['POST'])
def build_installer() -> Response:
    """
    Build the Windows installer for Winlogbeat and Sysmon
    :param: pf_sense_ip   IP or hostname of Logstash server
    :param: winlogbeat_port Port number to access Logstash server
    :return: Self-extracting archive if succesffuly built, ERROR_RESPONSE otherwise
    """
    payload = request.get_json()
    pf_sense_ip = payload['pf_sense_ip']
    winlogbeat_port = payload['winlogbeat_port']
    install_winlogbeat = payload['install_winlogbeat']
    install_sysmon = payload['install_sysmon']
    install_endgame = payload['install_endgame']
    endgame_server_ip = payload['endgame_credentials']['server_ip']
    endgame_user_name = payload['endgame_credentials']['user_name']
    endgame_port = payload['endgame_port']
    endgame_password = payload['endgame_credentials']['password']
    endgame_id =  payload['endgame_sensor_id']

    PrettyPrinter().pprint('payload: {}'.format(payload))
    print("Endgame Credentials: {}:{}, {}/{}".format(endgame_server_ip, endgame_port, endgame_user_name, endgame_password))


    installer_dir = str(CORE_DIR / 'playbooks')
    installer_name = 'monitor_install.exe'
    installer_path = '{}/{}'.format(installer_dir, installer_name)

    try:
        os.remove(installer_path)
    except OSError:
        pass

    command = "ansible-playbook winlogbeat.yml -i inventory.yml -t winlogbeat \
	            --extra-vars 'firewall_url={} \
                logstash_fw_port={} \
                install_winlogbeat={} \
                install_sysmon={} \
                install_endgame={} \
                endgame_server={} \
                endgame_port={} \
                endgame_user={} \
                endgame_password={} \
                endgame_sensor_id={}'".format(
                  pf_sense_ip,
                  winlogbeat_port,
                  install_winlogbeat,
                  install_sysmon,
                  install_endgame,
                  endgame_server_ip,
                  endgame_port,
                  endgame_user_name,
                  endgame_password.replace('$', '\\\$'),
                  endgame_id)

    stdout, stderr = shell(command, working_dir = installer_dir)

    if stdout:
        stdout = stdout.decode('utf-8')        
        print(stdout)
    if stderr:
        stderr = stderr.decode('utf-8')   
        print(stderr)

    if os.path.exists(installer_path):
        return send_file(installer_path, mimetype='application/vnd.microsoft.portable-executable')
    else: 
        return ERROR_RESPONSE

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
        return ERROR_RESPONSE

    header["Authorization"] = "JWT {}".format(auth_token) 
    session.headers = header

    url = 'https://{}/api/v1/deployment-profiles'.format(address)
    resp = session.get(url)
    if(resp.ok):
        return jsonify(resp.json()['data'])
    else:
        return resp

win_install_cnxn = MongoConnectionManager().mongo_windows_installer_configs
win_targets_cnxn = MongoConnectionManager().mongo_windows_target_lists

def save_if_unique(rqst, field: str, cnxn, return_func) -> Response:
    payload = rqst.get_json()
    matches = cnxn.count({field: payload[field]})
    if matches == 0:
        cnxn.insert_one(payload)
        return return_func()
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

@app.route('/api/save_agent_installer_config', methods=['POST'])
def save_agent_installer_config() -> Response:
    return save_if_unique(
        rqst = request,
        field='config_name', 
        cnxn = win_install_cnxn, 
        return_func = get_agent_installer_configs)

@app.route('/api/delete_agent_installer_config/<config_id>', methods=['DELETE'])
def delete_agent_installer_config(config_id: str) -> Response:
    win_install_cnxn.delete_one({'_id': ObjectId(config_id)})
    return get_agent_installer_configs()

@app.route('/api/get_agent_installer_configs', methods=['GET']) 
def get_agent_installer_configs() -> Response:
    saved_configs = win_install_cnxn.find({})
    return cursorToJsonResponse(saved_configs, sort_field = 'config_name')