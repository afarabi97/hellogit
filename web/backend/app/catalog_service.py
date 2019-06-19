from app import app, celery, socketio, logger, conn_mng
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
from flask_socketio import SocketIO, emit, join_room, rooms
from app.service.socket_service import NotificationMessage, NotificationCode


_MESSAGETYPE_PREFIX = "catalog"

@socketio.on('connect')
def connect():
    print('Client connected to websocket')


@socketio.on('disconnect')
def disconnect():
    print('Client disconnected from websocket')


def get_sensors() -> list:
    """
    Gets list of sensor hostnames

    """
    sensors = []
    kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if kit_configuration:
        for node in kit_configuration['form']['nodes']:
            if node["node_type"] == NODE_TYPES[1]:
                host_simple = {}
                host_simple['hostname'] = node['hostname']
                host_simple['node_state'] = NotificationCode.GREEN.name
                host_simple['interfaces'] = node['deviceFacts']['potential_monitor_interfaces']
                sensors.append(host_simple)
    return sensors

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


def get_app_state(tiller_server_ip: str, application: str, namespace: str) -> list:
    results = []
    sensors = get_sensors()  #type: list
    tiller_server = Tiller(tiller_server_ip)

    try:
        for release in tiller_server.list_releases():
            if application in release.name:
                sensor_name, app_name = release.name.split('-', 1)
                if len(sensors) > 0:
                    sensor = next(item for item in sensors if sensor_name in item["hostname"])
                    if sensor:
                        sensors.remove(sensor)
                        sensor["status"] = NotificationCode(release.info.status.code).name
                        sensor["application"] = application
                        sensor["version"] = release.chart.metadata.version
                        results.append(sensor)
        if len(sensors) > 0:
            for s in sensors:
                s["status"] = NotificationCode.UNKNOWN.name
                s["application"] = application
                s["version"] = None
                results.append(s)
    except Exception as exc:
       logger.error(exc)
       return exc
    return results

def get_values(chartb) -> dict:
    values = {}
    tValues = chartb.get_helm_chart().values.raw
    if isinstance(tValues, str):
        for line in tValues.splitlines():
            k, v = line.strip().split(':')
            values[k.strip()] = v.strip()
    elif isinstance(tValues, dict):
        values = tValues

    return values

def get_deployment_name(application: str, sensor_hostname: str):
        deployment_name = re.sub(r'\.(lan)?', '', sensor_hostname)
        deployment_name = re.sub(r'[^0-9a-zA-Z]', '', deployment_name)
        deployment_name = deployment_name + "-" + application
        return deployment_name

@celery.task
def install_helm_apps (tiller_server_ip: str, chart_repo_uri: str, application: str, namespace: str, configs: dict, task_id=None):
    response = []
    values = {}
    tiller_server = Tiller(tiller_server_ip)
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.INSTALLING.name.capitalize(), application=application.capitalize())
    try:
        chartb = chart(application, chart_repo_uri)
        values = get_values(chartb)
    except SchemeError as e:
        response.append(str(e))
        logger.exception(e)

    for sensor_hostname, v in configs.items():
        cValues = values
        for key, value in v.items():
            cValues[key] = value
        message = '%s %s on %s' % (NotificationCode.INSTALLING.name.capitalize(), application.capitalize(), sensor_hostname)
        notification.setMessage(message=message)
        try:
            # Send Update Notification to websocket
            notification.setException(exception=None)
            notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
            notification.post_to_websocket_api()

            execute_kubelet_cmd("kubectl label nodes " + sensor_hostname + " " + application + "=true --overwrite=true")
            result = tiller_server.install_release(chartb.get_helm_chart(), namespace,
                                    dry_run=False, name=get_deployment_name(application, sensor_hostname),
                                    values=cValues)

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

            continue
        except Exception as exc:
            logger.error(exc)
            # Send Update Notification to websocket
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setException(exception=exc)
            notification.post_to_websocket_api()
            continue
    return response

@celery.task
def delete_helm_apps (tiller_server_ip: str, application: str, namespace: str, sensors: List):
    # Send Update Notification to websocket
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.DELETING.name.capitalize(), application=application.capitalize())

    response = []
    tiller_server = Tiller(tiller_server_ip)
    for sensor in sensors:
        message = '%s %s on %s' % (NotificationCode.DELETING.name.capitalize(), application, sensor["hostname"])
        notification.setMessage(message=message)
        notification.setException(exception=None)
        try:
            # Send Update Notification to websocket
            notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
            notification.post_to_websocket_api()

            execute_kubelet_cmd("kubectl label nodes " + sensor["hostname"] + " " + application + "-")
            result = tiller_server.uninstall_release(get_deployment_name(application, sensor["hostname"]), True, True)
            response.append("release: \"" + result.release.name + "\" "  + NotificationCode(result.release.info.status.code).name)

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
