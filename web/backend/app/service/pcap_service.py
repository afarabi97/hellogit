from datetime import datetime
from enum import Enum
import glob
import hashlib
import io
import json
import os
import shutil
import sys
import traceback
from pathlib import Path
from typing import Dict, List, Optional, Union
import pymongo
from rq import Queue, Worker
from scapy.utils import rdpcap
from uuid import uuid4
import re
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from fabric import Connection
from kubernetes.stream import stream
from app.models.pcap import PcapModel, ReplayPCAPModel, ReplaySensorModel
# from app.models.ruleset import PCAPReplayModel
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import (REDIS_CLIENT, FabricConnectionManager,
                                       KubernetesWrapper, FabricConnection)
from app.utils.constants import (DATE_FORMAT_STR, PCAP_UPLOAD_DIR,
                                 SURICATA_IMAGE_VERSION, SURICATA_RULESET_LOC,
                                 ZEEK_IMAGE_VERSION)
from app.utils.logging import rq_logger
from app.utils.utils import get_app_context, compute_hash
from app.persistence.pcap import PcapRepo
from rq.decorators import job
# from rq.job import Job
from abc import ABC, abstractmethod
from scapy.error import Scapy_Exception
from scapy.utils import PcapReader

from app.persistence import Repo
from multiprocessing import Lock

from app.models.job_id import JobIDModel

class PCAPServiceResponse:
    def __init__(self, **kwargs):
        self.success = kwargs.get("success", False)
        self.valid = kwargs.get("valid", False)
        self.name = kwargs.get("name", "")
        self.errors: List[ServiceMsg] = kwargs.get("errors", [])
        self.warnings: List[ServiceMsg] = kwargs.get("warnings", [])

    def __repr__(self):
        return f"PCAPServiceResponse(valid={self.valid}, name={self.name}, errors={self.errors}, warnings={self.warnings})"

    def __str__(self):
        return f"PCAPServiceResponse(valid={self.valid}, name={self.name}, errors={self.errors}, warnings={self.warnings})"

    def __eq__(self, other):
        return self.valid == other.valid and self.name == other.name and self.errors == other.errors and self.warnings == other.warnings

    def __ne__(self, other):
        return not self.__eq__(other)

    def to_dict(self) -> Dict:
        return {
            'success': self.success,
            'valid': self.valid,
            'name': self.name,
            'errors': json.dumps([error.to_dict() for error in self.errors]),
            'warnings': json.dumps([warning.to_dict() for warning in self.warnings])
        }

