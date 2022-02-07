import base64
import glob
import shutil
import traceback
from pathlib import Path
from typing import Dict
from uuid import uuid4

from app.models.ruleset import PCAPReplayModel
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import (
    REDIS_CLIENT,
    FabricConnectionManager,
    KubernetesWrapper,
)
from app.utils.constants import (
    ARKIME_IMAGE_VERSION,
    PCAP_UPLOAD_DIR,
    SURICATA_IMAGE_VERSION,
    SURICATA_RULESET_LOC,
    ZEEK_IMAGE_VERSION,
)
from app.utils.elastic import get_elastic_service_ip
from app.utils.logging import rq_logger
from app.utils.utils import get_app_context
from rq.decorators import job

from .catalog_service import get_node_apps


@job("default", connection=REDIS_CLIENT, timeout="30m")
def replay_pcap_using_tcpreplay(payload: Dict, root_password: str):
    get_app_context().push()
    replay = PCAPReplayModel(payload)
    notification = NotificationMessage(role="pcap")
    notification.set_status(status=NotificationCode.STARTED.name)
    notification.set_message("{} replay started.".format(replay.pcap))
    notification.post_to_websocket_api()

    try:
        pcap_file = Path(PCAP_UPLOAD_DIR + "/" + replay.pcap)
        if not pcap_file.exists() or not pcap_file.is_file():
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(
                "{} does not exist or is not a file.".format(str(pcap_file))
            )
            notification.post_to_websocket_api()

        with FabricConnectionManager(
            "root", root_password, replay.sensor_ip
        ) as ssh_con:
            remote_pcap = "/tmp/{}".format(replay.pcap)
            ssh_con.put(str(pcap_file), remote_pcap)
            for iface in replay.ifaces:
                ssh_con.run("tcpreplay --mbps=100 -i {} {}".format(iface, remote_pcap))
            ssh_con.run("rm -f {}".format(remote_pcap))

        notification.set_status(status=NotificationCode.COMPLETED.name)
        notification.set_message("Completed tcpreplay of {}.".format(replay.pcap))
        notification.post_to_websocket_api()
    except Exception as e:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()


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


class SuricataReplayer:
    def __init__(self, replay: PCAPReplayModel, kit_password: str):
        self.replay = replay
        self.kit_password = kit_password
        self.tmp_dir = None
        self.logs_dir = None
        self.suricata_config = None
        self.filebeat_config = None

    def pull_suricata_rules(self):
        suricata_rules = "{}/suricata.rules".format(self.tmp_dir)
        with FabricConnectionManager(
            "root", self.kit_password, self.replay.sensor_ip
        ) as ssh_con:
            ssh_con.get(SURICATA_RULESET_LOC, suricata_rules)

    def push_logs_files(self):
        with FabricConnectionManager(
            "root", self.kit_password, self.replay.sensor_ip
        ) as ssh_con:
            for path in glob.glob(str(self.logs_dir) + "/*"):
                filename = Path(path).name
                pos = filename.rfind(".")
                filename = filename[0:pos] + "-ingest" + filename[pos:]
                dst_path = "/data/suricata/{}".format(filename)
                rq_logger.debug("Sending {} to {}".format(path, dst_path))
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
            raise Exception("The configuration file is missing expected runmode.")

        lines[line_index_to_change] = "runmode: single\n"
        with open(self.suricata_config, "w") as fhandle:
            fhandle.writelines(lines)

    def run_suricata_docker_cmd(self, pcap: Path) -> int:
        pcap_name = pcap.name
        cmd = (
            "docker run --rm -v {pcap_path}:/data/pcap/{pcap_name} "
            "-v {tmp_dir}/suricata.rules:/etc/suricata/rules/suricata.rules "
            "-v {tmp_dir}/suricata.yaml:/etc/suricata/suricata.yaml "
            "-v {tmp_dir}/logs:/logs localhost:5000/tfplenum/suricata:{version} "
            "-c /etc/suricata/suricata.yaml "
            "-r /data/pcap/{pcap_name} -l /logs"
        ).format(
            pcap_path=str(pcap),
            pcap_name=pcap_name,
            tmp_dir=self.tmp_dir,
            version=SURICATA_IMAGE_VERSION,
        )
        rq_logger.debug(cmd)
        stdout, ret_val = run_command2(cmd, use_shell=True)
        rq_logger.debug(stdout)
        return ret_val

    def _is_installed(self):
        applications = [
            i["application"] for i in get_node_apps(self.replay.sensor_hostname)
        ]
        return "suricata" in applications

    def execute(self, pcap: Path):
        if not self._is_installed():
            rq_logger.warn("Skipping, Suricata is not installed on the target sensors")
            return

        self.tmp_dir = "/root/" + str(uuid4())[0:6]
        Path(self.tmp_dir).mkdir()
        try:
            self.logs_dir = Path(self.tmp_dir + "/logs")
            self.logs_dir.mkdir(exist_ok=True, parents=False)
            self.suricata_config = "{}/suricata.yaml".format(self.tmp_dir)
            self.filebeat_config = "{}/filebeat.yml".format(self.tmp_dir)

            self.pull_suricata_rules()
            self.pull_suricata_config_map()
            self.patch_configuation()
            if self.run_suricata_docker_cmd(pcap) != 0:
                raise Exception(
                    "Failed to replay the PCAP using suricata. View /var/log/tfplenum/rq.log for more details."
                )
            self.push_logs_files()
        finally:
            shutil.rmtree(self.tmp_dir)


