import os

import shutil
import tempfile
import traceback

from app import app, celery, logger, conn_mng, TEMPLATE_DIR, REDIS_CLIENT
from app.models.cold_log import ColdLogUploadModel, WinlogbeatInstallModel
from app.service.job_service import run_command2
from app.service.scale_service import get_elastic_password, get_elastic_service_ip
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from celery.task import Task
from shared.tfwinrm_util import (configure_and_run_winlogbeat_for_cold_log_ingest, install_winlogbeat_for_cold_log_ingest)
from shared.utils import zip_package
from pathlib import Path
from shared.constants import BEATS_IMAGE_VERSIONS
from typing import List, Dict
from jinja2 import Environment, select_autoescape, FileSystemLoader


JOB_NAME = "process_logs"
INSTALL_WINLOGBEAT_JOB_NAME = "winlogbeat_install"


def print_command(cmd: str, work_dir: str):
    sout, ret_val = run_command2(cmd, work_dir)
    print("return_code: {}".format(ret_val))
    print(sout)


class ColdLogParseFailure(Exception):
    pass


def _has_failures(summary: Dict) -> bool:
    for key in summary:
        if summary[key]["failures"] > 0:
            return True
    return False


class ColdLogsProcessor:
    JINJA_ENV = Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=select_autoescape(['html', 'xml'])
    )

    def __init__(self,
                 model: ColdLogUploadModel,
                 elk_username: str="elastic"):

        self._send_to_logstash = model.send_to_logstash
        self._elk_password = ""
        if self._send_to_logstash:
            logstash_ip, logstash_port = get_elastic_service_ip("logstash")
            self._elk_ip = logstash_ip
            self._elk_port = logstash_port
        else:
            password = get_elastic_password()
            elk_ip, elk_port = get_elastic_service_ip()
            self._elk_ip = elk_ip
            self._elk_port = elk_port
            self._elk_password = password

        self._elk_username = elk_username
        self._index_suffix = model.index_suffix
        self._module = model.module
        self._cold_log_model = model

        self._template_ctx = {
            "elk_ip": self._elk_ip,
            "elk_port": self._elk_port,
            "elk_username": self._elk_username,
            "elk_password": self._elk_password,
            "log_names": None,
            "module": self._module,
            "index": "",
            "send_to_logstash": self._send_to_logstash
        }
        self._log_files = None # type: List (EX: ["/abs/path/test.evtx", "/abs/pathcool.evtx"])
        self._log_names = None # type: List

    def _generate_certs_if_not_exists(self, cert_location: str):
        if (not Path(cert_location).exists()
            or not Path(cert_location).is_file()):
            sout, ret_val = run_command2("/opt/tfplenum/scripts/retrieve_beats_certs.py")
            if ret_val != 0:
                raise ColdLogParseFailure("Failed to run /opt/tfplenum/scripts/retrieve_beats_certs.py with error {}".format(sout))

    def _set_winlogbeat_index(self):
        self._template_ctx["index"] = "winlogbeat-external-{}".format(self._index_suffix)

    def _set_filebeat_index(self):
        self._template_ctx["index"] = "filebeat-external-{}-{}".format(self._index_suffix, self._module)

    def _set_log_names(self):
        """
        Sets log names python list
        (EX: ["test.evtx", "cool.evtx"])
        :return None
        """
        self._log_names = []
        for log in self._log_files:
            pos = log.rfind("/")
            self._log_names.append(log[pos+1:])

        self._template_ctx["log_names"] = self._log_names

    def _copy_logs_to_dir(self, tmp_directory: str):
        for log in self._log_files:
            shutil.copy2(log, tmp_directory + '/')

    def _copy_winlogbeat_certs_to_dir(self, tmp_directory: str):
        if self._send_to_logstash:
            cert_location = "/opt/tfplenum/scripts/winlogbeat-agent-certificate/ca.crt"
            self._generate_certs_if_not_exists(cert_location)
            shutil.copy2(cert_location, tmp_directory + '/')
            shutil.copy2("/opt/tfplenum/scripts/winlogbeat-agent-certificate/tls.crt", tmp_directory + '/')
            shutil.copy2("/opt/tfplenum/scripts/winlogbeat-agent-certificate/tls.key", tmp_directory + '/')

    def _generate_winlogbeat_template(self, tmp_directory: str):
        template = self.JINJA_ENV.get_template('winlogbeat.yml')
        winlogbeat_template = template.render(template_ctx=self._template_ctx)

        with open(tmp_directory + '/winlogbeat.yml', "w") as winlogbeat_config:
            winlogbeat_config.write(winlogbeat_template)

    def _generate_filebeat_template(self, tmp_directory: str):
        template = self.JINJA_ENV.get_template('filebeat.yml')
        filebeat_template = template.render(template_ctx=self._template_ctx)

        with open(tmp_directory + '/filebeat.yml', "w") as filebeat_config:
            filebeat_config.write(filebeat_template)

    def _setup_class_members(self, log_files: List[str], module: str):
        """
        Initalizes any class member that were not already initalized in the
        constuctor.
        :return: None
        """
        self._log_files = log_files
        self._module = module
        self._template_ctx["module"] = module
        self._set_log_names()

    def process_windows_event_logs(self, log_files: List[str]) -> int:
        self._setup_class_members(log_files, "windows")
        self._set_winlogbeat_index()
        with tempfile.TemporaryDirectory() as tmp_directory:
            log_path = "/log"
            Path(tmp_directory + log_path).mkdir(exist_ok=True)
            self._copy_logs_to_dir(tmp_directory + log_path)
            self._copy_winlogbeat_certs_to_dir(tmp_directory)
            self._generate_winlogbeat_template(tmp_directory)
            zip_path = "/tmp/coldlog.zip"
            zip_package(zip_path, tmp_directory, "/coldlog")
            model = WinlogbeatInstallModel()
            model.initalize_from_mongo()
            ret_val = configure_and_run_winlogbeat_for_cold_log_ingest(model, zip_path, tmp_directory)
            if _has_failures(ret_val):
                return 1
            return 0

    def _get_module_specific_params(self, module: str):
        module_section = "--modules={module} --once "
        enable_and_eof_close = ("-M \"{module}.*.input.close_eof=true\" "
                                "-M \"{module}.*.enabled=true\" ")
        if self._module == "apache":
            module_section = module_section + ("-M \"{module}.access.var.paths=['/tmp/logs/*access*']\" "
                    "-M \"{module}.error.var.paths=['/tmp/logs/*error*']\" ") + enable_and_eof_close
        elif self._module == "suricata":
            module_section = module_section + ("-M \"{module}.eve.var.paths=['/tmp/logs/suricata*', '/tmp/logs/eve*']\" ") + enable_and_eof_close
        elif self._module == "auditd":
            module_section = module_section + ("-M \"{module}.log.var.paths=['/tmp/logs/audit*']\" ") + enable_and_eof_close
        elif self._module == "system":
            module_section = module_section + ("-M \"{module}.syslog.var.paths=['/tmp/logs/messages*', '/tmp/logs/boot*', '/tmp/logs/kern*', '/tmp/logs/cron*', '/tmp/logs/syslog*']\" "
                    "-M \"{module}.auth.var.paths=['/tmp/logs/auth*', '/tmp/logs/secure*', '/tmp/logs/utmp*', '/tmp/logs/wtmp*']\" ") + enable_and_eof_close
        else:
            module_section = module_section + ("-M \"{module}.*.var.paths=['/tmp/logs/*']\" ") + enable_and_eof_close
        return module_section.format(module=module)

    def _get_volume_mount_section(self, tmp_dir: str, logs_dir: str):
        mount_section = ("-v {tmp_dir}/filebeat.yml:/usr/share/filebeat/filebeat.yml "
                         "-v {logs_dir}:/tmp/logs/ ").format(tmp_dir=tmp_dir, logs_dir=logs_dir)
        if self._cold_log_model.send_to_logstash:
            self._generate_certs_if_not_exists("/opt/tfplenum/scripts/filebeat-agent-certificate/ca.crt")
            mount_section = mount_section + ("-v /opt/tfplenum/scripts/filebeat-agent-certificate/ca.crt:/usr/share/filebeat/ca.crt "
                                             "-v /opt/tfplenum/scripts/filebeat-agent-certificate/tls.crt:/usr/share/filebeat/tls.crt "
                                             "-v /opt/tfplenum/scripts/filebeat-agent-certificate/tls.key:/usr/share/filebeat/tls.key ")
        return mount_section

    def process_linux_logs(self, log_files: List[str], module: str='system'):
        with tempfile.TemporaryDirectory() as tmp_directory:
            self._setup_class_members(log_files, module)
            self._set_filebeat_index()
            self._generate_filebeat_template(tmp_directory)
            logs_directory = tmp_directory + "/log"
            Path(logs_directory).mkdir(exist_ok=True)
            self._copy_logs_to_dir(logs_directory)
            mount_section = self._get_volume_mount_section(tmp_directory, logs_directory)
            module_section = self._get_module_specific_params(module)
            container_section = "localhost:5000/beats/filebeat:{} -e ".format(BEATS_IMAGE_VERSIONS)
            run_cmd = ("docker run --rm " +
                       mount_section +
                       container_section +
                       module_section)

            job = AsyncJob(JOB_NAME.capitalize(), run_cmd, use_shell=True)
            return job.run_asycn_command()


