"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
import pymongo
import pytz
import requests
from app import (app, logger, conn_mng, WEB_DIR, CORE_DIR)
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.resources import convert_KiB_to_GiB, convert_GiB_to_KiB, convert_MiB_to_KiB
from app.service.job_service import run_command
from datetime import datetime

from fabric.runners import Result
from flask import request, Response, jsonify
from pathlib import Path
from shared.connection_mngs import (KubernetesWrapper, KubernetesWrapper2, objectify,
                                    KitFormNotFound, KUBEDIR, FabricConnection, FabricConnectionWrapper)
from shared.constants import KIT_ID, KICKSTART_ID, NODE_TYPES, DATE_FORMAT_STR
from shared.utils import decode_password, get_json_from_url, normalize_epoc_or_unixtimestamp
from typing import List, Dict
from urllib3.exceptions import MaxRetryError

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


@app.route('/api/perform_systems_check', methods=['GET'])
def perform_systems_check() -> Response:
    """
    Kicks off a systems check job

    :return: Response object
    """
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_kickstart_configuration = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if current_kit_configuration:
        if current_kit_configuration["form"] and current_kickstart_configuration["form"]["root_password"]:
            cmd_to_execute = ("ansible-playbook -i {} -e ansible_ssh_pass='{}' site.yml"
                               .format(str(CORE_DIR / 'playbooks/inventory.yml'),
                                       decode_password(current_kickstart_configuration["form"]["root_password"])))
            # spawn_job("SystemsCheck",
            #         cmd_to_execute,
            #         ["systems_check"],
            #         log_to_console,
            #         working_directory=str(TESTING_DIR / 'playbooks'))
            return OK_RESPONSE

    logger.warn("Perform systems check failed because the Kit configuration was not found in the mongo database.")
    return ERROR_RESPONSE


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


def get_kubernetes_service_ip(kubernetes_service_name: str) -> str:
    if ".lan" not in kubernetes_service_name:
        kubernetes_service_name = kubernetes_service_name + ".lan"

    with FabricConnectionWrapper(conn_mng) as ssh_conn:
        ret_val = ssh_conn.run('cat /etc/dnsmasq_kube_hosts', hide=True)  # type: Result
        for line in ret_val.stdout.split('\n'):
            tokens = line.split(' ')
            if tokens[1] == kubernetes_service_name:
                return tokens[0]

    raise ValueError("{} was not found.".format(kubernetes_service_name))


def _nomalize_elastic_timestamp(time: str) -> str:
    """
    :param: timestamp in "2019-08-16T20:24:25.195Z"
    :return:
    """
    pos = time.rfind('.')
    return time[:pos].replace('T', ' ')


def _normalize_log_date(time: str) -> str:
    """
    :param time : date time string formated as 2019-08-16 20:30:33.217839499 +0000\n

    :return: Normalized UTC time string
    """
    time = time.strip("\n")
    pos = time.find('.')
    pos2 = time.find(' ', pos)
    time = time[:pos] + time[pos2:]
    time = datetime.strptime(time, '%Y-%m-%d %H:%M:%S %z')
    utc_dt = time.astimezone(pytz.utc)

    return utc_dt.strftime(DATE_FORMAT_STR)


def _get_suricata_deployment_name(node: Dict) -> str:
    pos = node['hostname'].rfind(".")
    hostname_no_tld = node['hostname'][:pos]
    suricata_deployment_name = hostname_no_tld + "-suricata"
    with KubernetesWrapper2(conn_mng) as api:
        for deployment in api.apps_V1_API.list_deployment_for_all_namespaces().items:
            try:
                if deployment.spec.template.spec.init_containers and deployment.spec.template.spec.init_containers[0]:
                    if deployment.spec.template.spec.init_containers[0].name == "init-suricata":
                        deployment_host = (deployment.spec.template.spec.affinity.node_affinity.
                                            required_during_scheduling_ignored_during_execution.
                                            node_selector_terms[0].match_expressions[0].values[0])
                        if node['hostname'] == deployment_host:
                            return deployment.metadata.name
            except Exception as e:
                logger.exception(e)

    return suricata_deployment_name


