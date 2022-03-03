from pathlib import Path

from app.common import NOTFOUND_RESPONSE
from app.models.common import JobID
from app.service.diagnostics_service import run_diagnostics
from app.utils.collections import mongo_console
from flask import send_file
from flask_restx import Namespace, Resource

DIAGNOSTICS_NS = Namespace(
    "diagnostics",
    description="Run diagnostics to help service desk troubleshoot tickets.",
)

DOWNLOAD_DIR = "/var/www/html/downloads"


@DIAGNOSTICS_NS.route("")
class Diagnostics(Resource):
    def post(self):
        job = run_diagnostics.delay()
        return JobID(job).to_dict()


@DIAGNOSTICS_NS.route("/download/<job_id>")
class Diagnostics(Resource):
    def get(self, job_id):
        log = mongo_console().find_one(
            {"jobid": job_id, "log": {"$regex": "tfplenum-logs"}}, {"_id": False}
        )
        if not log:
            return NOTFOUND_RESPONSE
        archive_file_name = log["log"].split()[1]
        archive = Path(DOWNLOAD_DIR).joinpath(archive_file_name)
        if archive.exists():
            response = send_file(
                str(archive), attachment_filename="diagnostics.tar.gz")
            return response
        else:
            return NOTFOUND_RESPONSE
