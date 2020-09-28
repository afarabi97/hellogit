import os
import shutil
import tempfile
import zipfile

from app import app, conn_mng
from app.models.cold_log import (ColdLogUploadModel, WinlogbeatInstallModel)
from app.service.cold_log_service import (process_cold_logs,
                                          install_winlogbeat_srv,
                                          JOB_NAME,
                                          INSTALL_WINLOGBEAT_JOB_NAME,
                                          ProcessWinlogbeatColdLogs)
from flask import jsonify, request, Response


@app.route('/api/upload_cold_log_file', methods=['POST'])
def upload_cold_log_file() -> Response:
    """
    Supports the uploading of zip files or individual files.

    :return: Response
    """
    model = ColdLogUploadModel()
    model.from_request(request.files, request.form)
    if 'upload_file' not in request.files:
        return jsonify({"error_message": "Failed to upload file. No file was found in the request."})

    if model.is_windows():
        win_model = WinlogbeatInstallModel()
        try:
            win_model.initalize_from_mongo()
        except ValueError:
            return jsonify({"error_message": "Failed to upload Windows file because Winlogbeat has not been setup for cold log ingest."})

    tmpdirname = tempfile.mkdtemp()
    try:
        abs_save_path = tmpdirname + '/' + model.filename
        model.upload_file.save(abs_save_path)

        logs = []
        if model.is_zip():
            with zipfile.ZipFile(abs_save_path) as zip_ref:
                zip_ref.extractall(tmpdirname)

            for root, dirs, files in os.walk(tmpdirname):
                for file_path in files:
                    abs_path = root + "/" + file_path
                    if ".zip" in abs_path.lower():
                        continue
                    logs.append(abs_path)
        else:
            logs = [abs_save_path]

        if model.is_linux():
            task_id = process_cold_logs.delay(model.to_dict(), logs, tmpdirname)
        elif model.is_windows():
            task_id = ProcessWinlogbeatColdLogs.delay(model.to_dict(), logs, tmpdirname)

        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": JOB_NAME.capitalize()},
                                                         {"_id": JOB_NAME.capitalize(), "task_id": str(task_id), "pid": ""},
                                                         upsert=True)
    except Exception as e:
        shutil.rmtree(tmpdirname)
        raise e

    return (jsonify(str(task_id)), 200)


@app.route("/api/get_winlogbeat_configuration", methods=['GET'])
def get_winlogbeat_configuration() -> Response:
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
    task_id = install_winlogbeat_srv.delay()
    conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": INSTALL_WINLOGBEAT_JOB_NAME},
                                                     {"_id": INSTALL_WINLOGBEAT_JOB_NAME,
                                                     "task_id": str(task_id), "pid": ""},
                                                     upsert=True)
    return (jsonify(str(task_id)), 200)
