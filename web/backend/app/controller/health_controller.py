"""
Main module for handling all of the Kit Configuration REST calls.
"""
import time
# Type annotations
from typing import Dict, List

import requests
from app.common import ERROR_RESPONSE, NO_CONTENT
from app.middleware import login_required_roles
from app.models.health import DatastoreModel
from app.models.kubernetes import (KubernetesNodeMetricsModel,
                                   KubernetesPodMetricsModel,
                                   NodeOrPodStatusModel, PodLogsModel)
from app.models.nodes import Node
from app.models.settings.esxi_settings import EsxiSettingsForm
from app.service.health_service import (get_k8s_app_nodes, get_nodes_status,
                                        get_pods_status, get_suricata_stats,
                                        get_zeek_stats)
from app.service.job_service import run_command
from app.service.socket_service import (NotificationCode, NotificationMessage,
                                        notify_disk_pressure)
from app.utils import snmp
from app.utils.collections import mongo_kit_tokens, mongo_metrics
from app.utils.connection_mngs import KubernetesWrapper
from app.utils.constants import NODE_TYPES
from app.utils.elastic import ElasticWrapper
from app.utils.logging import logger
from app.utils.namespaces import APP_NS, HEALTH_NS, KUBERNETES_NS
from bson import ObjectId
from flask import Response, request
from flask_restx import Resource, fields
from kubernetes.client.models.v1_pod_list import V1PodList


@KUBERNETES_NS.route("/pod/describe/<pod_name>/<namespace>")
class DescribePod(Resource):
    @KUBERNETES_NS.doc(
        description="The stdout field is the content returned from a kubectl describe pod <pod_name> -n <namespace> command."
    )
    @KUBERNETES_NS.response(200, "PodStatus", NodeOrPodStatusModel.DTO)
    def get(self, pod_name: str, namespace: str) -> Response:
        command = "kubectl describe pod " + pod_name + " -n " + namespace
        stdout = run_command(command)
        return {"stdout": stdout, "stderr": ""}


@KUBERNETES_NS.route("/pod/logs/<pod_name>/<namespace>")
class PodLogsCtrl(Resource):
    @KUBERNETES_NS.response(200, "PodLogs", PodLogsModel.DTO)
    @KUBERNETES_NS.doc(
        description="Runs a command and pulls the pods describe command output."
    )
    def get(self, pod_name: str, namespace: str) -> Response:
        logs = []
        with KubernetesWrapper() as kube_apiv1:
            pod = kube_apiv1.read_namespaced_pod(
                pod_name, namespace)  # type: V1PodList
            pod = pod.to_dict()
            containers = []
            if (
                "spec" in pod
                and "init_containers" in pod["spec"]
                and pod["spec"]["init_containers"]
            ):
                containers = containers + pod["spec"]["init_containers"]
            if (
                "spec" in pod
                and "containers" in pod["spec"]
                and pod["spec"]["containers"]
            ):
                containers = containers + pod["spec"]["containers"]
            for container in containers:
                container_name = container["name"]
                try:
                    stdout = kube_apiv1.read_namespaced_pod_log(
                        pod_name, namespace, container=container_name, timestamps=False
                    )
                except Exception:
                    stdout = "Something went wrong fetching container logs"
                logs.append({"name": container_name, "logs": stdout})
        return logs


@KUBERNETES_NS.route("/node/describe/<node_name>")
class DescribeNode(Resource):
    @KUBERNETES_NS.doc(
        description="The stdout field is the content returned from a kubectl describe node command."
    )
    @KUBERNETES_NS.response(200, "NodeOrPodStatus", NodeOrPodStatusModel.DTO)
    def get(self, node_name: str) -> Response:
        command = "kubectl describe node " + node_name
        stdout = run_command(command)
        return {"stdout": stdout, "stderr": ""}


@KUBERNETES_NS.route("/nodes/status")
class NodesStatus(Resource):
    @KUBERNETES_NS.doc(description="Gets the nodes status.")
    @KUBERNETES_NS.response(200, "PodsStatus", [KubernetesNodeMetricsModel.DTO])
    def get(self) -> Response:
        try:
            return get_nodes_status()
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@KUBERNETES_NS.route("/pods/status")
class PodsStatus(Resource):
    @KUBERNETES_NS.doc(description="Gets the pods status.")
    @KUBERNETES_NS.response(200, "NodeStatus", [KubernetesPodMetricsModel.DTO])
    def get(self) -> Response:
        try:
            return get_pods_status()
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@KUBERNETES_NS.route("/remote/<token_id>/nodes/status")
class RemoteNodesStatus(Resource):
    def get(self, token_id: str) -> Response:
        try:
            response = mongo_kit_tokens().find_one({"_id": ObjectId(token_id)})
            node_status = response["node_status"]
            return node_status

        except Exception as e:
            logger.exception(e)
            return ERROR_RESPONSE


