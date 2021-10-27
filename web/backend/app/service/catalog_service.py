import json
import os
import re
from time import sleep, strftime
from typing import Dict, List

import requests
import urllib3
import yaml
from app.models.nodes import Node
from app.models.settings.kit_settings import GeneralSettingsForm
from app.service.job_service import run_command2
from app.service.socket_service import NotificationCode, NotificationMessage
from app.service.system_info_service import get_auth_base
from app.utils.collections import mongo_catalog_saved_values, mongo_node
from app.utils.connection_mngs import REDIS_CLIENT, KubernetesWrapper
from app.utils.constants import NODE_TYPES
from app.utils.logging import logger, rq_logger
from app.utils.utils import get_app_context, get_domain
from rq.decorators import job

HELM_BINARY_PATH = "/usr/local/bin/helm"
WORKING_DIR = "/root"
_MESSAGETYPE_PREFIX = "catalog"
_CHART_EXEMPTS = ["chartmuseum", "elasticsearch", "kibana", "filebeat", "metricbeat"]
_PMO_SUPPORTED_CHARTS = ['cortex', 'hive', 'misp', 'logstash', 'arkime', 'arkime-viewer', 'mongodb', 'rocketchat', 'suricata', 'wikijs', 'zeek', 'remote-health-agent']
_SENSOR_APPLICATIONS = ['arkime', 'suricata', 'zeek']


def _get_controller_ip() -> str:
    general_settings_configuration = GeneralSettingsForm.load_from_db() # type: Dict
    return str(general_settings_configuration.controller_interface)

def _get_elastic_nodes(node_type) -> list:
    """
    Get the different types of elastic nodes regardless of StatefulSet
    """
    nodes = []

    if node_type == "master":
        label_selector = "elasticsearch.k8s.elastic.co/node-master=true"
    elif node_type == "ingest":
        label_selector = "elasticsearch.k8s.elastic.co/node-ingest=true"
    elif node_type == "data":
        label_selector = "elasticsearch.k8s.elastic.co/node-data=true"
    elif node_type == "ml":
        label_selector = "elasticsearch.k8s.elastic.co/node-ml=true"

    with KubernetesWrapper() as kube_apiv1:
        try:
            api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False,label_selector=label_selector)
            for node in api_response.items:
                name = node.metadata.name
                stateful_set = node.metadata.labels["elasticsearch.k8s.elastic.co/statefulset-name"]
                nodes.append("https://{name}.{set}.default.svc.cluster.local:9200".format(name=name,set=stateful_set))
        except Exception as exc:
            nodes = ["elasticsearch.default.svc.cluster.local"]
            logger.exception(exc)
    return nodes

def _get_drive_type() -> bool:
    """
    Gets drive type from device facts utilizing the value provided by disk_rotation key. The disk_rotation
    artifact determines whether a drive is SSD/NVMe or HDD (1 == HDD 0 == SSD || NVMe)
    """
    disks = []
    disk_rotation = []
    sensors = list(mongo_node().find({"node_type": "Sensor"}))

    for sensor in sensors:
        disks.append(sensor['deviceFacts']['disks'])

    for disk in disks:
        for rotation in disk:
            if "nvme" in rotation['name'].lower() or "sd" in rotation['name'].lower():
                disk_rotation.append(rotation['disk_rotation'])

    if '1' in disk_rotation:
        return True
    return False

def _get_logstash_nodes() -> list:
    """
    Get the logstash nodes
    """
    nodes = []
    label_selector = "component=logstash"
    with KubernetesWrapper() as kube_apiv1:
        try:
            api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False,label_selector=label_selector)
            for node in api_response.items:
                name = node.metadata.name
                stateful_set = node.spec.subdomain
                nodes.append("{name}.{set}.default.svc.cluster.local:5050".format(name=name, set=stateful_set))
        except Exception as exc:
            nodes = ["logstash.default.svc.cluster.local:5050"]
            logger.exception(exc)
    return nodes

def _get_chartmuseum_uri() -> str:
    return "https://localhost/chartmuseum"


def get_node_type(hostname: str) -> str:
    """
    Get node type for a node

    """
    if hostname == "Server":
        return hostname
    node = Node.load_from_db_using_hostname(hostname) # type: Node
    if node:
        return node.node_type
    return None


