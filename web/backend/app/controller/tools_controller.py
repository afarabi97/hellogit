import base64
import json
import os
import shutil
import tempfile
import zipfile
from datetime import datetime
from glob import glob
from pathlib import Path
from typing import Dict

import kubernetes.client
import yaml
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.middleware import controller_maintainer_required, login_required_roles
from app.models import scale
from app.models.common import (COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE)
from app.models.nodes import Node
from app.models.settings.kit_settings import KitSettingsForm
from app.models.tools import (COMMON_TOOLS_RETURNS, InitialDeviceStatesModel,
                              NetworkDeviceStateModel, NetworkInterfaceModel,
                              NewPasswordModel, CurrentTimeModel)
from app.service.elastic_service import (apply_es_deploy,
                                         check_elastic_license,
                                         get_elasticsearch_license)
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.collections import mongo_catalog_saved_values
from app.utils.connection_mngs import FabricConnection, KubernetesWrapper
from app.utils.constants import TFPLENUM_CONFIGS_PATH
from app.utils.logging import logger
from app.utils.utils import PasswordValidator
import shlex
from app.utils.namespaces import TOOLS_NS

from flask import Response, request
from flask_restx import Resource
from kubernetes.client.models.v1_service_list import V1ServiceList
from kubernetes.client.rest import ApiException
from paramiko.ssh_exception import AuthenticationException
from werkzeug.datastructures import FileStorage
from werkzeug.security import safe_join
from werkzeug.utils import secure_filename

_JOB_NAME = "tools"
MESSAGETYPE_PREFIX = "documentation upload" # type: str


upload_parser = TOOLS_NS.parser()
upload_parser.add_argument(
    "upload_file", location="files", type=FileStorage, required=True
)
upload_parser.add_argument(
    "space_name",
    type=str,
    required=True,
    location="form",
    help="The name of the confluence space or some other arbirtrary name.",
)


def update_password(config, password):
    config.password = password
    config.save_to_db()


def validate_es_license_json(license: dict) -> bool:
    keys = [
        "uid",
        "type",
        "issue_date_in_millis",
        "expiry_date_in_millis",
        "issued_to",
        "issuer",
        "signature",
        "start_date_in_millis"
    ]
    return license.get("license", None) is not None and all(
        x in license["license"].keys() for x in keys
    )


def retrieve_service_ip_address(service_name: str) -> str:
    with KubernetesWrapper() as kube_apiv1:
        svcs = kube_apiv1.list_namespaced_service(
            "default")  # type: V1ServiceList
        for svc in svcs.items:  # type: V1Service
            if svc.metadata.name == service_name:
                return svc.status.load_balancer.ingress[0].ip

    raise KubernetesError("Failed to find passed in Kubernetes service ip.")

class AmmendedPasswordNotFound(Exception):
    pass


class KubernetesError(Exception):
    pass


class RemoteNetworkDevice(object):
    def __init__(self, node, device):
        self._node = node
        self._device = device

    def device_validation(self, shell: FabricConnection) -> list:
        cmd = 'basename -a /sys/class/net/*'
        result = shell.run(cmd).stdout.split("\n")
        return result

    def _is_link_up(self, shell: FabricConnection) -> bool:
        cmd = 'ethtool {} | grep "Link detected: yes"'.format(self._device)
        print(cmd)
        result = shell.run(cmd, warn=True)
        return result.return_code == 0

    def set_up(self):
        with FabricConnection(self._node) as shell:
            result = shell.run(
                "bash -c 'ip link set {} up'".format(self._device))
            link_up = self._is_link_up(shell)
            if result.return_code == 0:
                return NetworkDeviceStateModel(
                    self._node, self._device, "up", link_up
                ).to_dict()
            else:
                return {}

    def down(self):
        with FabricConnection(self._node) as shell:
            result = shell.run(
                "bash -c 'ip link set {} down'".format(self._device))
            link_up = self._is_link_up(shell)
            if result.return_code == 0:
                return NetworkDeviceStateModel(
                    self._node, self._device, "down", link_up
                ).to_dict()
            else:
                return {}

    def get_state(self):
        with FabricConnection(self._node) as shell:
            result = shell.run(
                "bash -c 'ip address show {} up'".format(self._device))
            link_up = self._is_link_up(shell)
            if result.return_code == 0:
                if result.stdout == "":
                    return NetworkDeviceStateModel(
                        self._node, self._device, "down", link_up
                    ).to_dict()
                else:
                    return NetworkDeviceStateModel(
                        self._node, self._device, "up", link_up
                    ).to_dict()
            else:
                return {}



