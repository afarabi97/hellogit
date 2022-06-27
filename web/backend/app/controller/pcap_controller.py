from datetime import datetime
from pathlib import Path
from typing import Dict, List

from app.middleware import operator_required
from app.models.common import (COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE,
                               JobID)
from app.models.nodes import Node
from app.models.pcap import PcapModel
from app.models.ruleset import PCAPMetadata, PCAPReplayModel
from app.models.settings.kit_settings import KitSettingsForm
from app.service.pcap_service import (replay_pcap_using_preserve_timestamp,
                                      replay_pcap_using_tcpreplay)
from app.utils.constants import DATE_FORMAT_STR, NODE_TYPES, PCAP_UPLOAD_DIR
from app.utils.namespaces import POLICY_NS
from app.utils.utils import hash_file
from flask import Response, request
from flask_restx import Resource
from werkzeug.datastructures import FileStorage

upload_parser = POLICY_NS.parser()
upload_parser.add_argument(
    "upload_file", location="files", type=FileStorage, required=True
)


@POLICY_NS.route("/pcaps")
class PcapsCtrl(Resource):
    @POLICY_NS.doc(
        description="Gets the currently uploaded PCAPs on the server and displays the metadata."
    )
    @POLICY_NS.response(200, "PCAPMetadata", [PCAPMetadata.DTO])
    def get(self) -> Response:
        ret_val = []
        pcap_dir = Path(PCAP_UPLOAD_DIR)
        for pcap in pcap_dir.glob("*.pcap"):
            hashes = hash_file(str(pcap))
            pcap = {
                "name": pcap.name,
                "size": pcap.stat().st_size,
                "createdDate": datetime.fromtimestamp(pcap.stat().st_mtime).strftime(
                    DATE_FORMAT_STR
                ),
                "hashes": hashes,
            }
            ret_val.append(pcap)
        return sorted(ret_val, key=lambda x: x["name"]), 200


@POLICY_NS.route("/pcap/upload")
class PcapCtrl(Resource):
    @POLICY_NS.doc(
        description="Uploads a PCAP to the controller which can then be used to replay against Sensors."
    )
    @POLICY_NS.expect(upload_parser)
    @POLICY_NS.response(200, "SuccessMessage: PCAP File Uploaded", COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(400, "ErrorMessage: No File In Request", COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(422, "ErrorMessage: Not Valid PCAP File", COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self) -> Response:
        if "upload_file" not in request.files:
            return { "error_message": "Failed to upload file. No file was found in the request." }, 400
        if not PcapModel.validate_file(request.files["upload_file"]):
            return { "error_message": "Failed to upload file. Not a valid pcap file." }, 422

        pcap_dir = Path(PCAP_UPLOAD_DIR)
        if not pcap_dir.exists():
            pcap_dir.mkdir(parents=True, exist_ok=True)

        pcap_file = request.files["upload_file"]
        pcap_file.seek(0)
        filename = PcapModel.get_secure_filename(pcap_file.filename)

        abs_save_path = str(pcap_dir) + "/" + filename
        pcap_file.save(abs_save_path)
        pcap_file.close()
        return { "success_message": "Successfully uploaded {}.".format(filename) }, 200


@POLICY_NS.route("/pcap/<pcap_name>")
class DeletePcap(Resource):
    @POLICY_NS.doc(description="Delets a PCAP by the name passed in.")
    @POLICY_NS.response(200, "SuccessMessage: PCAP Deleted", COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(500, "ErrorMessage: Failed to Delete PCAP", COMMON_ERROR_MESSAGE)
    @operator_required
    def delete(self, pcap_name: str) -> Response:
        pcap_file = Path(PCAP_UPLOAD_DIR + "/" + pcap_name)
        if pcap_file.exists():
            pcap_file.unlink()
            return { "success_message": "PCAP successfully deleted." }, 200
        return { "error_message": "PCAP failed to delete." }, 500


@POLICY_NS.route("/pcap/replay")
class ReplayPcapCtrl(Resource):
    @POLICY_NS.expect(PCAPReplayModel.DTO)
    @POLICY_NS.doc(description="Replays a PCAP against the specified sensor.")
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        kit_settings = KitSettingsForm.load_from_db()  # type: Dict
        if payload["preserve_timestamp"]:
            job = replay_pcap_using_preserve_timestamp.delay(
                payload, kit_settings.password
            )
        else:
            job = replay_pcap_using_tcpreplay.delay(payload, kit_settings.password)

        return JobID(job).to_dict(), 200


@POLICY_NS.route("/sensor/info")
class SensorInfo(Resource):
    def get(self) -> Response:
        ret_val = []
        kit_nodes = Node.load_all_from_db()  # type: List[Node]

        for node in kit_nodes:
            if node.node_type == NODE_TYPES.sensor.value:
                host_simple = {}
                host_simple["hostname"] = node.hostname
                host_simple["management_ip"] = str(node.ip_address)
                host_simple["mac"] = node.mac_address
                ret_val.append(host_simple)

        return ret_val, 200
