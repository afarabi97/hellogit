from app import app, logger, conn_mng
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
from flask import jsonify, request, Response
from app.service.upgrade_service import get_upgrade_paths, upgrade
import requests
from app.middleware import Auth, controller_admin_required


@app.route('/api/upgrade/paths', methods=['POST'])
@controller_admin_required
def fetch_upgrade_paths() -> str:
    payload = request.get_json()
    results = get_upgrade_paths(payload['original_controller_ip'])
    if isinstance(results, requests.exceptions.HTTPError):
        return (jsonify(str(results)), 503)
    return jsonify(results)


@app.route('/api/upgrade', methods=['POST'])
@controller_admin_required
def execute_upgrade() -> str:
    payload = request.get_json()
    results = upgrade(payload["original_controller_ip"], payload["username"], payload["password"], payload["new_controller_ip"], payload["upgrade_path"])
    if isinstance(results, Exception):
        return (jsonify(str(results)), 503)

    return jsonify(results)
