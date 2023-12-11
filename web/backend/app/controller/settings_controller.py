"""
Main module for handling all of the Kit Configuration REST calls.
"""
import ssl
from typing import Dict

from app.middleware import controller_admin_required, login_required_roles
from app.persistence import DBModelNotFound
from app.models import PostValidationError
from app.models.common import (COMMON_ERROR_DTO, COMMON_ERROR_MESSAGE,
                               COMMON_MESSAGE)
from app.models.job_id import JobIDModel
from app.models.settings.esxi_settings import EsxiSettingsForm
from app.models.settings.general_settings import GeneralSettingsForm
from app.models.settings.kit_settings import KitSettingsForm
from app.models.settings.mip_settings import MipSettingsForm
from app.service.node_service import execute, send_notification
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.constants import DEPLOYMENT_JOBS
from app.utils.logging import logger
from app.utils.namespaces import SETINGS_NS
from flask import Response
from flask_restx import Resource
from marshmallow.exceptions import ValidationError
from pyVim.connect import Connect
from pyVmomi import vim

_JOB_NAME = "Settings"


def get_obj(content, vimtype, name=None):
    return [
        item
        for item in content.viewManager.CreateContainerView(
            content.rootFolder, [vimtype], recursive=True
        ).view
    ]


def _test_esxi_client(esxi_settings: EsxiSettingsForm) -> dict:
    try:
        context = ssl._create_unverified_context()
        service_instance = Connect(
            host=str(esxi_settings.ip_address),
            user=str(esxi_settings.username),
            pwd=str(esxi_settings.password),
            sslContext=context,
            connectionPoolTimeout=20,
        )
        content = service_instance.RetrieveContent()
        vmware_data = {
            "datastores": None,
            "portgroups": None,
            "clusters": None,
            "datacenters": None,
            "folders": None,
        }
        clusters = []
        datastores = []
        datacenters = []
        folders = []
        portgroups = []
        isVcenter = False

        if content:
            if (
                "VirtualCenter" in content.about.licenseProductName
                or "vCenter" in content.about.name
            ):
                isVcenter = True

            dcs = [
                entity
                for entity in content.rootFolder.childEntity
                if hasattr(entity, "vmFolder")
            ]  # type: List[vim.Datacenter]

            for dc in dcs:
                stores = None
                vmFolders = None
                try:
                    stores = dc.datastore  # type: List[vim.Datastore]
                    vmFolders = dc.vmFolder.childEntity
                    datacenters.append(dc.name)
                    if stores:
                        for ds in stores:
                            datastores.append(ds.name)
                    if vmFolders:
                        for folder in vmFolders:
                            _get_esxi_client_folders(folders=folders, folder=folder, folder_name_extended="")
                except Exception as exc:
                    logger.error(str(exc))
                    pass
            cluster_resources = get_obj(
                content, vim.ComputeResource
            )  # type: List[vim.ClusterComputeResource]
            for cluster in cluster_resources:
                clusters.append(cluster.name)
            pgs = get_obj(
                content, vim.Network
            )  # type: List[vim.dvs.DistributedVirtualPortgroup]
            for portgroup in pgs:
                portgroups.append(portgroup.name)

            folders.sort()
            portgroups.sort()
            vmware_data["datastores"] = datastores
            vmware_data["portgroups"] = portgroups
            if isVcenter:
                vmware_data["clusters"] = clusters
                vmware_data["datacenters"] = datacenters
                vmware_data["folders"] = folders

            return vmware_data, 200
    except vim.fault.HostConnectFault as exc:
        logger.exception(exc)
        return {
            "error_message": "404 Not Found Unable to connect to hostname or ip address."
        }, 404
    except vim.fault.InvalidLogin as exc:
        logger.error(str(exc))
        return {
            "error_message": "Cannot complete login due to an incorrect user name or password."
        }, 400
    except Exception as exc:
        print(str(exc))
        try:
            logger.error(str(exc))
            return {"error_message": str(exc)}, 400
        except AttributeError:
            pass
        logger.error(str(exc))
        return {"error_message": str(exc)}, 400

def _get_esxi_client_folders(folders: list, folder, folder_name_extended: str) -> None:
    if isinstance(folder, vim.Folder):
        folder_name_extended = folder_name_extended + folder.name
        folders.append(folder_name_extended)
        if folder.childEntity:
            folder_name_extended = folder_name_extended + "/"
            for next_folder in folder.childEntity:
                _get_esxi_client_folders(folders=folders, folder=next_folder, folder_name_extended=folder_name_extended)


@SETINGS_NS.route("/general")
class GeneralSettings(Resource):
    def _execute_job(self) -> Dict:
        job = execute.delay(exec_type=DEPLOYMENT_JOBS.setup_controller)
        return JobIDModel(job).to_dict()

    @SETINGS_NS.response(200, "GeneralSettingsForm Model", GeneralSettingsForm.DTO)
    @SETINGS_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @login_required_roles()
    def get(self) -> Response:
        try:
            settings = GeneralSettingsForm.load_from_db()
            if settings:
                return settings.to_dict(), 200
        except DBModelNotFound:
            return { "error_message": "DBModelNotFound" }, 400

    @SETINGS_NS.expect(GeneralSettingsForm.DTO)
    @SETINGS_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @SETINGS_NS.response(400, "Error Model", COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self) -> Response:
        notification = NotificationMessage(role=_JOB_NAME.lower())
        try:
            general_settings = GeneralSettingsForm.load_from_request(SETINGS_NS.payload)
            general_settings.save_to_db()
            notification.set_and_send(message="General Settings Saved", status=NotificationCode.COMPLETED.name)
            send_notification()
        except ValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return e.normalized_messages(), 400
        except PostValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": [str(e)]}, 400

        return self._execute_job()