@app.route('/api/get_pipeline_status', methods=['GET'])
def get_pipeline_status() -> Response:
    ret_val = {}
    kit = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    msg = "No events"
    if kit:
        for node in kit["form"]["nodes"]:
            if node['node_type'] == NODE_TYPES[1]:
                elastic_external_address = get_kubernetes_service_ip("elasticsearch")
                pos = node['hostname'].rfind(".")
                hostname_no_tld = node['hostname'][:pos]
                suricata_deployment_name = _get_suricata_deployment_name(node)

                bro_url = ("http://{elastic_ip}:9200/logstash-zeek-*/"
                           "_search?size=1&_source=@timestamp&sort=@timestamp:desc&q=sensor_name:{hostname}"
                           .format(elastic_ip=elastic_external_address, hostname=node['hostname']))

                suricata_url = ("http://{elastic_ip}:9200/filebeat-*/_search?"
                                "size=1&_source=@timestamp&sort=@timestamp:desc&q=beat.name:{suricata_deployment} AND tags:suricata"
                                .format(elastic_ip=elastic_external_address, suricata_deployment=suricata_deployment_name))

                moloch_url = ("http://{elastic_ip}:9200/sessions2*/_search?size=1&_source=timestamp&sort=timestamp:desc&q=node:{hostname_no_tld}"
                              .format(elastic_ip=elastic_external_address, hostname_no_tld=hostname_no_tld))

                ret_val[node['hostname']] = {}

                try:
                    ret_val[node['hostname']]["last_zeek_elastic_events"] = _nomalize_elastic_timestamp(get_json_from_url(bro_url)['hits']['hits'][0]['_source']['@timestamp'])
                except IndexError:
                    ret_val[node['hostname']]["last_zeek_elastic_events"] = msg

                try:
                    ret_val[node['hostname']]["last_suricata_elastic_events"] = _nomalize_elastic_timestamp(get_json_from_url(suricata_url)['hits']['hits'][0]['_source']['@timestamp'])
                except IndexError:
                    ret_val[node['hostname']]["last_suricata_elastic_events"] = msg

                try:
                    ret_val[node['hostname']]["last_moloch_elastic_events"] = normalize_epoc_or_unixtimestamp(get_json_from_url(moloch_url)['hits']['hits'][0]['_source']['timestamp'])
                except IndexError:
                    ret_val[node['hostname']]["last_moloch_elastic_events"] = msg

                with FabricConnection(node['management_ip_address']) as shell:
                    output = shell.run("ls --full-time -t /data/zeek/**/conn*.log | head -n1 | tr -s ' ' | cut -f6-8 -d' '", shell=False, hide=True) # type: Result
                    if output.return_code == 0:
                        if output.stdout == "":
                            ret_val[node['hostname']]["last_zeek_log_event"] = msg
                        else:
                            ret_val[node['hostname']]["last_zeek_log_event"] = _normalize_log_date(output.stdout)
                    else:
                        ret_val[node['hostname']]["last_zeek_log_event"] = msg

                    output = shell.run("ls --full-time -t /data/suricata/eve*.json | head -n1 | tr -s ' ' | cut -f6-8 -d' '", shell=False, hide=True) # type: Result
                    if output.return_code == 0:
                        if output.stdout == "":
                            ret_val[node['hostname']]["last_suricata_log_event"] = msg
                        else:
                            ret_val[node['hostname']]["last_suricata_log_event"] = _normalize_log_date(output.stdout)
                    else:
                        ret_val[node['hostname']]["last_suricata_log_event"] = msg

                    output = shell.run("ls --full-time -t /data/pcap/*.pcap | head -n1 | tr -s ' ' | cut -f6-8 -d' '", shell=False, hide=True) # type: Result
                    if output.return_code == 0:
                        if output.stdout == "":
                            ret_val[node['hostname']]["last_pcap_log_event"] = msg
                        else:
                            ret_val[node['hostname']]["last_pcap_log_event"] = _normalize_log_date(output.stdout)
                    else:
                        ret_val[node['hostname']]["last_pcap_log_event"] = msg

    return jsonify(ret_val)