@KUBERNETES_NS.route("/remote/<token_id>/pods/status")
class RemotePodsStatus(Resource):
    def get(self, token_id: str) -> Response:
        try:
            response = mongo_kit_tokens().find_one({"_id": ObjectId(token_id)})
            pod_status = response["pod_status"]
            return pod_status

        except Exception as e:
            logger.exception(e)
            return ERROR_RESPONSE


@HEALTH_NS.route("/snmp/status")
class SNMPStatus(Resource):
    @HEALTH_NS.response(200, "SNMPData", [fields.Raw()])
    def get(self) -> Response:
        try:
            return snmp.status()
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@HEALTH_NS.route("/snmp/alerts")
class SNMPAlerts(Resource):
    @HEALTH_NS.response(200, "SNMPAlertList", [fields.Raw()])
    def get(self) -> Response:
        try:
            client = ElasticWrapper()
            body = {
                "size": 500,
                "query": {
                    "bool": {
                        "filter": [
                            {"term": {"type": "alert"}},
                            {"range": {"@timestamp": {"gte": "now-1m"}}},
                        ]
                    }
                },
                "sort": [{"@timestamp": {"order": "desc"}}],
            }
            alerts = []
            for alert in client.search(index="logstash", body=body)["hits"]["hits"]:
                alerts.append(alert["_source"])
            return alerts
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@HEALTH_NS.route("/remote/agent")
class RemoteAgent(Resource):
    @HEALTH_NS.response(204, "RemoteHealthData")
    @login_required_roles(
        ["metrics", "operator", "controller-admin", "controller-maintainer"],
        all_roles_req=False,
    )
    def post(self) -> Response:
        try:
            payload = request.get_json()
            payload["timestamp"] = time.time()
            ipaddress = payload["ipaddress"]
            mongo_kit_tokens().replace_one({"ipaddress": ipaddress}, payload)
            return NO_CONTENT
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@HEALTH_NS.route("/datastores")
class Datastores(Resource):
    @HEALTH_NS.response(200, "DatastoreList", [DatastoreModel.DTO])
    def get(self) -> Response:
        try:
            settings = EsxiSettingsForm.load_from_db()
            if not settings:
                return []
            ip_address = str(settings.ip_address)
            response = requests.post(
                f"https://{ip_address}/rest/com/vmware/cis/session",
                auth=(settings.username, settings.password),
                verify=False,
            )
            session_id = response.json()["value"]
            headers = {"vmware-api-session-id": session_id}
            datastores = requests.get(
                f"https://{ip_address}/rest/vcenter/datastore",
                verify=False,
                headers=headers,
            )
            response = requests.delete(
                f"https://{ip_address}/rest/com/vmware/cis/session",
                verify=False,
                headers=headers,
            )
            return datastores.json()["value"]
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route("/elasticsearch/rejects")
class WriteRejects(Resource):
    @APP_NS.response(200, "Elasticsearch Write Rejects", [fields.Raw()])
    def get(self) -> Response:
        try:
            rejected = []
            client = ElasticWrapper()
            response = client.cat.thread_pool(format="json")
            for item in response:
                if int(item["rejected"]) > 0:
                    rejected.append(item)

            return rejected

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route("/elasticsearch/rejects/remote/<ipaddress>")
class RemoteWriteRejects(Resource):
    @APP_NS.response(204, "Remote Elasticsearch Write Rejects", [fields.Raw()])
    def get(self, ipaddress: str) -> Response:
        try:
            response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
            write_rejects = response["write_rejects"]
            return write_rejects

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route("/zeek/packets")
class ZeekPackets(Resource):
    @APP_NS.response(200, "Zeek Packets")
    def get(self) -> Response:
        zeek_stats = []

        try:
            nodes = get_k8s_app_nodes("zeek")
            if nodes:
                for sensor in nodes:
                    # ignores closed but not deleted indices
                    stats = get_zeek_stats(
                        sensor["node_name"], ignore_unavailable=True)

                    if stats["hits"]["total"]["value"] > 0:
                        packets_dropped = int(
                            round(
                                stats["aggregations"]["zeek_total_pkts_dropped"][
                                    "value"
                                ]
                            )
                        )
                        packets_received = int(
                            round(
                                stats["aggregations"]["zeek_total_pkts_received"][
                                    "value"
                                ]
                            )
                        )
                        percent_dropped = (
                            packets_dropped / packets_received * 100
                            if packets_received > 0
                            else 0
                        )
                        zeek_stats.append(
                            {
                                "app": "zeek",
                                "node_name": sensor["node_name"],
                                "packets_received": packets_received,
                                "packets_dropped": round(percent_dropped, 2),
                            }
                        )

            return zeek_stats

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route("/suricata/packets")
class SuricataPackets(Resource):
    @APP_NS.response(200, "Suricata Packets")
    def get(self) -> Response:
        suricata_stats = []

        try:
            nodes = get_k8s_app_nodes("suricata")
            if nodes:
                for node in nodes:
                    node_name = node["node_name"]
                    total_packets, total_dropped = get_suricata_stats(node)
                    print(total_packets, total_dropped)
                    percent_dropped = (
                        total_dropped / total_packets * 100 if total_packets > 0 else 0
                    )
                    suricata_stats.append(
                        {
                            "app": "suricata",
                            "node_name": node_name,
                            "packets_received": total_packets,
                            "packets_dropped": round(percent_dropped, 2),
                        }
                    )
            return suricata_stats

        except Exception as e:
            logger.exception(e)
            return ERROR_RESPONSE