class ServiceMsgType(Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

class ServiceErrorType(Enum):
    NO_FILE_PROVIDED = "no_file_provided"
    INVALID_PCAP_FILE = "invalid_pcap_file"
    EOF_ERROR = "eof_error"
    PCAP_REPO_ERROR = "pcap_repo_error"
    PCAP_ALREADY_EXISTS = "pcap_already_exists"
    PCAP_EXISTS_IN_DIRECTORY = "pcap_exists_in_directory"
    PCAP_EXISTS_IN_REPO = "pcap_exists_in_repo"

class ServiceWarningType(Enum):
    FILE_EXTENSION_MISSING = "file_extension_missing"
    INVALID_FILE_EXTENSION = "invalid_file_extension"
    INSECURE_FILE_NAME  = "insecure_file_name"
    FILE_ALREADY_REMOVED_FROM_DISK = "file_already_removed_from_disk"
    PCAP_NAME_EXISTS_IN_REPO = "pcap_name_exists_in_repo"

class ServiceMsg:
    def __init__(self, type: ServiceMsgType , msg: str, msg_type: Union[ServiceErrorType, ServiceWarningType]):
        self.type = type
        self.msg = msg
        self.msg_type = msg_type

        if self.type == ServiceMsgType.ERROR:
            assert isinstance(self.msg_type, ServiceErrorType), "The msg_type must be an instance of ServiceErrorType if the type is ServiceMsgType.ERROR"
        elif self.type == ServiceMsgType.WARNING:
            assert isinstance(self.msg_type, ServiceWarningType), "The msg_type must be an instance of ServiceWarningType if the type is ServiceMsgType.WARNING"

    def __repr__(self):
        return f"ServiceMsg(type={self.type}, msg={self.msg}, msg_type={self.msg_type})"

    def __str__(self):
        return f"ServiceMsg(type={self.type}, msg={self.msg}, msg_type={self.msg_type})"

    def __eq__(self, other):
        return self.type == other.type and self.msg == other.msg and self.msg_type == other.msg_type

    def to_dict(self) -> Dict:
        return {
            'type': self.type.name,
            'msg': self.msg,
            'msg_type': self.msg_type.name
        }

def _get_configmap_data(search_dict: Dict, namespace: str, data_name: str):
    for i in search_dict["items"]:
        if i["metadata"]["namespace"] == namespace:
            try:
                return i["data"][data_name]
            except KeyError:
                pass
    return ""


def _save_all_configmap_data(
    search_dict: Dict, namespace: str, config_name: str, some_dir: str
):
    for i in search_dict["items"]:
        if (
            i["metadata"]["namespace"] == namespace
            and config_name in i["metadata"]["name"]
        ):
            for data_name_key in i["data"]:
                path = some_dir + "/" + data_name_key
                with Path(path).open("w") as fp:
                    fp.write(i["data"][data_name_key])
            break


class Replayer(ABC):
    """
    Abstract base class for all Replayer objects. A replayer object is used to replay a pcap file on a sensor.

    What replayers do:

    TCPReplayer:
    1. Replayers copy a pcap file to the Node(s) the application is running on.
    2. Replayers execute the application on the Node(s) with the pcap file as input.
    3. Replayers delete the pcap file from the Node(s).

    DockerReplayers:

    docker run --network host --rm -v /temp/pcaps/upload/wannacry.pcap:/pcaps/wannacry.pcap -v /temp/pcaps/copy/:/data/moloch/raw -v /temp/logs/:/data/moloch/logs -v /temp/config/config.ini:/data/moloch/etc/config.ini -v /temp/ssl/ca.crt:/etc/ssl/certs/container/ca.crt --add-host tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster:10.40.19.225 localhost:5000/tfplenum/arkime:3.1.0 /data/moloch/bin/moloch-capture -c /data/moloch/etc/config.ini --node saw-sensor3 --host saw-sensor3.worthey300 --pcapfile /pcaps/wannacry.pcap --copy --debug --debug --dryrun

    """

    @abstractmethod
    def execute(self, pcap: PcapModel) -> str:
        pass

class ReplayerFactory:

    @staticmethod
    def get(app_name: Optional[str], sensor: ReplaySensorModel) -> Replayer:
        """
        Returns a Replayer object based on the given app_name and sensor.

        Args:
            app_name (Optional[str]): The name of the app to use for replaying the pcap file.
            sensor (ReplaySensorModel): The sensor to replay the pcap file on.

        Returns:
            Replayer: A Replayer object based on the given app_name and client.

        Raises:
            ReplayerSetupError: If the given app_name is not one of the supported app names.
            NotImplementedError: If the given app_name is supported but the corresponding Replayer is not implemented yet.
        """
        if app_name is None or app_name == "tcpreplay":
            return TCPReplayer(sensor)
        elif app_name == "arkime":
            return ArkimeReplayer(sensor)
        elif app_name == "suricata":
            return SuricataReplayer(sensor)
        elif app_name == "zeek":
            return ZeekReplayer(sensor)
        else:
            raise ReplayerSetupError(f"{app_name} is not a valid app name. Please use one of the following: ['arkime', 'suricata', 'zeek']")

class ReplayerSetupError(Exception):
    pass

class ReplayerError(Exception):
    def __init__(self, replayer_name, error_message, file_path, line_number, traceback):
        self.replayer_name = replayer_name
        self.error_message = error_message
        self.file_path = file_path
        self.line_number = line_number
        self.traceback = traceback

    def __str__(self):
        return f"An error occurred while executing the replayer.\nReplayer: {self.replayer_name}\nError message: {self.error_message}\nFile: {self.file_path}, line {self.line_number}\nTraceback:\n{self.traceback}"

class TCPReplayer(Replayer):

    def __init__(self, sensor: Optional[ReplaySensorModel] = None):
        self.sensor = sensor

    def _validate_linux_network_interface(self, interface_name: str, conn: Connection) -> bool:
        """
        Validate if a network interface exists. This function will check if the interface name matches the CNDN convention and if the interface file exists in the /sys/class/net directory on the remote host.

        Args:
            interface_name (str): Name of the network interface
            conn (Connection): Connection object to a remote host.

        Returns:
            bool: True if the network interface exists, False otherwise
        """

        # Remove any leading/trailing whitespace
        interface_name = interface_name.strip()

        # Check if the interface name matches the CNDN convention
        if not re.match(r'^[a-z]{2}\w{0,14}$', interface_name):
            return False

        # Check if the interface file exists in the /sys/class/net directory
        interface_file = f'/sys/class/net/{interface_name}'

        if not conn.run('test -e {}'.format(interface_file), warn=True).ok:
            return False
        return True

    def _run_safe_tcpreplay(self, sensor: ReplaySensorModel, ssh_con: FabricConnection, pcap: PcapModel):
        remote_pcap = f"/tmp/{pcap.name}"
        ssh_con.put(str(pcap.path), remote_pcap)
        for iface in sensor.interfaces:
            if not self._validate_linux_network_interface(iface, ssh_con):
                raise ReplayerError("TCPReplay", f"Invalid network interface: {iface}", __file__, sys.exc_info()[-1].tb_lineno, traceback.format_exc())
            else:
                ssh_con.run(f"tcpreplay --mbps=100 -i {iface} {remote_pcap}")
        ssh_con.run(f"rm -f {remote_pcap}")

    def execute(self, pcap: PcapModel) -> str:
        with FabricConnectionManager(
            username=self.sensor.username,
            password=self.sensor.password,
            ipaddress=self.sensor.ip
        ) as ssh_con:

            self._run_safe_tcpreplay(self.sensor, ssh_con, pcap)
            rq_logger.info("TCPReplayer has finished executing")
            return "TCPReplayer has finished executing"

class ArkimeReplayer(Replayer):

    def __init__(self, sensor: ReplaySensorModel, namespace: Optional[str] = "default"):
        self.sensor = sensor
        self.namespace = namespace
        self.target_container = "capture"

    def _get_target(self) -> str:
        with self.client() as cli:
            api_response = cli.list_namespaced_pod(self.namespace)
            for pod in api_response.items:
                if pod.metadata.name.startswith(self.sensor.name) and "arkime" in pod.metadata.name:
                    return pod.metadata.name
            raise ReplayerSetupError("No 'arkime' pod found for sensor {self.sensor.name}")

    def _copy_pcap_to_target(self):
        command = [
            "/bin/sh",
            "-c",
            f"dd of={self.remote_file_name}"
        ]

        chunk_size = 1024 * 1024

        with self.client() as api:
            resp = stream(api.connect_get_namespaced_pod_exec,
                   self.target,
                   self.namespace,
                   command=command,
                   container=self.target_container,
                   stderr=True,
                   stdin=True,
                   stdout=True,
                   tty=False,
                   _preload_content=False)

            if not resp:
                raise ReplayerSetupError("Failed to copy the PCAP to the target.")

            with open(self.pcap.path, "rb") as fp:
                while True:
                    chunk = fp.read(chunk_size)  # read in 1MB chunks
                    if not chunk:
                        break
                    resp.write_stdin(chunk)
                resp.update(timeout=60)
            resp.close()

    def _patch_config(self):
        """
        Patch the configuration file.

        This method executes a series of commands to patch the configuration file. It copies the original configuration file
        to an offline configuration file and modifies the copied file to remove the Elasticsearch configuration.
        """
        exec_command = ["/bin/sh"]

        commands = [
            f"cp {self.config} {self.offline_config}", # copy
            f"sed -i '/^elasticsearch/s/,.*$//' {self.offline_config}", # patch elasticsearch
        ]

        with self.client() as api:
            resp = stream(api.connect_get_namespaced_pod_exec,
                     self.target,
                     self.namespace,
                     command=exec_command,
                     container=self.target_container,
                     stderr=True,
                     stdin=True,
                     stdout=True,
                     tty=False,
                     _preload_content=False)

            while resp.is_open():
                resp.update(timeout=1)
                if resp.peek_stdout():
                    print(f"STDOUT: {resp.read_stdout()}")
                if resp.peek_stderr():
                    print(f"STDERR: {resp.read_stderr()}")
                if commands:
                    c = commands.pop(0)
                    print(f"Running command... {c}\n")
                    resp.write_stdin(c + "\n")
                else:
                    break
            resp.close()

    def _run_moloch_capture(self):
        command = [
            "/bin/sh",
            "-c",
            f"/data/moloch/bin/moloch-capture --copy --pcapfile {self.remote_file_name}"
        ]

        with self.client() as api:
            resp = stream(api.connect_get_namespaced_pod_exec,
                   self.target,
                   self.namespace,
                   command=command,
                   container=self.target_container,
                   stderr=True,
                   stdin=True,
                   stdout=True,
                   tty=False,
                   _preload_content=False)

            if not resp:
                raise ReplayerSetupError("Failed to run moloch-capture on the target.")

            resp.update(timeout=60)

            while resp.is_open():
                if resp.read_stderr():
                    rq_logger.debug(f"STDERR: {resp.read_stderr()}")
                    resp.close()
                    raise ReplayerSetupError("Failed to run moloch-capture on the target.")

                # TODO: Figure out the automagicallness of this shit
                if "SYNC 200" in resp.read_stdout() and f"Processing {self.remote_file_name}" in resp.read_stdout():
                    rq_logger.info("Successfully ran moloch-capture on the target.")
                    rq_logger.debug(resp.read_stdout())
                    resp.close()

    def _run_delete_target_pcap(self):
        """
        Deletes the target PCAP file from the remote pod.

        Checks that target, PCAP and namespace are defined. Executes a shell command via the Kubernetes API to delete the remote PCAP file. Handles reading and logging stdout/stderr from the command. Raises an error if the delete fails.

            Args:
                self: The instance running this method.

            Raises:
                ReplayerSetupError: If target, PCAP or namespace are not defined or the delete fails.
        """

        with self.client() as api:
            resp = stream(api.connect_get_namespaced_pod_exec,
                   self.target,
                   self.namespace,
                   command=["/bin/sh","-c", f"rm -f {self.remote_file_name}"],
                   container=self.target_container,
                   stderr=True,
                   stdin=True,
                   stdout=True,
                   tty=False,
                   _preload_content=False)

            if not resp:
                raise ReplayerSetupError("Failed to delete the PCAP on the target.")

            resp.update(timeout=60)

            while resp.is_open():
                self._log_stdout(resp)
                self._log_stderr(resp, "Failed to delete the PCAP on the target.")

    def _log_stdout(self, resp):
        rq_logger.info(f"STDOUT: {resp.read_stdout()}")

    def _log_stderr(self, resp, msg):
        if resp.read_stderr():
            rq_logger.info(f"STDERR: {resp.read_stderr()}")
            resp.close()
            raise ReplayerSetupError(msg)

    def _setup(self, pcap: PcapModel, client = None, remote_file_name: str = None, config: str = None):
        if any([pcap is None, self.namespace is None, self.sensor is None]):
            raise ReplayerSetupError("Target or PCAP is not defined. Please set_target, set_pcap before calling execute().")
        self.pcap: PcapModel = pcap
        self.client = client or KubernetesWrapper
        self.remote_file_name = remote_file_name or f"/tmp/{self.pcap.name}"
        self.config = config or "/data/moloch/etc/config.ini"
        self.offline_config = "/data/moloch/etc/config.ini.offline" or  self.config.join(".offline")
        self.target = self._get_target()

    def execute(self, pcap: PcapModel) -> str:
        self._setup(pcap)
        self._copy_pcap_to_target()
        self._patch_config()
        self._run_moloch_capture()
        self._run_delete_target_pcap()
        rq_logger.info("ArikimeReplayer has finished executing")
        return "ArikimeReplayer has finished executing"

class SuricataReplayer(Replayer):

    def __init__(self, sensor: Optional[ReplaySensorModel] = None):
        if sensor:
            self.sensor = sensor
            self.client = FabricConnectionManager(sensor.username, sensor.password, sensor.ip)
            self.kit_password = sensor.password

    def pull_suricata_rules(self):
        with self.client as ssh_con:
            ssh_con.get(SURICATA_RULESET_LOC, self.suricata_rules)

    def push_logs_files(self):
        with FabricConnectionManager(self.sensor.username,  self.sensor.password, self.sensor.ip) as ssh_con:
            for path in glob.glob(f"{str(self.logs_dir)}/*"):
                filename = Path(path).name
                pos = filename.rfind(".")
                filename = f"{filename[:pos]}-ingest{filename[pos:]}"
                dst_path = f"/data/suricata/{filename}"
                rq_logger.debug(f"Sending {path} to {dst_path}")
                ssh_con.put(path, dst_path)

    def pull_suricata_config_map(self):
        with KubernetesWrapper() as kube_apiv1:
            api_response = kube_apiv1.list_config_map_for_all_namespaces()
            namespace = "default"
            data_name = "suricata.yaml"
            config_map = _get_configmap_data(
                api_response.to_dict(), namespace, data_name
            )

            with Path(self.suricata_config).open("w") as fp:
                fp.write(config_map)

    def patch_configuation(self):
        lines = []
        with open(self.suricata_config) as fhandle:
            lines = fhandle.readlines()

        line_index_to_change = -1
        for index, line in enumerate(lines):
            if "runmode" in line:
                line_index_to_change = index
                break

        if line_index_to_change == -1:
            raise Exception(
                "The configuration file is missing expected runmode.")

        lines[line_index_to_change] = "runmode: single\n"
        with open(self.suricata_config, "w") as fhandle:
            fhandle.writelines(lines)

    def run_suricata_docker_cmd(self, pcap: PcapModel = None) -> int:
        if not self.pcap and not pcap:
            raise Exception("No pcap file provided.")

        if pcap:
            self.pcap = pcap

        pcap_name = self.pcap.name
        pcap_path=str(self.pcap.path)
        tmp_dir=self.tmp_dir
        version=SURICATA_IMAGE_VERSION

        cmd = (
            f"docker run --rm -v {pcap_path}:/data/pcap/{pcap_name} "
            f"-v {tmp_dir}/suricata.rules:/etc/suricata/rules/suricata.rules "
            f"-v {tmp_dir}/suricata.yaml:/etc/suricata/suricata.yaml "
            f"-v {tmp_dir}/logs:/logs localhost:5000/tfplenum/suricata:{version} "
            f"-c /etc/suricata/suricata.yaml "
            f"-r /data/pcap/{pcap_name} -l /logs"
        )

        rq_logger.info(cmd)
        stdout, ret_val = run_command2(cmd, use_shell=True)
        rq_logger.info(stdout)
        return ret_val

    def _setup(self, pcap: PcapModel):
        self.pcap: PcapModel = pcap
        self.tmp_dir = f"/root/{str(uuid4())[:6]}"
        Path(self.tmp_dir).mkdir()
        self.logs_dir = Path(f"{self.tmp_dir}/logs")
        self.logs_dir.mkdir(exist_ok=True, parents=False)
        self.suricata_config = f"{self.tmp_dir}/suricata.yaml"
        self.suricata_rules = f"{self.tmp_dir}/suricata.rules"
        self.filebeat_config = f"{self.tmp_dir}/filebeat.yml"
        self.client = FabricConnectionManager(self.sensor.username, self.sensor.password, self.sensor.ip)

    def execute(self, pcap: PcapModel) -> str:
        try:
            self._setup(pcap)
            self.pull_suricata_rules()
            self.pull_suricata_config_map()
            self.patch_configuation()
            if self.run_suricata_docker_cmd() != 0:
                raise ReplayerError("SuricataReplayer", "Failed to replay the PCAP using suricata. View /var/log/tfplenum/rq.log for more details.", __file__, sys.exc_info()[-1].tb_lineno, traceback.format_exc())
            self.push_logs_files()
        finally:
            shutil.rmtree(self.tmp_dir)

        return "SuricataReplayer has finished executing"

class ZeekReplayer(Replayer):
    def __init__(self, sensor: ReplaySensorModel):
        self.sensor = sensor
        self.tmp_dir = None  # type: str
        self.logs_dir = None  # type: Path
        self.local_zeek_config = None  # type: str
        self.zeek_scripts = None  # type: Path
        self.client = FabricConnectionManager(self.sensor.username, self.sensor.password, self.sensor.ip)

    def pull_zeek_custom_scripts(self, local_zip_dir: str = None, remote_working_dir: str = "/opt/tfplenum"):
        # Perform a null check on the local zip directory
        if local_zip_dir is None: local_zip_dir = self.tmp_dir
        local_zip_location = f"{self.tmp_dir}/zeek.zip"

        # Archive & pull the zeek scripts from the sensor
        with self.client as shell:
            with shell.cd(remote_working_dir):
                try:
                    # Make a temporary directory to store the zeek script zip file
                    delete_cmd = ""
                    mktemp_dir_results = shell.run("mktemp --directory", in_stream=False)
                    if mktemp_dir_results.failed: raise ReplayerSetupError("Failed to create a temp directory: {mktemp_dir_results}")

                    # Create the remote zip file path and the zip commands
                    delete_cmd = f"rm -rf {mktemp_dir_results.stdout.strip()}"
                    remote_tmp_zip= f"{mktemp_dir_results.stdout.strip()}/zeek.zip"
                    zip_cmd = f"zip -r {remote_tmp_zip} zeek/"
                    unzip_cmd = f"unzip {local_zip_dir}/zeek.zip -d {local_zip_dir}"

                    # Run the zip command
                    zip_cmd_result = shell.run(zip_cmd, in_stream=False)
                    if zip_cmd_result.failed:
                        # TODO: Handle this better but it is handled in the finally block
                        raise ReplayerSetupError(f"Failed to zip the zeek scripts on the sensor: {zip_cmd_result}")

                    # Get the zip file from sensor
                    get_cmd_result = shell.get(remote_tmp_zip, local_zip_location)
                    if not get_cmd_result:
                        raise ReplayerSetupError(f"Failed to get the zeek scripts: {get_cmd_result}")

                    # Unzip the file
                    unzip_cmd_result = shell.local(unzip_cmd, in_stream=False)
                    if unzip_cmd_result.failed:
                        raise ReplayerSetupError(f"Failed to unzip the zeek scripts! {unzip_cmd_result}")
                except Exception as e:
                    pass
                finally:
                    # Delete the temp directory
                    delete_cmd_result=shell.run(delete_cmd, in_stream=False)
                    if delete_cmd_result.failed:
                        raise Exception(f"Failed to delete the temp directory: {delete_cmd_result}")

    def pull_kubernetes_zeek_configs(self):
        with KubernetesWrapper() as kube_apiv1:
            api_response = kube_apiv1.list_config_map_for_all_namespaces()
            namespace = "default"
            data_name = "local.zeek"
            config_maps = api_response.to_dict()
            config_map = _get_configmap_data(config_maps, namespace, data_name)

            with Path(self.local_zeek_config).open("w") as fp:
                fp.write(config_map)
            _save_all_configmap_data(
                config_maps, namespace, "zeek-scripts", str(self.zeek_scripts)
            )

    def run_zeek_docker_cmd(self, pcap: PcapModel) -> int:
        pcap_name = pcap.name
        tmp_dir = self.tmp_dir
        pcap_path = pcap.path

        cmd = (
            f"docker run --rm -i -v {tmp_dir}/zeek/intel.dat:/opt/tfplenum/zeek/intel.dat "
            f"-v {tmp_dir}/zeek/custom.sig:/opt/tfplenum/zeek/custom.sig "
            f"-v {tmp_dir}/zeek/scripts/:/opt/zeek/share/zeek/site/custom "
            f"-v {tmp_dir}/local.zeek:/opt/zeek/share/zeek/site/local.zeek "
            f"-v {pcap_path}:/pcaps/{pcap_name} "
            f"-v {tmp_dir}/scripts/:/opt/zeek/share/zeek/site/tfplenum/ "
            f"-v {tmp_dir}/logs/:/data/zeek/ "
            f"--workdir /data/zeek/ "
            f"--entrypoint /opt/zeek/bin/zeek "
            f"localhost:5000/tfplenum/zeek:{ZEEK_IMAGE_VERSION} "
            f"-r /pcaps/{pcap_name} "
            "/opt/zeek/share/zeek/site/local.zeek"
        )
        rq_logger.debug(cmd)
        stdout, ret_val = run_command2(cmd, use_shell=True)
        rq_logger.debug(stdout)
        return ret_val

    def push_logs_files(self):
        with FabricConnectionManager(username=self.sensor.username, password=self.sensor.password, ipaddress=self.sensor.ip) as ssh_con:
            for path in glob.glob(str(self.logs_dir) + "/*"):
                filename = Path(path).name
                pos = filename.rfind(".")
                filename = filename[0:pos] + "-ingest" + filename[pos:]
                dst_path = "/data/zeek/{}".format(filename)
                rq_logger.debug("Sending {} to {}".format(path, dst_path))
                ssh_con.put(path, dst_path)

    def execute(self, pcap: PcapModel) -> str:
        self.tmp_dir = f"/root/{str(uuid4())[:6]}"
        Path(self.tmp_dir).mkdir(exist_ok=True)
        try:
            self.logs_dir = Path(self.tmp_dir + "/logs")
            self.logs_dir.mkdir(exist_ok=True, parents=False)
            self.local_zeek_config = "{}/local.zeek".format(self.tmp_dir)
            self.zeek_scripts = Path(self.tmp_dir + "/scripts")
            self.zeek_scripts.mkdir(exist_ok=True, parents=False)

            self.pull_zeek_custom_scripts()
            self.pull_kubernetes_zeek_configs()
            if self.run_zeek_docker_cmd(pcap) != 0:
                raise ReplayerError("ZeekReplayer",
                    "Failed to replay the PCAP using zeek. View /var/log/tfplenum/rq.log for more details.", __file__, sys.exc_info()[-1].tb_lineno, traceback.format_exc()
                )
            self.push_logs_files()
        finally:
            shutil.rmtree(self.tmp_dir)

        return "ZeekReplayer has finished executing"

class PCAPService:

    def __init__(self, repo: Optional[Repo] = None) -> None:
        self.repo: PcapRepo = repo
        self.lock  = Lock()
        self._notification_message = NotificationMessage(role='pcap')

    def delete_pcap(self, name: str, pcap_dir: str = PCAP_UPLOAD_DIR) -> PCAPServiceResponse:
        """
        Deletes a pcap from the repo and the directory.

        """
        pcap: PcapModel = None
        v = PCAPServiceResponse(name="delete_pcap")
        _, pcap = self._get_pcap_from_repo(name, v)
        if not v.success:
            return v

        # Removes the pcap file from the directory, if it exists
        #   then removes it from the repo,
        #   then it syncs the directory with the repo
        self._remove_from_directory(pcap, v)
        self.repo.remove(pcap._id)
        self._sync_directory(pcap_dir=pcap_dir)
        return v

    def upload_pcap(self, name: str, data: bytes, pcap_dir: str = PCAP_UPLOAD_DIR) -> PCAPServiceResponse:

        # Validate the upload (e.g. file extension, file name changed if necessary, file exists, file hash not duplicate, etc.)
        v, file = self._validate_upload(name, data, pcap_dir=pcap_dir)

        # No need to go any further if there are errors
        if v.errors:
            return v

        # Validate the pcap file
        self._validate_pcap_file(file, v, pcap_dir=pcap_dir)

        # It may be valid, but there may be errors when saving it to the directory
        v.success = False

        # Save the valid pcap file to the specified directory
        if v.valid:
            with open(file.file_path, 'wb') as f:
                f.write(data)

            # Sync the directory with the repo
            if self._sync_directory(pcap_dir=pcap_dir) > 0:
                v.success = True
                return v
            v.errors.append(ServiceMsg(msg="Failed to save the file to the directory.", msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.PCAP_REPO_ERROR))
        return v

    def get_pcaps_from_directory(self, pcap_dir: str = PCAP_UPLOAD_DIR, pattern: str = "*.pcap") -> (PCAPServiceResponse, List[PcapModel]):
        """
        Get a list of pcap files from a directory.

        Args:
            pcap_dir: The directory path where the pcap files are located. Defaults to PCAP_UPLOAD_DIR.
            pattern: The pattern to match the pcap files. Defaults to "*.pcap".

        Returns:
            Tuple[PCAPServiceResponse, List[PcapModel]]: A tuple containing the response object and a list of pcap models.

        Examples:
            >>> service = PcapService()
            >>> pcap_dir = "/path/to/pcap/directory"
            >>> pattern = "*.pcap"
            >>> response, pcaps = service.get_pcaps_from_directory(pcap_dir, pattern)
        """
        v = PCAPServiceResponse(name="get_pcaps_from_directory")
        pcap_dir = Path(pcap_dir)
        if not pcap_dir.exists():
            v.errors.append(ServiceMsg(msg="The directory does not exist", msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.NO_FILE_PROVIDED))
            return None, v
        # validate each pcap file
        self._sync_directory(pcap_dir=pcap_dir)
        v.success = True
        v.valid = True
        return v, sorted(self.repo.get_all(), key=lambda x: x.name)

    def replay(self, payload):
        """
        Replays a pcap file.

        Args:
            payload: The payload containing the information needed for replay.

        Returns:
            JobIDModel: The ID of the job for the replay.

        Raises:
            ReplayerSetupError: If the workers are not running, or if the sensor or pcap file cannot be found in the repository,
                or if the pcap file does not exist.

        Examples:
            >>> service = PcapService()
            >>> payload = {...}
            >>> job_id = service.replay(payload)
        """

        # with current_app.app_context():
        notification = NotificationMessage(role="pcap")

        if not self._are_workers_running():
            # n = NotificationMessage(role="pcap")
            err_msg = "The workers are not running."
            rq_logger.error(err_msg)
            self._notify(NotificationCode.ERROR,err_msg)
            raise ReplayerSetupError("The workers are not running.")

        replay = ReplayPCAPModel(payload)
        preserve_timestamp = replay.preserve_timestamp

        # Holds the message according to what type of capture will be ran
        replay_message =  f"Historical replay of {replay.pcap}" if preserve_timestamp  else f"Live replay of {replay.pcap}"

        sensor = self.repo.get_replay_sensor(replay)
        pcap: PcapModel = self.repo._find("name", replay.pcap)
        if not sensor or not pcap:
            err_msg = f"Unable to find the sensor or pcap file in the repo. Sensor: {sensor}, PCAP: {pcap}"
            rq_logger.error(err_msg)
            self._notify(NotificationCode.ERROR, err_msg)
            raise ReplayerSetupError(err_msg)

        # check the pcap file to see if it is valid and exists
        pcap_file = Path(pcap.path) if Path(pcap.path).is_file() else None
        if not pcap_file:
            err_msg = f"The pcap file {pcap.path} does not exist."
            rq_logger.error(err_msg)
            self._notify(NotificationCode.ERROR, err_msg)
            raise ReplayerSetupError(err_msg)

        # check the sensor to see if it is valid and exists
        replayers = self._get_replayers(sensor, preserve_timestamp)

        q = Queue(connection=REDIS_CLIENT)
        job = q.enqueue(run_replay_job, replayers, pcap, replay_message, notification, result_ttl = 500)
        return JobIDModel(job)

    def models_to_dict(self, models: List[PcapModel]) -> List[Dict]:
        """
        Convert a list of PcapModel objects to a list of dictionaries.

        Args:
            models: A list of PcapModel objects to be converted.

        Returns:
            List[Dict]: A list of dictionaries representing the PcapModel objects.

        Examples:
            >>> service = PcapService()
            >>> models = [PcapModel(name="pcap1"), PcapModel(name="pcap2")]
            >>> dicts = service.models_to_dict(models)
        """
        return [model.to_dict() for model in models]

    def _validate_upload(self, name: str, data: bytes, pcap_dir: str = PCAP_UPLOAD_DIR) -> (PCAPServiceResponse, Union[io.BytesIO, None]):
        # The upload function repeats some validations because the user will want to know why the upload failed
        # and the user will want to know if the file already exists in the repo
        v: PCAPServiceResponse = PCAPServiceResponse(name="upload_pcap")
        if not data:
            v.errors.append(ServiceMsg(msg="No file was provided.", msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.NO_FILE_PROVIDED))
            return v

        # Modify the filename in a secure manner if needed
        fname = secure_filename(name)
        base_name, extension = os.path.splitext(fname)
        filename = fname if (extension and extension in [".pcap", ".pcapng"]) else f"{base_name}.pcap"

        # Check the filename to see if it already exists in the repo
        existing_by_name = self.repo.get_by_key(key="name", value=filename)
        if existing_by_name:
            old_file_name = filename
            filename = f"{base_name}_{str(uuid4())[:6]}.pcap" if not extension or extension not in [".pcap", ".pcapng"] else f"{base_name}_{str(uuid4())[:6]}{extension}"
            msg = f"The filename {old_file_name} is already taken. Renaming to {filename} pending validation."
            v.warnings.append(ServiceMsg(msg=msg, msg_type=ServiceMsgType.WARNING, type=ServiceWarningType.PCAP_NAME_EXISTS_IN_REPO))


        # Check if the file already exists by checking the sha256 hash
        data_hash = hashlib.sha256(data).hexdigest()
        existing_by_hash = self.repo.get_by_key(key="sha256", value=data_hash)
        if existing_by_hash:
            _ebh_name = existing_by_hash['name']
            msg = f"The uploaded file is identical to `{_ebh_name}`."
            v.errors.append(ServiceMsg(msg=msg, msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.PCAP_ALREADY_EXISTS))

        # Check the file_path to see if it already exists in the directory
        #  If it does, that means the file was uploaded but not saved to the repo I guess
        # TODO: handle this use case
        file_path = os.path.join(pcap_dir, filename)
        if os.path.exists(file_path):
            v.errors.append(ServiceMsg(msg="A file with the same path already exists.", msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.PCAP_ALREADY_EXISTS))

        if v.errors:
            return v, None

        # Put the file in a File-like object for validatioan io.BytesIO
        file = io.BytesIO(data)
        file.name = filename
        file.mode = "r+b"
        file.file_path = file_path

        return v, file

    def _notify(self, status: NotificationCode, message: str):
        # rq_logger.info(f"Sending notification to websocket api. Status: {status.name}, Message: {message}")
        self._notification_message = self._notification_message or NotificationMessage(role="pcap")
        self._notification_message.set_status(status=status.name)
        self._notification_message.set_message(message)
        self._notification_message.post_to_websocket_api()

    def _are_workers_running(self) -> bool:
        """
        Checks if there are any rq workers are running.
        """
        return len(Worker.all(connection=REDIS_CLIENT)) > 0

    def _get_pcap_from_repo(self, name: str, v: Optional[PCAPServiceResponse] = None) -> (PCAPServiceResponse, PcapModel):
        if not v:
            v = PCAPServiceResponse(name="_get_pcap_from_repo")

        collection_object: Union[PcapModel, Dict] = self.repo.get_by_key("name", name)
        pcap: PcapModel = PcapModel(**collection_object) if collection_object and isinstance(collection_object, Dict) else collection_object

        if not pcap:
            msg = f"There is no pcap named {name} in the repository. Check the name and the PCAP Directory and try again."
            v.errors.append(ServiceMsg(msg=msg, msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.PCAP_REPO_ERROR))
            return v, None
        v.success = True
        return v, pcap

    def _get_all_repo_hashes(self) -> List[Dict]:
        """
        Gets all the hashes of the pcap files in the given repo.

        Args:
            repo (Repo): The repo to get the pcap hashes from.

        Returns:
            List[str]: A list of all the pcap hashes in the given repo.
        """
        return [{"_id": pcap._id, "sha256": pcap.sha256} for pcap in self.repo.get_all()]

    def _get_pcap_model(self, pcap_path: str, v: PCAPServiceResponse = None) -> PcapModel:
        # This is called by _sync_directory so we only return a model if it
        # exists on the directory, does not exist in the repo, and is valid

        pcap_path = Path(pcap_path)
        if not v:
            v = PCAPServiceResponse(name="_get_pcap_model")

        # Check the file to see if it exist in the directory, if not append error and return None
        if not pcap_path.exists():
            if v:
                v.errors.append(ServiceMsg(msg="The file does not exist", msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.NO_FILE_PROVIDED))
            return None

        # Get the created date of the file in the directory in the format of DATE_FORMAT_STR (UTC)
        created_date = datetime.fromtimestamp(pcap_path.stat().st_mtime).strftime(DATE_FORMAT_STR) if pcap_path.exists() else None

        # Check the file to see if it is valid, if not append error and return None
        with open(pcap_path, "rb") as f:
            psr = self._validate_pcap_file(f, v=v)
            if not psr.valid:
                return None


        # Check the file to see if it exists in the repo, if so append error and return None
        sha256 = compute_hash(str(pcap_path))
        pcap_model: PcapModel = self.repo.get_by_key("sha256", sha256)
        if pcap_model:
            v.errors.append(ServiceMsg(msg=f"The files sha256 matches `{pcap_model.name}`.", msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.PCAP_ALREADY_EXISTS))
            return None

        # Get the first and last packet date of the file in the directory in the format of DATE_FORMAT_STR (UTC)
        first_packet_date, last_packet_date = self._get_pcap_file_time_range(str(pcap_path))
        if not first_packet_date or not last_packet_date:
            msg = "The files first or last packet date could not be determined."
            v.errors.append(ServiceMsg(msg=msg, msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.PCAP_REPO_ERROR))
            return None

        return PcapModel(
            name=pcap_path.name,
            size=pcap_path.stat().st_size,
            sha256=sha256,
            created_date=created_date,
            first_packet_date=first_packet_date,
            last_packet_date=last_packet_date,
            path=str(pcap_path)
        )

    def _remove_from_directory(self, pcap: PcapModel, v: PCAPServiceResponse = None) -> PCAPServiceResponse:
        """
        Removes the pcap file from the file path in the given pcap model. This uses the pcap model path to remove the file.
        If the file does not exist, a warning is added to the PCAPServiceResponse object.

        Args:
            pcap (PcapModel): The directory to remove the pcap file from.
            v (PCAPServiceResponse): The PCAPServiceResponse object to update.
        """

        v = v or PCAPServiceResponse(name="_remove_from_directory")
        pcap_path = Path(pcap.path)
        if pcap_path.exists():
            pcap_path.unlink()
        else:
            v.warnings.append(ServiceMsg(msg="The file has already been removed from disk.", msg_type=ServiceMsgType.WARNING, type=ServiceWarningType.FILE_ALREADY_REMOVED_FROM_DISK))

        v.success = True
        v.valid =  True
        return v

    def _sync_directory(self, pcap_dir: str = PCAP_UPLOAD_DIR) -> int:
        """
        Syncs the contents of the src directory to the repo.

        Args:
            pcap_dir (str): The source directory.
        """

        # track how many pcaps were added to the repo during sync
        added = 0
        globs = glob.glob(f"{pcap_dir}/*.pcap*")

        for pcap in globs:
            # If there are pcap files in the src directory that are not in the repo, add them to the repo if they're valid
            match = self.repo.get_by_key("path", pcap)
            print(match)
            if not match:
                # It doesn't exist in the repo, add it
                pcap_model = self._get_pcap_model(pcap)
                if pcap_model:
                    try:
                        self.repo.add(pcap_model)
                        added += 1
                    except pymongo.errors.DuplicateKeyError:
                        continue
        return added

    def _repo_has(self, key: str, value: str) -> bool:
        """
        Checks if the repo has a document with the given key and value.

        Args:
            key (str): The key to check in the repo.
            value (str): The value to check in the repo.
        """
        return bool(self.repo.get_by_key(key, value))

    def _validate_pcap_file(self, file, v: Optional[PCAPServiceResponse] = None, pcap_dir: str = PCAP_UPLOAD_DIR) -> PCAPServiceResponse:
        """
        Validates the given pcap file.

        Args:
            file: The pcap file to validate.
            v (Optional[PCAPServiceResponse]): The PCAPServiceResponse object to update.
            pcap_dir (str): The directory where the pcap file is located.

        Returns:
            PCAPServiceResponse: A PCAPServiceResponse object with the validation results.
        """

        name = file.name if (hasattr(file, 'name') and file.name is not None) else '_validate_pcap_file'
        if not v:
            v = PCAPServiceResponse(name=name)

        if not file:
            v.errors.append(ServiceMsg(msg="No file was provided", msg_type=ServiceMsgType.ERROR, type=ServiceErrorType.NO_FILE_PROVIDED))
            return self._evaluate_pcap_file_validation_results(v)

        self._validate_filename(file, v, pcap_dir)
        self._validate_file_type(file, v)
        self._evaluate_pcap_file_validation_results(v)

        return v

    def _validate_filename(self, file, v: PCAPServiceResponse, pcap_dir: str = PCAP_UPLOAD_DIR):
        """
        Validates the filename of the given file.

        Args:
            file: The file to validate.
            v (PCAPServiceResponse): The PCAPServiceResponse object to update.
            pcap_dir (str): The directory where the pcap file is located.
        """

        name = file.name

        if not name:
            v.errors.append(ServiceMsg(msg="The file has no filename.", type=ServiceMsgType.ERROR, msg_type=ServiceErrorType.INVALID_FILENAME))
            return

        if not name.endswith(".pcap"):
            v.warnings.append(ServiceMsg(msg="The file does not have a .pcap extension.", type=ServiceMsgType.WARNING, msg_type=ServiceWarningType.INVALID_FILE_EXTENSION))

        secure_name = secure_filename(name)
        if secure_name != name:
            v.warnings.append(ServiceMsg(msg=f"The filename {name} is not secure. It will be changed upon upload.", type=ServiceMsgType.WARNING, msg_type=ServiceWarningType.INSECURE_FILE_NAME))

        if self._repo_has("name", name) or self._repo_has("name", secure_name):
            v.errors.append(ServiceMsg(msg="A file with the same name already exists in the repo.", type=ServiceMsgType.ERROR, msg_type=ServiceErrorType.PCAP_EXISTS_IN_REPO))

    def _validate_file_type(self, file, v: PCAPServiceResponse) -> bool:
        """
        Validates the type of the given file.

        Args:
            file: The file to validate.
            v (PCAPServiceResponse): The PCAPServiceResponse object to update.
        """

        try:
            self._reset_file_seek(file)
            with PcapReader(file) as pcap:
                # Try to read the first packet to validate the pcap
                # Check if it is an instane of PCapReader meaning that it is not a PCAPNg file
                pcap.read_packet(size=48)
        except (Scapy_Exception, StopIteration, EOFError) as e:
            if isinstance(e, Scapy_Exception):

                v.errors.append(
                    ServiceMsg(
                        msg="The file is not a supported capture file.",
                        type=ServiceMsgType.ERROR,
                        msg_type=ServiceErrorType.INVALID_PCAP_FILE,
                    )
                )
            elif isinstance(e, EOFError):
                v.errors.append(ServiceMsg(msg="The file does not have any packets.", type=ServiceMsgType.ERROR, msg_type=ServiceErrorType.EOF_ERROR))
        finally:
            # Ensure the file pointer is reset to where it was initially
            self._reset_file_seek(file)

    def _reset_file_seek(self, file):
        """
        Reset the seek position of a file-like object to the beginning.

        Args:
            file: The file-like object to reset the seek position.

        Examples:
            This method is typically used internally to reset the seek position of a file before processing it.
        """
        if isinstance(file, FileStorage):
            None if file.stream.closed else file.seek(0)
        if isinstance(file, io.BufferedReader):
            None if file.closed else file.seek(0)

    def _get_pcap_file_time_range(self, file_path: str) -> (str, str):
        """
        Gets the first and last packet date of the given pcap file in UTC.

        Args:
            file_path (str): The path to the pcap file.

        Returns:
            (str, str): A tuple containing the first and last packet date of the given pcap file.
        """

        # Get the packet list
        packets = rdpcap(file_path)

        # Get the first and last packet date as floats if there are packets
        first = packets[0].time if packets and len(packets) > 0 else None
        last = packets[-1].time if packets and len(packets) > 0 else None

        # Convert the first and last packet date to UTC?? lol using our DATE_FORMAT_STR format
        if first and last:
            first = datetime.fromtimestamp(float(first)).strftime(DATE_FORMAT_STR)
            last = datetime.fromtimestamp(float(last)).strftime(DATE_FORMAT_STR)

        # Return the created date, first packet date and last packet date
        return (first, last)

    def _evaluate_pcap_file_validation_results(self, v: PCAPServiceResponse):
        """
        Evaluates the validation results and sets the valid property of the PCAPServiceResponse object.

        Args:
            v (PCAPServiceResponse): The PCAPServiceResponse object to update.
        """
        v.valid = len(v.errors) == 0

    def _get_replay_sensor_by_hostname(self, hostname: str, v: PCAPServiceResponse) -> (PCAPServiceResponse, ReplaySensorModel):

        """
        Gets the replay sensor by hostname.

        Args:
            hostname (str): The hostname of the replay sensor.
            v (PCAPServiceResponse): The PCAPServiceResponse object to update.

        Returns:
            ReplaySensorModel: The replay sensor with the given hostname.
        """
        if not v:
            v = PCAPServiceResponse(name="get_replay_sensor_by_hostname")
        # sensor: ReplaySensorModel = self.repo.get_replay_sensor_by_hostname(hostname)
        # This is a hack to get around the fact that the repo is not a singleton
        repo: PcapRepo = self.repo
        sensor: ReplaySensorModel = repo.get_replay_sensor(hostname)

        if not sensor:
            v.errors.append(ServiceMsg(msg="The sensor does not exist.", type=ServiceMsgType.ERROR, msg_type=ServiceErrorType.NO_FILE_PROVIDED))
            return v, None

        v.success = True
        return v, sensor

    def _get_replayers(self, sensor: ReplaySensorModel, preserve_timestamp: bool) -> List[Replayer]:
        """
        Get the list of replayers based on the given sensor and preservation of timestamp.

        Args:
            sensor: The ReplaySensorModel object representing the sensor.
            preserve_timestamp: A boolean indicating whether to preserve the timestamp.

        Returns:
            List[Replayer]: The list of Replayer objects.
        """
        return [ReplayerFactory.get(app, sensor) for app in sensor.apps] if preserve_timestamp else [ReplayerFactory.get("tcpreplay", sensor)]

@job("default", connection=REDIS_CLIENT, timeout="30m", result_ttl=500)
def run_replay_job(replayers, pcap, replay_message, notification):
    """
    Run a replay job for a pcap file. The job sends status updates to the websocket api.
    Those updates are: STARTED, IN_PROGRESS, COMPLETED, ERROR, and FAILED.

    Args:
        replayers: The list of replayers to execute.
        pcap: The pcap file to replay.
        replay_message: The message indicating the type of replay.
        notification: The notification object for sending status updates.

    Examples:
        This function is typically used as a decorator for a job function.
    """

    get_app_context().push()

    def inline_notify(status: NotificationCode, message: str, exception: Exception = None):
        """
        Needed due to the fact that we can not reference the service object from within the job function.
        """
        rq_logger.info(f"Sending notification to websocket api. Status: {status.name}, Message: {message}")
        rq_logger.exception(exception) if exception else None
        rq_logger.error(message) if status in (NotificationCode.ERROR, NotificationCode.FAILED) else None
        notification.set_status(status=status.name)
        notification.set_message(message)
        notification.post_to_websocket_api()

    try:
        inline_notify(NotificationCode.STARTED, f"{replay_message} has started.")
        for replayer in replayers:
            try:
                # Execute the replayer
                replayer_instance_message = replayer.execute(pcap)
                if replayer_instance_message:
                    inline_notify(NotificationCode.IN_PROGRESS, f"{replay_message} is in progress. {str(replayer_instance_message)}")
            except Exception as e:
                # Log the exception and continue to the next replayer
                msg = f"Error executing {type(replayer).__name__}: {e}"
                inline_notify(NotificationCode.FAILED, msg, e)
                continue

    except Exception as e:
        inline_notify(NotificationCode.ERROR, f"Error running replay: {e}", e)
    finally:
        msg = f"{replay_message} has completed."
        inline_notify(NotificationCode.COMPLETED, msg)

