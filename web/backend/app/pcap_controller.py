from app import app, conn_mng
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.models.common import JobID
from app.models.kit_setup import DIPKickstartForm
from app.utils.constants import KICKSTART_ID
from app.service.pcap_service import replay_pcap_srv
from datetime import datetime
from flask import jsonify, request, Response
from pathlib import Path
from app.utils.constants import DATE_FORMAT_STR, PCAP_UPLOAD_DIR
from app.utils.utils import hash_file
from werkzeug.utils import secure_filename
from app.middleware import operator_required


@app.route('/api/get_pcaps', methods=['GET'])
def get_pcaps() -> Response:
    ret_val = []
    pcap_dir = Path(PCAP_UPLOAD_DIR)
    for pcap in pcap_dir.glob("*.pcap"):
        hashes = hash_file(str(pcap))
        pcap = {'name': pcap.name,
                'size': pcap.stat().st_size,
                'createdDate': datetime.fromtimestamp(pcap.stat().st_mtime).strftime(DATE_FORMAT_STR),
                'hashes': hashes}
        ret_val.append(pcap)
    return jsonify(sorted(ret_val, key=lambda x: x['name']))


@app.route('/api/create_pcap', methods=['POST'])
@operator_required
def create_pcap() -> Response:
    if 'upload_file' not in request.files:
        return jsonify({"error_message": "Failed to upload file. No file was found in the request."})

    pcap_dir = Path(PCAP_UPLOAD_DIR)
    if not pcap_dir.exists():
        pcap_dir.mkdir(parents=True, exist_ok=True)

    pcap_file = request.files['upload_file']
    filename = secure_filename(pcap_file.filename)

    pos = filename.rfind('.') + 1
    if filename[pos:] != 'pcap':
        return jsonify({"error_message": "Failed to upload file. Files must end with the .pcap extension."})

    abs_save_path = str(pcap_dir) + '/' + filename
    pcap_file.save(abs_save_path)
    return jsonify({"success_message": "Successfully uploaded {}!".format(filename)})


@app.route('/api/delete_pcap/<pcap_name>', methods=['DELETE'])
@operator_required
def delete_pcap(pcap_name: str) -> Response:
    pcap_file = Path(PCAP_UPLOAD_DIR + '/' + pcap_name)
    if pcap_file.exists():
        pcap_file.unlink()
        return jsonify({"success_message": "PCAP successfully deleted!"})
    return jsonify({"error_message": "PCAP failed to delete!"})


@app.route('/api/replay_pcap', methods=['POST'])
@operator_required
def replay_pcap() -> Response:
    payload = request.get_json()
    kickstart_configuration = DIPKickstartForm.load_from_db() #type: DIPKickstartForm
    if kickstart_configuration:
        root_password = kickstart_configuration.root_password
        job = replay_pcap_srv.delay(payload, root_password)
        return (jsonify(JobID(job).to_dict()), 200)

    return ERROR_RESPONSE