class ZeekReplayer:
    def __init__(self, replay: PCAPReplayModel, kit_password: str):
        self.replay = replay
        self.kit_password = kit_password
        self.tmp_dir = None  # type: str
        self.logs_dir = None  # type: Path
        self.local_zeek_config = None  # type: str
        self.zeek_scripts = None  # type: Path

    def pull_zeek_custom_scripts(self):
        zip_location = self.tmp_dir + "/zeek.zip"
        with FabricConnectionManager(
            "root", self.kit_password, self.replay.sensor_ip
        ) as ssh_con:
            with ssh_con.cd("/opt/tfplenum"):
                ssh_con.run("zip -r zeek.zip zeek/")
            ssh_con.get("/opt/tfplenum/zeek.zip", zip_location)
            ssh_con.local("unzip {} -d {}".format(zip_location, self.tmp_dir))

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

    def run_zeek_docker_cmd(self, pcap: Path) -> int:
        pcap_name = pcap.name
        cmd = (
            "docker run -v {tmp_dir}/zeek/intel.dat:/opt/tfplenum/zeek/intel.dat "
            "-v {tmp_dir}/zeek/custom.sig:/opt/tfplenum/zeek/custom.sig "
            "-v {tmp_dir}/zeek/scripts/:/opt/zeek/share/zeek/site/custom "
            "-v {tmp_dir}/local.zeek:/opt/zeek/share/zeek/site/local.zeek "
            "-v {pcap_path}:/pcaps/{pcap_name} "
            "-v {tmp_dir}/scripts/:/opt/zeek/share/zeek/site/tfplenum/ "
            "-v {tmp_dir}/logs/:/data/zeek/ "
            "--workdir /data/zeek/ "
            "localhost:5000/tfplenum/zeek:{version} "
            "-r /pcaps/{pcap_name} "
            "/opt/zeek/share/zeek/site/local.zeek"
        ).format(
            tmp_dir=self.tmp_dir,
            pcap_path=str(pcap),
            pcap_name=pcap_name,
            version=ZEEK_IMAGE_VERSION,
        )
        rq_logger.debug(cmd)
        stdout, ret_val = run_command2(cmd, use_shell=True)
        rq_logger.debug(stdout)
        return ret_val

    def push_logs_files(self):
        with FabricConnectionManager(
            "root", self.kit_password, self.replay.sensor_ip
        ) as ssh_con:
            for path in glob.glob(str(self.logs_dir) + "/*"):
                filename = Path(path).name
                pos = filename.rfind(".")
                filename = filename[0:pos] + "-ingest" + filename[pos:]
                dst_path = "/data/zeek/{}".format(filename)
                rq_logger.debug("Sending {} to {}".format(path, dst_path))
                ssh_con.put(path, dst_path)

    def _is_installed(self):
        applications = [
            i["application"] for i in get_node_apps(self.replay.sensor_hostname)
        ]
        return "zeek" in applications

    def execute(self, pcap: Path):
        if not self._is_installed():
            rq_logger.warn("Skipping, Zeek is not installed on the target sensors")
            return

        self.tmp_dir = "/root/" + str(uuid4())[0:6]
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
                raise Exception(
                    "Failed to replay the PCAP using zeek. View /var/log/tfplenum/rq.log for more details."
                )
            self.push_logs_files()
        finally:
            shutil.rmtree(self.tmp_dir)


