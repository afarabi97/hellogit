"""
Main module for handling all of the Kit Configuration REST calls.
"""
from app.models.kubernetes import (NodeOrPodStatusModel, PodLogsModel)
from app.utils.logging import logger
from app.resources import convert_kib_to_gib, convert_gib_to_kib, convert_mib_to_kib
import time

from app import conn_mng, KUBERNETES_NS, HEALTH_NS
from app.common import ERROR_RESPONSE, NO_CONTENT, NOTFOUND_RESPONSE
from app.models.kubernetes import NodeOrPodStatusModel, PodLogsModel
from app.service.job_service import run_command
from app.utils.connection_mngs import KubernetesWrapper, objectify
from app.utils import snmp
from app.utils.elastic import ElasticWrapper
from app.models.health import DatastoreModel
from app.models.kubernetes import KubernetesNodeMetricsModel, KubernetesPodMetricsModel
from app.models.settings.esxi_settings import EsxiSettingsForm
from app.middleware import login_required_roles

from flask import Response, jsonify, request
from flask_restx import Resource, fields

from kubernetes.client.rest import ApiException
from kubernetes.utils import parse_quantity
from kubernetes.stream import stream

from decimal import Decimal

from bson import ObjectId

# Type annotations
from typing import List, Dict, Optional, TypeVar, Iterable
from app.models.nodes import Node
from kubernetes.client.models.v1_pod_list import V1PodList
from kubernetes.client.models.v1_pod import V1Pod
from kubernetes.client.models.v1_pod_condition import V1PodCondition
from kubernetes.client.models.v1_node_list import V1NodeList
from kubernetes.client.models.v1_node import V1Node
from kubernetes.client.models.v1_node_condition import V1NodeCondition
from kubernetes.client.models.v1_event_list import V1EventList

import requests

T = TypeVar("T")

def _len(_list: Optional[List[T]]) -> int:
    if _list:
        return len(_list)
    else:
        return 0

def get_warnings(pod: V1Pod) -> Optional[int]:
    if not is_ready_or_succeeded(pod):
        return len(get_event_warnings(pod).items)
    return None

def is_ready_or_succeeded(pod: V1Pod) -> bool:
    if pod.status.phase == "Succeeded":
        return True

    if pod.status.phase == "Running":
        for condition in pod.status.conditions:
            if condition.type == "Ready" and condition.status == "False":
                return False
        return True

    return False

def get_event_warnings(pod: V1Pod) -> V1EventList:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        field_selector = f"involvedObject.uid={pod.metadata.uid},type=Warning"
        try:
            return kube_apiv1.list_event_for_all_namespaces(field_selector=field_selector) # type: V1EventList
        except ApiException as e:
            logger.exception("Exception when calling CoreV1Api->list_event_for_all_namespaces: %s\n" % e)
            return None

