"""
Main module for handling all of the Kit Configuration REST calls.
"""
from app import (app, logger, conn_mng, WEB_DIR, CORE_DIR)
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.resources import convert_KiB_to_GiB, convert_GiB_to_KiB, convert_MiB_to_KiB
from app.service.job_service import run_command
from app.service.health_service import update_pipeline_datetimes
from datetime import datetime

from fabric.runners import Result
from flask import request, Response, jsonify
from pathlib import Path
from shared.connection_mngs import KubernetesWrapper, KubernetesWrapper2, KUBEDIR
from shared.constants import KIT_ID
from shared.utils import decode_password, get_json_from_url, normalize_epoc_or_unixtimestamp
from time import sleep
from typing import List, Dict

from kubernetes.client.models.v1_pod_list import V1PodList
from kubernetes.client.models.v1_node_list import V1NodeList


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
                    mem = convert_GiB_to_KiB(int(mem_str[:pos]))
            else:
                mem = int(mem_str[:pos])
        else:
            mem = convert_MiB_to_KiB(int(mem_str[:pos]))
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


@app.route('/api/describe_pod/<pod_name>/<namespace>', methods=['GET'])
def describe_pod(pod_name: str, namespace: str) -> Response:
    """
    Runs a command and pulls the pods describe command output.

    :param pod_name: The name of the pod of cource.
                     You can get it with 'kubectl get pods' on the main server node.
    """
    command = str(WEB_DIR / 'tfp-env/bin/python') + ' describe_kubernetes_pod.py %s %s' % (pod_name, namespace)
    stdout = run_command(command, working_dir=str(WEB_DIR / 'backend/fabfiles'))
    return jsonify({'stdout': stdout, 'stderr': ''})


@app.route('/api/describe_node/<node_name>', methods=['GET'])
def describe_node(node_name: str) -> Response:
    """
    Runs a command and pulls the pods describe command output.

    :param node_name: The name of the node of cource.
                      You can get it with 'kubectl get nodes' on the main server node.
    """
    command = str(WEB_DIR / 'tfp-env/bin/python') + ' describe_kubernetes_node.py %s' % node_name
    stdout = run_command(command, working_dir=str(WEB_DIR / 'backend/fabfiles'))
    return jsonify({'stdout': stdout, 'stderr': ''})


def _get_node_type(hostname: str, nodes: List) -> str:
    if nodes:
        for node in nodes:
            if hostname == node['hostname']:
                if node["node_type"]:
                    return node["node_type"]
    return ""


def _get_node_info(nodes: V1NodeList) -> List:
    mongo_document = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    ret_val = []
    for item in nodes.to_dict()['items']:
        try:

            name = item["metadata"]["name"]
            metrics = conn_mng.mongo_metrics.find_one({'_id': name})
            if (metrics == None):
                pass
            else:
                item['metadata']['annotations']['tfplenum/memory'] = metrics['memory']
                item['metadata']['annotations']['tfplenum/root_usage'] = metrics['root_usage']
                item['metadata']['annotations']['tfplenum/data_usage'] = metrics['data_usage']
                item['metadata']['annotations']['tfplenum/cpu_percent'] = metrics['cpu_percent']

            item['status']['allocatable']['cpu'] = str(_get_cpu_total(item['status']['allocatable']['cpu'])) + "m"
            item['status']['allocatable']["ephemeral-storage"] = str(convert_KiB_to_GiB(_get_mem_total(item['status']['allocatable']['ephemeral-storage']))) + "Gi"
            item['status']['allocatable']['memory'] = str(convert_KiB_to_GiB(_get_mem_total(item['status']['allocatable']['memory']))) + "Gi"
            item['status']['capacity']['cpu'] = str(_get_cpu_total(item['status']['capacity']['cpu'])) + "m"
            item['status']['capacity']["ephemeral-storage"] = str(convert_KiB_to_GiB(_get_mem_total(item['status']['capacity']['ephemeral-storage']))) + "Gi"
            item['status']['capacity']['memory'] = str(convert_KiB_to_GiB(_get_mem_total(item['status']['capacity']['memory']))) + "Gi"
            public_ip = item["metadata"]["annotations"]["flannel.alpha.coreos.com/public-ip"]
            item["metadata"]["public_ip"] = public_ip
            item["metadata"]["node_type"] = _get_node_type(item["metadata"]["name"], mongo_document['form']['nodes'])
            ret_val.append(item)
        except KeyError as e:
            item["metadata"]["public_ip"] = ''
            ret_val.append(item)
        except Exception as e:
            logger.exception(e)
    return ret_val