@SETINGS_NS.route("/kit")
class KitSettings(Resource):
    def _execute_job(self) -> Dict:
        job = execute.delay(
            exec_type=DEPLOYMENT_JOBS.setup_controller_kit_settings)
        return JobIDModel(job).to_dict()

    @SETINGS_NS.response(200, "KitSettingsForm Model", KitSettingsForm.DTO)
    @SETINGS_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    def get(self) -> Response:
        try:
            settings = KitSettingsForm.load_from_db()  # type: KitSettingsForm
            if settings:
                return settings.to_dict()
        except DBModelNotFound:
            return {"error_message": "Kit settings form not found"}, 400


    @SETINGS_NS.expect(KitSettingsForm.DTO)
    @SETINGS_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @SETINGS_NS.response(400, "Error Model", COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self) -> Response:
        notification = NotificationMessage(role=_JOB_NAME.lower())
        try:
            kit_settings = KitSettingsForm.load_from_request(
                SETINGS_NS.payload)
            kit_settings.save_to_db()
            notification.set_and_send(
                message="Kit Settings Saved", status=NotificationCode.COMPLETED.name
            )
        except ValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return e.normalized_messages(), 400
        except PostValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": [str(e)]}, 400

        return self._execute_job()


@SETINGS_NS.route("/mip")
class MipSettings(Resource):
    @SETINGS_NS.response(200, "MipSettingsForm Model", MipSettingsForm.DTO)
    @SETINGS_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    def get(self) -> Response:
        try:
            settings = MipSettingsForm.load_from_db()
            if settings:
                return settings.to_dict()
        except DBModelNotFound:
            return {"error_message": "MIP settings not found"}, 400

    @SETINGS_NS.expect(MipSettingsForm.DTO)
    @SETINGS_NS.response(400, "Error Model", COMMON_ERROR_DTO)
    @SETINGS_NS.response(200, "Message", COMMON_MESSAGE)
    @controller_admin_required
    def post(self) -> Response:
        notification = NotificationMessage(role=_JOB_NAME.lower())
        try:
            mip_settings = MipSettingsForm.load_from_request(
                SETINGS_NS.payload)
            mip_settings.save_to_db()
            notification.set_and_send(
                message="MIP Settings Saved", status=NotificationCode.COMPLETED.name
            )
            return {"success_message": "MIP Settings Saved"}, 200
        except ValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"validation": e.normalized_messages()}, 400
        except PostValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": [str(e)]}, 400


@SETINGS_NS.route("/esxi")
class EsxiSettings(Resource):
    @SETINGS_NS.response(400, "Error Model", COMMON_ERROR_DTO)
    @SETINGS_NS.response(200, "EsxiSettingsForm Model", EsxiSettingsForm.DTO)
    @login_required_roles()
    def get(self) -> Response:
        try:
            settings = EsxiSettingsForm.load_from_db()
            if settings:
                return settings.to_dict()
            return {}
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound"}, 400

    @SETINGS_NS.expect(EsxiSettingsForm.DTO)
    @SETINGS_NS.response(200, "Success", bool)
    @SETINGS_NS.response(400, "Error Model", COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self) -> Response:
        notification = NotificationMessage(role=_JOB_NAME.lower())
        try:
            esxi_settings = EsxiSettingsForm.load_from_request(
                SETINGS_NS.payload)
            esxi_settings.save_to_db()
            notification.set_and_send(
                message="VMware Settings Saved", status=NotificationCode.COMPLETED.name
            )
        except ValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return e.normalized_messages(), 400
        except PostValidationError as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            notification.set_and_send(
                message=str(e), status=NotificationCode.ERROR.name
            )
            return {"post_validation": [str(e)]}, 400

        return True, 200


@SETINGS_NS.route("/esxi/test")
class EsxiSettingsTest(Resource):
    @SETINGS_NS.response(200, "EsxiSettingsForm Model", EsxiSettingsForm.DTO)
    @login_required_roles()
    def get(self) -> Response:
        try:
            return EsxiSettingsForm.load_from_db()
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound"}, 400

    @SETINGS_NS.expect(EsxiSettingsForm.DTO)
    @SETINGS_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @SETINGS_NS.response(400, "Error Model", COMMON_ERROR_DTO)
    @SETINGS_NS.response(422, "Message", COMMON_MESSAGE)
    @controller_admin_required
    def post(self) -> Response:
        try:
            esxi_settings = EsxiSettingsForm.load_from_request(
                SETINGS_NS.payload)
        except ValidationError as e:
            return e.normalized_messages(), 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound"}, 400

        return _test_esxi_client(esxi_settings)
