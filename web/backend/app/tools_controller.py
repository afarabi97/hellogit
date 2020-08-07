import io
import json
import logging
import shutil
import tempfile
import zipfile
from pathlib import Path
from typing import Dict, List

import yaml
from celery.result import AsyncResult
from fabric.runners import Result
from flask import Response, jsonify, request
from kubernetes.client.models.v1_service import V1Service
from kubernetes.client.models.v1_service_list import V1ServiceList
from paramiko.ssh_exception import AuthenticationException
from pymongo import ReturnDocument
from werkzeug.utils import secure_filename

from app import app, conn_mng, logger
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
from app.dao import elastic_deploy
from app.middleware import Auth, controller_maintainer_required
from app.service.elastic_service import (Timeout, apply_es_deploy,
                                         setup_s3_repository,
                                         wait_for_elastic_cluster_ready)
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.service.time_service import TimeChangeFailure, change_time_on_kit
from shared.connection_mngs import (FabricConnection, FabricConnectionManager,
                                    FabricConnectionWrapper, KubernetesWrapper)
from shared.constants import KICKSTART_ID
from shared.utils import decode_password, encode_password

from fabric import Connection
import crypt

REGISTRATION_JOB = None # type: AsyncResult
_JOB_NAME = "tools"


class AmmendedPasswordNotFound(Exception):
    pass


@app.route('/api/change_kit_clock', methods=['POST'])
@controller_maintainer_required
def change_kit_clock() -> Response:
    payload = request.get_json()
    date_parts = payload['date'].split(' ')[0].split('/')
    time_parts = payload['date'].split(' ')[1].split(':')
    time_form = {'timezone': payload['timezone'],
                 'date': { 'year': date_parts[2], 'month': date_parts[0], 'day': date_parts[1]},
                 'time': '{}:{}:{}'.format(time_parts[0], time_parts[1], time_parts[2])
               }

    try:
        change_time_on_kit(time_form)
    except TimeChangeFailure as e:
        return jsonify({"message": str(e)})

    return jsonify({"message": "Successfully changed the clock on your Kit!"})


@app.route('/api/get_current_dip_time', methods=['GET'])
def get_current_dip_time():
    timezone_stdout, ret_val = run_command2('timedatectl | grep "Time zone:"', use_shell=True)
    if ret_val != 0:
        return ERROR_RESPONSE

    pos = timezone_stdout.find(":")
    pos2 = timezone_stdout.find("(", pos)
    timezone = timezone_stdout[pos+2:pos2-1]

    date_stdout, ret_val = run_command2('date +"%m-%d-%Y %H:%M:%S"', use_shell=True)
    if ret_val != 0:
        return ERROR_RESPONSE

    return jsonify({"timezone": timezone, "datetime": date_stdout.replace('\n', '')})


def _get_ammended_password(ip_address_lookup: str, ammended_passwords: List[Dict]) -> str:
    for item in ammended_passwords:
        if item["ip_address"] == ip_address_lookup:
            return item["password"]
    raise AmmendedPasswordNotFound()

def password_from_config(config):
    return decode_password(config["form"]["root_password"])

def update_password(config, password):
    config["form"]["root_password"] = encode_password(password)
    config["form"]["re_password"] = encode_password(password)
    result = conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                        {"_id": KICKSTART_ID, "form": config["form"]},
                                        upsert=False,
                                        return_document=ReturnDocument.AFTER)
    return result

@app.route('/api/change_kit_password', methods=['POST'])
@controller_maintainer_required
def change_kit_password():
    payload = request.get_json()

    current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})

    if current_config == None:
        return (jsonify({"message": "Couldn't find kit configuration."}), 500)
    
    for node in current_config["form"]["nodes"]:
        try:
            connection = Connection(node["ip_address"], "root", connect_kwargs={'key_filename': '/root/.ssh/id_rsa', 'allow_agent': False, 'look_for_keys': False})
            result = connection.run("echo '{}' | passwd --stdin root".format(payload["passwordForm"]["root_password"]), warn=True) # type: Result

            if result.return_code !=0:
                _result = connection.run("journalctl SYSLOG_IDENTIFIER=pwhistory_helper --since '10s ago'")
                if (_result.stdout.count("\n") == 2):
                    return (jsonify({"message": "Password has already been used. You must try another password."}), 409)
                else:
                    return (jsonify({"message": "An unknown error occured."}), 409)
            connection.close()

        except AuthenticationException:
            return (jsonify(node), 422)
        except Exception as e:
            return (jsonify({"message": str(e)}), 500)

    update_password(current_config, payload["passwordForm"]["root_password"])
    return jsonify({"message": "Successfully changed the password of your Kit!"})

@app.route('/api/update_documentation', methods=['POST'])
@controller_maintainer_required
def update_documentation() -> Response:
    if 'upload_file' not in request.files:
        return jsonify({"error_message": "Failed to upload file. No file was found in the request."})

    with tempfile.TemporaryDirectory() as upload_path: # type: str
        incoming_file = request.files['upload_file']
        filename = secure_filename(incoming_file.filename)
        space_name = request.form['space_name']

        pos = filename.rfind('.') + 1
        if filename[pos:] != 'zip':
            return jsonify({"error_message": "Failed to upload file. Files must end with the .zip extension."})

        abs_save_path = str(upload_path) + '/' + filename
        incoming_file.save(abs_save_path)

        extracted_path = "/var/www/html/" + space_name
        shutil.rmtree(extracted_path, ignore_errors=True)
        Path(extracted_path).mkdir(parents=True, exist_ok=False)

        with zipfile.ZipFile(abs_save_path) as zip_ref:
            zip_ref.extractall(extracted_path)

        ret = conn_mng.mongo_spaces.find_one({"_id": "spaces"})
        if ret:
            ret["space_names"].append(space_name)
            conn_mng.mongo_spaces.find_one_and_replace({"_id": "spaces"}, ret)
        else:
            conn_mng.mongo_spaces.insert_one({"_id": "spaces", "space_names": [space_name]})

        return jsonify({"success_message": "Successfully updated confluence documentation!"})