class ArkimeReplayer:
    def __init__(self, replay: PCAPReplayModel, kit_password: str):
        self.replay = replay
        self.kit_password = kit_password
        self.tmp_dir = None  # type: str
        self.logs_dir = None  # type: Path
        self.arkime_config = None  # type: str
        self.ca_crt = None  # type: str
        ip, port = get_elastic_service_ip()
        self.elastic_ip = ip
        self.elastic_port = port

    def _get_arkime_config_data(self, search_dict: Dict):
        for i in search_dict["items"]:
            if (
                i["metadata"]["namespace"] == "default"
                and "arkime" in i["metadata"]["name"]
            ):
                # We do not want the config.ini file from arkime-viewer we need the capture config which is why this check is performed.
                if i["metadata"]["name"] != "arkime-viewer":
                    try:
                        return i["data"]["config.ini"]
                    except KeyError:
                        pass
        return ""

    def pull_config_maps(self):
        with KubernetesWrapper() as kube_apiv1:
            api_response = kube_apiv1.list_config_map_for_all_namespaces()
            config_map = self._get_arkime_config_data(api_response.to_dict())

            with Path(self.arkime_config).open("w") as fp:
                fp.write(config_map)

            secret_name = "webca-certificate"
            secrets = kube_apiv1.list_namespaced_secret("default")
            for secret in secrets.items:  # type: V1Secret
                if secret.metadata.name == secret_name:
                    with Path(self.ca_crt).open("w") as fp:
                        fp.write(str(base64.b64decode(secret.data["ca.crt"]), "UTF-8"))
                    break

    def run_arkime_docker_cmd(self, pcap: Path):
        pcap_name = pcap.name
        cmd = (
            "docker run --rm -v {pcap_path}:/pcaps/{pcap_name} "
            "-v {tmp_dir}/config.ini:/data/moloch/etc/config.ini "
            "-v {tmp_dir}/ca.crt:/etc/ssl/certs/container/ca.crt "
            "--add-host tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster.local:{elastic_ip} "
            "localhost:5000/tfplenum/arkime:{version} "
            "/data/moloch/bin/moloch-capture -c /data/moloch/etc/config.ini "
            "-r /pcaps/{pcap_name}"
        ).format(
            pcap_path=str(pcap),
            pcap_name=pcap_name,
            tmp_dir=self.tmp_dir,
            elastic_ip=self.elastic_ip,
            version=ARKIME_IMAGE_VERSION,
        )
        rq_logger.debug(cmd)
        stdout, ret_val = run_command2(cmd, use_shell=True)
        rq_logger.debug(stdout)
        return ret_val

    def patch_configuation(self):
        lines = []
        with open(self.arkime_config) as fhandle:
            lines = fhandle.readlines()

        line_index_to_change = -1
        for index, line in enumerate(lines):
            if "elasticsearch" in line:
                line_index_to_change = index
                break

        if line_index_to_change == -1:
            raise Exception("The configuration file is missing expected elasticsearch.")

        lines[
            line_index_to_change
        ] = "elasticsearch=https://arkime:password@tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster.local:9200\n"
        with open(self.arkime_config, "w") as fhandle:
            fhandle.writelines(lines)

    def _is_installed(self):
        applications = [
            i["application"] for i in get_node_apps(self.replay.sensor_hostname)
        ]
        return "arkime" in applications

    def execute(self, pcap: Path):
        if not self._is_installed():
            rq_logger.warn("Skipping, Arkime is not installed on the target sensor.")
            return

        self.tmp_dir = "/root/" + str(uuid4())[0:6]
        Path(self.tmp_dir).mkdir(exist_ok=True)
        try:
            self.logs_dir = Path(self.tmp_dir + "/logs")
            self.logs_dir.mkdir(exist_ok=True, parents=False)
            self.arkime_config = "{}/config.ini".format(self.tmp_dir)
            self.ca_crt = "{}/ca.crt".format(self.tmp_dir)
            self.pull_config_maps()
            self.patch_configuation()
            if self.run_arkime_docker_cmd(pcap) != 0:
                raise Exception(
                    "Failed to replay the PCAP using Arkime. View /var/log/tfplenum/rq.log for more details."
                )
        finally:
            shutil.rmtree(self.tmp_dir)


@job("default", connection=REDIS_CLIENT, timeout="30m")
def replay_pcap_using_preserve_timestamp(payload: Dict, root_password: str):
    get_app_context().push()
    replay = PCAPReplayModel(payload)
    notification = NotificationMessage(role="pcap")
    notification.set_status(status=NotificationCode.STARTED.name)
    notification.set_message("{} replay started.".format(replay.pcap))
    notification.post_to_websocket_api()

    try:
        pcap = Path(PCAP_UPLOAD_DIR + "/" + replay.pcap)
        if not pcap.exists() or not pcap.is_file():
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(
                "{} does not exist or is not a file.".format(str(pcap))
            )
            notification.post_to_websocket_api()

        suricata_replayer = SuricataReplayer(replay, root_password)
        suricata_replayer.execute(pcap)

        zeek_replayer = ZeekReplayer(replay, root_password)
        zeek_replayer.execute(pcap)

        arkime_replayer = ArkimeReplayer(replay, root_password)
        arkime_replayer.execute(pcap)

        notification.set_status(status=NotificationCode.COMPLETED.name)
        notification.set_message("Completed tcpreplay of {}.".format(replay.pcap))
        notification.post_to_websocket_api()
    except Exception as e:
        rq_logger.exception(e)
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
