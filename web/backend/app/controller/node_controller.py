from typing import Dict, List

from app.middleware import controller_admin_required, login_required_roles
from app.models import DBModelNotFound, PostValidationError
from app.models.common import COMMON_ERROR_DTO, COMMON_ERROR_MESSAGE, JobID
from app.models.nodes import KIT_SETUP_NS, Node, NodeJob
from app.models.settings.kit_settings import (GeneralSettingsForm,
                                              KitSettingsForm)
from app.models.settings.mip_settings import MipSettingsForm
from app.service.catalog_service import delete_helm_apps, get_node_apps
from app.service.job_service import cancel_job, check_gather_device_facts_job
from app.service.node_service import (execute, gather_device_facts,
                                      get_all_nodes_with_jobs, refresh_kit,
                                      send_notification,
                                      update_device_facts_job)
from app.service.vpn_service import VpnService
from app.utils.collections import mongo_catalog_saved_values, mongo_node
from app.utils.constants import (DEPLOYMENT_JOBS, DEPLOYMENT_TYPES, JOB_CREATE,
                                 JOB_DEPLOY, JOB_PROVISION, JOB_REMOVE,
                                 MAC_BASE, NODE_TYPES, PXE_TYPES)
from flask import Response, send_file
from flask_restx import Resource
from marshmallow.exceptions import ValidationError
from randmac import RandMac

NAMESPACE = "default"


@KIT_SETUP_NS.route("/nodes")
class NodesCtrl(Resource):

    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(200, 'Node Model', Node.DTO)
    @controller_admin_required
    def get(self) -> Response:
        try:
            return get_all_nodes_with_jobs()
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400


@KIT_SETUP_NS.route("/node/<hostname>")
class NodeCtrl(Resource):

    def _remove_node(self, node: Node) -> Dict:
        job = execute.delay(node=node, stage=JOB_REMOVE,
                            exec_type=DEPLOYMENT_JOBS.remove_node)
        return JobID(job).to_dict()

    def _get_settings(self):
        return GeneralSettingsForm.load_from_db()

    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(200, 'Node Model', Node.DTO)
    @controller_admin_required
    def get(self, hostname: str) -> Response:
        try:
            settings = self._get_settings()  # type: Dict
            if not hostname.endswith(settings.domain):
                hostname = f"{hostname}.{settings.domain}"
            node = Node.load_from_db_using_hostname_with_jobs(
                hostname)  # type: dict
            if node == {}:
                return {"error_message": "Node not found."}, 404
            if node:
                return node
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400
        return {"error_message": "Unknown error"}, 500

    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_admin_required
    def delete(self, hostname: str) -> Response:
        settings = GeneralSettingsForm.load_from_db()  # type: Dict
        if not hostname.endswith(settings.domain):
            hostname = f"{hostname}.{settings.domain}"
        delete_node = False
        try:
            node = Node.load_from_db_using_hostname(hostname)  # type: Node
            if node:
                node_dict = node.to_dict()
                delete_node = True
                if node.node_type != NODE_TYPES.mip.value:
                    deploy_job = NodeJob.load_job_by_node(
                        node, JOB_DEPLOY)  # type: NodeJob
                    if node.deployment_type == DEPLOYMENT_TYPES.virtual.value or \
                            (deploy_job and (deploy_job.inprogress or deploy_job.complete or deploy_job.error)):
                        installed_apps = get_node_apps(node.hostname)
                        for inst_app in installed_apps:
                            node_dict["deployment_name"] = inst_app["deployment_name"]
                            nodes = [node_dict]
                            delete_helm_apps.delay(application=inst_app["application"], namespace=NAMESPACE, nodes=nodes, from_helm_delete_ctrl=False)
                        # Remove node will delete this
                        delete_node = False
                        return self._remove_node(node), 200

                elif node.node_type == NODE_TYPES.mip.value:
                    return self._remove_node(node), 202

                if delete_node:
                    node.delete()
                    send_notification()
                    return node.to_dict(), 200

        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400
        return {"error_message": "Node not found."}, 500


