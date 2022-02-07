import os
import shlex
import subprocess
from typing import Callable, List, Tuple

from app.models.common import JobID
from app.models.nodes import Node, NodeJob
from app.service.socket_service import log_to_console
from app.utils.connection_mngs import REDIS_CLIENT, REDIS_QUEUE
from app.utils.constants import DEPLOYMENT_JOBS
from app.utils.logging import rq_logger
from app.utils.utils import kill_child_processes
from rq import Worker
from rq.command import send_stop_job_command
from rq.job import Job
from rq.registry import StartedJobRegistry


def _open_proc(command: str, working_dir: str = None, use_shell: bool = False):
    proc = None

    if use_shell:
        if working_dir:
            proc = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                cwd=working_dir,
            )
        else:
            proc = subprocess.Popen(
                command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT
            )
    else:
        if working_dir:
            proc = subprocess.Popen(
                shlex.split(command),
                shell=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                cwd=working_dir,
            )
        else:
            proc = subprocess.Popen(
                shlex.split(command),
                shell=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
            )

    return proc


class AsyncJob:
    def __init__(
        self,
        job_name: str,
        job_id: str,
        command: str,
        output_fn: Callable = log_to_console,
        working_dir: str = None,
        use_shell: bool = False,
    ):

        self._job_name = job_name
        self._job_id = job_id
        if not output_fn:
            raise ValueError("An asynchronous job requires an output function.")
        self._output_fn = output_fn
        self._command = command
        self._working_dir = working_dir
        self._use_shell = use_shell

    def _run_output_func(self, msg: bytes, is_stderr=False) -> None:
        rq_logger.debug(msg.strip("\n"))
        self._output_fn(self._job_name, self._job_id, msg)

    @property
    def job_name(self):
        return self._job_name

    def run_async_command(self) -> int:
        if not self._use_shell:
            self._command = shlex.split(self._command)

        my_env = os.environ.copy()
        my_env["HOME"] = "/root"
        proc = subprocess.Popen(
            self._command,
            shell=self._use_shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=self._working_dir,
            env=my_env,
        )

        def check_io():
            while True:
                output = proc.stdout.readline().decode()
                if output:
                    self._run_output_func(output)
                else:
                    break

        while proc.poll() is None:
            check_io()

        ret_code = proc.poll()
        return ret_code


def run_command(command: str, working_dir: str = None, use_shell: bool = False) -> str:
    proc = _open_proc(command, working_dir, use_shell)
    sout, _ = proc.communicate()
    return sout.decode("utf-8")


def run_command2(
    command: str, working_dir: str = None, use_shell: bool = False
) -> Tuple[str, int]:
    proc = _open_proc(command, working_dir, use_shell)
    sout, _ = proc.communicate()
    return sout.decode("utf-8"), proc.poll()


def check_gather_device_facts_job(node: Node) -> str:
    all_jobs = StartedJobRegistry(connection=REDIS_CLIENT).get_job_ids()
    started_jobs = Job.fetch_many(all_jobs, connection=REDIS_CLIENT)  # type: List[Job]
    for job in started_jobs:
        if (
            "node_id" in job.meta
            and job.meta["node_id"] == node._id
            and "job_name" in job.meta
            and job.meta["job_name"] == DEPLOYMENT_JOBS.gather_device_facts.value
        ):
            return job.id
    return None


def cancel_job(job_id, txt):
    log_to_console(job_name="nodes", jobid=job_id, text=txt, color="red")
    send_stop_job_command(connection=REDIS_CLIENT, job_id=job_id)


def delete_job(job_id):
    job_obj = NodeJob.load_jobs_by_job_id(job_id)  # type: NodeJob
    if job_obj:
        job_obj.set_error("Job killed by User")

    workers = Worker.all(queue=REDIS_QUEUE)
    for worker in workers:
        job = worker.get_current_job()
        if job and job_id == job.get_id():
            kill_child_processes(worker.pid)
            job.delete()
            return JobID(job).to_dict()

    job = Job.fetch(job_id, connection=REDIS_CLIENT)
    job.delete()
    return JobID(job).to_dict()