def get_nodes(details: bool=False) -> list:
    """
    Gets list of sensor hostnames

    """
    nodes = []
    kit_nodes = Node.load_all_from_db() # type: List[Node]

    for node in kit_nodes:
        host_simple = {}
        if not details:
            host_simple['hostname'] = node.hostname
            host_simple['status'] = None
            host_simple['application'] = None
            host_simple['version'] = None
            host_simple['node_type'] = node.node_type
        if details:
            host_simple = node.to_dict()
        nodes.append(host_simple)
    return nodes

def get_node_apps(node_hostname: str) -> list:
    node = Node.load_from_db_using_hostname(node_hostname)
    deployed_apps = []
    if node.node_type == NODE_TYPES.sensor.value:
        saved_values = list(mongo_catalog_saved_values().find({"values.node_hostname": node.hostname}))
        for val in saved_values:
            deployed_apps.append({"application": val["application"], "deployment_name": val["deployment_name"]})
    elif node.node_type == NODE_TYPES.service_node.value or node.node_type == NODE_TYPES.server.value:
        saved_values = list(mongo_catalog_saved_values().find({"values.node_hostname": "server"}))
        field_selector = "spec.nodeName={}".format(node.hostname)
        for val in saved_values:
            with KubernetesWrapper() as kube_apiv1:
                try:
                    label_selector = "component={}".format(val["application"])
                    api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False, label_selector=label_selector, field_selector=field_selector)
                    if len(api_response.items) > 0:
                        deployed_apps.append({"application": val["application"], "deployment_name": val["deployment_name"]})
                except:
                    pass
    return deployed_apps

def execute_kubelet_cmd(cmd: str) -> bool:
    """
    Gets execute kubelet commands

    :return (bool): Return if command was successful
    """

    try:
        stdout, ret_code = run_command2(command=cmd, working_dir=WORKING_DIR, use_shell=True)
        if ret_code == 0:
            return True
    except Exception:
        return False

    return False

# def get_system_charts():
#     # TODO THis is jacked and needs to be fixed
#     ret_val = []
#     for chart in glob.glob("/opt/tfplenum/charts"):
#         ret_val.append(chart)

#     # CHARTS = '/opt/tfplenum/bootstrap/playbooks/group_vars/all/chartmuseum.yml'
#     # with open(CHARTS) as file:
#     #     charts = yaml.load(file, Loader=yaml.FullLoader)
#     return charts['{}_charts'.format(system.lower())]

