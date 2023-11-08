from typing import Dict, List, Union

from app.middleware import login_required_roles, operator_required
from app.models.common import (COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE)
from app.models.nodes import Node
from app.models.pcap import PcapModel, ReplayPCAPModel
from app.service.pcap_service import PCAPService, PCAPServiceResponse
from app.utils.constants import NODE_TYPES
from app.utils.namespaces import POLICY_NS
from flask import Response, request
from flask_restx import Resource
from werkzeug.datastructures import FileStorage


from app.persistence.pcap import PcapRepo
from app.models.job_id import JobIDModel

upload_parser = POLICY_NS.parser()
upload_parser.add_argument(
    "upload_file", location="files", type=FileStorage, required=True
)


def pcap_error(service_response: Union[PCAPServiceResponse, str], code: int = 500) -> Response:
    """
    Creates an error response for a PCAP service response or an error string.

    Args:
        service_response (PCAPServiceResponse or str): The service response as a PCAPServiceResponse or an error string.
        code (int, optional): The HTTP status code to use for the response. Defaults to 500.

    Returns:
        Response: The error response.
    """

    error_dict = {"error_message": ""}

    if isinstance(service_response, str):
        error_dict["error_message"] = service_response
    if isinstance(service_response, PCAPServiceResponse):
        error_dict["error_message"] = "".join(error.msg + "\n" for error in service_response.errors)
        error_dict["warnings"] = "".join(warning.msg + "\n" for warning in service_response.warnings)
    return error_dict, code

def pcap_success(msg: Union[str, Dict, List], code: int = 200) -> Response:
    if isinstance(msg, str):
        return {"success_message": msg}, code
    return msg, code

def pcap_response(service_response: PCAPServiceResponse, success_msg: Union[str, Dict, List] = None, success_code: int = 200, error_code: int = 500) -> Response:
    if isinstance(service_response, PCAPServiceResponse) and service_response.success:
        return pcap_success(success_msg, success_code)
    return pcap_error(service_response, error_code)

@POLICY_NS.route("/pcaps")
class ListPcaps(Resource):
    @POLICY_NS.doc(
        description="Gets the currently uploaded PCAPs on the server and displays the metadata."
    )
    @POLICY_NS.response(200, "PcapModel", [PcapModel.DTO])
    @login_required_roles()
    def get(self) -> Response:
        service = PCAPService(PcapRepo())
        service_response: PCAPServiceResponse
        pcaps: List[PcapModel]
        service_response, pcaps = service.get_pcaps_from_directory()

        if not service_response.success:
            return pcap_error(service_response, 422)
        return pcap_success(service.models_to_dict(pcaps))



@POLICY_NS.route("/pcap/upload")
class UploadPcap(Resource):
    @POLICY_NS.doc(
        description="Uploads a PCAP to the controller which can then be used to replay against Sensors."
    )
    @POLICY_NS.expect(upload_parser)
    @POLICY_NS.response(200, "SuccessMessage: PCAP File Uploaded", COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(400, "ErrorMessage: No File In Request", COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(422, "ErrorMessage: Not Valid PCAP File", COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self) -> Response:
        if ('upload_file' not in request.files or not request.files['upload_file'].filename):
            return pcap_response("No file in request.", error_code=400)

        filename = request.files['upload_file'].filename
        data = request.files['upload_file'].read()

        service = PCAPService(PcapRepo())
        service_response: PCAPServiceResponse
        service_response = service.upload_pcap(filename, data)
        return pcap_response(service_response, f"Successfully uploaded {filename}.", error_code=422)

@POLICY_NS.route("/pcap/<pcap_name>")
class DeletePcap(Resource):
    @POLICY_NS.doc(description="Delets a PCAP by the name passed in.")
    @POLICY_NS.response(200, "SuccessMessage: PCAP Deleted", COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(500, "ErrorMessage: Failed to Delete PCAP", COMMON_ERROR_MESSAGE)
    @operator_required
    def delete(self, pcap_name: str) -> Response:
        service = PCAPService(PcapRepo())
        service_response: PCAPServiceResponse = service.delete_pcap(pcap_name)
        return pcap_response(service_response, f"Successfully deleted {pcap_name}.")

@POLICY_NS.route("/pcap/replay")
class ReplayPcapCtrl(Resource):
    @POLICY_NS.expect(ReplayPCAPModel.DTO)
    @POLICY_NS.doc(description="Replays a PCAP against the specified sensor.")
    @POLICY_NS.response(200, "SuccessMessage: PCAP Replay Job Started", JobIDModel.DTO)
    @operator_required
    def post(self) -> Response:
        service = PCAPService(PcapRepo())
        jid = service.replay(request.get_json())
        return pcap_success(jid.to_dict())


@POLICY_NS.route("/sensor/info")
class SensorInfo(Resource):
    @login_required_roles()
    def get(self) -> Response:
        kit_nodes = Node.load_all_from_db()  # type: List[Node]
        ret_val = []

        for node in kit_nodes:
            if node.node_type == NODE_TYPES.sensor.value:
                host_simple = {
                    "hostname": node.hostname,
                    "management_ip": str(node.ip_address),
                    "mac": node.mac_address,
                }
                ret_val.append(host_simple)

        return pcap_success(ret_val)
