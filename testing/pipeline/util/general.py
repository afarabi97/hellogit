import shlex
import subprocess
from typing import  Tuple


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


def run_command(command: str,
                working_dir: str=None,
                use_shell:bool=False) -> Tuple[str, int]:
    proc = _open_proc(command, working_dir, use_shell)
    sout, _ = proc.communicate()
    return sout.decode('utf-8'), proc.poll()