def only_one(function=None, key="", timeout=None):
    """Enforce only one celery task at a time."""

    def _dec(run_func):
        """Decorator."""

        def _caller(*args, **kwargs):
            """Caller."""
            ret_value = None
            have_lock = False
            lock = REDIS_CLIENT.lock(key, timeout=timeout)
            try:
                have_lock = lock.acquire(blocking=False)
                if have_lock:
                    ret_value = run_func(*args, **kwargs)
                else:
                    notification = NotificationMessage(role=JOB_NAME)
                    notification.set_message("Failed to run task as another Windows Cold Log Ingest job is already running.  Please try again later.")
                    notification.set_status(NotificationCode.ERROR.name)
                    notification.post_to_websocket_api()
            finally:
                if have_lock:
                    lock.release()

            return ret_value

        return _caller

    return _dec(function) if function is not None else _dec


@celery.task
def process_cold_logs(model_dict: Dict,
                      logs: List[str],
                      tmpdirname: str):
    desc = "Cold Log Ingestion"
    notification = NotificationMessage(role=JOB_NAME)
    try:
        model = ColdLogUploadModel()
        model.from_dictionary(model_dict)
        notification.set_message("{} started.".format(desc))
        notification.set_status(NotificationCode.STARTED.name)
        notification.post_to_websocket_api()

        logs_processor = ColdLogsProcessor(model)
        notification.set_message("Processing {}.".format(str(logs)))
        notification.set_status(NotificationCode.IN_PROGRESS.name)
        notification.post_to_websocket_api()

        ret_val = 1
        if model.is_linux():
            ret_val = logs_processor.process_linux_logs(logs, model.module)
        elif model.is_windows():
            ret_val = logs_processor.process_windows_event_logs(logs)
        else:
            raise ValueError("Invalid system type {} was passed in.".format(model.system_type))

        msg = "{} successfully completed.".format(desc)
        if ret_val != 0:
            msg = "{} job failed.".format(desc)
            notification.set_message(msg)
            notification.set_status(NotificationCode.ERROR.name)
            notification.post_to_websocket_api()
        else:
            notification.set_message(msg)
            notification.set_status(NotificationCode.COMPLETED.name)
            notification.post_to_websocket_api()
        conn_mng.mongo_celery_tasks.delete_one({"_id": JOB_NAME.capitalize()})
    except Exception as e:
        traceback.print_exc()
        msg = "{} job failed with {}.".format(desc, str(e))
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
    finally:
        shutil.rmtree(tmpdirname)


