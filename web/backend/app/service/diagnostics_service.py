from app.service.job_service import AsyncJob
from app.service.socket_service import notify_diag
from app.utils.connection_mngs import REDIS_CLIENT
from app.utils.constants import SCRIPTS_DIR
from app.utils.utils import get_app_context
from rq import get_current_job
from rq.decorators import job


@job("default", connection=REDIS_CLIENT, timeout="2m")
def run_diagnostics():
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