@APP_NS.route("/zeek/packets/remote/<ipaddress>")
class RemoteZeekPackets(Resource):
    @APP_NS.response(200, "Remote Zeek Packets")
    def get(self, ipaddress: str) -> Response:
        try:
            response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
            zeek_packets = response["zeek"]
            return zeek_packets

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route("/suricata/packets/remote/<ipaddress>")
class RemoteSuricataPackets(Resource):
    @APP_NS.response(200, "Remote Suricata Packets")
    def get(self, ipaddress: str) -> Response:
        try:
            response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
            suricata_packets = response["suricata"]
            return suricata_packets

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@HEALTH_NS.route("/metrics")
class Metrics(Resource):
    @login_required_roles(["metrics"], all_roles_req=False)
    def post(self) -> Response:
        data = request.get_json()
        status = 200
        replaced = []
        for document in data:
            try:
                mongo_metrics().find_one_and_replace(
                    {
                        "hostname": document["hostname"],
                        "name": document["name"],
                        "type": document["type"],
                    },
                    document,
                    upsert=True,
                )
                replaced.append(document)
                disk_pressure_warning = False
                disk_pressure_critical = False
                if (
                    "disk_pressure_warning" in document
                    and document["disk_pressure_warning"]
                ):
                    disk_pressure_warning = True
                if (
                    "disk_pressure_critical" in document
                    and document["disk_pressure_critical"]
                ):
                    disk_pressure_critical = True

                if disk_pressure_warning or disk_pressure_critical:
                    node = Node.load_from_db_using_hostname(
                        document["hostname"]
                    )  # type: Node
                    if disk_pressure_warning:
                        disk_pressure_type = "warning"
                    if disk_pressure_critical:
                        disk_pressure_type = "critical"
                    if node.node_type == NODE_TYPES.server.value:
                        rem = "Delete data from elastic immediately"
                    if node.node_type == NODE_TYPES.sensor.value:
                        rem = "Delete data from /data immediately"
                    disk_name = "data"
                    if document["name"] == "root_usage":
                        disk_name = "root"

                    notification = NotificationMessage(
                        role="nodes",
                        action=NotificationCode.ERROR.name.capitalize(),
                        application="disk-pressure",
                    )
                    notification.set_status(status=NotificationCode.ERROR.name)
                    notification.set_and_send(
                        "Disk pressure {} on {} for {} disk at {}%.  Action: {}".format(
                            disk_pressure_type,
                            document["hostname"],
                            disk_name,
                            document["value"]["percent"],
                            rem,
                        )
                    )

                    if disk_pressure_critical:
                        notify_disk_pressure(notification.message)

            except Exception as e:
                logger.exception(e)
                status = 500

        return replaced, status
