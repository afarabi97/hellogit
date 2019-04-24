"""
Main module for handling Agent Builder REST calls.
"""

import os
import requests

from app import (app, logger, conn_mng)
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.job_manager import shell
from flask import send_file, Response, request, jsonify

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
    endgame_user_name = payload['endgame_user_name']
    #Escape dollar signs with another dollar sign so as not to confuse make.
    endgame_password = payload['endgame_password']
    endgame_sensor_name = payload['endgame_sensor_name']
    endgame_server_ip = payload['endgame_server_ip']
    endgame_port = payload['endgame_port']
    endgame_vdi = payload['endgame_vdi']
    if payload['endgame_persistence']:
        endgame_persistence = payload['endgame_persistence'][0] == 'Persistent'
    else:
        endgame_persistence = True
    endgame_id =  payload['id']

    installer_dir = '/opt/tfplenum/playbooks'
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
                endgame_config_name={} \
                endgame_vdi={} \
                endgame_dissolvable={} \
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
                  '"{}"'.format(endgame_sensor_name),
                  endgame_vdi,
                  not endgame_persistence,
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

    requests.packages.urllib3.disable_warnings( requests.packages.urllib3.exceptions.InsecureRequestWarning )
    session = requests.Session()
    session.verify = False
    
    #Get authorization token from server, i.e., log in.
    address = '{}:{}'.format(endgame_server_ip, endgame_port)
    url = 'https://{}/api/v1/auth/login'.format(address)
    header = { 'Content-Type': 'application/json' }
    resp = session.post(url, json = { 'username': endgame_user_name, 'password': endgame_password }, 
                       headers = header)
    auth_token = resp.json()['metadata']['token']

    header["Authorization"] = "JWT {}".format(auth_token) 
    session.headers = header

    url = 'https://{}/api/v1/deployment-profiles'.format(address)
    resp = session.get(url)

    return jsonify(resp.json()['data'])
