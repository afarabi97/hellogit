from app import app, celery, logger, conn_mng
from typing import Dict, Tuple, List
from enum import Enum
from shared.constants import KICKSTART_ID, KIT_ID, NODE_TYPES
from shared.connection_mngs import FabricConnectionWrapper
from app.node_facts import get_system_info
from shared.utils import decode_password
import re
from app.service.socket_service import NotificationMessage, NotificationCode
import requests, json, yaml
from app.service.job_service import run_command2
from time import sleep, strftime
import os


_MESSAGETYPE_PREFIX = "catalog"
_CHART_EXEMPTS = ["chartmuseum", "elasticsearch", "kibana", "filebeat", "metricbeat"]
CHARTMUSEUM_PORT = "8080"
CHARTMUSEUM_FQDN = "chartmuseum.lan"
HELM_BINARY_PATH = "/usr/local/bin/helm"
WORKING_DIR = "/root"


def _get_chartmuseum_uri() -> str:
    svc_ip = None
    kube_cmd = ("kubectl get svc chartmuseum -o json")
    stdout, ret_code = run_command2(command=kube_cmd, working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0 and stdout != "":
        try:
            results = json.loads(stdout.strip())
            svc_ip = results["status"]["loadBalancer"]["ingress"][0]["ip"]
            if svc_ip and svc_ip != "":
                return "https://" + CHARTMUSEUM_FQDN + ":" + CHARTMUSEUM_PORT
        except Exception as exc:
            logger.exception(exc)
    return ""

def get_node_type(hostname: str) -> str:
    """
    Get node type for a node

    """
    nodes = []
    kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if kit_configuration:
        nodes = kit_configuration['form']['nodes']
        node_list = list(filter(lambda node: node['hostname'] == hostname, nodes))
        if len(node_list) == 1:
            return node_list[0]['node_type']
    return None


def get_nodes(details: bool=False) -> list:
    """
    Gets list of sensor hostnames

    """
    nodes = []
    kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if kit_configuration:
        for node in kit_configuration['form']['nodes']:
            host_simple = {}
            if not details:
                host_simple['hostname'] = node['hostname']
                host_simple['status'] = None
                host_simple['application'] = None
                host_simple['version'] = None
                host_simple['node_type'] = node['node_type']
            if details:
                host_simple = node
            nodes.append(host_simple)
    return nodes

def get_node_apps(node_hostname: str) -> list:
    deployed_apps = []
    saved_values = list(conn_mng.mongo_catalog_saved_values.find({}))
    for v in saved_values:
        if "values" in v and "node_hostname" in v["values"]:
            node_type = get_node_type(v["values"]["node_hostname"])
            if node_type:
                hostname = v["values"]["node_hostname"]
                if hostname == node_hostname:
                    deployed_apps.append(v["application"])

    return deployed_apps

def execute_kubelet_cmd(cmd: str) -> bool:
    """
    Gets execute kubelet commands

    :return (bool): Return if command was successful
    """

    try:
        with FabricConnectionWrapper() as ssh_conn:
            ssh_conn.run(cmd, hide=True)
        return True
    except:
        return False

    return False


def get_repo_charts() -> list:
    """
    Returns a list of charts from helm repo

    : return (list): Returns a list of charts
    """
    stdout, ret_code = run_command2(command="helm repo update",
            working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0:
        print("helm repo cache updated.")
        logger.info("helm repo cache updated.")
    results = []
    try:
        response = requests.get(_get_chartmuseum_uri() + "/api/charts")
        charts = json.loads(response.text)
        for key, value in charts.items():
            application = key
            if application not in _CHART_EXEMPTS:
                for c in value:
                    t_chart = {}
                    t_chart["application"] = application
                    t_chart["version"] = c["version"]
                    t_chart["appVersion"] = c["appVersion"]
                    t_chart["description"] = c["description"]
                    results.append(t_chart)
    except Exception as exc:
       logger.exception(exc)
    return results


def _inspect_chart(application: str) -> dict:
    chart = {}
    stdout, ret_code = run_command2(command="helm inspect chart chartmuseum/" + application,
                working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0 and stdout != '':
        chart = yaml.full_load(stdout.strip())
    return chart

def _inspect_readme(application: str):
    appconfig = {}
    stdout, ret_code = run_command2(command="helm inspect readme chartmuseum/" + application,
                working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0 and stdout != '':
        appconfig = json.loads(stdout.strip())
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

def _get_helm_list(application: str) -> dict:
        chart_releases = None
        stdout, ret_code = run_command2(command="helm list --all -o json --filter='" + application + "$'",
        working_dir=WORKING_DIR, use_shell=True)

        if ret_code == 0 and stdout != '':
            chart_releases = json.loads(stdout.strip())
        return chart_releases


def get_app_state(application: str, namespace: str) -> list:
    deployed_apps = []
    try:
        chart_releases = _get_helm_list(application)
        if chart_releases:
            for c in chart_releases:
                node = {}
                node["application"] = application
                node["appVersion"] = c["app_version"]
                node["status"] = c["status"].upper()
                node["deployment_name"] = c["name"]
                node["hostname"] = None
                node["node_type"] = None
                saved_values = conn_mng.mongo_catalog_saved_values.find_one({"application": application, "deployment_name": c["name"]})
                values = saved_values.get("values", None)
                if values:
                    node_hostname = values.get("node_hostname", None)
                if node_hostname:
                    node["hostname"] = node_hostname
                    node["node_type"] = get_node_type(node_hostname)
                deployed_apps.append(node)
    except Exception as exc:
        logger.error(exc)
        print("ERROR: " + str(exc))
    return deployed_apps

def get_values(application) -> dict:
    values = {}
    raw_values = None
    stdout, ret_code = run_command2(command="helm inspect values chartmuseum/" + application,
            working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0 and stdout != '':
        try:
            raw_values = yaml.full_load(stdout.strip())
        except:
            pass

    if raw_values:
        if isinstance(raw_values, str):
            for line in raw_values.splitlines():
                k, v = line.strip().split(':')
                values[k.strip()] = v.strip()
        elif isinstance(raw_values, dict):
            values = raw_values

    return values

def generate_values(application: str, namespace: str, configs: list=None) -> list:
    try:
        values = get_values(application)
    except Exception as e:
        logger.exception(e)
    if configs:
        l_values = []
        for config in configs:
            for node_hostname, v in config.items():
                sensordict = {}
                sensordict[node_hostname] = {}
                c_values = values.copy()
                for key, value in v.items():
                    c_values[key] = value
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
    print(values)
    try:
        for h, v in values.items():
            deployment_name = h
            value_items = v
    except Exception as exc:
            logger.error(exc)

    return deployment_name, value_items


@celery.task
def install_helm_apps (application: str, namespace: str, node_affinity: str, values: list, task_id=None):
    response = []

    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.INSTALLING.name.capitalize(), application=application.capitalize())
    for value in values:
        deployment_name = None
        value_items = None
        node_hostname = None

        message = '%s %s' % (NotificationCode.INSTALLING.name.capitalize(), application.capitalize())

        deployment_name, value_items = _build_values(value)

        if deployment_name and value_items:
            node_hostname = value_items.get("node_hostname", None)
            if node_hostname is None:
                node_hostname = deployment_name

            message = '%s %s on %s' % (NotificationCode.INSTALLING.name.capitalize(), application.capitalize(), node_hostname)
            notification.set_message(message=message)
            try:
                # Send Update Notification to websocket
                notification.set_exception(exception=None)
                notification.set_status(status=NotificationCode.IN_PROGRESS.name)
                notification.post_to_websocket_api()

                if "Sensor" in node_affinity:
                    # Add kube node label
                    execute_kubelet_cmd("kubectl label nodes " + node_hostname + " " + application + "=true --overwrite=true")
                else:
                    if "nodeSelector" in value_items:
                        value_items["nodeSelector"] = { "role": "server" }

                tpath = _write_values(deployment_name, value_items)

                stdout, ret_code = run_command2(command="helm install " + deployment_name +
                    " chartmuseum/" + application +
                    " --namespace " + namespace +
                    " --values " + tpath,
                    working_dir=WORKING_DIR, use_shell=True)

                if ret_code == 0 and stdout != '':
                    results = yaml.full_load(stdout.strip())

                    # Send Update Notification to websocket
                    notification.set_status(status=results["STATUS"].upper())
                    notification.post_to_websocket_api()
                    response.append("release: \"" + deployment_name + "\" "  + results["STATUS"].upper())
                    conn_mng.mongo_catalog_saved_values.delete_one({"application": application, "deployment_name": deployment_name})
                    conn_mng.mongo_catalog_saved_values.insert({"application": application, "deployment_name": deployment_name, "values": value_items})

                if ret_code != 0 and stdout != '':
                    results = stdout.strip()
                    logger.exception(results)
                    # Send Update Notification to websocket
                    notification.set_status(status=NotificationCode.ERROR.name)
                    notification.set_exception(exception=results)
                    notification.post_to_websocket_api()
                if os.path.exists(tpath):
                    os.remove(tpath)
                sleep(1)
            except Exception as exc:
                logger.error(exc)
                # Send Update Notification to websocket
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_exception(exception=exc)
                notification.post_to_websocket_api()
        else:
            err = "Error unable to parse values from request"
            logger.exception(err)
            # Send Update Notification to websocket
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_exception(exception=err)
            notification.post_to_websocket_api()

    # Send Update Notification to websocket
    notification.set_message(message="Install completed.")
    notification.set_status(status=NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return response

@celery.task
def delete_helm_apps (application: str, namespace: str, nodes: List):
    # Send Update Notification to websocket
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.DELETING.name.capitalize(), application=application.capitalize())
    response = []
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
            message = '%s %s on %s' % (NotificationCode.DELETING.name.capitalize(), application, node_hostname)
            notification.set_message(message=message)
            notification.set_exception(exception=None)
            try:
                # Send Update Notification to websocket
                notification.set_status(status=NotificationCode.IN_PROGRESS.name)
                notification.post_to_websocket_api()

                # Remove kube node label
                if node_hostname:
                    execute_kubelet_cmd("kubectl label nodes " + node_hostname + " " + application + "-")

                stdout, ret_code = run_command2(command="helm delete " + deployment_to_uninstall,
                        working_dir=WORKING_DIR, use_shell=True)
                if ret_code == 0 and stdout != '':
                    results = stdout.strip()
                    # Remove old saved values
                    conn_mng.mongo_catalog_saved_values.delete_one({"application": application, "deployment_name": deployment_to_uninstall})

                    # Send Update Notification to websocket
                    message = '%s %s on %s' % (NotificationCode.DELETING.name.capitalize(), application, node_hostname)
                    notification.set_status(status=NotificationCode.DELETED.name)
                    notification.post_to_websocket_api()
                if ret_code != 0 and stdout != '':
                    results = stdout.strip()
                    logger.exception(exc)
                    # Send Update Notification to websocket
                    notification.set_status(status=NotificationCode.ERROR.name)
                    notification.set_exception(exception=exc)
                    notification.post_to_websocket_api()
                response.append(results)
                sleep(1)
            except Exception as exc:
                logger.exception(exc)
                # Send Update Notification to websocket
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_exception(exception=exc)
                notification.post_to_websocket_api()
        else:
            err = "Error unable to determine deployment name please try again"
            logger.exception(err)
            # Send Update Notification to websocket
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_exception(exception=err)
            notification.post_to_websocket_api()

    # Send Update Notification to websocket
    notification.set_message(message="Delete completed.")
    notification.set_status(status=NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return response
