"""
Main module for handling all of the Kit Configuration REST calls.
"""
from app import (app, logger, conn_mng, WEB_DIR, KUBERNETES_NS)
from app.models.kubernetes import (HealthServiceModel, PipelineInfoModel,
                                   NodeOrPodStatusModel, PodLogsModel)
from app.models.kit_setup import (DIPKickstartForm, DIPKitForm, Node)
from app.resources import convert_kib_to_gib, convert_gib_to_kib, convert_mib_to_kib
from app.service.job_service import run_command

from flask import Response, jsonify
from flask_restplus import Resource

from pathlib import Path
from app.utils.connection_mngs import KubernetesWrapper, KUBEDIR, objectify
from app.utils.constants import KIT_ID
from typing import List, Dict

from kubernetes.client.models.v1_pod_list import V1PodList
from kubernetes.client.models.v1_node_list import V1NodeList


PYTHON_PATH = str(WEB_DIR / 'tfp-env/bin/python')


def _get_mem_total(memory_str: str) -> int:
    try:
        mem_str = str(memory_str)
        pos = mem_str.rfind('Mi')
        if pos == -1:
            pos = mem_str.rfind('Ki')
            if pos == -1:
                pos = mem_str.rfind('Gi')
                if pos == -1:
                    mem = int(mem_str) / 1024
                else:
                    mem = convert_gib_to_kib(int(mem_str[:pos]))
            else:
                mem = int(mem_str[:pos])
        else:
            mem = convert_mib_to_kib(int(mem_str[:pos]))
        return mem
    except KeyError:
        pass
    return 0


def _get_cpu_total(cpu: str) -> int:
    try:
        cpu_str = str(cpu)
        pos = cpu_str.rfind('m')
        if pos == -1:
            cpu_milli = int(cpu_str) * 1000
        else:
            cpu_milli = int(cpu_str[:pos])
        return cpu_milli
    except KeyError:
        pass
    return 0


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


def _get_node_type(hostname: str, nodes: List) -> str:
    if nodes:
        for node in nodes: # type: Node
            if hostname == node.hostname and node.node_type:
                return node.node_type
    return ""


def _get_node_info(nodes: V1NodeList) -> List:
    kit_form = DIPKitForm.load_from_db() # type: DIPKitForm
    ret_val = []
    for item in nodes.to_dict()['items']:
        try:

            name = item["metadata"]["name"]
            metrics = conn_mng.mongo_metrics.find({'node': name, "type": "psutil"})
            if metrics:
                for metric in metrics:
                    item['metadata']['annotations']['tfplenum/{}'.format(metric['name'])] = metric['value']

            item['status']['allocatable']['cpu'] = str(_get_cpu_total(item['status']['allocatable']['cpu'])) + "m"
            item['status']['allocatable']["ephemeral-storage"] = str(convert_kib_to_gib(_get_mem_total(item['status']['allocatable']['ephemeral-storage']))) + "Gi"
            item['status']['allocatable']['memory'] = str(convert_kib_to_gib(_get_mem_total(item['status']['allocatable']['memory']))) + "Gi"
            item['status']['capacity']['cpu'] = str(_get_cpu_total(item['status']['capacity']['cpu'])) + "m"
            item['status']['capacity']["ephemeral-storage"] = str(convert_kib_to_gib(_get_mem_total(item['status']['capacity']['ephemeral-storage']))) + "Gi"
            item['status']['capacity']['memory'] = str(convert_kib_to_gib(_get_mem_total(item['status']['capacity']['memory']))) + "Gi"
            public_ip = item["metadata"]["annotations"]["flannel.alpha.coreos.com/public-ip"]
            item["metadata"]["public_ip"] = public_ip
            item["metadata"]["node_type"] = _get_node_type(item["metadata"]["name"], kit_form.nodes)
            ret_val.append(item)
        except KeyError as e:
            item["metadata"]["public_ip"] = ''
            ret_val.append(item)
        except Exception as e:
            logger.exception(e)
    return ret_val


def _get_pod_info(pods: V1PodList) -> List:
    return pods.to_dict()['items']


