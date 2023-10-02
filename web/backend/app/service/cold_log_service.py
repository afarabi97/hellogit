import os
import shutil
import zipfile
from pathlib import Path
from typing import Dict, List
from uuid import uuid4

from app.models.cold_log import (ColdLogUploadModel, FilebeatModuleModel,
                                 WinlogbeatInstallModel)
from app.models.job_id import JobIDModel
from app.service.job_service import AsyncJob, run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import REDIS_CLIENT
from app.utils.constants import (BEATS_IMAGE_VERSIONS, TEMPLATE_DIR,
                                 ColdLogModules)
from app.utils.elastic import (ElasticWrapper, get_elastic_password,
                               get_elastic_service_ip)
from app.utils.exceptions import FailedToUploadFile, FailedToUploadWinLog
from app.utils.logging import rq_logger
from app.utils.tfwinrm_util import (
    configure_and_run_winlogbeat_for_cold_log_ingest,
    install_winlogbeat_for_cold_log_ingest)
from app.utils.utils import TfplenumTempDir, get_app_context, zip_package
from flask import request
from jinja2 import Environment, FileSystemLoader, select_autoescape
from rq.decorators import job
from werkzeug.datastructures import ImmutableMultiDict

JOB_NAME = "process_logs"
INSTALL_WINLOGBEAT_JOB_NAME = "winlogbeat_install"


def print_command(cmd: str, work_dir: str):
    sout, ret_val = run_command2(cmd, work_dir)
    rq_logger.debug(cmd)
    rq_logger.debug("return_code: {}".format(ret_val))
    rq_logger.debug(sout)
    print(cmd)
    print("return_code: {}".format(ret_val))
    print(sout)


class ColdLogParseFailure(Exception):
    pass


