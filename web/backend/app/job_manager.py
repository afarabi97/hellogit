import fcntl
import os
import sys
import shlex
from app import logger, socketio, conn_mng
from shared.constants import DATE_FORMAT_STR
from uuid import uuid4
from datetime import datetime, timedelta
import psutil

import subprocess
from typing import Callable, List, Tuple
from threading import Thread
from gevent import sleep


JOB_QUEUE = []
LOCK_IDS = {}


class SynchronousIPLockException(Exception):
    def __init__(self, msg=""):
        super(SynchronousIPLockException, self).__init__(msg)
    

def _async_read2(job):
    """
    A synchronously read stdout

    :param job: A proc job object     

    :return: Return true if no ouput was sent to function pointer, false otherwise.
    """    
    if job.silent:
        return
    # set non-blocking flag while preserving old flags
    fd = job.process.stdout
    fd2 = job.process.stderr

    fl = fcntl.fcntl(fd, fcntl.F_GETFL)
    fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)
    
    fl2 = fcntl.fcntl(fd2, fcntl.F_GETFL)
    fcntl.fcntl(fd2, fcntl.F_SETFL, fl2 | os.O_NONBLOCK)

    # read char until EOF hit
    ch = None
    ch2 = None
    try:
        sleep(0.1)
        ch = os.read(fd.fileno(), 1024)
        job.run_output_func(ch)

        ch2 = os.read(fd2.fileno(), 1024)
        job.run_output_func(ch2, is_stderr=True)
    except OSError as e:
        # waiting for data be available on fd
        pass

    stdout_done = ch is None or ch == b''
    stderr_done = ch2 is None or ch2 == b''
    return stderr_done and stderr_done


