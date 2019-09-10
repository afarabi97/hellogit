import os
from app import app, logger, conn_mng
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
from flask import jsonify, request, Response


@app.route('/api/version', methods=['GET'])
def get_version() -> str:
    tfplenum_version = None
    line = None
    dip_version_path = "/etc/dip-version"

    if os.path.isfile(dip_version_path):
        with open(dip_version_path) as f:
	        line = f.readline().strip()

    if line:
        tfplenum_version = { "version" : line }
    return jsonify(tfplenum_version)