class ElasticUpdateError(Exception):
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
                 elk_username: str = "elastic"):

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
        self._log_files = None  # type: List
        self._log_names = None  # type: List

    def _generate_certs_if_not_exists(self, cert_location: str):
        if (not Path(cert_location).exists()
                or not Path(cert_location).is_file()):
            sout, ret_val = run_command2(
                "/opt/tfplenum/scripts/retrieve_beats_certs.py")
            if ret_val != 0:
                raise ColdLogParseFailure(
                    "Failed to run /opt/tfplenum/scripts/retrieve_beats_certs.py with error {}".format(sout))

    def _set_winlogbeat_index(self):
        self._template_ctx["index"] = "winlogbeat-external-{}".format(
            self._index_suffix)

    def _set_filebeat_index(self):
        self._template_ctx["index"] = "filebeat-external-{}-{}".format(
            self._index_suffix, self._module)

    def _remove_lifecyle_settings_from_index(self):
        index = self._template_ctx["index"]
        client = ElasticWrapper()
        body = {
            "index": {
                "lifecycle": {
                    "name": "",
                    "rollover_alias": ""
                }
            }
        }
        result = client.indices.put_settings(body, index=index)  # type: Dict
        if not result['acknowledged']:
            raise ElasticUpdateError("Removing lifecyle policy failed.")

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
            shutil.copy2(
                "/opt/tfplenum/scripts/winlogbeat-agent-certificate/tls.crt", tmp_directory + '/')
            shutil.copy2(
                "/opt/tfplenum/scripts/winlogbeat-agent-certificate/tls.key", tmp_directory + '/')

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
        with TfplenumTempDir() as tmp_directory:
            log_path = "/log"
            Path(tmp_directory + log_path).mkdir(exist_ok=True)
            self._copy_logs_to_dir(tmp_directory + log_path)
            self._copy_winlogbeat_certs_to_dir(tmp_directory)
            self._generate_winlogbeat_template(tmp_directory)
            zip_path = "/tmp/coldlog.zip"
            zip_package(zip_path, tmp_directory, "/coldlog")
            model = WinlogbeatInstallModel()
            model.initalize_from_mongo()
            ret_val = configure_and_run_winlogbeat_for_cold_log_ingest(
                model, zip_path, tmp_directory)
            if _has_failures(ret_val):
                return 1
            self._remove_lifecyle_settings_from_index()
            return 0

    def _get_module_specific_params(self, module: str, fileset: str):
        module_section = "--modules={module} --once "
        enable_and_eof_close = ("-M \"{module}.{fileset}.input.close_eof=true\" "
                                "-M \"{module}.*.enabled=false\" "
                                "-M \"{module}.{fileset}.enabled=true\" ")
        if self._module == ColdLogModules.AUDITD.value:
            fileset = ColdLogModules.AUDITD.filesets[0].value
        elif self._module == ColdLogModules.BLUECOAT.value:
            fileset = ColdLogModules.BLUECOAT.filesets[0].value
        elif self._module == ColdLogModules.OFFICE365.value:
            fileset = ColdLogModules.OFFICE365.filesets[0].value
        elif self._module == ColdLogModules.PALOALTO.value:
            fileset = ColdLogModules.PALOALTO.filesets[0].value
        elif self._module == ColdLogModules.SNORT.value:
            fileset = ColdLogModules.SNORT.filesets[0].value
        elif self._module == ColdLogModules.SURICATA.value:
            fileset = ColdLogModules.SURICATA.filesets[0].value

        if (self._module == ColdLogModules.APACHE.value
            or self._module == ColdLogModules.AUDITD.value
            or self._module == ColdLogModules.SURICATA.value
                or self._module == ColdLogModules.SYSTEM.value):

            module_section = module_section + \
                ("-M \"{module}.{fileset}.var.paths=['/tmp/logs/*']\" ")
        elif (self._module == ColdLogModules.AZURE.value
              or self._module == ColdLogModules.AWS.value
              or self._module == ColdLogModules.BLUECOAT.value
              or self._module == ColdLogModules.JUNIPER.value
              or self._module == ColdLogModules.CISCO.value
              or self._module == ColdLogModules.OFFICE365.value
              or self._module == ColdLogModules.PALOALTO.value
              or self._module == ColdLogModules.SNORT.value):
            input_override = '-M "{module}.{fileset}.var.input=file" '
            module_section = module_section + input_override + \
                "-M \"{module}.{fileset}.var.paths=['/tmp/logs/*']\" "
        else:
            raise ValueError(
                "Unsupported module: {} and fileset: {} was passed in.".format(module, fileset))

        module_section += enable_and_eof_close
        return module_section.format(module=module, fileset=fileset)

    def _get_volume_mount_section(self, tmp_dir: str, logs_dir: str):
        mount_section = ("-v {tmp_dir}/filebeat.yml:/usr/share/filebeat/filebeat.yml "
                         "-v {logs_dir}:/tmp/logs/ ").format(tmp_dir=tmp_dir, logs_dir=logs_dir)
        if self._cold_log_model.send_to_logstash:
            self._generate_certs_if_not_exists(
                "/opt/tfplenum/scripts/filebeat-agent-certificate/ca.crt")
            mount_section = mount_section + ("-v /opt/tfplenum/scripts/filebeat-agent-certificate/ca.crt:/usr/share/filebeat/ca.crt "
                                             "-v /opt/tfplenum/scripts/filebeat-agent-certificate/tls.crt:/usr/share/filebeat/tls.crt "
                                             "-v /opt/tfplenum/scripts/filebeat-agent-certificate/tls.key:/usr/share/filebeat/tls.key ")
        return mount_section

    def process_linux_logs(self, log_files: List[str], model: ColdLogUploadModel):
        with TfplenumTempDir() as tmp_directory:
            container_name = str(uuid4())[0:8]
            module = model.module
            fileset = model.fileset
            self._setup_class_members(log_files, module)
            self._set_filebeat_index()
            self._generate_filebeat_template(tmp_directory)
            logs_directory = tmp_directory + "/log"
            Path(logs_directory).mkdir(exist_ok=True)
            self._copy_logs_to_dir(logs_directory)
            mount_section = self._get_volume_mount_section(
                tmp_directory, logs_directory)
            module_section = self._get_module_specific_params(module, fileset)
            container_section = "localhost:5000/beats/filebeat:{} -e ".format(BEATS_IMAGE_VERSIONS)
            run_cmd = ("docker run --rm --name " + container_name + " " +
                       mount_section +
                       container_section +
                       module_section)

            rq_logger.debug(run_cmd)
            job = AsyncJob(JOB_NAME.capitalize(), "", run_cmd, use_shell=False)
            result = job.run_async_command()
            self._remove_lifecyle_settings_from_index()
            return result, container_name


