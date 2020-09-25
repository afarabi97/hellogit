
import subprocess
from flask import jsonify, Response

from app import app
from app.service.system_info_service import get_version, get_build_date

TFPLENUM_VERSION = None

@app.route('/api/version', methods=['GET'])
def get_version_api() -> str:
    global TFPLENUM_VERSION
    if TFPLENUM_VERSION:
        return jsonify(TFPLENUM_VERSION)

    proc = subprocess.Popen('git rev-parse HEAD', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    git_commit_hash, _ = proc.communicate()
    if git_commit_hash:
        TFPLENUM_VERSION = {"version": get_version(), "build_date": get_build_date(), "commit_hash": git_commit_hash.decode('utf-8')}

    return jsonify(TFPLENUM_VERSION)
