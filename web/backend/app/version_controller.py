import os
from app import app, logger, conn_mng
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
from flask import jsonify, request, Response
from app.service.system_info_service  import get_version


@app.route('/api/version', methods=['GET'])
def get_version_api() -> str:
    return jsonify(get_version())