@TOOLS_NS.route("/controller/datetime")
class CurrentTime(Resource):
    @TOOLS_NS.response(200, "CurrentTimeModel", CurrentTimeModel.DTO)
    @TOOLS_NS.response(500, "Empty 500 return.")
    @TOOLS_NS.doc(description="Gets the Current time of the controller.")
    @login_required_roles()
    def get(self) -> Response:
        timezone_stdout, ret_val = run_command2(
            'timedatectl | grep "Time zone:"', use_shell=True
        )
        if ret_val != 0:
            return ERROR_RESPONSE

        pos = timezone_stdout.find(":")
        pos2 = timezone_stdout.find("(", pos)
        timezone = timezone_stdout[pos + 2: pos2 - 1]

        date_stdout, ret_val = run_command2(
            'date +"%m-%d-%Y %H:%M:%S"', use_shell=True)
        if ret_val != 0:
            return ERROR_RESPONSE

        return CurrentTimeModel(timezone, date_stdout.replace("\n", "")).to_dict()


@TOOLS_NS.route("/change-kit-password")
class ChangeKitPassword(Resource):

    @TOOLS_NS.doc(description="Changes the Kit's ssh root/password on all nodes.")
    @TOOLS_NS.expect(NewPasswordModel.DTO)
    @TOOLS_NS.response(200, "Success Message", COMMON_SUCCESS_MESSAGE)
    @TOOLS_NS.response(403, "Authentication failure on Node", Node.DTO)
    @TOOLS_NS.response(404, "Kit config not found.", COMMON_ERROR_MESSAGE)
    @TOOLS_NS.response(409, "Password has already been used. You must try another password.", COMMON_ERROR_MESSAGE)
    @TOOLS_NS.response(500, "Internal Server Error", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        raw_password = TOOLS_NS.payload["root_password"]
        errors = PasswordValidator.validate(raw_password)

        if errors:
            return {"error_message": f'The password failed {len(errors)} validation rules: {", ".join(errors)}'}, 400 # type: ignore

        current_config = KitSettingsForm.load_from_db()

        if not current_config:
            return {"error_message": "Couldn't find kit configuration."}, 404 # type: ignore

        model = NewPasswordModel(raw_password)
        encoded_password = base64.b64encode(model.root_password.encode()).decode()
        shell_safe_password = shlex.quote(encoded_password)
        for node in Node.load_stateful_dip_nodes_from_db():
            try:
                with FabricConnection(str(node.ip_address), use_ssh_key=True) as shell:
                    result  = shell.run(
                        f"echo {shell_safe_password} | base64 --decode | passwd --stdin root",
                        warn=True,
                        hide='stdout'
                    )
                    if result.return_code != 0:
                        _result = shell.run("journalctl SYSLOG_IDENTIFIER=pwhistory_helper --since '10s ago'")
                        if _result.stdout.count("\n") == 2:
                            return {"error_message": "Password has already been used. You must try another password."}, 409 # type: ignore
                        return {"error_message": "Internal Server Error"}, 500 # type: ignore
                    else :
                        result  = shell.run(
                            f"echo {shell_safe_password} | base64 --decode | passwd --stdin assessor",
                            warn=True,
                            hide='stdout'
                        )
                        if result.return_code != 0:
                            _result = shell.run("journalctl SYSLOG_IDENTIFIER=pwhistory_helper --since '10s ago'")
                            if _result.stdout.count("\n") == 2:
                                return {"error_message": "Password has already been used. You must try another password."}, 409 # type: ignore
                            return {"error_message": "Internal Server Error"}, 500 # type: ignore

            except AuthenticationException:
                return { "error_message": "Authentication failure. Check the ssh key on the controller." }, 403 # type: ignore

        update_password(current_config, model.root_password)
        return {"success_message": "Successfully changed the password of your Kit!"} # type: ignore


@TOOLS_NS.route("/documentation/upload")
class UpdateDocs(Resource):
    @TOOLS_NS.doc(
        description="Uploads new confluence documentation placing it into the navigation bar."
    )
    @TOOLS_NS.expect(upload_parser)
    @TOOLS_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @TOOLS_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        notification = NotificationMessage(
            role=MESSAGETYPE_PREFIX
        )
        if "upload_file" not in request.files:
            return {
                "error_message": "Failed to upload file. No file was found in the request."
            }, 400

        if Path(request.files["upload_file"].filename).suffix != ".zip":
            return {
                "error_message": "Failed to upload file. Files must end with the .zip extension."
            }, 400

        if (
            "space_name" not in request.form
            or request.form["space_name"] is None
            or request.form["space_name"] == ""
        ):
            return {"error_message": "Space name is required."}, 400

        if "\x00" in request.form["space_name"]:
            return {
                "error_message": "Invalid space name: The null character is prohibited."
            }, 400

        with tempfile.TemporaryDirectory() as upload_path:  # type: str
            tmp_archive_path = (
                upload_path
                + "/"
                + secure_filename(request.files["upload_file"].filename)
            )
            request.files["upload_file"].save(tmp_archive_path)

            new_docs_path = safe_join(
                "/var/www/html/docs", request.form["space_name"])
            if new_docs_path is None:
                return {
                    "error_message": "The Space Name passed in is of an invalid value that cannot be safely joined."
                }, 400

            shutil.rmtree(new_docs_path, ignore_errors=True)
            Path(new_docs_path).mkdir(parents=True, exist_ok=False)

            with zipfile.ZipFile(tmp_archive_path) as zip_ref:
                zip_ref.extractall(new_docs_path)

        notification.set_status(status=NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
        return {"success_message": "Successfully updated confluence documentation!"}


@TOOLS_NS.route("/es_license")
class ElasticLicense(Resource):
    @TOOLS_NS.doc(description="Update Elasticsearch license.")
    @TOOLS_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @TOOLS_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @TOOLS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def put(self) -> Response:
        license = request.get_json()
        current_license = get_elasticsearch_license()

        if not validate_es_license_json(license) or not license["license"].get(
            "cluster_licenses", None
        ):
            return {"error_message": "File is not valid Elastic license"}, 400
        if (
            datetime.fromtimestamp(
                license["license"]["expiry_date_in_millis"] / 1000)
            < datetime.now()
        ):
            return {"error_message": "Elastic license has expired"}, 400
        for lic in license["license"]["cluster_licenses"]:
            if not validate_es_license_json(lic):
                return {"error_message": "File is not valid Elastic license"}, 400

        json_string = json.dumps(license, separators=(",", ":"))
        license_prefix = "eck-license"
        secret_name = "{}-{}".format(license_prefix,
                                     datetime.now().strftime("%s"))
        namespace = "elastic-system"
        body = kubernetes.client.V1Secret()
        body.api_version = "v1"
        body.data = {
            "license": base64.b64encode(json_string.encode("utf-8")).decode("utf-8")
        }
        body.kind = "Secret"
        body.type = "Opaque"
        body.metadata = {
            "name": secret_name,
            "labels": {"license.k8s.elastic.co/scope": "operator"},
        }
        with KubernetesWrapper() as kube_apiv1:
            try:
                kube_apiv1.create_namespaced_secret(namespace, body)
                old_secrets = kube_apiv1.list_namespaced_secret(namespace)
                for secret in old_secrets.items:
                    if (
                        secret.metadata.name.startswith(license_prefix)
                        and secret.metadata.name != secret_name
                    ):
                        kube_apiv1.delete_namespaced_secret(
                            secret.metadata.name, namespace
                        )
            except ApiException as e:
                logger.exception(e)
                return {
                    "error_message": "Something went wrong saving the Elastic license. See the logs."
                }, 500
        check_elastic_license.delay(current_license=current_license)
        return {
            "success_message": "Successfully uploaded Elastic License. It will take a few minutes for Elastic to show. Check notifications for updates."
        }

    @TOOLS_NS.doc(description="Get Elasticsearch license status.")
    @TOOLS_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @TOOLS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def get(self) -> Response:
        try:
            return get_elasticsearch_license(), 200
        except Exception as e:
            logger.exception(e)
            return {
                "error_message": "Something went wrong getting the Elastic license.\nSee the logs."
            }, 500


@TOOLS_NS.route("/spaces")
class GetSpaces(Resource):
    @TOOLS_NS.doc(
        description="Gets all the folder names stored in /var/www/html/docs/. \
                               This directory stores raw HTML files for documentation purposes. \
                               Also, anything showing in this list will appear on the navbar on the UI."
    )
    @TOOLS_NS.response(200, "SpacesList", COMMON_TOOLS_RETURNS["spaces"])
    @login_required_roles()
    def get(self) -> Response:
        directories = glob("/var/www/html/docs/*")
        all_spaces = [os.path.basename(dir) for dir in directories]
        try:
            return all_spaces
        except Exception:
            return []


@TOOLS_NS.route("/<node>/set-interface-state/<device>/<state>")
class ChangeStateOfRemoteNetworkDevice(Resource):
    @TOOLS_NS.doc(
        description="Shuts down the NIC device or turns it back on. \
                               Passing a up value will bring the interface back \
                               into an up state while passing down will bring the interface down. \
                               Note: This can cause Suricata, Zeek or Arkime pods to crash while \
                               the interface is shutdown on the Sensor.",
        params={
            "node": "The FQDN or hostname of the node.",
            "device": "The interface to toggle.",
            "state": "The current state of the NIC device. Valid values are up or down.",
        },
    )
    @TOOLS_NS.response(200, "NetworkDeviceState", NetworkDeviceStateModel.DTO)
    @TOOLS_NS.response(500, "ErrorMessage: Something went wrong", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def put(self, node: str, device: str, state: str) -> Response:
        device = RemoteNetworkDevice(node, device)
        device_list = RemoteNetworkDevice.device_validation(self)
        if device in device_list:
            pass
        else:
            return { "error_message": "An invalid input was provided. Input does not match list of provided interfaces." }, 400

        if state == "up":
            result = device.set_up()
            if result:
                return result
            else:
                return { "error_message": "Something went wrong. Check logs /var/log/tfplenum/ for more details." }, 500

        if state == "down":
            result = device.down()
            if result:
                return result
            else:
                return { "error_message": "Something went wrong. Check logs /var/log/tfplenum/ for more details." }, 500

        return { "error_message": "Something went wrong. Check logs /var/log/tfplenum/ for more details." }, 500


@TOOLS_NS.route("/monitoring-interfaces")
class MonitoringInterfaces(Resource):
    @TOOLS_NS.doc(description="Retrieves a list of node hostnames with their associated network interfaces.")
    @TOOLS_NS.response(200, "InitialDeviceStates", [InitialDeviceStatesModel.DTO])
    @login_required_roles()
    def get(self) -> Response:
        nodes = {}
        applications = ["arkime", "zeek", "suricata"]

        documents = list(
            mongo_catalog_saved_values().find(
                {"application": {"$in": applications}})
        )
        for document in documents:
            hostname = document["values"]["node_hostname"]
            interfaces = document["values"]["interfaces"]
            try:
                for interface in interfaces:
                    nodes[hostname].add(interface)
            except KeyError:
                nodes[hostname] = set(interfaces)

        result = []
        for hostname, interfaces in nodes.items():
            inital_states = InitialDeviceStatesModel(hostname)
            for interface in interfaces:
                device = RemoteNetworkDevice(hostname, interface)
                try:
                    ret_val = device.get_state()
                    state = ret_val["state"]
                    link_up = ret_val["link_up"]
                    inital_states.add_interface(
                        NetworkInterfaceModel(interface, state, link_up)
                    )
                except KeyError:
                    inital_states.add_interface(
                        NetworkInterfaceModel(interface))
                result.append(inital_states.to_dict())

        return result


@TOOLS_NS.route("/ifaces/<hostname>")
class AllIfaces(Resource):
    @TOOLS_NS.doc(description="Retrieves a list of network interfaces with their states.")
    @TOOLS_NS.response(200, "InitialDeviceStates", [NetworkInterfaceModel.DTO])
    def get(self, hostname: str) -> Response:
        node = Node.load_from_db_using_hostname(hostname)
        result = []
        for iface in node.deviceFacts["interfaces"]:
            device = RemoteNetworkDevice(hostname, iface["name"])
            ret_val = device.get_state()
            state = ret_val["state"]
            link_up = ret_val["link_up"]
            result.append(
                NetworkInterfaceModel(iface["name"], state, link_up).to_dict()
            )
        return result


@TOOLS_NS.route("/elastic/deploy")
class ElasticDeploy(Resource):
    @TOOLS_NS.doc(description="Load elastic deploy into mongo database.")
    @TOOLS_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @TOOLS_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def get(self) -> Response:
        """
        Save Elastic deploy yaml into mongo
        """
        notification = NotificationMessage(role=_JOB_NAME)
        deploy_path = "{}/elasticsearch/deploy.yml".format(
            TFPLENUM_CONFIGS_PATH)
        override = request.args.get("override", default=False, type=bool)

        try:
            if override:
                scale.delete_many()
            deploy_config = scale.read_many()
            if override == False and len(deploy_config) > 0:
                return {
                    "error_message": "Deploy config already exists use ?override=1 to reload it"
                }, 400
            if override or (override == False and len(deploy_config) == 0):
                with open(deploy_path, "r") as f:
                    config = f.read()
                config_yaml = yaml.safe_load_all(config)
                for d in config_yaml:
                    scale.create(d)
            return {"success_message": "Deploy config successfully loaded."}
        except Exception as e:
            logger.exception(e)
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(str(e))
            notification.post_to_websocket_api()
            return {"error_message": str(e)}, 400

    @TOOLS_NS.doc(description="Apply elastic deploy to kubernetes.")
    @TOOLS_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @TOOLS_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        """
        Read Elastic deploy from mongo and apply to kubernetes
        """
        if apply_es_deploy():
            return OK_RESPONSE

        return ERROR_RESPONSE
