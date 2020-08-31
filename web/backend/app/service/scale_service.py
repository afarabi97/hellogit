import os
from base64 import b64decode
from time import sleep
from collections import defaultdict
from pint import UnitRegistry
import traceback
from elasticsearch import Elasticsearch
from kubernetes import client, config

from app import celery, logger
from app.service.socket_service import NotificationMessage, NotificationCode
from app.catalog_service import _get_domain
from app.dao import elastic_deploy


_JOB_NAME = "scale"
ELASTIC_OP_GROUP = "elasticsearch.k8s.elastic.co"
ELASTIC_OP_VERSION = "v1"
ELASTIC_OP_NAMESPACE = "default"
ELASTIC_OP_NAME = "tfplenum"
ELASTIC_OP_PLURAL = "elasticsearches"
KUBE_CONFIG_LOCATION = "/root/.kube/config"

def get_elastic_password(name='tfplenum-es-elastic-user', namespace='default'):
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_secret(name, namespace)
    password = b64decode(response.data['elastic']).decode('utf-8')
    return password

def get_elastic_service_ip(name='elasticsearch', namespace='default'):
    ip_address = None
    port= None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    # Try to get the external ip
    ip_address = response.spec.external_i_ps
    if ip_address is None:
        ip_address = response.spec.load_balancer_ip
    if ip_address is None:
        ip_address = response.status.load_balancer.ingress[0].ip

    # Get the port
    port = response.spec.ports[0].port

    return ip_address, port

def get_elastic_fqdn(name='elasticsearch', namespace='default'):
    fqdn = None
    port= None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    fqdn =  "{name}.{domain}".format(name=name,domain=_get_domain())
    # Get the port
    port = response.spec.ports[0].port

    return fqdn, port

def get_es_nodes():
    nodes = None
    if not os.path.exists(KUBE_CONFIG_LOCATION):
        return []
    try:
        if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
            config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
        password = get_elastic_password()
        elastic_fqdn, port = get_elastic_fqdn()
        if elastic_fqdn is not None and port is not None:
            elastic = Elasticsearch(elastic_fqdn, scheme="https", port=port, http_auth=('elastic', password), use_ssl=True, verify_certs=True, ca_certs=os.environ['REQUESTS_CA_BUNDLE'])
            nodes = elastic.cat.nodes(format='json')
        return nodes
    except Exception as exec:
        traceback.print_exc()
        logger.exception(exec)
        return None

def parse_nodes(nodes):
    mdi = 0
    master = 0
    data = 0
    coordinating_ingest = 0

    if nodes is not None:
        for node in nodes:
            role = node["node.role"]
            if "m" in role and "d" in role and "i" in role:
                mdi += 1
            else:
                if "m" in role:
                    master += 1
                if "d" in role:
                    data += 1
                if "i" in role:
                    coordinating_ingest += 1
        # if data is zero than we are working with an mdi cluster
        if master == 0 and data == 0:
            master = mdi

    return { "master": master, "data": data, "coordinating": coordinating_ingest}

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
        deploy_coordinating_count = 0
        deploy_data_count = 0
        deploy_total_count = 0

        if "spec" in deploy_config:
            spec = deploy_config["spec"]
            if "nodeSets" in spec:
                node_sets = deploy_config["spec"]["nodeSets"]
                for node in node_sets:
                    if node["name"] == "master":
                        deploy_master_count = node["count"]
                    if node["name"] == "coordinating":
                        deploy_coordinating_count = node["count"]
                    if node["name"] == "data":
                        deploy_data_count = node["count"]
                    deploy_total_count += node["count"]
        nodes = get_es_nodes()
        es_node_count = None
        if nodes:
            es_node_count = parse_nodes(nodes)

        resp = get_namespaced_custom_object_status()

        if (es_node_count
                and es_node_count["master"] ==  deploy_master_count
                and es_node_count["data"] == deploy_data_count
                and es_node_count["coordinating"] == deploy_coordinating_count
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


@celery.task
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
    ureg.load_definitions('/opt/tfplenum/web/backend/shared/kubernetes_units')
    data = {}
    request = []
    Q_ = ureg.Quantity

    MAX_PER_NODE = 3
    coordinating_count = 0
    data_count = 0
    master_count = 0
    server_node_count = 0

    deploy_config = elastic_deploy.read()
    if "spec" in deploy_config:
        spec = deploy_config["spec"]
        if "nodeSets" in spec:
            node_sets = deploy_config["spec"]["nodeSets"]
            for n in node_sets:
                for c in n["podTemplate"]["spec"]["containers"]:
                    if n["name"] == "coordinating":
                        coordinating_memory_request = Q_(c["resources"]["requests"]["memory"]).to(ureg.Mi)
                        coordinating_cpu_request = Q_(c["resources"]["requests"]["cpu"])
                        coordinating_count = n["count"]
                    if n["name"] == "master":
                        master_memory_request = Q_(c["resources"]["requests"]["memory"]).to(ureg.Mi)
                        master_cpu_request = Q_(c["resources"]["requests"]["cpu"])
                        master_count = n["count"]
                    if n["name"] == "data":
                        data_memory_request = Q_(c["resources"]["requests"]["memory"]).to(ureg.Mi)
                        data_cpu_request = Q_(c["resources"]["requests"]["cpu"])
                        data_count = n["count"]

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
    max_total_coordinating = 0
    max_total_data = 0
    for i in request:
        for key, value in i.items():
            if master_count > 0:
                es_master_cpu_av = int((value["cpu_remaining"] / master_cpu_request))
                es_master_mem_av = int((value["mem_remaining"] / master_memory_request))
                master_min = min([es_master_cpu_av, es_master_mem_av])

                if master_min >= MAX_PER_NODE:
                    max_total_masters = max_total_masters + MAX_PER_NODE
                else:
                    max_total_masters = master_min

            if coordinating_count > 0:
                es_coordinating_cpu_av = int((value["cpu_remaining"] / coordinating_cpu_request))
                es_coordinating_mem_av = int((value["mem_remaining"] / coordinating_memory_request))
                coordinating_min = min([es_coordinating_cpu_av, es_coordinating_mem_av])

                if coordinating_min >= MAX_PER_NODE:
                    max_total_coordinating = max_total_coordinating + MAX_PER_NODE
                else:
                    max_total_coordinating = coordinating_min

            if data_count > 0:
                es_data_cpu_av = int((value["cpu_remaining"] / data_cpu_request))
                es_data_mem_av = int((value["mem_remaining"] / data_memory_request))
                data_min = min([es_data_cpu_av, es_data_mem_av])

                if data_min >= MAX_PER_NODE:
                    max_total_data = max_total_data + MAX_PER_NODE
                else:
                    max_total_data = data_min

    return { "max_scale_count_master": max_total_masters,
            "max_scale_count_coordinating": max_total_coordinating,
            "max_scale_count_data": max_total_data,
            "server_node_count": server_node_count }