class ProcJob(object):
    def __init__(self, job_name: str,
                 command: str,
                 func_output: Callable=None,
                 funcs_before: List[Callable]=[],
                 funcs_after: List[Callable]=[],
                 lock_ids: List[str]=[],
                 silent: bool=False,
                 working_directory: str=None,
                 is_shell=False):
        """
        Initializes a Process Job.

        :param job_name: The name of the job
        :param command: The command to be run
        :param func_output: The callback to run
        :param funcs_before: A List of function pointers to call before executing the process.
        :param funcs_after: A List of function pointers to call after process is done executing.
        :param lock_ids: A list of ids that identifies the locking mechanisme for this process.
        :param silent: If set to true, no output will be captured.
        :param working_directory: The working directory of where we want to run the command.
        :param is_shell: The boolean that controls whether or not we are executing the command using a shell.
        """
        self.job_name = job_name
        self.job_id = str(uuid4())[-12:]
        self.process = None  # type: subprocess.Popen
        self.funcToOperateOnOuput = func_output
        self.runAfterComplete = funcs_after
        self.runBeforeComplete = funcs_before
        self.isProcRunning = False
        self.command = command
        self.lock_ids = lock_ids
        self.silent = silent
        self.working_directory = working_directory
        self.is_shell = is_shell

    def __str__(self):
        if self.process is not None:
            return "PID: %d Job: %s ID: %s Locked IDs: %s isProcRunning: %s isSilent: %s" % (
                self.process.pid, self.job_name, self.job_id,
                self.lock_ids, self.isProcRunning, self.silent)
        else:
            return ("Job: %s ID: %s Locked IPs: %s isProcRunning: %s isSilent: %s"
                    % (self.job_name, self.job_id, self.lock_ids, self.isProcRunning, self.silent))

    def is_pid(self) -> bool:
        """
        Checks if a process is already running.

        :return:
        """
        try:
            os.kill(self.process.pid, 0)
        except OSError:
            return False
        else:
            return True

    def is_zombie(self) -> bool:
        """
        Checks if the process is a zombie.

        :return:
        """
        proc = psutil.Process(self.process.pid)
        if proc.status() == psutil.STATUS_ZOMBIE:
            return True
        return False

    def is_runnable(self) -> bool:
        """
        Checks if a process is runnable.

        :return:
        """
        if self.isProcRunning:
            return True

        for ip in self.lock_ids:
            if ip in LOCK_IDS:
                return False
        return True

    def run_process(self) -> None:
        """
        Runs the process and sets the appropriate locks.

        :return:
        """        
        if self.process is None:
            command_to_run = self.command
            if not self.is_shell:
                command_to_run = shlex.split(self.command)

            my_env = os.environ.copy()
            my_env['HOME'] = '/root'

            if self.working_directory is None:
                self.process = subprocess.Popen(command_to_run,
                                                shell=self.is_shell,
                                                stdout=subprocess.PIPE,
                                                stderr=subprocess.PIPE,
                                                env=my_env)
            else:                
                self.process = subprocess.Popen(command_to_run,
                                                shell=self.is_shell,
                                                stdout=subprocess.PIPE,
                                                stderr=subprocess.PIPE,
                                                cwd=self.working_directory,
                                                env=my_env)
            for ip in self.lock_ids:
                LOCK_IDS[ip] = True
            logger.debug("IP_ADDRESS_LOCK size after add: %d" % len(LOCK_IDS))

    def kill_myself(self, index: int) -> None:
        """
        Kills itself and it even cleans up after its dead self.

        :return:
        """
        if self.process:
            self.process.kill()

    def run_funcs_before_proc_completion(self) -> None:
        """
        Runs functions before the process completes.

        :return:
        """
        if not self.isProcRunning:
            self.isProcRunning = True
            for func in self.runBeforeComplete:
                func()

    def run_funcs_after_proc_completion(self) -> None:
        """
        Runs functions after the process completes.

        :return:
        """
        for func in self.runAfterComplete:
            func()

    def run_output_func(self, msg: bytes, is_stderr=False) -> None:
        """
        Passes a message to the output function.

        :param msg:
        :return:
        """
        if self.funcToOperateOnOuput is None:
            return

        lines = msg.decode("utf-8").split('\n')
        if is_stderr:
            for line in lines:
                self.funcToOperateOnOuput(self.job_name, self.job_id, line, 'red')
        else:
            for line in lines:
                self.funcToOperateOnOuput(self.job_name, self.job_id, line)

    def run_job_clean_up(self, index: int):
        """
        Cleans up the job queue and locks that the job had.

        :param index:
        :return:
        """
        while True:
            if _async_read2(self):
                break

        JOB_QUEUE.pop(index)
        for ip in self.lock_ids:
            LOCK_IDS.pop(ip, None)

        logger.debug("QUEUE size after pop: %d" % len(JOB_QUEUE))
        logger.debug("IP_ADDRESS_LOCK size after pop: %d" % len(LOCK_IDS))


def _async_read(fd):
    # set non-blocking flag while preserving old flags
    fl = fcntl.fcntl(fd, fcntl.F_GETFL)
    fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)
    # read char until EOF hit
    while True:
        try:
            sleep(0.1)
            ch = os.read(fd.fileno(), 1024)
            # EOF
            if not ch:
                break
            sys.stdout.write(ch.decode("utf-8"))
        except OSError:
            # waiting for data be available on fd
            pass


def shell(command: str, async: bool=False, working_dir=None, use_shell=False) -> Tuple[bytes, bytes]:
    """
    Runs a command and returns std out and stderr.

    :param command: The command to be run.
    :param async: If set to true the output is gathered will the process is running otherwise it blocks and return
    :param use_shell: If set to true.  the command will be run as is without shlex module through the shell.
    :return:
    """
    sout = None
    serr = None
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

    if async:
        _async_read(proc.stdout)
    else:
        sout, serr = proc.communicate()
    return sout, serr


def _log_queues() -> None:
    """
    Logs important queue information when processing jobs.

    :return:
    """
    jobqueue_len = len(JOB_QUEUE)
    if jobqueue_len > 0:
        logger.info("JOB_QUEUE size: %d" % jobqueue_len)
        logger.info("IP_ADDRESS_LOCK size: %d" % len(LOCK_IDS))
        for job in JOB_QUEUE:
            logger.debug(str(job))


