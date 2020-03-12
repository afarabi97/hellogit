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
                return "http://" + svc_ip + ":" + CHARTMUSEUM_PORT
        except Exception as exc:
            logger.exception(exc)
    return ""

def get_node_type(hostname: str) -> str:
    """
    Get node type for a node

    """
    nodes = []
    kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
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
    current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
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
        if "values" in v:
            if "node_hostname" in v["values"]:
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
                    tChart = {}
                    tChart["application"] = application
                    tChart["version"] = c["version"]
                    tChart["appVersion"] = c["appVersion"]
                    tChart["description"] = c["description"]
                    results.append(tChart)
    except Exception as exc:
       logger.exception(exc)
    return results

def chart_info(application: str) -> dict:
    info = {}
    info["id"] = application
    chart = None
    appconfig= None
    try:
        stdout, ret_code = run_command2(command="helm inspect chart chartmuseum/" + application,
                working_dir=WORKING_DIR, use_shell=True)
        if ret_code == 0 and stdout != '':
            chart = yaml.full_load(stdout.strip())
        if chart:
            info["version"] = chart["version"]
            info["description"] = chart["description"]
            info["appVersion"] = chart["appVersion"]
            info["formControls"] = None
            info["type"] = "chart"
            info["node_affinity"] = "Server - Any"
            info["devDependent"] = None

            stdout, ret_code = run_command2(command="helm inspect readme chartmuseum/" + application,
                working_dir=WORKING_DIR, use_shell=True)
            if ret_code == 0 and stdout != '':
                appconfig = json.loads(stdout.strip())

            if appconfig:
                if "formControls" in appconfig:
                    info["formControls"] = appconfig["formControls"]
                if "type" in appconfig:
                    info["type"] = appconfig["type"]
                if "node_affinity" in appconfig:
                    info["node_affinity"] = appconfig["node_affinity"]
                if "devDependent" in appconfig:
                    info["devDependent"] = appconfig["devDependent"]
    except Exception as exc:
        logger.exception(exc)
        print("ERROR: " + str(exc))
    return info


def get_app_state(application: str, namespace: str) -> list:
    deployed_apps = []
    chart_releases = None
    try:
        stdout, ret_code = run_command2(command="helm list --all -o json --filter='" + application + "$'",
        working_dir=WORKING_DIR, use_shell=True)

        if ret_code == 0 and stdout != '':
            chart_releases = json.loads(stdout.strip())
        if chart_releases:
            for c in chart_releases:
                node = {}
                node["deployment_name"] = c["name"]
                node["hostname"] = None
                node["node_type"] = None
                saved_values = conn_mng.mongo_catalog_saved_values.find_one({"application": application, "deployment_name": c["name"]})

                if saved_values:
                    if "values" in saved_values:
                        if "node_hostname" in saved_values["values"]:
                            node["node_type"] = get_node_type(saved_values["values"]["node_hostname"])
                            if node["node_type"]:
                                node["hostname"] = saved_values["values"]["node_hostname"]

                node["application"] = application
                #node["version"] = ""
                node["appVersion"] = c["app_version"]
                node["status"] = c["status"].upper()
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
    except SchemeError as e:
        response.append(str(e))
        logger.exception(e)
    if configs:
        lValues = []
        for config in configs:
            for node_hostname, v in config.items():
                sensordict = {}
                sensordict[node_hostname] = {}
                cValues = values.copy()
                for key, value in v.items():
                    cValues[key] = value
                sensordict[node_hostname] = cValues
            lValues.append(sensordict)

        return lValues
    if values:
        return values
    return []


