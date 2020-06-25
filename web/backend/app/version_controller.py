import os
import subprocess

from app import app, logger, conn_mng
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
from flask import jsonify, request, Response
from app.service.system_info_service  import get_version

TFPLENUM_VERSION = None

@app.route('/api/version', methods=['GET'])
def get_version_api() -> str:
    global TFPLENUM_VERSION
    if TFPLENUM_VERSION:
        return jsonify(TFPLENUM_VERSION)

    proc = subprocess.Popen('git rev-parse HEAD', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    git_commit_hash, _ = proc.communicate()
    if git_commit_hash:
        TFPLENUM_VERSION = { "version" : get_version(), "commit_hash":  git_commit_hash.decode('utf-8') }

    return jsonify(TFPLENUM_VERSION)