def _save_job(job: ProcJob, job_retval: int, message: str) -> None:
    """
    Saves a to the mongo database so that we can check it on the integration side.
    :return:
    """
    conn_mng.mongo_last_jobs.find_one_and_replace({"_id": job.job_name},
                                                  {"_id": job.job_name, 
                                                   "return_code": job_retval, 
                                                   "date_completed": datetime.utcnow().strftime(DATE_FORMAT_STR),
                                                   "message": message},
                                                   upsert=True)  # type: InsertOneResult


def _spawn_jobqueue() -> None:
    """
    Spawns a job queue:

    :return:
    """
    logger.info("Starting job queue!")
    future_time = datetime.utcnow() + timedelta(seconds=10)
    while True:
        if len(JOB_QUEUE) == 0:
            # logger.debug("Sleeping one second")
            sleep(1)

        if future_time <= datetime.utcnow():
            future_time = datetime.utcnow() + timedelta(seconds=15)
            _log_queues()

        for index, job in enumerate(JOB_QUEUE):
            try:
                if not job.is_runnable():
                    continue

                job.run_funcs_before_proc_completion()
                job.run_process()
                # Periodically check the queue for messages and print them.
                _async_read2(job)
                job_retval = job.process.poll()
                if job_retval != None or not job.is_pid():
                    logger.debug("Completed: %s" % str(job))
                    if job_retval != 0:
                        logger.debug("Job return value was not 0. It was %d" % int(job_retval))
                        _save_job(job, job_retval, "Failed to execute with unknown error.")
                    else:
                        _save_job(job, job_retval, "Successfully executed job.")
                    
                    job.run_funcs_after_proc_completion()
                    job.run_job_clean_up(index)
                elif job.is_zombie():
                    logger.warn("ZOMBIE process cleanup %s" % str(job))
                    _save_job(job, 600, "Job became a zombie somehow.")
                    job.run_job_clean_up(index)
                    # Clean zombie has to happen after we garbage collect the popen object
            except Exception as e:
                logger.exception(e)
                _save_job(job, 500, str(e.message))
                job.run_job_clean_up(index)


def start_job_manager() -> None:
    """
    Starts the main job manager thread for the backend system.

    :return:
    """
    job_thread = socketio.start_background_task(target=_spawn_jobqueue)  # type: Thread
    job_thread.start()


def spawn_job(job_name: str, command: str,
              lock_ids: List[str],
              output_func: Callable=None,
              funcs_before: List[Callable]=[],
              funcs_after: List[Callable]=[],
              silent=False,
              working_directory: str=None,
              is_shell: bool=False) -> None:
    """
    The main method to call when spawning a new Job. It will instantiate
    a ProcJob object with the appropriate locks and then populate the queue.

    :param job_name: The name of the job
    :param command: The command to be run
    :param lock_ids: A list of ids that identifies the locking mechanism for this process.
    :param output_func: The callback to run for process output.
    :param funcs_before: A List of function pointers to call before the process is executed.
    :param funcs_after: A List of function pointers to call after process is done executing.
    :param silent: If set to true, no output will be captured.
    :param working_directory: The working directory of where we want to run the command.
    :return:
    """
    logger.info("Spawning %s %s" % (job_name, command))
    job = ProcJob(job_name, command, output_func, funcs_before,
                  funcs_after, lock_ids, silent, working_directory, is_shell)
    JOB_QUEUE.append(job)
    logger.debug("QUEUE size after add: %d" % len(JOB_QUEUE))


def kill_job_in_queue(job_name: str) -> None:
    """
    Finds a particular job in the queue and removes it.

    :return: None or throws exception on failure.
    """
    for index, job in enumerate(JOB_QUEUE):
        if job_name == job.job_name:
            job.kill_myself(index)


def get_running_jobs() -> List:
    """
    Returns a list of running objects
    {"jobID": job.job_id, "jobName": job.job_name, "cmd": job.command}

    :return:
    """
    json_doc = []
    for job in JOB_QUEUE:
        if job.funcToOperateOnOuput != None:
            json_doc.append({"jobID": job.job_id, "jobName": job.job_name, "cmd": job.command})

    return json_doc
