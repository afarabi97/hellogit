import json
import pytz

from app import (app, logger, conn_mng, celery)
from celery import Celery
from celery.schedules import crontab
from datetime import datetime
from fabric.runners import Result
from multiprocessing import Process, Queue
from pymongo import ReturnDocument
from shared.connection_mngs import (KubernetesWrapper2, FabricConnection, FabricConnectionWrapper)
from shared.constants import KIT_ID, NODE_TYPES, DATE_FORMAT_STR
from shared.utils import decode_password, get_json_from_url, normalize_epoc_or_unixtimestamp
from typing import List, Dict


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


def _excute_pipeline_datetime_update(queue: Queue):
    ret_val = {}
    kit = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    msg = "No events"
    if kit:
        ELASTIC_EXTRENAL_ADDRESS = get_kubernetes_service_ip("elasticsearch-master")

        for node in kit["form"]["nodes"]:
            if node['node_type'] == NODE_TYPES[1]:
                pos = node['hostname'].rfind(".")
                hostname_no_tld = node['hostname'][:pos]
                suricata_deployment_name = _get_suricata_deployment_name(node)

                bro_url = ("http://{elastic_ip}:9200/logstash-zeek-*/"
                           "_search?size=1&_source=@timestamp&sort=@timestamp:desc&q=sensor_name:\"{hostname}\""
                           .format(elastic_ip=ELASTIC_EXTRENAL_ADDRESS, hostname=node['hostname']))

                suricata_url = ("http://{elastic_ip}:9200/filebeat-*/_search?"
                                "size=1&_source=@timestamp&sort=@timestamp:desc&q=agent.name:{suricata_deployment} AND tags:suricata"
                                .format(elastic_ip=ELASTIC_EXTRENAL_ADDRESS, suricata_deployment=suricata_deployment_name))

                moloch_url = ("http://{elastic_ip}:9200/sessions2*/_search?size=1&_source=timestamp&sort=timestamp:desc&q=node:{hostname_no_tld}"
                              .format(elastic_ip=ELASTIC_EXTRENAL_ADDRESS, hostname_no_tld=hostname_no_tld))

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
                    output = shell.run("ls --full-time -t /data/zeek/**/conn*.log | head -n1 | tr -s ' ' | cut -f6-8 -d' '") # type: Result
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
    queue.put(ret_val)


@celery.task(time_limit=14)
def update_pipeline_datetimes():
    # This task is run in a separate process and is then killed to prevent leaking file descriptors to occur in celery workers.
    queue = Queue()
    p = Process(target=_excute_pipeline_datetime_update, args=(queue,))
    p.start()
    p.join() # this blocks until the process terminates
    result = queue.get()
    return result
