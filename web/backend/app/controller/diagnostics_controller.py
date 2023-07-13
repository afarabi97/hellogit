from pathlib import Path

from app.models.common import COMMON_ERROR_MESSAGE
from app.models.job_id import JobIDModel
from app.service.diagnostics_service import run_diagnostics
from app.utils.collections import mongo_console
from app.utils.logging import logger
from app.utils.namespaces import DIAGNOSTICS_NS
from flask import Response, send_file
from flask_restx import Resource

from app.middleware import login_required_roles

DOWNLOAD_DIR = "/var/www/html/downloads"


@DIAGNOSTICS_NS.route("")
class Diagnostics(Resource):
    @DIAGNOSTICS_NS.doc(description="Runs diagnostics on the controller.")
    @DIAGNOSTICS_NS.response(200, "RunDiagnostics", JobIDModel.DTO)
    @DIAGNOSTICS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    def post(self) -> Response:
        try:
            job = run_diagnostics.delay()
            return JobIDModel(job).to_dict()
        except Exception as e:
            logger.exception(e)
            return {"error_message": str(e)}, 500


@DIAGNOSTICS_NS.route("/download/<job_id>")
class Diagnostics(Resource):
    @DIAGNOSTICS_NS.doc(description="Gets the dianostic information.")
    @DIAGNOSTICS_NS.response(200, "FileDownload", DIAGNOSTICS_NS.schema_model('Diagnostics', {'type': 'file'}))
    @DIAGNOSTICS_NS.response(404, "FileNotFound", COMMON_ERROR_MESSAGE)
    @DIAGNOSTICS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    def get(self, job_id) -> Response:
        try:
            log = mongo_console().find_one(
                {"jobid": job_id, "log": {"$regex": "tfplenum-logs"}}, {"_id": False}
            )
            if not log:
                return {"error_message": f"Couldn't find the log for {job_id}."}, 404
            archive_file_name = log["log"].split()[1]
            archive = Path(DOWNLOAD_DIR).joinpath(archive_file_name)
            if archive.exists():
                response = send_file(
                    str(archive), attachment_filename="diagnostics.tar.gz")
                return response
            else:
                return {"error_message": f"Couldn't find the archive for {job_id}."}, 404
        except Exception as e:
            logger.exception(e)
            return {"error_message": str(e)}, 500