@app.route('/api/get_spaces', methods=['GET'])
def get_spaces() -> Response:
    """
    Send all links in mongo_user_links.
    :return: flask.Response containing all link data.
    """

    all_spaces = list(conn_mng.mongo_spaces.find({}))
    try:
        return jsonify(all_spaces[0]["space_names"])
    except Exception:
        return jsonify([])


class KubernetesError(Exception):
    pass


def retrieve_service_ip_address(service_name: str) -> str:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        svcs = kube_apiv1.list_namespaced_service("default") # type: V1ServiceList
        for svc in svcs.items: # type: V1Service
            if svc.metadata.name == service_name:
                return svc.status.load_balancer.ingress[0].ip

    raise KubernetesError("Failed to find passed in Kubernetes service ip.")


class RemoteNetworkDevice(object):
    def __init__(self, node, device):
      self._node = node
      self._device = device

    def set_up(self):
        with FabricConnection(self._node) as shell:
            result = shell.run("bash -c 'ip link set {} up'".format(self._device))
            if result.return_code == 0:
                return {"node": self._node, "device": self._device, "state": "up"}
            else:
                return {}

    def down(self):
        with FabricConnection(self._node) as shell:
            result = shell.run("bash -c 'ip link set {} down'".format(self._device))
            if result.return_code == 0:
                return {"node": self._node, "device": self._device, "state": "down"}
            else:
                return {}

    def get_state(self):
        with FabricConnection(self._node) as shell:
            result = shell.run("bash -c 'ip address show {} up'".format(self._device))

            if result.return_code == 0:
                if result.stdout == "":
                    return {"node": self._node, "device": self._device, "state": "down"}
                else:
                    return {"node": self._node, "device": self._device, "state": "up"}
            else:
                return {}


@app.route('/api/<node>/set_interface_state/<device>/<state>', methods=['POST'])
@controller_maintainer_required
def change_state_of_remote_network_device(node: str, device: str, state: str):
    device = RemoteNetworkDevice(node, device)
    if state == "up":
        result = device.set_up()
        if result:
            return jsonify(result)
        else:
            return ERROR_RESPONSE

    if state == "down":
        result = device.down()
        if result:
            return jsonify(result)
        else:
            return ERROR_RESPONSE

    return ERROR_RESPONSE

@app.route('/api/monitoring_interfaces', methods=['GET'])
def get_monitoring_interfaces():
    nodes = {}
    applications = ["moloch", "zeek", "suricata"]

    documents = list(conn_mng.mongo_catalog_saved_values.find({ "application": {"$in": applications} }))

    for document in documents:
        hostname = document['values']['node_hostname']
        interfaces = document['values']['interfaces']
        try:
            for interface in interfaces:
                nodes[hostname].add(interface)
        except KeyError:
            nodes[hostname] = set(interfaces)

    result = []
    for hostname, interfaces in nodes.items():
        node = {'node': hostname, 'interfaces': []}
        for interface in interfaces:
            device = RemoteNetworkDevice(hostname, interface)
            try:
                state = device.get_state()['state']
                node['interfaces'].append({'name': interface, 'state': state})
            except KeyError:
                node['interfaces'].append({'name': interface})
        result.append(node)

    return jsonify(result)


@app.route('/api/load_elastic_deploy', methods=['GET'])
@controller_maintainer_required
def load_es_deploy():
    notification = NotificationMessage(role=_JOB_NAME)
    remote_deploy_path = "/opt/tfplenum/elasticsearch/deploy.yml"
    override = request.args.get('override', default = False, type = bool)

    try:
        if override:
            elastic_deploy.delete_many()
        deploy_config = elastic_deploy.read_many()
        if (override == False and len(deploy_config) > 0):
            return (jsonify("Deploy config already exists use ?override=1 to reload it"), 200)
        if override or (override == False and len(deploy_config) == 0):
            original_config = io.BytesIO()
            with FabricConnectionWrapper(conn_mng) as master_shell: # type: Connection
                master_shell.get(remote_deploy_path, original_config)
                config = original_config.getvalue().decode('utf-8')
                config_yaml = yaml.load_all(config, Loader=yaml.FullLoader)

                for d in config_yaml:
                    elastic_deploy.create(d)
        return (jsonify("Deploy config successfully loaded."), 200)
    except Exception as e:
        logger.exception(e)
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
        return jsonify(str(e))
    return ERROR_RESPONSE


@app.route('/api/apply_elastic_deploy', methods=['GET'])
@controller_maintainer_required
def apply_es_deploy_rest():
    if apply_es_deploy():
        return OK_RESPONSE

    return ERROR_RESPONSE

@app.route('/api/snapshot', methods=['POST'])
@controller_maintainer_required
def snapshot():
    try:
        wait_for_elastic_cluster_ready(minutes=0)
    except Timeout as e:
        return (jsonify("Elastic cluster is not in a ready state."), 500)
    except Exception as e:
        logger.exception(e)
        return (jsonify(str(e)), 500)
    else:
        repository_settings = request.get_json()
        elasticsearch_ip = retrieve_service_ip_address("elasticsearch")
        setup_s3_repository.delay(elasticsearch_ip, repository_settings)
        return OK_RESPONSE
