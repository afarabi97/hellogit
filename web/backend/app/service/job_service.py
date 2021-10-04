import os
import shlex
import subprocess
from typing import Callable, Tuple

from app.service.socket_service import log_to_console
from app.utils.logging import rq_logger


def _open_proc(command: str,
               working_dir: str=None,
               use_shell:bool=False):
    proc = None

    if use_shell:
        if working_dir:
            proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=working_dir)
        else:
            proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    else:
        if working_dir:
            proc = subprocess.Popen(shlex.split(command), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=working_dir)
        else:
            proc = subprocess.Popen(shlex.split(command), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    return proc


class AsyncJob:

    def __init__(self,
                 job_name: str,
                 job_id: str,
                 command: str,
                 output_fn: Callable=log_to_console,
                 working_dir: str=None,
                 use_shell: bool=False):

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

    def run_asycn_command(self) -> int:
        if not self._use_shell:
            self._command = shlex.split(self._command)

        my_env = os.environ.copy()
        my_env['HOME'] = '/root'
        proc = subprocess.Popen(self._command,
                                shell=self._use_shell,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                                cwd=self._working_dir,
                                env=my_env)
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

def run_command(command: str,
                working_dir: str=None,
                use_shell:bool=False) -> str:
    proc = _open_proc(command, working_dir, use_shell)
    sout, _ = proc.communicate()
    return sout.decode('utf-8')

def run_command2(command: str,
                 working_dir: str=None,
                 use_shell:bool=False) -> Tuple[str, int]:
    proc = _open_proc(command, working_dir, use_shell)
    sout, _ = proc.communicate()
    return sout.decode('utf-8'), proc.poll()