def _get_pod_info(pods: V1PodList) -> List:
    return pods.to_dict()['items']


def _get_totals(pods: V1PodList, nodes: V1NodeList) -> Dict:
    cpu_total = 0
    mem_total = 0
    node_names = {}
    node_names["Unallocated"] = {'cpus_requested': 0, 'mem_requested': 0}
    for pod in pods.items:
        if pod.spec.node_name:
            if pod.spec.node_name not in node_names:
                node_names[pod.spec.node_name] = {'cpus_requested': 0, 'mem_requested': 0}

        for container in pod.spec.containers:
            if container.resources.requests:
                try:
                    cpu = _get_cpu_total(container.resources.requests['cpu'])
                except KeyError:
                    cpu = 0

                cpu_total += cpu

                try:
                    mem = _get_mem_total(container.resources.requests['memory'])
                except KeyError:
                    mem = 0

                mem_total += mem

                if pod.spec.node_name:
                    node_names[pod.spec.node_name]['cpus_requested'] += cpu
                    node_names[pod.spec.node_name]['mem_requested'] += mem
                else:
                    node_names["Unallocated"]['cpus_requested'] += cpu
                    node_names["Unallocated"]['mem_requested'] += mem

    for key in node_names:
        node_names[key]['cpus_requested_str']  = str(node_names[key]['cpus_requested']) + "m"
        node_names[key]['mem_requested_str']  = str(convert_KiB_to_GiB(node_names[key]['mem_requested'])) + "Gi"

    for key in node_names:
        for node in nodes.items:
            if key == node.metadata.name:
                try:
                    cpu_milli = _get_cpu_total(node.status.allocatable['cpu'])
                except KeyError:
                    cpu_milli = 0

                cpu_milli -= node_names[key]['cpus_requested']

                try:
                    mem = _get_mem_total(node.status.allocatable['memory'])
                except KeyError:
                    mem = 0
                mem -= node_names[key]['mem_requested']

                node_names[key]['remaining_allocatable_cpu'] = str(cpu_milli) + "m"
                node_names[key]['remaining_allocatable_mem'] = str(convert_KiB_to_GiB(mem)) + "Gi"

    return node_names


def _get_health_status() -> Dict:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        ret_val = {}
        pods = kube_apiv1.list_pod_for_all_namespaces(watch=False) # type: V1PodList
        nodes = kube_apiv1.list_node() # type: V1NodeList
        ret_val['totals'] = _get_totals(pods, nodes)
        ret_val['pod_info'] = _get_pod_info(pods)
        ret_val['node_info'] = _get_node_info(nodes)
        return ret_val


@app.route('/api/get_health_status', methods=['GET'])
def get_health_status() -> Response:
    try:
        try:
            return jsonify(_get_health_status())
        except Exception as e:
            Path(KUBEDIR + '/config').unlink()
            return jsonify(_get_health_status())
    except Exception as e:
        logger.exception(e)
    return jsonify({'totals': {}, 'pod_info': [], 'node_info': []})


@app.route('/api/get_pipeline_status', methods=['GET'])
def get_pipeline_status() -> Response:
    result = update_pipeline_datetimes.delay()
    iterations = 0
    while not result.ready():
        sleep(1)
        iterations += 1
        if iterations > 20:
            return jsonify({})

    result_output = result.get()
    return jsonify(result_output)
