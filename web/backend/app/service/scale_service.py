import os

from time import sleep
from collections import defaultdict
from pint import UnitRegistry
import traceback
from elasticsearch import Elasticsearch
from kubernetes import client, config

from app import logger, REDIS_CLIENT
from app.service.socket_service import NotificationMessage, NotificationCode
from app.dao import elastic_deploy
from rq.decorators import job
from app.utils.elastic import ElasticWrapper


_JOB_NAME = "scale"
ELASTIC_OP_GROUP = "elasticsearch.k8s.elastic.co"
ELASTIC_OP_VERSION = "v1"
ELASTIC_OP_NAMESPACE = "default"
ELASTIC_OP_NAME = "tfplenum"
ELASTIC_OP_PLURAL = "elasticsearches"
KUBE_CONFIG_LOCATION = "/root/.kube/config"

def get_es_nodes():
    nodes = None
    if not os.path.exists(KUBE_CONFIG_LOCATION):
        return []
    try:
        if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
            config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
        elastic = ElasticWrapper()
        nodes = elastic.cat.nodes(format='json')
        return nodes
    except Exception as exec:
        traceback.print_exc()
        logger.exception(exec)
        return None

def parse_nodes(nodes):
    mdil = 0
    master = 0
    data = 0
    ingest = 0
    machine_learning = 0

    if nodes is not None:
        for node in nodes:
            role = node["node.role"]
            if "m" in role and "d" in role and "i" in role:
                mdil += 1
            else:
                if "m" in role:
                    master += 1
                elif "d" in role:
                    data += 1
                elif "i" in role:
                    ingest += 1
                elif "l" in role:
                    machine_learning += 1
        # if data is zero than we are working with an mdil cluster
        if master == 0 and data == 0:
            master = mdil

    return { "master": master, "data": data, "ml": machine_learning, "ingest": ingest}

def get_namespaced_custom_object_status() -> str:
    notification = NotificationMessage(role=_JOB_NAME)
    if not os.path.exists(KUBE_CONFIG_LOCATION):
        return None
    try:
        if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
            config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
        api = client.CustomObjectsApi()
        resp = api.get_namespaced_custom_object_status(group=ELASTIC_OP_GROUP,
                                                       version=ELASTIC_OP_VERSION,
                                                       plural=ELASTIC_OP_PLURAL,
                                                       namespace=ELASTIC_OP_NAMESPACE,
                                                       name=ELASTIC_OP_NAME)

        return resp
    except Exception as exec:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(exec))
        notification.post_to_websocket_api()
        return "Unknown"

def es_cluster_status() -> str:
    notification = NotificationMessage(role=_JOB_NAME)
    try:
        deploy_config = elastic_deploy.read()
        deploy_master_count = 0
        deploy_data_count = 0
        deploy_ml_count = 0
        deploy_ingest_count = 0
        deploy_total_count = 0

        if "spec" in deploy_config:
            spec = deploy_config["spec"]
            if "nodeSets" in spec:
                node_sets = deploy_config["spec"]["nodeSets"]
                for node in node_sets:
                    if node["name"] == "master":
                        deploy_master_count = node["count"]
                    if node["name"] == "data":
                        deploy_data_count = node["count"]
                    if node["name"] == "ml":
                        deploy_ml_count = node["count"]
                    if node["name"] == "ingest":
                        deploy_ingest_count = node["count"]
                    deploy_total_count += node["count"]
        nodes = get_es_nodes()
        es_node_count = None
        if nodes:
            es_node_count = parse_nodes(nodes)

        resp = get_namespaced_custom_object_status()

        if (es_node_count
                and es_node_count["master"] ==  deploy_master_count
                and es_node_count["data"] == deploy_data_count
                and es_node_count["ml"] == deploy_ml_count
                and es_node_count["ingest"] == deploy_ingest_count
                and resp["status"]["phase"] == "Ready"
                and resp["status"]["availableNodes"] == deploy_total_count):
            return resp["status"]["phase"]

        if resp is None:
            return "None"

        if resp["status"]["phase"] != "Ready":
            return resp["status"]["phase"]

        return "Pending"
    except Exception as exec:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(exec))
        notification.post_to_websocket_api()
        return "Unknown"