@KIT_SETUP_NS.route("/node/<hostname>/update")
class NodeUpdateFactsCtrl(Resource):

    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    def put(self, hostname) -> Response:
        try:
            settings = None
            node = Node.load_from_db_using_hostname(hostname)  # type: Node
            if node.node_type != NODE_TYPES.mip.value:
                settings = KitSettingsForm.load_from_db()  # type: KitSettingsForm
            if node.node_type == NODE_TYPES.mip.value:
                settings = MipSettingsForm.load_from_db()  # type: MipSettingsForm
            if settings:
                update_device_facts_job.delay(node, settings)
                return "Update node facts started", 200
        except Exception as exc:
            return {" error_message": str(exc)}, 400
        return {"error_message": "Unknown error"}, 500


@KIT_SETUP_NS.route("/node")
class NewNodeCtrl(Resource):

    def _execute_kickstart_profile_job(self, node: Node) -> Dict:
        job = execute.delay(
            node=node, exec_type=DEPLOYMENT_JOBS.kickstart_profiles)
        return JobID(job).to_dict()

    def _execute_create_virtual_job(self, node: Node) -> Dict:
        job = execute.delay(
            node=node, exec_type=DEPLOYMENT_JOBS.create_virtual)
        return JobID(job).to_dict()

    def _get_settings(self):
        return GeneralSettingsForm.load_from_db()

    @KIT_SETUP_NS.expect(Node.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_admin_required
    def post(self) -> Response:
        try:
            settings = self._get_settings() # type: Dict
            node = Node.load_node_from_request(
                KIT_SETUP_NS.payload)  # type: Node
            if not node.hostname.endswith(settings.domain):
                node.hostname = "{}.{}".format(node.hostname, settings.domain)
            if node.deployment_type == DEPLOYMENT_TYPES.virtual.value:
                node.mac_address = str(RandMac(MAC_BASE, True)).strip("'")
                node.pxe_type = PXE_TYPES.uefi.value
            node.post_validation()
            node.create()

            # Alert websocket to update the table
            send_notification()

        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400

        if node.deployment_type == DEPLOYMENT_TYPES.virtual.value:
            return self._execute_create_virtual_job(node), 200

        return self._execute_kickstart_profile_job(node), 200


@KIT_SETUP_NS.route("/node/<hostname>/vpn")
class NodeVpnCtrl(Resource):

    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(200, 'Node Model', Node.DTO)
    @login_required_roles(['controller-node-state'], True)
    def post(self, hostname: str) -> Response:
        try:
            node = Node.load_from_db_using_hostname(hostname)  # type: Node
            payload = KIT_SETUP_NS.payload
            if payload and node:
                if "vpn_status" in payload:
                    node.vpn_status = payload["vpn_status"]
                    node.save_to_db()
                send_notification()
            return "Updated", 200
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400
        except ValueError:
            return {"error_message": "Invalid State."}, 400


@KIT_SETUP_NS.route("/node/<hostname>/status")
class NodeStateCtrl(Resource):

    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(200, 'Node Model', Node.DTO)
    @login_required_roles(['controller-node-state'], True)
    def post(self, hostname: str) -> Response:
        job_error = False
        job_complete = False
        job_inprogress = False
        job_create = False
        job_provision = False
        job_deploy = False
        try:
            node = Node.load_from_db_using_hostname(hostname)  # type: Node
            payload = KIT_SETUP_NS.payload
            if payload and node:
                job = NodeJob.load_job_by_node(
                    node=node, job_name=payload["name"])  # type: NodeJob
                if "error" in payload and payload["error"]:
                    job_error = True
                elif "complete" in payload and payload["complete"]:
                    job_complete = True
                elif "inprogress" in payload and payload["inprogress"]:
                    job_inprogress = True
                if "name" in payload:
                    if payload["name"] == JOB_CREATE:
                        job_create = True
                    elif payload["name"] == JOB_PROVISION:
                        job_provision = True
                    elif payload["name"] == JOB_DEPLOY:
                        job_deploy = True
                if job:
                    if job_provision and job_inprogress and job.inprogress:
                        job_id = check_gather_device_facts_job(
                            node)  # type: str
                        if job_id:
                            txt = "Provision job {} cancelled by another job.  Check node status on node management page.".format(
                                job_id)
                            cancel_job(job_id, txt)
                    job.set_job_state()
                    if job_error:
                        text = "An error has occurred"
                        if "message" in payload:
                            text = payload["message"]
                        job.set_error(text)
                    if job_complete:
                        job.set_complete()
                    if job_inprogress:
                        if job_provision:
                            settings = KitSettingsForm.load_from_db()  # type: KitSettingsForm
                            if node.node_type == NODE_TYPES.mip.value:
                                settings = MipSettingsForm.load_from_db()  # type: MipSettingsForm
                            gather_device_facts.delay(node, settings)
                        else:
                            job.set_inprogress()
                    send_notification()
            return {"success_message": "Updated"}
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400
        except ValueError:
            return {"error_message": "Invalid state"}, 400


@KIT_SETUP_NS.route("/node/<hostname>/deploy")
class NodeCtrlRebuild(Resource):

    def _execute_kickstart_profile_job(self, node: Node) -> Dict:
        job = execute.delay(node=node, exec_type=DEPLOYMENT_JOBS)
        return JobID(job).to_dict()

    @KIT_SETUP_NS.expect(Node.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @controller_admin_required
    def post(self, hostname: str) -> Response:
        job_id = None
        try:
            kit_settings = KitSettingsForm.load_from_db()  # type: KitSettingsForm
            node = Node.load_from_db_using_hostname(hostname)  # type: Node
            if node and kit_settings:
                job_id = gather_device_facts.delay(node, kit_settings)
                return JobID(job_id).to_dict(), 200
            # Alert websocket to update the table
            send_notification()
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400
        return {"error_message": "Unable to start deployment for {}".format(hostname)}, 500


@KIT_SETUP_NS.route("/node/<hostname>/generate-vpn")
class GenerateVpnConfigCtrl(Resource):

    @KIT_SETUP_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(200, 'Node Model', Node.DTO)
    def get(self, hostname: str) -> Response:
        try:
            results = []
            node = Node.load_from_db_using_hostname(hostname)  # type: Node
            settings = GeneralSettingsForm.load_from_db()  # type: Dict
            vpn_service = VpnService(node, settings)  # type: VpnService
            filename = vpn_service.generate_config()
            if filename:
                return send_file(filename, mimetype="text/plain")
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400


@KIT_SETUP_NS.route("/control-plane")
class ControlPlaneCtrl(Resource):

    def _execute_control_plane_job(self, node: Node) -> Dict:
        job = execute.delay(
            node=node, exec_type=DEPLOYMENT_JOBS.setup_control_plane)
        return JobID(job).to_dict()

    @KIT_SETUP_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @KIT_SETUP_NS.response(200, 'Node Model', Node.DTO)
    def get(self) -> Response:
        try:
            results = []
            nodes = Node.load_control_plane_from_db()  # type: Node
            for node in nodes:
                job_list = []
                jobs = NodeJob.load_jobs_by_node(node)  # type: NodeJob
                for job in jobs:
                    job_list.append(job.to_dict())
                node_json = node.to_dict()
                node_json["jobs"] = job_list
                results.append(node_json)
            return results
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}, 400

    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self) -> Response:
        try:
            mongo_catalog_saved_values().delete_many({})
            mongo_node().delete_many({})
            settings = GeneralSettingsForm.load_from_db()  # type: Dict

            control_plane = {
                "hostname": "control-plane",
                "node_type": NODE_TYPES.control_plane.value,
                "deployment_type": DEPLOYMENT_TYPES.virtual.value,
                "ip_address": settings.controller_interface + 1,
                "pxe_type": PXE_TYPES.uefi.value,
                "mac_address": str(RandMac(MAC_BASE, True)).strip("'"),
                "os_raid": False,
                "boot_drives": ["sda"],
                "data_drives": ["sdb"]
            }
            node = Node.load_node_from_request(control_plane)  # type: Node
            if not node.hostname.endswith(settings.domain):
                node.hostname = "{}.{}".format(node.hostname, settings.domain)
            node.create()

            # Alert websocket to update the table
            send_notification()

        except ValidationError as e:
            return {"error_message": e.normalized_messages()}, 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}
        except DBModelNotFound as e:
            return {"post_validation": [str(e)]}

        return self._execute_control_plane_job(node)


@KIT_SETUP_NS.route("/rebuild")
class KitRefresh(Resource):

    def _refresh_kit(self, new_nodes: List[Node], control_plane: List[Node]):
        job = refresh_kit.delay(
            nodes=new_nodes, new_control_plane=control_plane)
        return JobID(job).to_dict()

    def post(self) -> Response:
        cp = Node.load_control_plane_from_db()  # type: List[Node]
        nodes = Node.load_all_servers_sensors_from_db()  # type: List[Node]


        return self._refresh_kit(new_nodes=nodes, control_plane=cp)
