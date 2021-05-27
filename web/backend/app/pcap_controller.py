from app import api, POLICY_NS
from app.models.common import JobID, COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.models.settings.kit_settings import KitSettingsForm
from app.models.ruleset import PCAPMetadata, PCAPReplayModel
from app.service.pcap_service import replay_pcap_using_tcpreplay, replay_pcap_using_preserve_timestamp
from datetime import datetime
from flask import jsonify, request, Response
from flask_restx import Resource
from pathlib import Path
from app.utils.constants import DATE_FORMAT_STR, PCAP_UPLOAD_DIR
from app.utils.utils import hash_file
from werkzeug.utils import secure_filename
from app.middleware import operator_required
from werkzeug.datastructures import FileStorage


@POLICY_NS.route('/pcaps')
class PcapsCtrl(Resource):

    @POLICY_NS.response(200, "PCAPMetadata", [PCAPMetadata.DTO])
    @POLICY_NS.doc(description="Gets the currently uploaded PCAPs on the server and displays the metadata.")
    def get(self) -> Response:
        ret_val = []
        pcap_dir = Path(PCAP_UPLOAD_DIR)
        for pcap in pcap_dir.glob("*.pcap"):
            hashes = hash_file(str(pcap))
            pcap = {'name': pcap.name,
                    'size': pcap.stat().st_size,
                    'createdDate': datetime.fromtimestamp(pcap.stat().st_mtime).strftime(DATE_FORMAT_STR),
                    'hashes': hashes}
            ret_val.append(pcap)
        return sorted(ret_val, key=lambda x: x['name'])


upload_parser = api.parser()
upload_parser.add_argument('upload_file', location='files',
                           type=FileStorage, required=True)

@POLICY_NS.route('/pcap/upload')
class PcapCtrl(Resource):

    @POLICY_NS.doc(description="Uploads a PCAP to the controller which can then be used to replay against Sensors.")
    @POLICY_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.expect(upload_parser)
    @operator_required
    def post(self) -> Response:
        if 'upload_file' not in request.files:
            return {"error_message": "Failed to upload file. No file was found in the request."}, 400

        pcap_dir = Path(PCAP_UPLOAD_DIR)
        if not pcap_dir.exists():
            pcap_dir.mkdir(parents=True, exist_ok=True)

        pcap_file = request.files['upload_file']
        filename = secure_filename(pcap_file.filename)

        pos = filename.rfind('.') + 1
        if filename[pos:] != 'pcap':
            return {"error_message": "Failed to upload file. Files must end with the .pcap extension."}, 400

        abs_save_path = str(pcap_dir) + '/' + filename
        pcap_file.save(abs_save_path)
        return {"success_message": "Successfully uploaded {}!".format(filename)}


@POLICY_NS.route('/pcap/<pcap_name>')
class DeletePcap(Resource):

    @POLICY_NS.doc(description="Delets a PCAP by the name passed in.")
    @POLICY_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @operator_required
    def delete(self, pcap_name: str) -> Response:
        pcap_file = Path(PCAP_UPLOAD_DIR + '/' + pcap_name)
        if pcap_file.exists():
            pcap_file.unlink()
            return {"success_message": "PCAP successfully deleted!"}
        return {"error_message": "PCAP failed to delete!"}, 400


@POLICY_NS.route('/pcap/replay')
class ReplayPcapCtrl(Resource):

    @POLICY_NS.expect(PCAPReplayModel.DTO)
    @POLICY_NS.doc(description="Replays a PCAP against the specified sensor.")
    @POLICY_NS.response(500, "Error")
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        kit_settings = KitSettingsForm.load_from_db() #type: Dict
        if payload['preserve_timestamp']:
            job = replay_pcap_using_preserve_timestamp.delay(payload, kit_settings.password)
        else:
            job = replay_pcap_using_tcpreplay.delay(payload, kit_settings.password)

        return JobID(job).to_dict(), 200