@job('default', connection=REDIS_CLIENT, timeout="30m")
def process_cold_logs(model_dict: Dict,
                      logs: List[str],
                      tmpdirname: str):
    get_app_context().push()
    desc = "Cold Log Ingestion"
    notification = NotificationMessage(role=JOB_NAME)
    container_name = None
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
            ret_val, container_name = logs_processor.process_linux_logs(
                logs, model)
        elif model.is_windows():
            ret_val = logs_processor.process_windows_event_logs(logs)
        else:
            raise ValueError(
                "Invalid system type {} was passed in.".format(model.system_type))

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
    except Exception as e:
        rq_logger.exception(e)
        msg = "{} job failed with {}.".format(desc, str(e))
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
    finally:
        # We need to stop the container so that proper cleanup can be performed.
        if container_name is not None:
            run_command2("docker stop " + container_name)
        shutil.rmtree(tmpdirname)


@job('default', connection=REDIS_CLIENT, timeout="30m")
def install_winlogbeat_srv():
    get_app_context().push()
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
            msg = "{} job failed. Check celery logs in /var/log/celery/ for more details.".format(
                desc)
            notification.set_message(msg)
            notification.set_status(NotificationCode.ERROR.name)
            notification.post_to_websocket_api()
        else:
            notification.set_message(msg)
            notification.set_status(NotificationCode.COMPLETED.name)
            notification.post_to_websocket_api()

    except Exception as e:
        rq_logger.exception(e)
        msg = "{} job failed with {}.".format(desc, str(e))
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()


def post_coldlog_upload(files: ImmutableMultiDict, form: ImmutableMultiDict) -> JobIDModel:
    model = ColdLogUploadModel()
    model.from_request(files, form)
    if "upload_file" not in request.files:
        raise FailedToUploadFile

    if model.is_windows():
        win_model = WinlogbeatInstallModel()
        try:
            win_model.initalize_from_mongo()
        except ValueError:
            raise FailedToUploadWinLog

    new_dir = TfplenumTempDir()
    tmpdirname = new_dir.file_path_str
    if tmpdirname:
        abs_save_path = tmpdirname + "/" + model.filename
        model.upload_file.save(abs_save_path)

        logs = []
        if model.is_zip():
            with zipfile.ZipFile(abs_save_path) as zip_ref:
                zip_ref.extractall(tmpdirname)

            for root, _, files in os.walk(tmpdirname):
                for file_path in files:
                    abs_path = root + "/" + file_path
                    if ".zip" in abs_path.lower():
                        continue
                    logs.append(abs_path)
        else:
            logs = [abs_save_path]

        job = process_cold_logs.delay(model.to_dict(), logs, tmpdirname)
    else:
        try:
            shutil.rmtree(tmpdirname)
        except FileNotFoundError:
            raise FileNotFoundError
        raise Exception

    return JobIDModel(job).to_dict()


def get_module_info() -> List[FilebeatModuleModel]:
    return ColdLogModules.to_list()


def get_winlogbeat_configure() -> WinlogbeatInstallModel:
    model = WinlogbeatInstallModel()
    try:
        model.initalize_from_mongo()
    except ValueError:
        pass

    return model.to_dict()


def post_winlogbeat_install(payload: WinlogbeatInstallModel) -> JobIDModel:
    model = WinlogbeatInstallModel()
    model.from_request(payload)
    model.save_to_mongo()
    job = install_winlogbeat_srv.delay()

    return JobIDModel(job).to_dict()