class HealthNodeTotals:
    def __init__(self, pods: V1PodList, nodes: V1NodeList):
        self.pods = pods
        self.nodes = nodes
        self.kit_form = DIPKitForm.load_from_db() # type: DIPKitForm
        self.node_names = {}
        self.node_names["Unallocated"] = {'cpus_requested': 0, 'mem_requested': 0}

    def _set_totals_per_pod(self, pod):
        for container in pod.spec.containers:
            if container.resources.requests:
                try:
                    cpu = _get_cpu_total(container.resources.requests['cpu'])
                except KeyError:
                    cpu = 0

                try:
                    mem = _get_mem_total(container.resources.requests['memory'])
                except KeyError:
                    mem = 0

                if pod.spec.node_name:
                    self.node_names[pod.spec.node_name]['cpus_requested'] += cpu
                    self.node_names[pod.spec.node_name]['mem_requested'] += mem
                else:
                    self.node_names["Unallocated"]['cpus_requested'] += cpu
                    self.node_names["Unallocated"]['mem_requested'] += mem

    def _set_requested_totals(self):
        for pod in self.pods.items:
            if pod.spec.node_name and pod.spec.node_name not in self.node_names:
                self.node_names[pod.spec.node_name] = {'cpus_requested': 0, 'mem_requested': 0}

            self._set_totals_per_pod(pod)

    def _set_requested_total_strings(self):
        for key in self.node_names:
            self.node_names[key]['cpus_requested_str']  = str(self.node_names[key]['cpus_requested']) + "m"
            self.node_names[key]['mem_requested_str']  = str(convert_kib_to_gib(self.node_names[key]['mem_requested'])) + "Gi"

    def _set_allocatable_totals(self):
        for key in self.node_names:
            for node in self.nodes.items:
                if key == node.metadata.name:
                    self.node_names[key]['name'] = node.metadata.name
                    self.node_names[key]['node_type'] = _get_node_type(node.metadata.name, self.kit_form.nodes)

                    try:
                        cpu_milli = _get_cpu_total(node.status.allocatable['cpu'])
                    except KeyError:
                        cpu_milli = 0

                    cpu_milli -= self.node_names[key]['cpus_requested']

                    try:
                        mem = _get_mem_total(node.status.allocatable['memory'])
                    except KeyError:
                        mem = 0
                    mem -= self.node_names[key]['mem_requested']

                    self.node_names[key]['remaining_allocatable_cpu'] = str(cpu_milli) + "m"
                    self.node_names[key]['remaining_allocatable_mem'] = str(convert_kib_to_gib(mem)) + "Gi"


    def execute(self) -> Dict:
        self._set_requested_totals()
        self._set_requested_total_strings()
        self._set_allocatable_totals()
        return self.node_names


def _get_health_status() -> Dict:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        pods = kube_apiv1.list_pod_for_all_namespaces(watch=False) # type: V1PodList
        nodes = kube_apiv1.list_node() # type: V1NodeList

        ret_val = {}
        health = HealthNodeTotals(pods, nodes)
        ret_val['totals'] = health.execute()
        ret_val['node_info'] = _get_node_info(nodes)
        ret_val['pod_info'] = _get_pod_info(pods)

        return ret_val


@KUBERNETES_NS.route('/health/status')
class SystemHealthStatus(Resource):

    @KUBERNETES_NS.doc(description="Gets the kubernetes health status for all nodes.")
    @KUBERNETES_NS.response(200, 'HealthService', [HealthServiceModel.DTO])
    def get(self):
        try:
            return objectify(_get_health_status())
        except Exception as e:
            Path(KUBEDIR + '/config').unlink()
            return objectify(_get_health_status())
        except Exception as e:
            logger.exception(e)
        return {'totals': {}, 'pod_info': [], 'node_info': []}


@KUBERNETES_NS.route('/pipeline/status')
class PipelineStatusCtrl(Resource):

    @KUBERNETES_NS.response(200, 'PipelineInfo', PipelineInfoModel.DTO)
    def get(self) -> Response:
        status = {}
        documents = list(conn_mng.mongo_metrics.find({'type': 'elastic'}))
        for document in documents:
            hostname = document['node']
            name = document['name']
            value = document['value']
            try:
                status[hostname][name] = value
            except KeyError:
                status[hostname] = {name: value}

        return status
