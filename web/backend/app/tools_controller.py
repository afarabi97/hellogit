import io
import shutil
import tempfile
import zipfile
from pathlib import Path
from typing import Dict, List
from glob import glob
import os
from datetime import datetime
import base64

import yaml
import json
from fabric.runners import Result
from flask import Response, jsonify, request
import kubernetes.client
from kubernetes.client.models.v1_service import V1Service
from kubernetes.client.models.v1_service_list import V1ServiceList
from kubernetes.client.rest import ApiException
from paramiko.ssh_exception import AuthenticationException
from pymongo import ReturnDocument
from werkzeug.utils import secure_filename
from fabric import Connection

from app import app, conn_mng, logger
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.dao import elastic_deploy
from app.middleware import controller_maintainer_required
from app.models.common import JobID
from app.models.kit_setup import DIPKickstartForm, Node
from app.service.elastic_service import (Timeout, apply_es_deploy,
                                         setup_s3_repository, get_elasticsearch_license,
                                         wait_for_elastic_cluster_ready)
from app.service.scale_service import get_elastic_password, get_elastic_fqdn
from app.service.elastic_service import check_elastic_license
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import (FabricConnection,
                                    FabricConnectionWrapper, KubernetesWrapper)
from app.utils.constants import KICKSTART_ID
from app.utils.utils import decode_password, encode_password



_JOB_NAME = "tools"


class AmmendedPasswordNotFound(Exception):
    pass


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

def update_password(config: DIPKickstartForm, password):
    config.root_password = password
    config.save_to_db()


@app.route('/api/change_kit_password', methods=['POST'])
@controller_maintainer_required
def change_kit_password():
    payload = request.get_json()

    current_config = DIPKickstartForm.load_from_db() # type: DIPKickstartForm
    if current_config == None:
        return (jsonify({"message": "Couldn't find kit configuration."}), 500)

    for node in current_config.nodes: # type: Node
        try:
            connection = Connection(str(node.ip_address), "root", connect_kwargs={'key_filename': '/root/.ssh/id_rsa', 'allow_agent': False, 'look_for_keys': False})
            result = connection.run("echo '{}' | passwd --stdin root".format(payload["passwordForm"]["root_password"]), warn=True) # type: Result

            if result.return_code !=0:
                _result = connection.run("journalctl SYSLOG_IDENTIFIER=pwhistory_helper --since '10s ago'")
                if (_result.stdout.count("\n") == 2):
                    return (jsonify({"message": "Password has already been used. You must try another password."}), 409)
                else:
                    return (jsonify({"message": "An unknown error occured."}), 409)
            connection.close()

        except AuthenticationException:
            return (jsonify(node.to_dict()), 422)
        except Exception as e:
            return (jsonify({"message": str(e)}), 500)

    update_password(current_config, payload["passwordForm"]["root_password"])
    return jsonify({"message": "Successfully changed the password of your Kit!"})

@app.route('/api/update_documentation', methods=['POST'])
@controller_maintainer_required
def update_documentation() -> Response:
    if 'upload_file' not in request.files:
        return jsonify({"error_message": "Failed to upload file. No file was found in the request."})

    if 'space_name' not in request.form or request.form['space_name'] is None or request.form['space_name'] == "":
        return jsonify({"error_message": "Space name is required."})

    with tempfile.TemporaryDirectory() as upload_path: # type: str
        incoming_file = request.files['upload_file']
        filename = secure_filename(incoming_file.filename)
        space_name = request.form['space_name']

        pos = filename.rfind('.') + 1
        if filename[pos:] != 'zip':
            return jsonify({"error_message": "Failed to upload file. Files must end with the .zip extension."})

        abs_save_path = str(upload_path) + '/' + filename
        incoming_file.save(abs_save_path)

        extracted_path = "/var/www/html/docs/" + space_name
        shutil.rmtree(extracted_path, ignore_errors=True)
        Path(extracted_path).mkdir(parents=True, exist_ok=False)

        with zipfile.ZipFile(abs_save_path) as zip_ref:
            zip_ref.extractall(extracted_path)

        return jsonify({"success_message": "Successfully updated confluence documentation!"})

@app.route('/api/get_spaces', methods=['GET'])
def get_spaces() -> Response:
    """
    Send all links in mongo_user_links.
    :return: flask.Response containing all link data.
    """
    directories = glob("/var/www/html/docs/*")
    all_spaces = [ os.path.basename(dir) for dir in directories ]
    try:
        return jsonify(all_spaces)
    except Exception:
        return jsonify([])

def validate_es_license_json(license: dict) -> bool:
    keys = ['uid','type','issue_date_in_millis','expiry_date_in_millis','issued_to','issuer','signature','start_date_in_millis']
    return license.get('license', None) is not None and all(x in license['license'].keys() for x in keys)

@app.route('/api/es_license', methods=['PUT'])
@controller_maintainer_required
def update_es_license() -> Response:
    license = request.get_json()
    current_license = get_elasticsearch_license()

    if not validate_es_license_json(license) or not license['license'].get('cluster_licenses', None):
        return jsonify({"error_message": "File is not valid Elastic license"}), 400
    if datetime.fromtimestamp(license['license']['expiry_date_in_millis']/1000) < datetime.now():
        return jsonify({"error_message": "Elastic license has expired"}), 400
    for lic in license['license']['cluster_licenses']:
        if not validate_es_license_json(lic):
            return jsonify({"error_message": "File is not valid Elastic license"}), 400

    json_string = json.dumps(license, separators=(',', ':'))
    license_prefix = 'eck-license'
    secret_name = '{}-{}'.format(license_prefix, datetime.now().strftime("%s"))
    namespace = 'elastic-system'
    body = kubernetes.client.V1Secret()
    body.api_version = 'v1'
    body.data = {
        'license': base64.b64encode(json_string.encode('utf-8')).decode('utf-8')
    }
    body.kind = 'Secret'
    body.type = 'Opaque'
    body.metadata = {
        'name': secret_name,
        'labels': {
            'license.k8s.elastic.co/scope': 'operator'
        }
    }
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        try:
            kube_apiv1.create_namespaced_secret(namespace, body)
            old_secrets = kube_apiv1.list_namespaced_secret(namespace)
            for secret in old_secrets.items:
                if secret.metadata.name.startswith(license_prefix) and secret.metadata.name != secret_name:
                    kube_apiv1.delete_namespaced_secret(secret.metadata.name, namespace)
        except ApiException as e:
            logger.exception(e)
            return jsonify({"error_message": "Something went wrong saving the Elastic license.  See the logs."}), 500
    check_elastic_license.delay(current_license=current_license)
    return jsonify({"success_message": "Successfully uploaded Elastic License. It will take a few minutes for Elastic to show. Check notifications for updates."})

@app.route('/api/es_license', methods=['GET'])
@controller_maintainer_required
def get_es_license() -> Response:
    try:
        return jsonify(get_elasticsearch_license())
    except Exception as e:
        logger.exception(e)
        return jsonify({"error_message": "Something getting the Elastic license.  See the logs."}), 500


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
        job = setup_s3_repository.delay(elasticsearch_ip, repository_settings)
        return (jsonify(JobID(job).to_dict()), 200)
