from flask import request, send_from_directory, jsonify
from flask_restx import Resource
from app import DIAGNOSTICS_NS, conn_mng, socketio
from rq.decorators import job
from app import REDIS_CLIENT
from app.models.common import JobID
from rq import get_current_job
from app.service.job_service import AsyncJob
from pathlib import Path
from app.common import NOTFOUND_RESPONSE
from tempfile import mktemp
from zipfile import ZipFile
import os
from flask_socketio import SocketIO


@DIAGNOSTICS_NS.route("/diagnostics")
class Diagnostics(Resource):
    def post(self):
        job = run_diagnostics.delay()
        return JobID(job).to_dict()

@DIAGNOSTICS_NS.route("/diagnostics/download/<job_id>")
class Diagnostics(Resource):
    def get(self, job_id):
        cursor = conn_mng.mongo_console.find({"jobid": job_id}, {'_id': False})
        if not cursor:
            return NOTFOUND_RESPONSE
        logs = list(cursor)
        archive_file_name = logs[-1]["log"].split()[1]
        directory = logs[-1]["log"].split()[4]
        archive = Path(directory).joinpath(archive_file_name)
        if archive.exists():
            stdout = mktemp()
            with open(stdout, 'w') as mystdout:
                for line in logs:
                    mystdout.write(line["log"])

            zip = mktemp()
            with ZipFile(zip, 'w') as myzip:
                myzip.write(str(archive), arcname=archive_file_name)
                myzip.write(stdout, arcname="stdout")

            response = send_from_directory(str(Path(zip).parent), str(Path(zip).name), as_attachment=True, attachment_filename="diagnostics.zip")

            os.remove(stdout)
            os.remove(zip)

            return response
        else:
            return NOTFOUND_RESPONSE

@job('default', connection=REDIS_CLIENT, timeout="2m")
def run_diagnostics():
    job_id = get_current_job().id
    job = AsyncJob(job_name="diagnostics", job_id=job_id, command="/opt/tfplenum/scripts/diagnostics/run.sh", working_dir="/opt/tfplenum/scripts/diagnostics", use_shell=True)
    job.run_asycn_command()
    socketio.emit("diagnostics_finished_running", True, broadcast=True)
