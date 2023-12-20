import json
import time
from decimal import Decimal
from typing import Iterable, List, Optional, TypeVar

import requests
from app.common import ERROR_RESPONSE, NO_CONTENT, OK_RESPONSE
from app.models.elasticsearch import ElasticSearchRejectModel
from app.models.health import (DatastoreModel, MetricsCPUPercentModel,
                               MetricsDataUsageModel, MetricsMemoryModel,
                               MetricsRootUsageModel, PacketsModel)
from app.models.kubernetes import (KubernetesNodeMetricsModel,
                                   KubernetesPodMetricsModel,
                                   NodeOrPodStatusModel, PodLogsModel)
from app.models.nodes import Node
from app.models.settings.esxi_settings import EsxiSettingsForm
from app.service.job_service import run_command
from app.service.socket_service import (NotificationCode, NotificationMessage,
                                        notify_disk_pressure)
from app.utils.collections import mongo_kit_tokens, mongo_metrics
from app.utils.connection_mngs import KubernetesWrapper, objectify
from app.utils.constants import INVALID_KEY_VALUE_OPEN_SSH, NODE_TYPES
from app.utils.elastic import ElasticWrapper
from app.utils.logging import logger
from app.utils.utils import invalid_string_checker
from bson import ObjectId
from kubernetes.client.models.v1_event_list import V1EventList
from kubernetes.client.models.v1_node import V1Node
from kubernetes.client.models.v1_node_condition import V1NodeCondition
from kubernetes.client.models.v1_node_list import V1NodeList
from kubernetes.client.models.v1_pod import V1Pod
from kubernetes.client.models.v1_pod_condition import V1PodCondition
from kubernetes.client.models.v1_pod_list import V1PodList
from kubernetes.client.rest import ApiException
from kubernetes.stream import stream
from kubernetes.utils import parse_quantity

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
    with KubernetesWrapper() as kube_apiv1:
        field_selector = f"involvedObject.uid={pod.metadata.uid},type=Warning"
        try:
            return kube_apiv1.list_event_for_all_namespaces(
                field_selector=field_selector
            )  # type: V1EventList
        except ApiException as e:
            logger.exception(
                "Exception when calling CoreV1Api->list_event_for_all_namespaces: %s\n"
                % e
            )
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

        if (
            container.state.waiting
            and len(container.sate.waiting.reason) > 0
            and container.state.waiting.reason != "PodInitializing"
        ):
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
            states.append(
                f"{container.name}: terminated: {container.state.terminated.reason}"
            )

        if container.state.waiting:
            states.append(
                f"{container.name}: waiting: {container.state.waiting.reason}"
            )
    return states


def get_container_resource(pod: V1Pod) -> dict:
    resources = []
    for i in range(_len(pod.spec.containers)):
        container = pod.spec.containers[i]

        resources.append(
            {"name": container.name, "resources": container.resources.to_dict()}
        )
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
    root_usage = mongo_metrics().find_one(
        {"hostname": hostname, "name": "root_usage"})
    data_usage = mongo_metrics().find_one(
        {"hostname": hostname, "name": "data_usage"})
    storage = []
    if root_usage:
        storage.append(
            {
                "name": "root",
                "free": root_usage["value"]["free"],
                "percent": root_usage["value"]["percent"],
            }
        )
    if data_usage:
        storage.append(
            {
                "name": "data",
                "free": data_usage["value"]["free"],
                "percent": data_usage["value"]["percent"],
            }
        )
    if len(storage) > 0:
        return storage
    return None


def get_cpu(hostname: str) -> Optional[int]:
    cpu_percent = mongo_metrics().find_one(
        {"hostname": hostname, "name": "cpu_percent"}
    )
    if cpu_percent:
        return cpu_percent["value"]
    return None


def get_memory(hostname: str) -> Optional[dict]:
    memory = mongo_metrics().find_one({"hostname": hostname, "name": "memory"})
    if memory:
        return {
            "available": memory["value"]["available"],
            "percent": memory["value"]["percent"],
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
                requests_cpu += parse_quantity(
                    container.resources.requests.get("cpu", 0)
                )
                requests_memory += parse_quantity(
                    container.resources.requests.get("memory", 0)
                )
    remaining_cpu = allocatable_cpu - requests_cpu
    remaining_memory = allocatable_memory - requests_memory
    return {
        "cpu": convert_to_m(remaining_cpu),
        "memory": convert_to_gi(remaining_memory),
    }


def to_quantity(value: Decimal, si: str, ndigits=3) -> str:
    factor = (
        {
            "Ki": 1024,
            "Mi": 1024 ** 2,
            "Gi": 1024 ** 3,
            "Ti": 1024 ** 4,
            "Pi": 1024 ** 5,
            "Ei": 1024 ** 6,
            "m": 1000,
            "": 1,
            "k": 1000,
            "M": 1000 ** 2,
            "G": 1000 ** 3,
            "T": 1000 ** 4,
            "P": 1000 ** 5,
            "E": 1000 ** 6,
        }
    ).get(si)
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
        "ephermeral-storage": convert_to_gi(
            parse_quantity(node.status.capacity.get("ephemeral-storage", 0))
        ),
        "memory": convert_to_gi(parse_quantity(node.status.capacity.get("memory", 0))),
        "pods": node.status.capacity["pods"],
    }


