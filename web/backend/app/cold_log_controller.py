import os
import shutil
import zipfile

from app import app
from app.models.cold_log import ColdLogUploadModel, WinlogbeatInstallModel
from app.models.common import JobID
from app.service.cold_log_service import (install_winlogbeat_srv,
                                          process_cold_logs)
from app.utils.constants import ColdLogModules
from app.utils.utils import TfplenumTempDir
from flask import Response, jsonify, request


@app.route('/api/upload_cold_log_file', methods=['POST'])
def upload_cold_log_file() -> Response:
    """
    Supports the uploading of zip files or individual files.

    :return: Response
    """
    model = ColdLogUploadModel()
    model.from_request(request.files, request.form)
    if 'upload_file' not in request.files:
        return {"error_message": "Failed to upload file. No file was found in the request."}, 400

    if model.is_windows():
        win_model = WinlogbeatInstallModel()
        try:
            win_model.initalize_from_mongo()
        except ValueError:
            return {"error_message": "Failed to upload Windows file because Winlogbeat has not been setup for cold log ingest."}, 500

    new_dir = TfplenumTempDir()
    tmpdirname = new_dir.file_path_str
    try:
        abs_save_path = tmpdirname + '/' + model.filename
        model.upload_file.save(abs_save_path)

        logs = []
        if model.is_zip():
            with zipfile.ZipFile(abs_save_path) as zip_ref:
                zip_ref.extractall(tmpdirname)

            for root, _, files in os.walk(tmpdirname):
                for file_path in files:
                    abs_path = root + "/" + file_path
                    if ".zip" in abs_path.lower():
                        continue
                    logs.append(abs_path)
        else:
            logs = [abs_save_path]

        job = process_cold_logs.delay(model.to_dict(), logs, tmpdirname)
    except Exception as exception:
        try:
            shutil.rmtree(tmpdirname)
        except FileNotFoundError:
            pass
        raise exception

    return (jsonify(JobID(job).to_dict()), 200)


@app.route("/api/get_module_info", methods=['GET'])
def get_module_info() -> Response:
    """
    Gets module info containing log types and there file set types.

    :return: Response
    """
    return jsonify(ColdLogModules.to_list())


@app.route("/api/get_winlogbeat_configuration", methods=['GET'])
def get_winlogbeat_configuration() -> Response:
    """
    Gets current Winlogbeat configuration will return default configuration if not setup

    :return: Response
    """
    model = WinlogbeatInstallModel()
    try:
        model.initalize_from_mongo()
    except ValueError:
        pass

    return jsonify(model.to_dict())


@app.route("/api/install_winlogbeat", methods=['POST'])
def install_winlogbeat() -> Response:
    """
    Sets up Winlogbeat on a target Windows host so that it can be used for cold log ingest.

    :return: Response
    """
    model = WinlogbeatInstallModel()
    model.from_request(request.get_json())
    model.save_to_mongo()
    job = install_winlogbeat_srv.delay()
    return (jsonify(JobID(job).to_dict()), 200)
