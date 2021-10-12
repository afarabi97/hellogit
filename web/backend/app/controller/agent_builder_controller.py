"""
Main module for handling Agent Builder REST calls.
"""

import shutil
from contextlib import ExitStack
from json.decoder import JSONDecodeError
from pathlib import Path
from typing import Dict, List, Union

import requests
import urllib3
from app.common import cursor_to_json_response
from app.middleware import operator_required
from app.models.common import COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.service.agent_service import (build_agent_if_not_exists,
                                       perform_agent_reinstall)
from app.service.job_service import run_command2
from app.utils.constants import (AGENT_PKGS_DIR, AGENT_UPLOAD_DIR,
                                 TARGET_STATES, TEMPLATE_DIR)
from app.utils.db_mngs import conn_mng
from app.utils.logging import logger
from app.utils.utils import encode_password, fix_hostname, sanitize_dictionary
from bson import ObjectId
from flask import Response, json, request, send_file
from flask_restx import Namespace, Resource
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pymongo import ReturnDocument

win_install_cnxn = conn_mng.mongo_windows_installer_configs
win_targets_cnxn = conn_mng.mongo_windows_target_lists

AGENT_NS = Namespace("agent", path="/api/agent", description="Create and deploy various agent installations.")

JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


@AGENT_NS.route('/configs')
class AppConfigs(Resource):
    def get(self) -> Response:
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
        return configs

@AGENT_NS.route('/generate')
class AgentGenerate(Resource):

    @operator_required
    def post(self) -> Response:
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

@AGENT_NS.route('/endgame/profiles')
class AgentEndgameProfiles(Resource):

    @AGENT_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self) -> Response:
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
                resp = failure, 400
            else:
                resp = {'error_message': 'Failed to connect to Endgame server for unknown reason'}
            return resp

        header["Authorization"] = "JWT {}".format(auth_token)
        session.headers = header

        url = 'https://{}/api/v1/deployment-profiles'.format(address)
        resp = session.get(url, verify=False)
        if(resp.ok):
            return resp.json()['data']
        else:
            return resp


def get_agent_installer_target_lists():
    target_lists = win_targets_cnxn.find({})
    return cursor_to_json_response(target_lists, sort_field = 'name')

@AGENT_NS.route('/targets')
class AgentTargets(Resource):
    def get(self) -> Response:
        return get_agent_installer_target_lists()

    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        matches = win_targets_cnxn.count({"name": payload["name"]})
        if matches == 0:
            win_targets_cnxn.insert_one(payload)
        else:
            win_targets_cnxn.find_one_and_replace({"name": payload["name"]}, payload)
        return get_agent_installer_target_lists()

@AGENT_NS.route('/targets/<name>')
class AgentDelTargets(Resource):
    @operator_required
    def delete(self, name: str) -> Response:
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


@AGENT_NS.route('/host/<target_config_id>')
class AgentTargetHost(Resource):

    @AGENT_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self, target_config_id: str) -> Response:
        hosts_to_add = request.get_json()
        if hosts_to_add['hostnames'] and len(hosts_to_add['hostnames']) > 0:
            target_config = win_targets_cnxn.find_one({'_id': ObjectId(target_config_id)})
            to_insert = _get_unique_hosts_to_add(target_config, hosts_to_add)
            ret_val = win_targets_cnxn.find_one_and_update({'_id': ObjectId(target_config_id)},
                                                        {'$push': {'targets': { '$each': to_insert }}},
                                                        return_document=ReturnDocument.AFTER)
            if ret_val:
                ret_val["_id"] = str(ret_val["_id"])
                return ret_val
        return {"error_message": "Failed to add a hosts to target configuration {}.".format(target_config['name'])}


@AGENT_NS.route('/host/<host>/<target_config_id>')
class DelAgentTargetHost(Resource):

    @AGENT_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @AGENT_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @operator_required
    def delete(self, host: str, target_config_id: str) -> Response:
        print(host)
        ret_val = win_targets_cnxn.update_one({'_id': ObjectId(target_config_id)},
                                            {'$pull': {'targets': {'hostname': host}}})
        if ret_val.modified_count == 1:
            return {"success_message": "Successfully deleted {} from the target configuration.".format(host)}
        return {"error_message": "Failed to delete {} from the target configuration.".format(host)}


def get_agent_installer_configs():
    saved_configs = win_install_cnxn.find({})
    return cursor_to_json_response(saved_configs, sort_field = 'config_name')


@AGENT_NS.route('/config')
class AgentInstallerConfigs(Resource):
    def get(self) -> Response:
        return get_agent_installer_configs()

    @AGENT_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        sanitize_dictionary(payload)
        payload['endgame_password'] = encode_password(payload['endgame_password'])
        matches = win_install_cnxn.count({"config_name": payload["config_name"]})
        if matches == 0:
            try:
                win_install_cnxn.insert_one(payload)
                return get_agent_installer_configs()
            except:
                return {"error_message": "500 Could not insert document"}
        else:
            return {"error_message": "{} name already in use".format(payload["config_name"])}


@AGENT_NS.route('/config/<config_id>')
class AgentInstallerDelConfigs(Resource):

    @operator_required
    def delete(self, config_id: str) -> Response:
        win_install_cnxn.delete_one({'_id': ObjectId(config_id)})

        agent_dir = Path(AGENT_UPLOAD_DIR + "/" + config_id)
        if agent_dir.exists() and agent_dir.is_dir():
            shutil.rmtree(str(agent_dir))

        return get_agent_installer_configs()


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
        perform_agent_reinstall.delay(payload, targets, do_uninstall_only)
    else:
        for hostname_or_ip in targets:
            perform_agent_reinstall.delay(payload, hostname_or_ip, do_uninstall_only)


@AGENT_NS.route('/uninstall')
class AgentUninstall(Resource):

    @AGENT_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @AGENT_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        sanitize_dictionary(payload)
        targets = None
        if 'target_config' in payload:
            target_config = payload['target_config']
            targets = [target['hostname'] for target in target_config.pop('targets')]
            if len(targets) == 0:
                return {"error_message": "Failed to initiate uninstall task. No targets were specified for this configuration. Did you forget to add them?"}
        elif 'target' in payload:
            targets = payload['target']
        _create_and_run_celery_tasks(payload, targets, do_uninstall_only=True)
        return {"success_message": "Initiated uninstall task. Open the notification manager to track its progress."}


@AGENT_NS.route('/install')
class AgentInstall(Resource):

    @AGENT_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        sanitize_dictionary(payload)
        target_config = payload['target_config']
        targets = [target['hostname'] for target in target_config.pop('targets')]
        if len(targets) == 0:
            return {"error_message": "Failed to initiated install task. No targets were specified for this configuration. Did you forget to add them?"}

        _create_and_run_celery_tasks(payload, targets)
        return {"error_message": "Initiated install task. Open the notification manager to track its progress."}


@AGENT_NS.route('/reinstall')
class AgentReinstall(Resource):

    AGENT_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        sanitize_dictionary(payload)
        target = payload['target']
        hostname = target['hostname']

        _create_and_run_celery_tasks(payload, hostname)
        return {"success_message": "Initiated reinstall task on {}. \
                                    Open the notification manager to track its progress.".format(hostname)}