class ProcessWinlogbeatColdLogs(Task):
    """A task."""

    @only_one(key="WinlogbeatTaskLock", timeout=60 * 5)
    def run(self, model_dict: Dict,
                  logs: List[str],
                  tmpdirname: str):
        """Run task."""
        process_cold_logs(model_dict, logs, tmpdirname)


@celery.task
def install_winlogbeat_srv():
    try:
        model = WinlogbeatInstallModel()
        model.initalize_from_mongo()

        desc = "Winlogbeat setup for cold log ingest"
        notification = NotificationMessage(role=JOB_NAME)
        notification.set_message("{} started.".format(desc))
        notification.set_status(NotificationCode.STARTED.name)
        notification.post_to_websocket_api()

        ret_val = install_winlogbeat_for_cold_log_ingest(model)
        msg = "{} successfully completed.".format(desc)
        if _has_failures(ret_val):
            msg = "{} job failed. Check celery logs in /var/log/celery/ for more details.".format(desc)
            notification.set_message(msg)
            notification.set_status(NotificationCode.ERROR.name)
            notification.post_to_websocket_api()
        else:
            notification.set_message(msg)
            notification.set_status(NotificationCode.COMPLETED.name)
            notification.post_to_websocket_api()

    except Exception as e:
        traceback.print_exc()
        msg = "{} job failed with {}.".format(desc, str(e))
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()

    conn_mng.mongo_celery_tasks.delete_one({"_id": INSTALL_WINLOGBEAT_JOB_NAME})