def get_allocatable(node: V1Node, ndigits=3) -> dict:
    return {
        "cpu": convert_to_m(parse_quantity(node.status.allocatable.get("cpu", 0))),
        "ephermeral-storage": convert_to_gi(
            parse_quantity(node.status.allocatable.get("ephemeral-storage", 0))
        ),
        "memory": convert_to_gi(
            parse_quantity(node.status.allocatable.get("memory", 0))
        ),
        "pods": node.status.allocatable["pods"],
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
        "node_info": node.status.node_info.to_dict(),
    }


def get_pod_metrics(pod: V1Pod) -> dict:
    _metrics = {
        "namespace": pod.metadata.namespace,
        "name": pod.metadata.name,
        "node_name": pod.spec.node_name,
        "status_brief": get_pod_status(pod),
        "restart_count": get_restart_count(pod),
        "states": get_container_states(pod),
        "resources": get_container_resource(pod),
        "status": objectify(pod.status.to_dict()),
    }
    warnings = get_warnings(pod)
    if warnings:
        _metrics["warnings"] = warnings
    return _metrics


def get_nodes_status() -> List[KubernetesNodeMetricsModel]:
    with KubernetesWrapper() as kube_apiv1:
        pods = kube_apiv1.list_pod_for_all_namespaces(
            watch=False)  # type: V1PodList
        nodes = kube_apiv1.list_node()  # type: V1NodeList

        _node_metrics = list(
            map(
                lambda node: get_node_metrics(
                    node,
                    filter(
                        lambda pod: pod.spec.node_name == node.metadata.name, pods.items
                    ),
                ),
                nodes.items,
            )
        )

        return _node_metrics


def get_pods_status() -> List[dict]:
    with KubernetesWrapper() as kube_apiv1:
        pods = kube_apiv1.list_pod_for_all_namespaces(
            watch=False)  # type: V1PodList

        _pod_metrics = list(map(lambda pod: get_pod_metrics(pod), pods.items))

        return _pod_metrics


def _create_body(sensor_hostname: str) -> dict:
    body = {
        "size": 0,
        "query": {
            "bool": {
                "should": [{"match": {"event.dataset": "zeek.stats"}}],
                "must": [{"match": {"observer.hostname": sensor_hostname}}],
            }
        },
        "aggs": {
            "zeek_total_pkts_dropped": {"sum": {"field": "zeek.stats.packets.dropped"}},
            "zeek_total_pkts_received": {
                "sum": {"field": "zeek.stats.packets.received"}
            },
        },
    }
    return body


def client_session(username: str, password: str) -> requests:
    with requests.Session() as session:
        session.auth = (username, password)
        session.timeout = 60
    return session


def get_kibana_ipaddress():
    try:
        with KubernetesWrapper() as api:
            services = api.list_service_for_all_namespaces()
            for service in services.items:
                name = service.metadata.name
                if service.status.load_balancer.ingress and name == "kibana":
                    kibana_ip = service.status.load_balancer.ingress[0].ip
                    return kibana_ip

    except Exception as e:
        logger.exception(e)
    return ERROR_RESPONSE


def get_zeek_stats(sensor: str, ignore_unavailable: bool = True) -> dict:
    """
    Get Zeek Stats for the given sensor hostname from Elasticsearch. Ignore unavailable nodes by default.

    Args:
        sensor (str): _description_
        ignore_unavailable (bool, optional): Ignores unavailable indices. Defaults to True.

    Returns:
        dict: The Zeek stats in dictionary format.
    """
    client = ElasticWrapper()
    sensor_hostname = sensor
    stats = client.search(
        body=_create_body(sensor_hostname),
        index="filebeat-zeek*",
        doc_type=None,
        headers=None,
        request_timeout=20,
        ignore_unavailable=ignore_unavailable
    )
    return stats


def get_k8s_app_nodes(app: str) -> list:
    nodes = []
    with KubernetesWrapper() as kube_apiv1:
        k8s_obj = kube_apiv1.list_namespaced_pod(
            "default", label_selector=f"component={app}"
        ).items

        if k8s_obj:
            for v1_pod_obj in k8s_obj:
                nodes.append(
                    {
                        "node_name": v1_pod_obj.spec.node_name,
                        "pod_name": v1_pod_obj.metadata.name,
                    }
                )

    return nodes


def _exec_command(command: str) -> list:
    exec_command = ["/bin/sh", "-c", command]
    return exec_command


