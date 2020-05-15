import shutil
import tempfile
import zipfile

from app import app, logger, conn_mng, CORE_DIR
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.service.configmap_service import bounce_pods
from app.service.elastic_service import apply_es_deploy, setup_s3_repository, wait_for_elastic_cluster_ready, Timeout
from app.service.job_service import run_command, run_command2
from app.service.time_service import change_time_on_kit, TimeChangeFailure
from celery import chain
from celery.result import AsyncResult
from elasticsearch.exceptions import NotFoundError, ConnectionError
from fabric.runners import Result
from flask import request, jsonify, Response
from kubernetes.client.models.v1_service_list import V1ServiceList
from kubernetes.client.models.v1_service import V1Service
from paramiko.ssh_exception import AuthenticationException
from pathlib import Path
from pymongo import ReturnDocument
from shared.constants import KICKSTART_ID, ELK_SNAPSHOT_STATE, KIT_ID
from shared.utils import decode_password, encode_password
from shared.connection_mngs import FabricConnectionManager, ElasticsearchManager, KubernetesWrapper, FabricConnection, FabricConnectionWrapper
from socket import gethostbyname
from typing import List, Dict, Tuple, Set
from werkzeug.utils import secure_filename
import traceback
from app.service.socket_service import NotificationMessage, NotificationCode
import io
import yaml, json
from app.service.scale_service import es_cluster_status
from app.dao import elastic_deploy
from app.middleware import Auth, controller_maintainer_required


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


@app.route('/api/change_kit_password', methods=['POST'])
@controller_maintainer_required
def change_kit_password():
    payload = request.get_json()
    password_form = payload["passwordForm"]
    ammended_passwords = payload["amendedPasswords"]
    current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if current_config:
        old_password = decode_password(current_config["form"]["root_password"])
        password_hash, ret_code = run_command2('perl -e "print crypt(\'{}\', "Q9"),"'.format(password_form["root_password"]))
        change_root_pwd = "usermod --password {} root".format(password_hash)

        for node in current_config["form"]["nodes"]:
            ip = node["ip_address"]

            if ret_code != 0:
                return ERROR_RESPONSE

            try:
                amended_password = _get_ammended_password(ip, ammended_passwords)
                correct_password = amended_password
            except AmmendedPasswordNotFound:
                correct_password = None

            try:
                with FabricConnectionManager("root", old_password, ip) as shell:
                    ret = shell.run(change_root_pwd) # type: Result
                    if ret.return_code != 0:
                        return ERROR_RESPONSE

            except AuthenticationException:
                if correct_password is not None:
                    try:
                        with FabricConnectionManager("root", correct_password, ip) as shell:
                            ret = shell.run(change_root_pwd) # type: Result
                            if ret.return_code != 0:
                                return ERROR_RESPONSE
                    except AuthenticationException:
                        return jsonify(node)
                else:
                    return jsonify(node)


        current_config["form"]["root_password"] = encode_password(password_form["root_password"])
        current_config["form"]["re_password"] = encode_password(password_form["root_password"])
        new_configuration = conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                            {"_id": KICKSTART_ID, "form": current_config["form"]},
                                            upsert=False,
                                            return_document=ReturnDocument.AFTER)
        if not new_configuration:
            return ERROR_RESPONSE

    return jsonify({"message": "Successfully changed the password of your Kit!"})


@app.route('/api/update_documentation', methods=['POST'])
@controller_maintainer_required
def update_documentation() -> Response:
    if 'upload_file' not in request.files:
        return jsonify({"error_message": "Failed to upload file. No file was found in the request."})

    with tempfile.TemporaryDirectory() as upload_path: # type: str
        incoming_file = request.files['upload_file']
        filename = secure_filename(incoming_file.filename)

        pos = filename.rfind('.') + 1
        if filename[pos:] != 'zip':
            return jsonify({"error_message": "Failed to upload file. Files must end with the .zip extension."})

        abs_save_path = str(upload_path) + '/' + filename
        incoming_file.save(abs_save_path)

        extracted_path = "/var/www/html/THISISCVAH"
        shutil.rmtree(extracted_path, ignore_errors=True)
        Path(extracted_path).mkdir(parents=True, exist_ok=False)

        with zipfile.ZipFile(abs_save_path) as zip_ref:
            zip_ref.extractall(extracted_path)

        return jsonify({"success_message": "Successfully updated confluence documentation!"})


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