def get_repo_charts() -> list:
    """
    Returns a list of charts from helm repo

    : return (list): Returns a list of charts
    """
    # system_charts = get_system_charts()
    stdout, ret_code = run_command2(command="helm repo update", working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0:
        print("helm repo cache updated.")
        logger.info("helm repo cache updated.")
    results = []
    try:
        uri = _get_chartmuseum_uri()
        urllib3.disable_warnings()
        response = requests.get(uri + "/api/charts", verify=False)
        charts = json.loads(response.text)
        for key, value in charts.items():
            application = key
            if application not in _CHART_EXEMPTS and application:
                for chart in value:
                    t_chart = {}
                    t_chart["application"] = application
                    t_chart["version"] = chart["version"]
                    t_chart["appVersion"] = chart["appVersion"]
                    t_chart["description"] = chart["description"]
                    t_chart["pmoSupported"] = (application in _PMO_SUPPORTED_CHARTS)
                    t_chart["isSensorApp"] = (application  in _SENSOR_APPLICATIONS)
                    results.append(t_chart)
    except Exception as exc:
        logger.exception(exc)
        print(str(exc))
    return results


def _inspect_chart(application: str) -> dict:
    chart = {}
    stdout, ret_code = run_command2(command="helm inspect chart chartmuseum/" + application, working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0 and stdout != '':
        chart = yaml.full_load(stdout.strip())
    return chart

def _inspect_readme(application: str):
    appconfig = {}
    stdout, ret_code = run_command2(command="helm inspect readme chartmuseum/" + application, working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0 and stdout != '':
        appconfig = yaml.full_load(stdout.strip())
    return appconfig


def _build_chart_info(application: str, chart: dict, appconfig: dict) -> dict:
    info = {}
    info["id"] = application
    info["version"] = chart.get("version", None)
    info["description"] = chart.get("description", None)
    info["appVersion"] = chart.get("appVersion", None)
    info["formControls"] = appconfig.get("formControls", None)
    info["type"] = appconfig.get("type", "chart")
    info["node_affinity"] = appconfig.get("node_affinity","Server - Any")
    info["devDependent"] = appconfig.get("devDependent", None)
    return info


def chart_info(application: str) -> dict:
    chart = None
    appconfig= None
    try:
        chart = _inspect_chart(application)
        appconfig = _inspect_readme(application)
        if chart and appconfig:
            return _build_chart_info(application, chart, appconfig)
    except Exception as exc:
        logger.exception(exc)
        print("ERROR: " + str(exc))
    return None

def get_helm_list(application: str=None) -> dict:
    chart_releases = None
    cmd = "helm list --all -o json"
    if application:
        cmd = "helm list --all -o json --filter='" + application + "$'"
    stdout, ret_code = run_command2(command=cmd,
    working_dir=WORKING_DIR, use_shell=True)

    if ret_code == 0 and stdout != '':
        chart_releases = json.loads(stdout.strip())
    return chart_releases


def get_app_state(application: str, namespace: str, nodes: List[Node]=None, chart_releases: List=None) -> list:
    if not nodes:
        nodes = Node.load_dip_nodes_from_db() # type: List[Node]
    saved_values = list(mongo_catalog_saved_values().find({"application": application}))
    deployed_apps = []
    try:
        if not chart_releases:
            chart_releases = get_helm_list(application)
        regex = ".*{}$".format(application)
        current_charts = [chart for chart in chart_releases if re.match(regex, chart["name"])]
        for chart in current_charts:
            node = {}
            node_hostname = None
            values = None
            node["application"] = application
            node["appVersion"] = chart["app_version"]
            node["status"] = chart["status"].replace("-", " ").upper()
            node["deployment_name"] = chart["name"]
            node["hostname"] = None
            node["node_type"] = None
            filter_sv = [svalues for svalues in saved_values if svalues["deployment_name"] == chart["name"]]
            if filter_sv:
                values = filter_sv[0].get("values", None)
            if values:
                node_hostname = values.get("node_hostname", None)
            if node_hostname:
                cnode = [tnode for tnode in nodes if tnode.hostname == node_hostname]
                node["hostname"] = node_hostname
                if cnode:
                    node["node_type"] = cnode[0].node_type
            deployed_apps.append(node)
    except Exception as exc:
        logger.error(exc)
        print("ERROR: " + str(exc))
    return deployed_apps

def get_values(application) -> dict:
    values = {}
    raw_values = None
    stdout, ret_code = run_command2(command="helm inspect values chartmuseum/" + application, working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0 and stdout != '':
        try:
            raw_values = yaml.full_load(stdout.strip())
        except Exception:
            pass

    if raw_values:
        if isinstance(raw_values, str):
            for line in raw_values.splitlines():
                k, val = line.strip().split(':')
                values[k.strip()] = val.strip()
        elif isinstance(raw_values, dict):
            values = raw_values

    return values

def generate_values(application: str, namespace: str, configs: list=None) -> list:
    try:
        values = get_values(application)
        if 'domain' in values:
            values['domain'] = get_domain()
        if 'auth_base' in values:
            values['auth_base'] = get_auth_base()
        if 'elastic_ingest_nodes' in values:
            values['elastic_ingest_nodes'] = _get_elastic_nodes(node_type="ingest")
            if values['elastic_ingest_nodes'] is None or len(values['elastic_ingest_nodes']) == 0:
                raise ValueError("Elastic ingest cannot be null")
        if 'elastic_data_nodes' in values:
            values['elastic_data_nodes'] = _get_elastic_nodes(node_type="data")
        if 'shards' in values:
            values['shards'] = len(_get_elastic_nodes(node_type="data"))
        if 'logstash_nodes' in values:
            values['logstash_nodes'] = _get_logstash_nodes()
        if 'hard_disk_drive' in values:
            values['hard_disk_drive'] = _get_drive_type()
        if 'controller_ipaddress' in values:
            values['controller_ipaddress'] = _get_controller_ip()
    except Exception as exec:
        logger.exception(exec)
    if configs:
        l_values = []
        for config in configs:
            for node_hostname, value in config.items():
                sensordict = {}
                sensordict[node_hostname] = {}
                c_values = values.copy()
                for key, t_value in value.items():
                    c_values[key] = t_value
                sensordict[node_hostname] = c_values
            l_values.append(sensordict)

        return l_values
    if values:
        return values
    return []


def _write_values(deployment_name: str, value_items: dict) -> str:
    timestr = strftime("%Y%m%d-%H%M%S")
    tpath = "/tmp/" + deployment_name  + "_" + timestr + ".yaml"
    with open(tpath , 'w') as values_file:
        values_file.write(yaml.dump(value_items))
    return tpath

def _build_values(values: dict):
    try:
        for name, val in values.items():
            deployment_name = name
            value_items = val
    except Exception as exc:
        logger.error(exc)

    return deployment_name, value_items


def _purge_helm_app_on_failure(deployment_name: str, namespace: str):
    cmd = "helm uninstall {} --namespace {}".format(deployment_name, namespace)
    run_command2(command=cmd, use_shell=True, working_dir=WORKING_DIR)


@job('default', connection=REDIS_CLIENT, timeout="30m")
def install_helm_apps (application: str, namespace: str, node_affinity: str, values: list, task_id=None):
    get_app_context().push()
    response = []
    deployment_names =[]
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.INSTALLING.name.capitalize(), application=application.capitalize())
    for value in values:
        deployment_name = None
        value_items = None
        node_hostname = None

        message = '%s %s' % (NotificationCode.INSTALLING.name.capitalize(), application.capitalize())

        deployment_name, value_items = _build_values(value)

        if deployment_name and value_items:
            deployment_names.append(deployment_name)
            # TODO start here on Monday this is totally messed up as it does not have the FQDN
            node_hostname = value_items.get("node_hostname", None)
            if node_hostname is None:
                node_hostname = deployment_name

            message = '%s %s on %s' % (NotificationCode.INSTALLING.name.capitalize(), application.capitalize(), node_hostname)
            notification.set_message(message=message)
            try:

                if "Sensor" in node_affinity:
                    # Add kube node label
                    execute_kubelet_cmd("kubectl label nodes " + node_hostname + " " + application + "=true --overwrite=true")
                else:
                    if "nodeSelector" in value_items:
                        value_items["nodeSelector"] = { "role": "server" }
                install_helm_command.delay(deployment_name=deployment_name, application=application, node=node_hostname, namespace=namespace, value_items=value_items)
                mongo_catalog_saved_values().delete_one({"application": application, "deployment_name": deployment_name})
                mongo_catalog_saved_values().insert({"application": application, "deployment_name": deployment_name, "values": value_items})
                while True:
                    sleep(0.25)
                    data = get_app_state(application=application, namespace=namespace)
                    if len(list(filter(lambda d: d["deployment_name"] == deployment_name, data))) > 0:
                        break
                # Send Update Notification to websocket
                notification.set_exception(exception=None)
                notification.set_status(status=NotificationCode.IN_PROGRESS.name)
                notification.set_additional_data(data=data)
                notification.post_to_websocket_api()
            except Exception as exc:
                rq_logger.error(exc)
                # Send Update Notification to websocket
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_exception(exception=exc)
                notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
                notification.post_to_websocket_api()
                _purge_helm_app_on_failure(deployment_name, namespace)
        else:
            err = "Error unable to parse values from request"
            rq_logger.exception(err)
            # Send Update Notification to websocket
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_exception(exception=err)
            notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
            notification.post_to_websocket_api()
    # Send Update Notification to websocket
    while len(list(filter(lambda d: d["deployment_name"] in deployment_names and d["status"].lower() == "deployed", get_app_state(application=application, namespace=namespace)))) < len(deployment_names):
        sleep(0.25)
    notification.set_message(message="Install completed.")
    notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
    notification.set_status(status=NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return response

@job('default', connection=REDIS_CLIENT, timeout="30m")
def install_helm_command (deployment_name: str, application: str, node: str, namespace: str, value_items: dict):
    get_app_context().push()
    response = []
    tpath = _write_values(deployment_name, value_items)
    cmd = "helm install " + deployment_name + " chartmuseum/" + application + " --namespace " + namespace + " --values " + tpath + " --wait --wait-for-jobs"
    rq_logger.info(cmd)
    stdout, ret_code = run_command2(command=cmd,
        working_dir=WORKING_DIR, use_shell=True)

    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.INSTALLING.name.capitalize(), application=application.capitalize())
    if ret_code == 0 and stdout != '':
        # Send Update Notification to websocket
        results = yaml.full_load(stdout.strip())
        notification.set_status(status=results["STATUS"].upper())
        notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
        if node is not None:
            message = '%s %s on %s' % (NotificationCode.INSTALLING.name.capitalize(), application, node)
            notification.set_message(message=message)
        notification.post_to_websocket_api()

        response.append("release: \"" + deployment_name + "\" "  + results["STATUS"].upper())
    if ret_code != 0 and stdout != '':
        results = stdout.strip()
        rq_logger.exception(results)
        # Send Update Notification to websocket
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_exception(exception=results)
        notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
        notification.post_to_websocket_api()
        _purge_helm_app_on_failure(deployment_name, namespace)
    if os.path.exists(tpath):
        os.remove(tpath)
    sleep(1)
    return response

@job('default', connection=REDIS_CLIENT, timeout="30m")
def delete_helm_apps (application: str, nodes: List, namespace: str="default"):
    get_app_context().push()
    # Send Update Notification to websocket
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.UNINSTALLING.name.capitalize(), application=application.capitalize())
    response = []
    deployment_names =[]
    for node in nodes:
        node_hostname = None
        deployment_name = None
        old_deployment_name = None
        deployment_to_uninstall = None
        results = None

        if "hostname" in node:
            node_hostname = node["hostname"]
        if "deployment_name" in node:
            deployment_name = node["deployment_name"]
            deployment_to_uninstall = deployment_name
        if "status" in node:
            status = node["status"]
            if "deployment_name" in status:
                old_deployment_name = status["deployment_name"]
        if (deployment_name and old_deployment_name) and (deployment_name != old_deployment_name):
            deployment_to_uninstall = old_deployment_name


        if deployment_to_uninstall:
            deployment_names.append(deployment_name)
            message = '%s %s on %s' % (NotificationCode.UNINSTALLING.name.capitalize(), application, node_hostname)
            notification.set_message(message=message)
            notification.set_exception(exception=None)
            try:
                # Remove kube node label
                if node_hostname:
                    execute_kubelet_cmd("kubectl label nodes " + node_hostname + " " + application + "-")
                delete_helm_command.delay(deployment_name=deployment_to_uninstall, application=application, node=node_hostname, namespace=namespace)
                while True:
                    if len(list(filter(lambda d: d["deployment_name"] == deployment_to_uninstall and d["status"].lower() == "uninstalling", get_app_state(application=application, namespace=namespace)))) > 0:
                        break
                # Send Update Notification to websocket
                notification.set_status(status=NotificationCode.IN_PROGRESS.name)
                notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
                notification.post_to_websocket_api()
                response.append(results)
            except Exception as exc:
                rq_logger.exception(exc)
                # Send Update Notification to websocket
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_exception(exception=exc)
                notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
                notification.post_to_websocket_api()
        else:
            err = "Error unable to determine deployment name please try again"
            rq_logger.exception(err)
            # Send Update Notification to websocket
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_exception(exception=err)
            notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
            notification.post_to_websocket_api()

    # Send Update Notification to websocket
    while any(item in deployment_names for item in [d["deployment_name"] for d in get_app_state(application=application, namespace=namespace)]):
        sleep(0.25)
    notification.set_message(message="Uninstall completed.")
    notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
    notification.set_status(status=NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return response

@job('default', connection=REDIS_CLIENT, timeout="30m")
def delete_helm_command (deployment_name: str, application: str, node: str, namespace: str):
    get_app_context().push()
    response = []
    stdout, ret_code = run_command2(command="helm delete " + deployment_name + " --namespace " + namespace +" --wait",
                                    working_dir=WORKING_DIR, use_shell=True)

    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.UNINSTALLING.name.capitalize(), application=application.capitalize())
    if ret_code == 0 and stdout != '':
        mongo_catalog_saved_values().delete_one({"deployment_name": deployment_name})
        # Send Update Notification to websocket
        if node is not None:
            message = '%s %s on %s' % (NotificationCode.UNINSTALLING.name.capitalize(), application, node)
            notification.set_message(message=message)
        notification.set_status(status=NotificationCode.UNINSTALLED.name)
        notification.post_to_websocket_api()

        response.append("release: \"" + deployment_name + "\" UNINSTALLED")
    if ret_code != 0:
        results = ''
        if stdout != '':
            results = stdout.strip()
        rq_logger.exception(results)
        # Send Update Notification to websocket
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_exception(exception=results)
        notification.set_additional_data(data=get_app_state(application=application, namespace=namespace))
        notification.post_to_websocket_api()
    sleep(1)
    return response

@job('default', connection=REDIS_CLIENT, timeout="30m")
def reinstall_helm_apps(application: str, namespace: str, nodes: List, node_affinity: str, values: List):
    get_app_context().push()
    delete_helm_apps(application=application, namespace=namespace, nodes=nodes)
    install_helm_apps(application=application, namespace=namespace, node_affinity=node_affinity, values=values)