# https://github.com/kubernetes/dashboard/blob/7a5d7e26c502d24d568401ec55a3f0d3d39a2fda/src/app/backend/resource/pod/common.go#L40
def get_pod_status(pod: V1Pod) -> str:
    restarts = 0
    ready_containers = 0

    reason = pod.status.phase
    if pod.status.reason:
        reason = pod.status.reason

    initializing = False
    for i in range(_len(pod.status.init_container_statuses)):
        container = pod.status.init_container_statuses[i]
        restarts += container.restart_count

        if container.state.terminated and container.state.terminated.exit_code == 0:
            continue

        if container.state.terminated:
            # initialization is failed
            if len(container.state.terminated.reason) == 0:
                if container.state.terminated.signal != 0:
                    reason = f"Init: Signal {container.state.terminated.signal}"
                else:
                    reason = f"Init: ExitCode {container.state.terminated.exit_code}"
            else:
                reason = "Init:" + container.state.terminated.reason
            initializing = True

        if container.state.waiting and len(container.sate.waiting.reason) > 0 and container.state.waiting.reason != "PodInitializing":
            reason = f"Init: {container.state.waiting.reason}"
            initializing = True

        reason = f"Init: {i}/{len(pod.spec.init_containers)}"
        initializing = True
        break

    if not initializing:
        restarts = 0
        has_running = False
        for i in range(_len(pod.status.container_statuses) - 1, -1, -1):
            container = pod.status.container_statuses[i]
            restarts += container.restart_count
            if container.state.waiting and container.state.waiting.reason:
                reason = container.state.waiting.reason
            elif container.state.terminated and container.state.terminated.reason:
                reason = container.state.terminated.reason
            elif container.state.terminated and not container.state.terminated.reason:
                if container.state.terminated.signal != 0:
                    reason = f"Signal: {container.state.terminated.signal}"
                else:
                    reason = f"ExitCode: {container.state.terminated.exit_code}"
            elif container.ready and container.state.running:
                has_running = True
                ready_containers += 1

    # change pod status back to "Running" if there is at least one container still reporting as "Running" status
    if reason == "Completed" and has_running:
        if has_pod_ready_condition(pod.status.conditions):
            reason = "Running"
        else:
            reason = "NotReady"

    if pod.metadata.deletion_timestamp and pod.status.reason == "NodeLost":
        reason = "Unknown"
    elif pod.metadata.deletion_timestamp:
        reason = "Terminating"

    if len(reason) == 0:
        reason = "Unknown"

    return reason

def has_pod_ready_condition(conditions: List[V1PodCondition]) -> bool:
    for condition in conditions:
        if condition.type == "Ready" and condition.status == "True":
            return True
    return False

def get_restart_count(pod: V1Pod) -> int:
    count = 0
    for i in range(_len(pod.status.init_container_statuses)):
        count += pod.status.init_container_statuses[i].restart_count
    for i in range(_len(pod.status.container_statuses)):
        count += pod.status.container_statuses[i].restart_count
    return count

def get_container_states(pod: V1Pod) -> dict:
    states = []
    for i in range(_len(pod.status.container_statuses)):
        container = pod.status.container_statuses[i]

        if container.state.running:
            states.append(f"{container.name}: running")

        if container.state.terminated:
            states.append(f"{container.name}: terminated: {container.state.terminated.reason}")

        if container.state.waiting:
            states.append(f"{container.name}: waiting: {container.state.waiting.reason}")
    return states

def get_container_resources(pod: V1Pod) -> dict:
    resources = []
    for i in range(_len(pod.spec.containers)):
        container = pod.spec.containers[i]

        resources.append({
            "name": container.name,
            "resources": container.resources.to_dict()
        })
    return resources

def has_node_ready_condition(conditions: V1NodeCondition) -> bool:
    for condition in conditions:
        if condition.type == "Ready" and condition.status == "True":
            return True
    return False

def get_node_internal_ip(node: V1Node) -> str:
    for address in node.status.addresses:
        if address.type == "InternalIP":
            return address.address

def get_node_hostname(node: V1Node) -> str:
    for address in node.status.addresses:
        if address.type == "Hostname":
            return address.address

def get_storage(hostname: str) -> Optional[list]:
    root_usage = conn_mng.mongo_metrics.find_one({"hostname": hostname, "name": "root_usage"})
    data_usage = conn_mng.mongo_metrics.find_one({"hostname": hostname, "name": "data_usage"})
    storage = []
    if root_usage:
        storage.append({"name": "root", "free": root_usage["value"]["free"], "percent": root_usage["value"]["percent"]})
    if data_usage:
        storage.append({"name": "data", "free": data_usage["value"]["free"], "percent": data_usage["value"]["percent"]})
    if len(storage) > 0:
        return storage
    return None

def get_cpu(hostname: str) -> Optional[int]:
    cpu_percent = conn_mng.mongo_metrics.find_one({"hostname": hostname, "name": "cpu_percent"})
    if cpu_percent:
        return cpu_percent["value"]
    return None

def get_memory(hostname: str) -> Optional[dict]:
    memory = conn_mng.mongo_metrics.find_one({"hostname": hostname, "name": "memory"})
    if memory:
        return {
            "available": memory["value"]["available"],
            "percent": memory["value"]["percent"]
        }
    return None

