"""
Main module for handling Agent Builder REST calls.
"""

import os

from app import (app, logger, conn_mng)
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.job_manager import shell
from flask import send_file, Response, request

@app.route('/api/generate_windows_installer', methods=['POST'])
def build_installer() -> Response:
    """
    Build the Windows installer for Winlogbeat, Sysmon and GRR
    :param: pf_sense_ip   IP or hostname of Logstash server
    :param: winlogbeat_port Port number to access Logstash server
    :param: isGrrInstalled  Flag indicating if GRR is installed
    :param: grr_port Port number to access GRR server
    :return: Self-extracting archive if succesffuly built, ERROR_RESPONSE otherwise
     """
    #{pf_sense_ip: "172.16.77.22", winlogbeat_port: "5044", grr_port: "8080", isGrrInstalled: false}
    payload = request.get_json()
    pf_sense_ip = payload['pf_sense_ip']
    winlogbeat_port = payload['winlogbeat_port']
    isGrrInstalled = payload['isGrrInstalled']
    grr_port = payload['grr_port']

    installer_dir = '/opt/tfplenum/playbooks'
    installer_name = 'monitor_install.exe'
    installer_path = '{}/{}'.format(installer_dir, installer_name)
    try:
        os.remove(installer_path)
    except OSError:
        pass

    if isGrrInstalled:
        command = 'make winlogbeat LOGSTASH_URL={} LOGSTASH_PORT={} INCLUDE_GRR=TRUE GRR_PORT={}'.format(
            pf_sense_ip, winlogbeat_port, grr_port)
    else:
        command = 'make winlogbeat LOGSTASH_URL={} LOGSTASH_PORT={}'.format(pf_sense_ip, winlogbeat_port)

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


