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
from flask_restx import Resource
from kubernetes.client.models.v1_service import V1Service
from kubernetes.client.models.v1_service_list import V1ServiceList
from kubernetes.client.rest import ApiException
from paramiko.ssh_exception import AuthenticationException
from pymongo import ReturnDocument
from werkzeug.utils import secure_filename
from fabric import Connection

from app import app, conn_mng, logger, api, TOOLS_NS
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.dao import elastic_deploy
from app.middleware import controller_maintainer_required
from app.models.common import (JobID, CurrentTimeMdl, COMMON_MESSAGE,
                               COMMON_SUCCESS_MESSAGE, COMMON_ERROR_MESSAGE)
from app.models.tools import (NewPasswordModel, COMMON_TOOLS_RETURNS, NetworkDeviceStateModel,
                              InitalDeviceStatesModel, NetworkInterfaceModel)
from app.models.kit_setup import DIPKickstartForm, Node
from app.service.elastic_service import (Timeout, apply_es_deploy,
                                         setup_s3_repository, get_elasticsearch_license,
                                         wait_for_elastic_cluster_ready)
from app.service.elastic_service import check_elastic_license
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import (FabricConnection,
                                       FabricConnectionWrapper, KubernetesWrapper)
from app.utils.constants import KICKSTART_ID
from app.utils.utils import decode_password, encode_password

from fabric import Connection
from werkzeug.datastructures import FileStorage


_JOB_NAME = "tools"


class AmmendedPasswordNotFound(Exception):
    pass


@api.route("/api/controller/datetime")
class CurrentTime(Resource):

    @api.response(200, "CurrentTime", CurrentTimeMdl.DTO)
    @api.response(500, 'Empty 500 return.')
    @api.doc(description="Gets the Current time of the controller.")
    def get(self):
        timezone_stdout, ret_val = run_command2('timedatectl | grep "Time zone:"', use_shell=True)
        if ret_val != 0:
            return ERROR_RESPONSE

        pos = timezone_stdout.find(":")
        pos2 = timezone_stdout.find("(", pos)
        timezone = timezone_stdout[pos+2:pos2-1]

        date_stdout, ret_val = run_command2('date +"%m-%d-%Y %H:%M:%S"', use_shell=True)
        if ret_val != 0:
            return ERROR_RESPONSE

        return CurrentTimeMdl(timezone, date_stdout.replace('\n', '')).to_dict()


def _get_ammended_password(ip_address_lookup: str, ammended_passwords: List[Dict]) -> str:
    for item in ammended_passwords:
        if item["ip_address"] == ip_address_lookup:
            return item["password"]
    raise AmmendedPasswordNotFound()

def update_password(config: DIPKickstartForm, password):
    config.root_password = password
    config.save_to_db()


@TOOLS_NS.route("/change-kit-password")
class ChangeKitPassword(Resource):

    @TOOLS_NS.doc(description="Changes the Kit's ssh root/password on all nodes.")
    @TOOLS_NS.expect(NewPasswordModel.DTO)
    @TOOLS_NS.response(200, 'Success Message', COMMON_MESSAGE)
    @TOOLS_NS.response(409, 'Password has already been used. You must try another password.', COMMON_MESSAGE)
    @TOOLS_NS.response(500, 'Unknown error.', COMMON_MESSAGE)
    @TOOLS_NS.response(404, 'Kit config not found.', COMMON_MESSAGE)
    @TOOLS_NS.response(403, 'Authentication failure on Node', Node.DTO)
    @controller_maintainer_required
    def post(self):
        model = NewPasswordModel(TOOLS_NS.payload['root_password'])
        current_config = DIPKickstartForm.load_from_db() # type: DIPKickstartForm
        if current_config == None:
            return {"message": "Couldn't find kit configuration."}, 404

        for node in current_config.nodes: # type: Node
            try:
                with FabricConnection(str(node.ip_address), use_ssh_key=True) as shell:
                    result = shell.run("echo '{}' | passwd --stdin root".format(model.root_password), warn=True) # type: Result

                    if result.return_code !=0:
                        _result = shell.run("journalctl SYSLOG_IDENTIFIER=pwhistory_helper --since '10s ago'")
                        if (_result.stdout.count("\n") == 2):
                            return {"message": "Password has already been used. You must try another password."}, 409
                        else:
                            return {"message": "An unknown error occured."}, 500

            except AuthenticationException:
                return node.to_dict(), 403

        update_password(current_config, model.root_password)
        return {"message": "Successfully changed the password of your Kit!"}, 200



upload_parser = api.parser()
upload_parser.add_argument('upload_file', location='files',
                           type=FileStorage, required=True)
upload_parser.add_argument('space_name', type=str, required=True, location='form',
                           help='The name of the confluence space or some other arbirtrary name.')

@TOOLS_NS.route("/documentation/upload")
class UpdateDocs(Resource):

    @TOOLS_NS.doc(description="Uploads new confluence documentation placing it into the navigation bar.")
    @TOOLS_NS.expect(upload_parser)
    @TOOLS_NS.response(200, 'SuccessMessage', COMMON_SUCCESS_MESSAGE)
    @TOOLS_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def post(self):
        if 'upload_file' not in request.files:
            return {"error_message": "Failed to upload file. No file was found in the request."}, 400

        if 'space_name' not in request.form or request.form['space_name'] is None or request.form['space_name'] == "":
            return {"error_message": "Space name is required."}, 400

        with tempfile.TemporaryDirectory() as upload_path: # type: str
            incoming_file = request.files['upload_file']
            filename = secure_filename(incoming_file.filename)
            space_name = request.form['space_name']

            pos = filename.rfind('.') + 1
            if filename[pos:] != 'zip':
                return {"error_message": "Failed to upload file. Files must end with the .zip extension."}, 400

            abs_save_path = str(upload_path) + '/' + filename
            incoming_file.save(abs_save_path)

            extracted_path = "/var/www/html/docs/" + space_name
            shutil.rmtree(extracted_path, ignore_errors=True)
            Path(extracted_path).mkdir(parents=True, exist_ok=False)

            with zipfile.ZipFile(abs_save_path) as zip_ref:
                zip_ref.extractall(extracted_path)

            return {"success_message": "Successfully updated confluence documentation!"}


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


