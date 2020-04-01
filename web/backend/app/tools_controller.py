import shutil
import tempfile
import zipfile

from app import app, logger, conn_mng, CORE_DIR
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.service.configmap_service import bounce_pods
from app.service.elastic_service import finish_repository_registration, apply_es_deploy
from app.service.job_service import run_command, run_command2
from app.service.snapshot_service import check_snapshot_status
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


REGISTRATION_JOB = None # type: AsyncResult
_JOB_NAME = "tools"


class AmmendedPasswordNotFound(Exception):
    pass


@app.route('/api/change_kit_clock', methods=['POST'])
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


@app.route('/api/mount_nfs_shares', methods=['POST'])
def mount_nfs_shares() -> Response:
    payload = request.get_json()
    nfs_host_or_ip = payload['nfs_host'].strip() # type: str
    cmd = 'ansible-playbook nfsclient.yml -i inventory.yml -t nfsclient --extra-vars "nfs_server_host={}"'.format(nfs_host_or_ip)
    stdout, ret_val = run_command2(cmd, str(CORE_DIR / "playbooks/"))
    print(stdout)
    if ret_val != 0:
        return jsonify({"error_message": "Failed to mount one or more share drives."})

    return jsonify({"success_message": "Successfully mounted share drives on all nodes!"})


class KubernetesError(Exception):
    pass


def retrieve_service_ip_address(service_name: str) -> str:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        svcs = kube_apiv1.list_namespaced_service("default") # type: V1ServiceList
        for svc in svcs.items: # type: V1Service
            if svc.metadata.name == service_name:
                return svc.status.load_balancer.ingress[0].ip

    raise KubernetesError("Failed to find passed in Kubernetes service ip.")


@app.route('/api/restart_elastic_search_and_complete_registration', methods=['POST'])
def restart_elastic_search() -> Response:
    if es_cluster_status() == "Ready":
        global REGISTRATION_JOB
        service_ip = retrieve_service_ip_address("elasticsearch")
        REGISTRATION_JOB = finish_repository_registration.delay(service_ip)
        return OK_RESPONSE
    return (jsonify("Elastic cluster is not in a ready state. Please wait and try again..."), 500)

@app.route('/api/elk_snapshot_state', methods=['GET'])
def is_elk_snapshot_repo_setup():
    global REGISTRATION_JOB
    service_ip = retrieve_service_ip_address("elasticsearch")
    if REGISTRATION_JOB:
        if REGISTRATION_JOB.state != "SUCCESS":
            return jsonify({"is_setup": "inprogress"})
        else:
            REGISTRATION_JOB = None

    try:
        mng = ElasticsearchManager(service_ip, conn_mng)
        mng.get_repository()
        return jsonify({"is_setup": "complete"})
    except (NotFoundError, ConnectionError):
        return jsonify({"is_setup": "notstarted"})


@app.route('/api/get_elasticsearch_snapshots', methods=['GET'])
def get_elasticsearch_snapshots():
    """
    [{'snapshot': 'snapshot_1', 'uuid': 'ml0vWrkmRymKZbFI1EDeHQ', 'version_id': 7030199, 'version': '7.3.1',
    'indices': ['ecs-zeek-2019.11.18-000001', 'ecs-zeek-2019.11.21-000004', 'filebeat-suricata-2019.11.18-000001',
    'ecs-zeek-2019.11.19-000002', 'ecs-zeek-2019.11.20-000003'], 'include_global_state': False,
    'metadata': {'taken_by': 'tfplenum_ctrl',
    'taken_because': 'Backup of all related tfplenum indices which includes ecs-*,endgame-*,filebeat-*, and winlogbeat-*.'},
    'state': 'SUCCESS', 'start_time': '2019-11-22T21:12:17.561Z', 'start_time_in_millis': 1574457137561, 'end_time': '2019-11-22T21:12:28.532Z',
    'end_time_in_millis': 1574457148532, 'duration_in_millis': 10971, 'failures': [], 'shards': {'total': 21, 'failed': 0, 'successful': 21}}]
    """
    service_ip = retrieve_service_ip_address("elasticsearch")
    mng = ElasticsearchManager(service_ip, conn_mng)
    return jsonify(mng.get_snapshots())


def _get_next_snaphot_name(snapshots: List[Dict]) -> str:
    if len(snapshots) == 0:
        return "tfplenum_1"

    count = 0
    for snapshot in snapshots:
        tokens = snapshot['snapshot'].split("_")
        if tokens[0] == "tfplenum":
            number = int(tokens[1])
            if number > count:
                count = number
    return "tfplenum_{}".format(count + 1)


@app.route('/api/take_elasticsearch_snapshot', methods=['GET'])
def take_elasticsearch_snapshot():
    service_ip = retrieve_service_ip_address("elasticsearch")
    mng = ElasticsearchManager(service_ip, conn_mng)
    ret_val = mng.get_snapshots()
    snapshot_name = _get_next_snaphot_name(ret_val)
    snapshot = mng.take_snapshot(snapshot_name)
    check_snapshot_status.delay(service_ip, snapshot_name)
    return jsonify(snapshot)

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
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
        return ERROR_RESPONSE
    return ERROR_RESPONSE


@app.route('/api/apply_elastic_deploy', methods=['GET'])
def apply_es_deploy_rest():

    if apply_es_deploy():
        return OK_RESPONSE

    return ERROR_RESPONSE