def get_suricata_stats(node) -> tuple:

    with KubernetesWrapper() as kube_apiv1:
        packets_command = "cat /var/log/suricata/stats.log | grep capture.kernel_packets | awk '{print $5}' | sort -n | tail -n 1"
        drops_command = "cat /var/log/suricata/stats.log | grep capture.kernel_drops | awk '{print $5}' | sort -n | tail -n 1"

        total_packets = stream(
            kube_apiv1.connect_get_namespaced_pod_exec,
            node["pod_name"],
            "default",
            command=_exec_command(packets_command),
            stderr=True,
            stdin=False,
            stdout=True,
            tty=False,
        )

        total_dropped = stream(
            kube_apiv1.connect_get_namespaced_pod_exec,
            node["pod_name"],
            "default",
            command=_exec_command(drops_command),
            stderr=True,
            stdin=False,
            stdout=True,
            tty=False,
        )

        total_packets_parsed = int(total_packets) if total_packets else 0
        total_dropped_parsed = int(total_dropped) if total_dropped else 0

    return total_packets_parsed, total_dropped_parsed


def get_sensors() -> list:
    sensors = []
    with KubernetesWrapper() as kube_apiv1:
        node_info = kube_apiv1.list_node().items
        for node in node_info:
            if node.metadata.labels["role"] == "sensor":
                sensors.append(node.metadata.name)

    return sensors


def get_pod_describe(pod_name: str, namespace: str) -> NodeOrPodStatusModel:
    command = "kubectl describe pod " + pod_name + " -n " + namespace
    stdout = run_command(command)
    response = invalid_string_checker(stdout, INVALID_KEY_VALUE_OPEN_SSH)
    return response

def get_pod_logs(pod_name: str, namespace: str) -> PodLogsModel:
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


def get_describe_node(node_name: str) -> NodeOrPodStatusModel:
    command = "kubectl describe node " + node_name
    stdout = run_command(command)
    response = invalid_string_checker(stdout, INVALID_KEY_VALUE_OPEN_SSH)
    return response


def get_nodes_statuses() -> List[KubernetesNodeMetricsModel]:
    nodes_status = get_nodes_status()
    if nodes_status:
        return nodes_status
    else:
        return []


def get_pods_statuses() -> List[KubernetesPodMetricsModel]:
    pods_status = get_pods_status()
    if pods_status:
        return pods_status
    else:
        return []


def get_nodes_status_remote(token_id: str) -> List[KubernetesNodeMetricsModel]:
    response = mongo_kit_tokens().find_one({"_id": ObjectId(token_id)})
    node_status = response["node_status"]
    if node_status:
        return node_status
    else:
        return []


def get_pods_status_remote(token_id: str) -> List[KubernetesNodeMetricsModel]:
    response = mongo_kit_tokens().find_one({"_id": ObjectId(token_id)})
    pod_status = response["pod_status"]
    if pod_status:
        return pod_status
    else:
        return []


def post_remote_agent(payload) -> any:
    if(payload != None and len(payload)>0):
        json_payload = json.loads(payload)
        json_payload["timestamp"] = time.time()
        ipaddress = json_payload["ipaddress"]
        update_result = mongo_kit_tokens().replace_one({"ipaddress": ipaddress}, json_payload)
        if update_result:
            return OK_RESPONSE

    return NO_CONTENT

def get_datastores() -> List[DatastoreModel]:
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
    if datastores:
        return datastores.json()["value"]
    else:
        return []


def get_elasticsearch_rejects() -> List[ElasticSearchRejectModel]:
    rejected = []
    client = ElasticWrapper()
    response = client.cat.thread_pool(format="json")
    if len(response) == 0 or "rejected" not in response[0] or response == None:
        return []
    for item in response:
        if int(item["rejected"]) > 0:
            rejected.append(item)
    return rejected


def get_elasticsearch_rejects_remote(ipaddress: str) -> List[ElasticSearchRejectModel]:
    response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
    if response != None:
        write_rejects = response["write_rejects"]
        if write_rejects:
            return write_rejects
        else:
            return []
    else:
        []


def get_zeek_packets() -> List[PacketsModel]:
    zeek_stats = []
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
    if zeek_stats:
        return zeek_stats
    else:
        return []


def get_suricata_packets() -> List[PacketsModel]:
    suricata_stats = []
    nodes = get_k8s_app_nodes("suricata")
    if nodes:
        for node in nodes:
            node_name = node["node_name"]
            total_packets, total_dropped = get_suricata_stats(node)
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
    if suricata_stats:
        return suricata_stats
    else:
        return []


def get_zeek_packets_remote(ipaddress: str) -> List[PacketsModel]:
    response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
    zeek_packets = response["zeek"]
    if zeek_packets:
        return zeek_packets
    else:
        return []


def get_suricata_packets_remote(ipaddress: str) -> List[PacketsModel]:
    response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
    suricata_packets = response["suricata"]
    if suricata_packets:
        return suricata_packets
    else:
        return []


def post_metrics(payload: [MetricsMemoryModel, MetricsRootUsageModel, MetricsDataUsageModel, MetricsCPUPercentModel]) -> [MetricsMemoryModel, MetricsRootUsageModel, MetricsDataUsageModel, MetricsCPUPercentModel]:
    replaced = []
    for document in payload:
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
            pass

    return replaced