@TOOLS_NS.route("/spaces")
class GetSpaces(Resource):

    @TOOLS_NS.doc(description="Gets all the folder names stored in /var/www/html/docs/. \
                               This directory stores raw HTML files for documentation purposes. \
                               Also, anything showing in this list will appear on the navbar on the UI.")
    @TOOLS_NS.response(200, 'SpacesList', COMMON_TOOLS_RETURNS['spaces'])
    def get(self):
        directories = glob("/var/www/html/docs/*")
        all_spaces = [ os.path.basename(dir) for dir in directories ]
        try:
            return all_spaces
        except Exception:
            return []


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

    def _is_link_up(self, shell: FabricConnection) -> bool:
        cmd = 'ethtool {} | grep "Link detected: yes"'.format(self._device)
        print(cmd)
        result = shell.run(cmd, warn=True, shell=True)
        return (result.return_code == 0)

    def set_up(self):
        with FabricConnection(self._node) as shell:
            result = shell.run("bash -c 'ip link set {} up'".format(self._device))
            link_up = self._is_link_up(shell)
            if result.return_code == 0:
                return NetworkDeviceStateModel(self._node, self._device, "up", link_up).to_dict()
            else:
                return {}

    def down(self):
        with FabricConnection(self._node) as shell:
            result = shell.run("bash -c 'ip link set {} down'".format(self._device))
            link_up = self._is_link_up(shell)
            if result.return_code == 0:
                return NetworkDeviceStateModel(self._node, self._device, "down", link_up).to_dict()
            else:
                return {}

    def get_state(self):
        with FabricConnection(self._node) as shell:
            result = shell.run("bash -c 'ip address show {} up'".format(self._device))
            link_up = self._is_link_up(shell)
            if result.return_code == 0:
                if result.stdout == "":
                    return NetworkDeviceStateModel(self._node, self._device, "down", link_up).to_dict()
                else:
                    return NetworkDeviceStateModel(self._node, self._device, "up", link_up).to_dict()
            else:
                return {}


@TOOLS_NS.route("/<node>/set-interface-state/<device>/<state>")
class ChangeStateOfRemoteNetworkDevice(Resource):

    @TOOLS_NS.doc(description="Shuts down the NIC device or turns it back on. \
                               Passing a up value will bring the interface back \
                               into an up state while passing down will bring the interface down. \
                               Note: This can cause Suricata, Zeek or Arkime pods to crash while \
                               the interface is shutdown on the Sensor.",
                  params={'node': "The FQDN or hostname of the node.",
                          'device': "The interface to toggle.",
                          'state': "The current state of the NIC device. Valid values are up or down."})
    @TOOLS_NS.response(200, 'NetworkDeviceState', NetworkDeviceStateModel.DTO)
    @TOOLS_NS.response(500, 'Errors with no message.  Check logs /var/log/tfplenum/ for more details.')
    @controller_maintainer_required
    def put(self, node: str, device: str, state: str ):
        device = RemoteNetworkDevice(node, device)
        if state == "up":
            result = device.set_up()
            if result:
                return result
            else:
                return ERROR_RESPONSE

        if state == "down":
            result = device.down()
            if result:
                return result
            else:
                return ERROR_RESPONSE

        return ERROR_RESPONSE


@TOOLS_NS.route('/monitoring-interfaces')
class MonitoringInterfaces(Resource):

    @TOOLS_NS.response(200, 'InitalDeviceStates', [InitalDeviceStatesModel.DTO])
    @TOOLS_NS.doc(description="Retrieves a list of node hostnames with their associated network interfaces.")
    def get(self):
        nodes = {}
        applications = ["arkime", "zeek", "suricata"]

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
            inital_states = InitalDeviceStatesModel(hostname)
            for interface in interfaces:
                device = RemoteNetworkDevice(hostname, interface)
                try:
                    ret_val = device.get_state()
                    state = ret_val['state']
                    link_up = ret_val['link_up']
                    inital_states.add_interface(NetworkInterfaceModel(interface, state, link_up))
                except KeyError:
                    inital_states.add_interface(NetworkInterfaceModel(interface))
            result.append(inital_states.to_dict())

        return result


@TOOLS_NS.route('/ifaces/<hostname>')
class AllIfaces(Resource):

    @TOOLS_NS.response(200, 'InitalDeviceStates', [NetworkInterfaceModel.DTO])
    @TOOLS_NS.doc(description="Retrieves a list of network interfaces with their states.")
    def get(self, hostname: str):
        node = Node.load_from_db_using_hostname(hostname)
        result = []
        for iface in node.deviceFacts['interfaces']:
            device = RemoteNetworkDevice(hostname, iface['name'])
            ret_val = device.get_state()
            state = ret_val['state']
            link_up = ret_val['link_up']
            result.append(NetworkInterfaceModel(iface['name'], state, link_up).to_dict())
        return result


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
