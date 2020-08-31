from time import sleep, strftime
import os
import requests
import json
import yaml
from typing import List

from app import celery, logger, conn_mng
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.system_info_service import get_system_name, get_auth_base
from app.service.job_service import run_command2
from shared.constants import KICKSTART_ID, KIT_ID
from shared.connection_mngs import FabricConnectionWrapper, KubernetesWrapper, KubernetesWrapper2


HELM_BINARY_PATH = "/usr/local/bin/helm"
WORKING_DIR = "/root"
_MESSAGETYPE_PREFIX = "catalog"
_CHART_EXEMPTS = ["chartmuseum", "elasticsearch", "kibana", "filebeat", "metricbeat"]


def _get_domain() -> str:
    kickstart_configuration = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if "domain" in kickstart_configuration["form"]:
        return kickstart_configuration["form"]["domain"]
    return "lan"


def _get_chartmuseum_uri() -> str:
    return "https://chartmuseum.{domain}".format(domain=_get_domain())


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
    for val in saved_values:
        if "values" in val and "node_hostname" in val["values"]:
            node_type = get_node_type(val["values"]["node_hostname"])
            if node_type:
                hostname = val["values"]["node_hostname"]
                if hostname == node_hostname:
                    deployed_apps.append(val["application"])

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
    except Exception:
        return False

    return False

def get_repo_charts() -> list:
    """
    Returns a list of charts from helm repo

    : return (list): Returns a list of charts
    """

    stdout, ret_code = run_command2(command="helm repo update", working_dir=WORKING_DIR, use_shell=True)
    if ret_code == 0:
        print("helm repo cache updated.")
        logger.info("helm repo cache updated.")
    results = []
    try:
        uri = _get_chartmuseum_uri()
        response = requests.get(uri + "/api/charts")
        charts = json.loads(response.text)
        for key, value in charts.items():
            application = key
            if application not in _CHART_EXEMPTS:
                for chart in value:
                    t_chart = {}
                    t_chart["application"] = application
                    t_chart["version"] = chart["version"]
                    t_chart["appVersion"] = chart["appVersion"]
                    t_chart["description"] = chart["description"]
                    results.append(t_chart)
    except Exception as exc:
        logger.exception(exc)
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
            for chart in chart_releases:
                node = {}
                node["application"] = application
                node["appVersion"] = chart["app_version"]
                node["status"] = chart["status"].upper()
                node["deployment_name"] = chart["name"]
                node["hostname"] = None
                node["node_type"] = None
                saved_values = conn_mng.mongo_catalog_saved_values.find_one({"application": application, "deployment_name": chart["name"]})
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
            values['domain'] = _get_domain()
        if 'system_name' in values:
            values['system_name'] = get_system_name()
        if 'auth_base' in values:
            values['auth_base'] = get_auth_base()
    except Exception as exec:
        logger.exception(exec)
    if configs:
        l_values = []
        for config in configs:
            for node_hostname, value in config.items():
                sensordict = {}
                sensordict[node_hostname] = {}
                c_values = values.copy()
                for key, value in value.items():
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
    try:
        for name, val in values.items():
            deployment_name = name
            value_items = val
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
                    application_setup_job_watcher.delay(application=application, deployment_name=deployment_name, namespace=namespace, task_id=None)
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

                stdout, ret_code = run_command2(command="helm delete " + deployment_to_uninstall, working_dir=WORKING_DIR, use_shell=True)
                if ret_code == 0 and stdout != '':
                    # PVC deletion takes significatly longer than the other Resources and is the final thing to be removed
                    # Thus, once the PVC is gone, It has been completely removed
                    check_deployment_pvc_deletetion(deployment_to_uninstall)
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

def check_deployment_pvc_deletetion(deployment_name: str):
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        while True:
            try:
                kube_apiv1.read_namespaced_persistent_volume_claim_status(deployment_name+'-pvc','default',pretty=False)
                sleep(5)
            except Exception:
                break
    return True


@celery.task
def application_setup_job_watcher(application: str, deployment_name: str, namespace: str = 'default', task_id=None):
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX, action=NotificationCode.INSTALLING.name.capitalize(), application=application.capitalize())
    setup_job = None

    with KubernetesWrapper2(conn_mng) as api:
        batch_v1_api = api.batch_V1_API
        try:
            jobs = batch_v1_api.list_namespaced_job(namespace=namespace,watch=False)
            for job in jobs.items:
                job_name = job.metadata.name
                if job_name.startswith(deployment_name+'-setup'):
                    setup_job = job
                    logger.info("Found Job "+setup_job.metadata.name)
                    break
        except Exception as exc:
            logger.exception(exc)
            # Send Update Notification to websocket
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_exception(exception=exc)
            notification.post_to_websocket_api()

        if setup_job is None:
            return False

        notification.set_message(message='Setup Job Started')
        notification.set_status(status=NotificationCode.IN_PROGRESS.name)
        notification.post_to_websocket_api()
        while True:
            # logger.info("Sleeping for 10s: "+setup_job.metadata.name)
            sleep(10)
            try:
                # logger.info("Querying K8S: "+setup_job.metadata.name)
                job = batch_v1_api.read_namespaced_job(setup_job.metadata.name, namespace=namespace, pretty=False)
                # logger.info(job)
                containers = job.spec.template.spec.containers
                succeeded = job.status.succeeded
                failed = job.status.failed
                active = job.status.active
                # logger.info("Job containers: "+str(len(containers)))
                # logger.info("Job succeeded: "+str(succeeded))
                # logger.info("Job failed: "+str(failed))
                # logger.info("Job active: "+str(active))
                if active is None and failed is None and succeeded == len(containers):
                    # Send Update Notification to websocket
                    notification.set_message(message='Setup Job Completed')
                    notification.set_status(status=NotificationCode.COMPLETED.name)
                    notification.post_to_websocket_api()
                    break
                if active is None and failed is not None and failed > 0:
                    # Send Update Notification to websocket
                    notification.set_message(message='Setup Job Error')
                    notification.set_status(status=NotificationCode.ERROR.name)
                    notification.post_to_websocket_api()
                    break
            except Exception as exc:
                logger.exception(exc)
                # Send Update Notification to websocket
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_exception(exception=exc)
                notification.post_to_websocket_api()
                return False
    return True