def get_remaining(node: V1Node, pods: Iterable[V1Pod]) -> dict:
    allocatable_cpu = parse_quantity(node.status.allocatable.get("cpu", 0))
    allocatable_memory = parse_quantity(node.status.capacity.get("memory", 0))
    requests_cpu = Decimal(0)
    requests_memory = Decimal(0)
    for pod in pods:
        for container in pod.spec.containers:
            if container.resources.requests:
                requests_cpu += parse_quantity(container.resources.requests.get("cpu", 0))
                requests_memory += parse_quantity(container.resources.requests.get("memory", 0))
    remaining_cpu = allocatable_cpu - requests_cpu
    remaining_memory = allocatable_memory - requests_memory
    return {
        "cpu": convert_to_m(remaining_cpu),
        "memory": convert_to_gi(remaining_memory)
    }

def to_quantity(value: Decimal, si: str, ndigits=3) -> str:
    factor = ({
        "Ki": 1024,
        "Mi": 1024**2,
        "Gi": 1024**3,
        "Ti": 1024**4,
        "Pi": 1024**5,
        "Ei": 1024**6,
        "m": 1000,
        "": 1,
        "k": 1000,
        "M": 1000**2,
        "G": 1000**3,
        "T": 1000**4,
        "P": 1000**5,
        "E": 1000**6
    }).get(si)
    if si == "m":
        return str(int(value * factor)) + "m"
    if factor:
        return str(round(value / factor, ndigits)) + si
    return None

def convert_to_gi(number: Decimal, ndigits=3) -> str:
    return to_quantity(number, "Gi", ndigits)

def convert_to_m(number: Decimal) -> str:
    return to_quantity(number, "m")

def get_capacity(node: V1Node) -> dict:
    return {
        "cpu": convert_to_m(parse_quantity(node.status.capacity.get("cpu", 0))),
        "ephermeral-storage": convert_to_gi(parse_quantity(node.status.capacity.get("ephemeral-storage", 0))),
        "memory": convert_to_gi(parse_quantity(node.status.capacity.get("memory", 0))),
        "pods": node.status.capacity["pods"]
    }

def get_allocatable(node: V1Node, ndigits=3) -> dict:
    return {
        "cpu": convert_to_m(parse_quantity(node.status.allocatable.get("cpu", 0))),
        "ephermeral-storage": convert_to_gi(parse_quantity(node.status.allocatable.get("ephemeral-storage", 0))),
        "memory": convert_to_gi(parse_quantity(node.status.allocatable.get("memory", 0))),
        "pods": node.status.allocatable["pods"]
    }

def get_node_metrics(node: V1Node, pods: Iterable[V1Pod]) -> dict:
        hostname = get_node_hostname(node)
        return {
            "name": node.metadata.name,
            "address": get_node_internal_ip(node),
            "ready": has_node_ready_condition(node.status.conditions),
            "type": node.metadata.labels["role"],
            "storage": get_storage(hostname),
            "memory": get_memory(hostname),
            "cpu": get_cpu(hostname),
            "capacity": get_capacity(node),
            "allocatable": get_allocatable(node),
            "remaining": get_remaining(node, pods),
            "node_info": node.status.node_info.to_dict()
        }

def get_pod_metrics(pod: V1Pod) -> dict:
    _metrics = {
        "namespace": pod.metadata.namespace,
        "name": pod.metadata.name,
        "node_name": pod.spec.node_name,
        "status_brief": get_pod_status(pod),
        "restart_count": get_restart_count(pod),
        "states": get_container_states(pod),
        "resources": get_container_resources(pod),
        "status": objectify(pod.status.to_dict())
    }
    warnings = get_warnings(pod)
    if warnings:
        _metrics['warnings'] = warnings
    return _metrics

