from app import app, celery, logger, conn_mng
from pyhelm.chartbuilder import ChartBuilder
from pyhelm.tiller import Tiller
from pyhelm.repo import SchemeError
from typing import Dict, Tuple, List
from enum import Enum
from shared.constants import KICKSTART_ID, KIT_ID, NODE_TYPES
from shared.connection_mngs import FabricConnectionWrapper
from app.node_facts import get_system_info
from shared.utils import decode_password
import re
import grpc
from app.service.socket_service import NotificationMessage, NotificationCode
import requests, json, yaml


_MESSAGETYPE_PREFIX = "catalog"
_CHART_EXEMPTS = ["chartmuseum", "elasticsearch", "kibana", "filebeat", "metricbeat"]
TILLER_SERVER = None

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
    Gets tiller service ip address from kubernetes

    :return (str): Return tiller service ip address
    """

    try:
        with FabricConnectionWrapper() as ssh_conn:
            ssh_conn.run(cmd, hide=True)
        return True
    except:
        return False

    return False

def chart(application: str, chart_repo_uri: str) -> ChartBuilder:
    """
    Returns an instance of chart builder

    : return (ChartBuilder): Returns an instance of chart builder
    """

    chartb = ChartBuilder({"name": application, "source": {"type": "repo", "location": chart_repo_uri}})
    return chartb


def get_repo_charts(helm_repo_uri: str) -> list:
    """
    Returns a list of charts from helm repo

    : return (list): Returns a list of charts
    """
    results = []
    response = requests.get(helm_repo_uri + "/api/charts")
    try:
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
       logger.error(exc)
       #return exc
    return results

def chart_info(chart_repo_uri: str, application: str) -> dict:
    info = {}
    info["id"] = application
    chartb = chart(application, chart_repo_uri)
    helm_chart = chartb.get_helm_chart()
    info["version"] = helm_chart.metadata.version
    info["description"] = helm_chart.metadata.description
    info["appVersion"] = helm_chart.metadata.appVersion
    info["formControls"] = None
    info["type"] = "chart"
    info["node_affinity"] = "Server - Any"
    info["devDependent"] = None
    appconfig = None

    files = helm_chart.files
    for f in files:
        if "appconfig" in f.type_url:
            appconfig = json.loads(f.value)
    if appconfig:
        info["formControls"] = appconfig["formControls"]
        info["type"] = appconfig["type"]
        info["node_affinity"] = appconfig["node_affinity"]
        if "devDependent" in appconfig:
            info["devDependent"] = appconfig["devDependent"]

    return info

def get_chart_release_lists(tiller_server_ip: str):
    chart_releases = None
    try:
        global TILLER_SERVER
        if TILLER_SERVER is None and tiller_server_ip != None:
            TILLER_SERVER = Tiller(tiller_server_ip)
        if TILLER_SERVER is not None:
            chart_releases = TILLER_SERVER.list_releases()
    except Exception as exc:
        logger.error(exc)
        print("ERROR: " + str(exc))
        #return exc
    return chart_releases


def get_app_state(chart_releases: dict, application: str, namespace: str) -> list:
    deployed_apps = []
    try:
        for c in chart_releases:
            chart_name = c.chart.metadata.name
            if chart_name not in _CHART_EXEMPTS and chart_name == application:

                node = {}
                node["deployment_name"] = c.name
                node["hostname"] = None
                node["node_type"] = None
                saved_values = conn_mng.mongo_catalog_saved_values.find_one({"application": application, "deployment_name": c.name})

                # when saved values is defined
                # check to see if we can determine hostname
                if saved_values:
                    if "values" in saved_values:
                        if "node_hostname" in saved_values["values"]:
                            node["node_type"] = get_node_type(saved_values["values"]["node_hostname"])
                            if node["node_type"]:
                                node["hostname"] = saved_values["values"]["node_hostname"]

                node["application"] = application
                node["version"] = c.chart.metadata.version
                node["appVersion"] = c.chart.metadata.appVersion
                node["status"] = NotificationCode(c.info.status.code).name
                deployed_apps.append(node)
    except Exception as exc:
        logger.error(exc)
        print("ERROR: " + str(exc))
        #return exc
    return deployed_apps

def get_values(chartb) -> dict:
    values = {}
    raw_values = chartb.get_helm_chart().values.raw
    try:
        raw_values = yaml.full_load(raw_values)
    except:
        pass

    if isinstance(raw_values, str):
        for line in raw_values.splitlines():
            k, v = line.strip().split(':')
            values[k.strip()] = v.strip()
    elif isinstance(raw_values, dict):
        values = raw_values

    return values

def generate_values(chart_repo_uri: str, application: str, namespace: str, configs: list=None) -> list:
    try:
        chartb = chart(application, chart_repo_uri)
        values = get_values(chartb)
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
def install_helm_apps (tiller_server_ip: str, chart_repo_uri: str, application: str, namespace: str, node_affinity: str, values: list, task_id=None):
    response = []
    global TILLER_SERVER
    if TILLER_SERVER is None:
        TILLER_SERVER = Tiller(tiller_server_ip)

    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.INSTALLING.name.capitalize(), application=application.capitalize())
    try:
        chartb = chart(application, chart_repo_uri)
    except SchemeError as e:
        response.append(str(e))
        logger.exception(e)

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

                result = TILLER_SERVER.install_release(chartb.get_helm_chart(), namespace,
                                        dry_run=False, name=deployment_name,
                                        values=value_items)
                conn_mng.mongo_catalog_saved_values.delete_one({"application": application, "deployment_name": deployment_name})
                conn_mng.mongo_catalog_saved_values.insert({"application": application, "deployment_name": deployment_name, "values": value_items})
                saved_values = list(conn_mng.mongo_catalog_saved_values.find({}))

                response.append("release: \"" + result.release.name + "\" "  + NotificationCode(result.release.info.status.code).name)

                # Send Update Notification to websocket
                notification.setStatus(status=NotificationCode(result.release.info.status.code).name)
                notification.post_to_websocket_api()

            except grpc._channel._Rendezvous as exc:
                err = ""
                if exc._state and "Run:" in exc._state.details:
                    err = (exc._state.details.split('Run:', 1)[0].strip())
                elif exc._state.details:
                    err = str(exc._state.details)
                else:
                    err = str(exc)
                response.append(err)
                logger.error(err)

                # Send Update Notification to websocket
                notification.setStatus(status=NotificationCode.ERROR.name)
                notification.setException(exception=err)
                notification.post_to_websocket_api()
                pass
            except Exception as exc:
                logger.error(exc)
                # Send Update Notification to websocket
                notification.setStatus(status=NotificationCode.ERROR.name)
                notification.setException(exception=exc)
                notification.post_to_websocket_api()
                pass
        else:
            err = "Error unable to parse values from request"
            logger.error(err)
            # Send Update Notification to websocket
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setException(exception=err)
            notification.post_to_websocket_api()

    return response

@celery.task
def delete_helm_apps (tiller_server_ip: str, application: str, namespace: str, nodes: List):
    # Send Update Notification to websocket
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.DELETING.name.capitalize(), application=application.capitalize())

    response = []
    global TILLER_SERVER
    if TILLER_SERVER is None:
        TILLER_SERVER = Tiller(tiller_server_ip)

    new_values = []

    for node in nodes:
        node_hostname = None
        deployment_name = None
        old_deployment_name = None
        deployment_to_uninstall = None

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

            result = TILLER_SERVER.uninstall_release(deployment_to_uninstall, True, True)
            response.append("release: \"" + result.release.name + "\" "  + NotificationCode(result.release.info.status.code).name)

            # Remove old saved values
            conn_mng.mongo_catalog_saved_values.delete_one({"application": application, "deployment_name": deployment_to_uninstall})

            # Send Update Notification to websocket
            notification.setStatus(status=NotificationCode.COMPLETED.name)
            notification.post_to_websocket_api()

        except grpc._channel._Rendezvous as exc:

            # Send Update Notification to websocket
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setException(exception=exc._state.details)
            notification.post_to_websocket_api()

            logger.error(exc._state.details)
            response.append(exc._state.details)

    return response
