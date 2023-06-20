from pathlib import Path

from app.models.job_id import JobIDModel
from app.service.job_service import AsyncJob
from app.service.socket_service import notify_diag
from app.utils.collections import mongo_console
from app.utils.connection_mngs import REDIS_CLIENT
from app.utils.constants import DOWNLOAD_DIR, SCRIPTS_DIR
from app.utils.exceptions import NoSuchLogArchiveError, NoSuchLogError
from app.utils.utils import get_app_context
from flask import Response, send_file
from rq import get_current_job
from rq.decorators import job


def post_diagnostics() -> JobIDModel:
    job = _run_diagnostics.delay()
    return JobIDModel(job).to_dict()


def get_diagnostics(job_id: str) -> Response:
    log = mongo_console().find_one({"jobid": job_id, "log": {"$regex": "tfplenum-logs"}},
                                   {"_id": False})
    if not log:
        raise NoSuchLogError(f"Couldn't find the log for {job_id}.")
    archive_file_name = log["log"].split()[1]
    archive = Path(DOWNLOAD_DIR).joinpath(archive_file_name)
    if archive.exists():
        response = send_file(str(archive), attachment_filename="diagnostics.tar.gz")
        return response
    else:
        raise NoSuchLogArchiveError(f"Couldn't find the archive for {job_id}.")


@job("default", connection=REDIS_CLIENT, timeout="2m")
def _run_diagnostics():
    get_app_context().push()
    job_id = get_current_job().id
    job = AsyncJob(
        job_name="diagnostics",
        job_id=job_id,
        command="./run.sh",
        working_dir=str(SCRIPTS_DIR / "diagnostics"),
        use_shell=True,
    )
    rc = job.run_async_command()
    notify_diag(rc)