@job('default', connection=REDIS_CLIENT, timeout="30m")
def check_scale_status(application: str):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s scaling started." % application)
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()
    try:
        notification = NotificationMessage(role=_JOB_NAME)
        notification.set_message("{} scaling in progress.".format(application))
        notification.set_status(NotificationCode.IN_PROGRESS.name)
        notification.post_to_websocket_api()

        previous_status = es_cluster_status()
        sleep(5)
        while True:
            status = es_cluster_status()
            if status not in ["Ready", previous_status]:
                notification = NotificationMessage(role=_JOB_NAME)
                notification.set_message("{} scaling is {}.".format(application, status))
                notification.set_status(NotificationCode.IN_PROGRESS.name)
                notification.post_to_websocket_api()

            if status == "Ready":
                break
            previous_status = status
            sleep(5)
        notification = NotificationMessage(role=_JOB_NAME)
        notification.set_message("{} scaling completed successfully.".format(application))
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()

    except Exception as exec:
        traceback.print_exc()
        msg = "{} scaling failed with error {}.".format(application, str(exec))
        notification = NotificationMessage(role=_JOB_NAME)
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()

def get_allowable_scale_count():
    ureg = UnitRegistry()
    ureg.load_definitions('/opt/tfplenum/web/backend/app/utils/kubernetes_units')
    data = {}
    request = []
    Q_ = ureg.Quantity

    MAX_MASTER_PER_NODE = 1
    MAX_PER_NODE = 3
    data_count = 0
    master_count = 0
    ml_count = 0
    ingest_count = 0
    server_node_count = 0

    deploy_config = elastic_deploy.read()
    if "spec" in deploy_config:
        spec = deploy_config["spec"]
        if "nodeSets" in spec:
            node_sets = deploy_config["spec"]["nodeSets"]
            for n in node_sets:
                for c in n["podTemplate"]["spec"]["containers"]:
                    if n["name"] == "master":
                        master_memory_request = Q_(c["resources"]["requests"]["memory"]).to(ureg.Mi)
                        master_cpu_request = Q_(c["resources"]["requests"]["cpu"])
                        master_count = n["count"]
                    if n["name"] == "data":
                        data_memory_request = Q_(c["resources"]["requests"]["memory"]).to(ureg.Mi)
                        data_cpu_request = Q_(c["resources"]["requests"]["cpu"])
                        data_count = n["count"]
                    if n["name"] == "ml":
                        ml_memory_request = Q_(c["resources"]["requests"]["memory"]).to(ureg.Mi)
                        ml_cpu_request = Q_(c["resources"]["requests"]["cpu"])
                        ml_count = n["count"]
                    if n["name"] == "ingest":
                        ingest_memory_request = Q_(c["resources"]["requests"]["memory"]).to(ureg.Mi)
                        ingest_cpu_request = Q_(c["resources"]["requests"]["cpu"])
                        ingest_count = n["count"]

    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    v1 = client.CoreV1Api()

    for node in v1.list_node().items:
        n = node.to_dict()
        for key, value in n["metadata"]["labels"].items():
            if key == "role" and value == "server":
                server_node_count += 1

                stats          = {}
                node_name      = node.metadata.name
                allocatable    = node.status.allocatable
                max_pods       = int(int(allocatable["pods"]) * 1.5)

                stats["cpu_alloc"] = Q_(allocatable["cpu"])
                stats["mem_alloc"] = Q_(allocatable["memory"]).to(ureg.Mi)

                field_selector = ("status.phase!=Succeeded,status.phase!=Failed," +
                          "spec.nodeName=" + node_name)

                pods = v1.list_pod_for_all_namespaces(limit=max_pods,
                                                   field_selector=field_selector).items
                # compute the allocated resources
                cpureqs,cpulmts,memreqs,memlmts = [], [], [], []
                for pod in pods:
                    for container in pod.spec.containers:
                        res  = container.resources
                        reqs = defaultdict(lambda: 0, res.requests or {})
                        lmts = defaultdict(lambda: 0, res.limits or {})

                        if reqs["cpu"] == "1" or reqs["cpu"] == 1:
                            cpureqs.append(Q_('1000m'))
                        elif reqs["cpu"] == 0 or reqs["cpu"] == "0":
                            cpureqs.append(Q_('0m'))
                        else:
                            cpureqs.append(Q_(reqs["cpu"]))
                        memreqs.append(Q_(reqs["memory"]).to(ureg.Mi))
                        if lmts["cpu"] == "1" or lmts["cpu"] == 1:
                            cpulmts.append(Q_('1000m'))
                        elif lmts["cpu"] == 0 or lmts["cpu"] == "0":
                            cpulmts.append(Q_('0m'))
                        else:
                            cpulmts.append(Q_(lmts["cpu"]))
                        memlmts.append(Q_(lmts["memory"]).to(ureg.Mi))

                stats["cpu_req"]     = sum(cpureqs)
                stats["cpu_lmt"]     = sum(cpulmts)
                stats["cpu_req_per"] = (stats["cpu_req"] / stats["cpu_alloc"] * 100)
                stats["cpu_lmt_per"] = (stats["cpu_lmt"] / stats["cpu_alloc"] * 100)

                stats["mem_req"]     = sum(memreqs)
                stats["mem_lmt"]     = sum(memlmts)
                stats["mem_req_per"] = (stats["mem_req"] / stats["mem_alloc"] * 100)
                stats["mem_lmt_per"] = (stats["mem_lmt"] / stats["mem_alloc"] * 100)

                stats["cpu_remaining"] =  stats["cpu_alloc"] - stats["cpu_req"]
                stats["mem_remaining"] =  stats["mem_alloc"] - stats["mem_req"]

                data[node_name] = stats
                request.append({ node_name: data[node_name]})

    max_total_masters = 0
    max_total_data = 0
    max_total_ml = 0
    max_total_ingest = 0
    for i in request:
        for key, value in i.items():
            if master_count > 0:
                es_master_cpu_av = int((value["cpu_remaining"] / master_cpu_request))
                es_master_mem_av = int((value["mem_remaining"] / master_memory_request))
                master_min = min([es_master_cpu_av, es_master_mem_av])

            if master_min >= MAX_MASTER_PER_NODE:
                max_total_masters = max_total_masters + MAX_MASTER_PER_NODE
            else:
                max_total_masters = master_min

            if data_count > 0:
                es_data_cpu_av = int((value["cpu_remaining"] / data_cpu_request))
                es_data_mem_av = int((value["mem_remaining"] / data_memory_request))
                data_min = min([es_data_cpu_av, es_data_mem_av])
                if data_min >= MAX_PER_NODE:
                    max_total_data = max_total_data + MAX_PER_NODE
                elif data_min == 0:
                    max_total_data = data_count
                else:
                    max_total_data = data_count + data_min

            if ml_count > 0:
                es_ml_cpu_av = int((value["cpu_remaining"] / ml_cpu_request))
                es_ml_mem_av = int((value["mem_remaining"] / ml_memory_request))
                ml_min = min([es_ml_cpu_av, es_ml_mem_av])
                if ml_min >= MAX_PER_NODE:
                    max_total_ml = max_total_ml + MAX_PER_NODE
                elif ml_min == 0:
                    max_total_ml = ml_count
                else:
                    max_total_ml = ml_count + ml_min

            if ingest_count > 0:
                es_ingest_cpu_av = int((value["cpu_remaining"] / ingest_cpu_request))
                es_ingest_mem_av = int((value["mem_remaining"] / ingest_memory_request))
                ingest_min = min([es_ingest_cpu_av, es_ingest_mem_av])
                if ingest_min >= MAX_PER_NODE:
                    max_total_ingest = max_total_ingest + MAX_PER_NODE
                elif data_min == 0:
                    max_total_ingest = ingest_count
                else:
                    max_total_ingest = ingest_count + ingest_min

    return { "max_scale_count_master": max_total_masters,
            "max_scale_count_data": max_total_data,
            "max_scale_count_ml": max_total_ml,
            "max_scale_count_ingest": max_total_ingest,
            "server_node_count": server_node_count }