def _get_nodes_status() -> List[dict]:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        pods = kube_apiv1.list_pod_for_all_namespaces(watch=False) # type: V1PodList
        nodes = kube_apiv1.list_node() # type: V1NodeList

        _node_metrics = list(map(lambda node: get_node_metrics(node, filter(lambda pod: pod.spec.node_name == node.metadata.name, pods.items)), nodes.items))

        return _node_metrics

def _get_pods_status() -> List[dict]:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        pods = kube_apiv1.list_pod_for_all_namespaces(watch=False) # type: V1PodList

        _pod_metrics = list(map(lambda pod: get_pod_metrics(pod), pods.items))

        return _pod_metrics

@KUBERNETES_NS.route('/pod/describe/<pod_name>/<namespace>')
class DescribePod(Resource):

    @KUBERNETES_NS.doc(description="The stdout field is the content returned from a kubectl describe pod <pod_name> -n <namespace> command.")
    @KUBERNETES_NS.response(200, 'PodStatus', NodeOrPodStatusModel.DTO)
    def get(self, pod_name: str, namespace: str) -> Response:
        command = 'kubectl describe pod ' + pod_name + ' -n ' + namespace
        stdout = run_command(command)
        return {'stdout': stdout, 'stderr': ''}


@KUBERNETES_NS.route('/pod/logs/<pod_name>/<namespace>')
class PodLogsCtrl(Resource):

    @KUBERNETES_NS.response(200, 'PodLogs', PodLogsModel.DTO)
    @KUBERNETES_NS.doc(description="Runs a command and pulls the pods describe command output.")
    def get(self, pod_name: str, namespace: str) -> Response:
        logs = []
        with KubernetesWrapper(conn_mng) as kube_apiv1:
            pod = kube_apiv1.read_namespaced_pod(pod_name, namespace) # type: V1PodList
            pod = pod.to_dict()
            containers = []
            if "spec" in pod and "init_containers" in pod['spec'] and pod['spec']['init_containers']:
                containers = containers + pod['spec']['init_containers']
            if "spec" in pod and "containers" in pod['spec'] and pod['spec']['containers']:
                containers = containers + pod['spec']['containers']
            for container in containers:
                container_name = container['name']
                try:
                    stdout = kube_apiv1.read_namespaced_pod_log(pod_name, namespace, container=container_name, timestamps=False)
                except Exception:
                    stdout = 'Something went wrong fetching container logs'
                logs.append({'name': container_name, 'logs': stdout})
        return logs


@KUBERNETES_NS.route('/node/describe/<node_name>')
class DescribeNode(Resource):

    @KUBERNETES_NS.doc(description="The stdout field is the content returned from a kubectl describe node command.")
    @KUBERNETES_NS.response(200, 'NodeOrPodStatus', NodeOrPodStatusModel.DTO)
    def get(self, node_name: str) -> Response:
        command = 'kubectl describe node ' + node_name
        stdout = run_command(command)
        return {'stdout': stdout, 'stderr': ''}


@KUBERNETES_NS.route('/health/nodes/status')
class NodesStatus(Resource):

    @KUBERNETES_NS.doc(description="Gets the nodes status.")
    @KUBERNETES_NS.response(200, 'PodsStatus', [KubernetesNodeMetricsModel.DTO])
    def get(self):
        try:
            return _get_nodes_status()
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@KUBERNETES_NS.route('/health/pods/status')
class PodsStatus(Resource):

    @KUBERNETES_NS.doc(description="Gets the pods status.")
    @KUBERNETES_NS.response(200, 'NodeStatus', [KubernetesPodMetricsModel.DTO])
    def get(self):
        try:
            return _get_pods_status()
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/health/snmp/status')
class SNMPStatus(Resource):
    @HEALTH_NS.response(200, 'SNMPData', [fields.Raw()])
    def get(self) -> Response:
        try:
            return snmp.status()
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/health/snmp/alerts')
class SNMPAlerts(Resource):
    @HEALTH_NS.response(200, 'SNMPAlertList', [fields.Raw()])
    def get(self) -> Response:
        try:
            client = ElasticWrapper()
            body = {
                "size": 500,
                "query" : {"bool": {"filter": [{"term": {"type": "alert"}}, {"range": {"@timestamp": {"gte": "now-1m"}}}]}},
                "sort": [{"@timestamp": {"order": "desc"}}]
            }
            alerts = []
            for alert in client.search(index="logstash", body=body)["hits"]["hits"]:
                alerts.append(alert["_source"])
            return jsonify(alerts)
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@KUBERNETES_NS.route('/remote-health/<token_id>/nodes/status')
class RemoteNodesStatus(Resource):
    def get(self, token_id: str) -> Response:
        try:
            response = conn_mng.mongo_kit_tokens.find_one({"_id": ObjectId(token_id)})
            node_status = response['node_status']
            return jsonify(node_status)

        except Exception as e:
            logger.exception(e)
            return ERROR_RESPONSE