@celery.task
def install_helm_apps (application: str, namespace: str, node_affinity: str, values: list, task_id=None):
    response = []

    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.INSTALLING.name.capitalize(), application=application.capitalize())
    for value in values:
        deployment_name = None
        value_items = None
        node_hostname = None

        message = '%s %s' % (NotificationCode.INSTALLING.name.capitalize(), application.capitalize())
        try:
            for h, v in value.items():
                deployment_name = h
                value_items = v
        except Exception as exc:
                logger.error(exc)
                pass

        if deployment_name and value_items:

            if "node_hostname" in value_items:
                node_hostname = value_items["node_hostname"]
            else:
                node_hostname = deployment_name

            message = '%s %s on %s' % (NotificationCode.INSTALLING.name.capitalize(), application.capitalize(), node_hostname)
            notification.setMessage(message=message)
            try:
                # Send Update Notification to websocket
                notification.setException(exception=None)
                notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
                notification.post_to_websocket_api()

                if "Sensor" in node_affinity:
                    # Add kube node label
                    execute_kubelet_cmd("kubectl label nodes " + node_hostname + " " + application + "=true --overwrite=true")
                else:
                    if "nodeSelector" in value_items:
                        value_items["nodeSelector"] = { "role": "server" }

                timestr = strftime("%Y%m%d-%H%M%S")
                tpath = "/tmp/" + deployment_name  + "_" + timestr + ".yaml"
                with open(tpath , 'w') as values_file:
                    values_file.write(yaml.dump(value_items))

                stdout, ret_code = run_command2(command="helm install " + deployment_name +
                    " chartmuseum/" + application +
                    " --namespace " + namespace +
                    " --values " + tpath,
                    working_dir=WORKING_DIR, use_shell=True)

                if ret_code == 0 and stdout != '':
                    results = yaml.full_load(stdout.strip())

                    # Send Update Notification to websocket
                    notification.setStatus(status=results["STATUS"].upper())
                    notification.post_to_websocket_api()
                    response.append("release: \"" + deployment_name + "\" "  + results["STATUS"].upper())
                    conn_mng.mongo_catalog_saved_values.delete_one({"application": application, "deployment_name": deployment_name})
                    conn_mng.mongo_catalog_saved_values.insert({"application": application, "deployment_name": deployment_name, "values": value_items})
                    saved_values = list(conn_mng.mongo_catalog_saved_values.find({}))

                if ret_code != 0 and stdout != '':
                    results = stdout.strip()
                    logger.exception(results)
                    # Send Update Notification to websocket
                    notification.setStatus(status=NotificationCode.ERROR.name)
                    notification.setException(exception=results)
                    notification.post_to_websocket_api()
                if os.path.exists(tpath):
                    os.remove(tpath)
                sleep(1)
            except Exception as exc:
                logger.error(exc)
                # Send Update Notification to websocket
                notification.setStatus(status=NotificationCode.ERROR.name)
                notification.setException(exception=exc)
                notification.post_to_websocket_api()
                pass
        else:
            err = "Error unable to parse values from request"
            logger.exception(err)
            # Send Update Notification to websocket
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setException(exception=err)
            notification.post_to_websocket_api()

    # Send Update Notification to websocket
    notification.setMessage(message="Install completed.")
    notification.setStatus(status=NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return response

@celery.task
def delete_helm_apps (application: str, namespace: str, nodes: List):
    # Send Update Notification to websocket
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.DELETING.name.capitalize(), application=application.capitalize())
    response = []
    new_values = []
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
            notification.setMessage(message=message)
            notification.setException(exception=None)
            try:
                # Send Update Notification to websocket
                notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
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
                    notification.setStatus(status=NotificationCode.DELETED.name)
                    notification.post_to_websocket_api()
                if ret_code != 0 and stdout != '':
                    results = stdout.strip()
                    logger.exception(exc)
                    # Send Update Notification to websocket
                    notification.setStatus(status=NotificationCode.ERROR.name)
                    notification.setException(exception=exc)
                    notification.post_to_websocket_api()
                response.append(results)
                sleep(1)
            except Exception as exc:
                logger.exception(exc)
                # Send Update Notification to websocket
                notification.setStatus(status=NotificationCode.ERROR.name)
                notification.setException(exception=exc)
                notification.post_to_websocket_api()
                pass
        else:
            err = "Error unable to determine deployment name please try again"
            logger.exception(err)
            # Send Update Notification to websocket
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setException(exception=err)
            notification.post_to_websocket_api()

    # Send Update Notification to websocket
    notification.setMessage(message="Delete completed.")
    notification.setStatus(status=NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return response