@KUBERNETES_NS.route('/remote-health/<token_id>/pods/status')
class RemotePodsStatus(Resource):
    def get(self, token_id: str) -> Response:
        try:
            response = conn_mng.mongo_kit_tokens.find_one({"_id": ObjectId(token_id)})
            pod_status = response['pod_status']
            return jsonify(pod_status)

        except Exception as e:
            logger.exception(e)
            return ERROR_RESPONSE


@HEALTH_NS.route('/remote-health/agent')
class RemoteAgent(Resource):
    @HEALTH_NS.response(204, 'RemoteHealthData')
    @login_required_roles(['metrics','operator','controller-admin','controller-maintainer'], all_roles_req=False)
    def post(self):
        try:
            payload = request.get_json()
            payload["timestamp"] = time.time()
            ipaddress = payload['ipaddress']
            conn_mng.mongo_kit_tokens.replace_one({"ipaddress": ipaddress}, payload)
            return NO_CONTENT
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/write/rejects')
class WriteRejects(Resource):
    @HEALTH_NS.response(200, 'Elasticsearch Write Rejects', [fields.Raw()])
    def get(self):
        try:
            rejected = []
            client = ElasticWrapper()
            response = client.cat.thread_pool(format='json')
            for item in response:
                if int(item['rejected']) > 0:
                    rejected.append(item)

            return rejected

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/write/rejects/remote/<ipaddress>')
class RemoteWriteRejects(Resource):
    @HEALTH_NS.response(204, 'Remote Elasticsearch Write Rejects', [fields.Raw()])
    def get(self, ipaddress: str):
        try:
            response = conn_mng.mongo_kit_tokens.find_one({"ipaddress": ipaddress})
            write_rejects = response['write_rejects']
            return write_rejects

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/health/datastores')
class Datastores(Resource):
    @HEALTH_NS.response(200, 'DatastoreList', [DatastoreModel.DTO])
    def get(self):
        try:
            settings = EsxiSettingsForm.load_from_db()
            if not settings:
                return jsonify([])
            ip_address = str(settings.ip_address)
            response = requests.post(f"https://{ip_address}/rest/com/vmware/cis/session", auth=(settings.username, settings.password), verify=False)
            session_id = response.json()['value']
            headers = {"vmware-api-session-id": session_id}
            datastores = requests.get(f"https://{ip_address}/rest/vcenter/datastore", verify=False, headers=headers)
            response = requests.delete(f"https://{ip_address}/rest/com/vmware/cis/session", verify=False, headers=headers)
            return datastores.json()["value"]
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/app/zeek/packets')
class ZeekPackets(Resource):
    def create_body(self, sensor_hostname: str) -> dict:
            body =  {
                    "size": 0,
                    "query": {
                        "bool": {
                            "should": [
                                {
                                    "match": {
                                        "event.dataset": "zeek.stats"
                                    }
                                }
                            ],
                            "must": [
                              {
                                 "match": {
                                        "observer.hostname": sensor_hostname
                                    }
                              }
                            ]
                        }
                    },
                    "aggs": {
                            "zeek_total_pkts_dropped": {
                            "sum": {
                                "field": "zeek.stats.packets.dropped"
                            }
                        },
                            "zeek_total_pkts_processed": {
                            "sum": {
                                "field": "zeek.stats.packets.processed"
                            }
                        }
                    }
            }

            return body

    @HEALTH_NS.response(200, 'Zeek Packets')
    def get(self):
        app_stats = []
        sensors = []
        client = ElasticWrapper()

        try:
            with KubernetesWrapper(conn_mng) as kube_apiv1:
                node_info = kube_apiv1.list_node().items
                for node in node_info:
                    if node.metadata.labels['role'] == 'sensor':
                        sensors.append(node.metadata.name)

            for sensor in sensors:
                sensor_hostname = sensor
                stats = client.search(body=self.create_body(sensor_hostname),
                                    index='filebeat-zeek*',
                                    doc_type=None,
                                    params=None,
                                    headers=None,
                                    request_timeout=20)

                if(stats['hits']['total']['value'] > 0 ):

                    zeek_stats = {
                                    'app': 'zeek',
                                    'node_name': sensor,
                                    'packets_dropped':int(round(stats['aggregations']['zeek_total_pkts_dropped']['value'])),
                                    'packets_processed': int(round(stats['aggregations']['zeek_total_pkts_processed']['value']))
                                }
                    app_stats.append(zeek_stats)

            return jsonify(app_stats)

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/app/suricata/packets')
class SuricataPackets(Resource):
    def exec_command(self, command: str) -> list:
        exec_command = [ '/bin/sh', '-c', command ]
        return exec_command

    @HEALTH_NS.response(200, 'Suricata Packets')
    def get(self):
        packets_command = "cat /var/log/suricata/stats.log | grep capture.kernel_packets | tail -n 1 | awk '{print $5}'"
        drops_command = "cat /var/log/suricata/stats.log | grep capture.kernel_drops | tail -n 1 | awk '{print $5}'"

        try:
            with KubernetesWrapper(conn_mng) as kube_apiv1:
                nodes = []
                suricata_stats = []

                k8s_obj = kube_apiv1.list_namespaced_pod("default", label_selector="component=suricata")

                if(k8s_obj):
                    for v1_pod_obj in k8s_obj.items:
                        nodes.append({'node_name':v1_pod_obj.spec.node_name, 'pod_name':v1_pod_obj.metadata.name})

                    for node in nodes:
                        node_name = node['node_name']
                        total_packets = stream(kube_apiv1.connect_get_namespaced_pod_exec,
                                        node['pod_name'],
                                        'default',
                                        command=self.exec_command(packets_command),
                                        stderr=True, stdin=False,
                                        stdout=True, tty=False)

                        total_dropped = stream(kube_apiv1.connect_get_namespaced_pod_exec,
                                        node['pod_name'],
                                        'default',
                                        command=self.exec_command(drops_command),
                                        stderr=True, stdin=False,
                                        stdout=True, tty=False)

                        if(total_dropped == ''):
                            total_dropped = "0"

                        suricata_stats.append({
                                                'app':'suricata',
                                                'node_name': node_name,
                                                'packets_processed': int(total_packets),
                                                'packets_dropped': int(total_dropped)
                                            })
            return jsonify(suricata_stats)

        except Exception as e:
            logger.exception(e)
            return ERROR_RESPONSE

@HEALTH_NS.route('/app/zeek/packets/remote/<ipaddress>')
class RemoteZeekPackets(Resource):
    @HEALTH_NS.response(200, 'Remote Zeek Packets')
    def get(self, ipaddress: str):
        try:
            response = conn_mng.mongo_kit_tokens.find_one({"ipaddress": ipaddress})
            zeek_packets = response['zeek']
            return jsonify(zeek_packets)

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/app/suricata/packets/remote/<ipaddress>')
class RemoteSuricataPackets(Resource):
    @HEALTH_NS.response(200, 'Remote Suricata Packets')
    def get(self, ipaddress: str):
        try:
            response = conn_mng.mongo_kit_tokens.find_one({"ipaddress": ipaddress})
            suricata_packets = response['suricata']
            return jsonify(suricata_packets)

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE
