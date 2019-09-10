from app import app, socketio, logger, conn_mng
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
from flask import jsonify, request, Response, send_file
from typing import Dict, Tuple, List
from shared.connection_mngs import FabricConnectionWrapper
from app.catalog_service import delete_helm_apps, install_helm_apps, get_app_state, get_repo_charts, chart_info, generate_values, get_nodes
import json
from bson import ObjectId
import requests
from celery import chain


NAMESPACE = "default"
CHART_REPO_PORT="8080"


def get_helm_repo_health(repo_ip: str) -> bool:
    """
    Gets the helm repo health from chartmuseum

    """
    healthy = False

    URL = "http://" + repo_ip + ":" + CHART_REPO_PORT + "/health"
    r = requests.get(url = URL)
    data = r.json()

    if data['healthy']:
        healthy = True

    return healthy

def get_tiller_service() -> str:
    """
    Gets tiller service ip address from kubernetes

    :return (str): Return tiller service ip address
    """
    with FabricConnectionWrapper() as ssh_conn:
        execute_cmd_get_ip = ("kubectl get service tiller-deploy -n kube-system --no-headers | awk '{ print $4 }'")
        ip_ret_val = ssh_conn.run(execute_cmd_get_ip, hide=True)  # type: Result
        ip_ret_val = ip_ret_val.stdout.strip() # type: str
        if ip_ret_val == '<none>':
            ip_ret_val = None
        return ip_ret_val

def get_helm_repo_service() -> str:
    """
    Gets tiller service ip address from kubernetes

    :return (str): Return tiller service ip address
    """
    ip_ret_val = ""

    with FabricConnectionWrapper() as ssh_conn:
        execute_cmd_get_ip = ("kubectl get service chartmuseum --no-headers | awk '{ print $4 }'")
        ip_ret_val = ssh_conn.run(execute_cmd_get_ip, hide=True)  # type: Result
        ip_ret_val= ip_ret_val.stdout.strip()  # type: str
        if ip_ret_val == '<none>':
            ip_ret_val = None

    return ip_ret_val

def get_helm_repo() -> str:
    """
    Gets the helm repo ip and health

    """
    healthy = False

    ip = get_helm_repo_service()
    if ip:
        healthy = get_helm_repo_health(ip)

    if healthy:
        return "http://" + ip + ":" + CHART_REPO_PORT

    return ""

@app.route('/api/catalog/<application>/saved_values', methods=['GET'])
def get_saved_values(application: str) -> str:

    if application:
            saved_values = list(conn_mng.mongo_catalog_saved_values.find({ "application": application }))
            return JSONEncoder().encode(saved_values)

    return ERROR_RESPONSE


@app.route('/api/catalog/install', methods=['POST'])
def install () -> Response:
    """
    Install an application using helm

    :return (Response): Returns a Reponse object
    """
    payload = request.get_json()
    application = payload["role"]
    processdic = payload["process"]
    process = processdic["selectedProcess"]
    node_affinity = processdic["node_affinity"]
    values = payload["values"]

    if process == "install":
        tiller_ip = get_tiller_service()
        helm_repo_uri = get_helm_repo()
        if tiller_ip and helm_repo_uri:
            results = install_helm_apps.delay(tiller_ip, helm_repo_uri, application, NAMESPACE, node_affinity=node_affinity, values=values)  #type: list
            return (jsonify(str(results)), 200)

        results = dict()
        error_message = []
        if not tiller_ip:
            error_message.append("Unable to find tiller service ip")
        if not helm_repo_uri:
           error_message.append("Unable to find chartmuseum service ip")

        results["error_message"] = error_message
        results["status_code"] = 500

        if results:
            logger.error(error_message)
            return (jsonify(results), results["status_code"])


    logger.error("Executing /api/catalog/install has failed.")
    return ERROR_RESPONSE

@app.route('/api/catalog/delete', methods=['POST'])
def delete () -> Response:
    """
    Delete an application using helm

    :return (Response): Returns a Reponse object
    """

    payload = request.get_json()
    application = payload["role"]
    processdic = payload["process"]
    process = processdic["selectedProcess"]
    nodes = processdic["selectedNodes"]

    if process == "uninstall":
        results = delete_helm_apps.delay(get_tiller_service(), application, NAMESPACE, nodes)  #type: Response
        return jsonify(str(results))

    logger.error("Executing /api/catalog/delete has failed.")
    return ERROR_RESPONSE

@app.route('/api/catalog/reinstall', methods=['POST'])
def reinstall() -> Response:
    """
    Reinstall an application using helm

    :return (Response): Returns a Reponse object
    """

    payload = request.get_json()
    application = payload["role"]
    processdic = payload["process"]
    process = processdic["selectedProcess"]
    nodes = processdic["selectedNodes"]
    node_affinity = processdic["node_affinity"]
    values = payload["values"]

    if process == "reinstall":
        tiller_ip = get_tiller_service()
        helm_repo_uri = get_helm_repo()
        if tiller_ip and helm_repo_uri:
            results = chain(delete_helm_apps.si(tiller_server_ip=tiller_ip, application=application, namespace=NAMESPACE, nodes=nodes),
            install_helm_apps.si(tiller_server_ip=tiller_ip, chart_repo_uri=helm_repo_uri, application=application, namespace=NAMESPACE, node_affinity=node_affinity, values=values))()

            return jsonify(str(results))

        results = dict()
        error_message = []
        if not tiller_ip:
            error_message.append("Unable to find tiller service ip")
        if not helm_repo_uri:
           error_message.append("Unable to find chartmuseum service ip")

        results["error_message"] = error_message
        results["status_code"] = 500

        if results:
            logger.error(error_message)
            return (jsonify(results), results["status_code"])

    logger.error("Executing /api/catalog/delete has failed.")
    return ERROR_RESPONSE


@app.route('/api/catalog/generate_values', methods=['POST'])
def generate_values_file () -> Response:
    """
    Generate values yaml

    :return (Response): Returns a Reponse object
    """
    payload = request.get_json()
    application = payload["role"]
    configs = payload["configs"]
    helm_repo_uri = get_helm_repo()
    if helm_repo_uri:
        results = generate_values(helm_repo_uri, application, NAMESPACE, configs)
        return jsonify(results)

    return ERROR_RESPONSE


@app.route('/api/catalog/charts', methods=['GET'])
def get_all_charts() -> Response:
    helm_repo_uri = get_helm_repo()
    if helm_repo_uri:
        charts = get_repo_charts(helm_repo_uri)  #type: list
        return jsonify(charts)
    return ERROR_RESPONSE

@app.route('/api/catalog/chart/<application>/status', methods=['GET'])
def get_app_status(application: str) -> Response:
    tiller_ip = get_tiller_service()
    if tiller_ip:
        results = get_app_state(tiller_ip, application, NAMESPACE)
        return jsonify(results)
    return ERROR_RESPONSE

@app.route('/api/catalog/chart/<application>/info', methods=['GET'])
def get_chart_info(application: str) -> Response:
    helm_repo_uri = get_helm_repo()
    if helm_repo_uri:
        results = chart_info(helm_repo_uri, application)  #type: list
        return jsonify(results)
    return ERROR_RESPONSE

@app.route('/api/nodes', methods=['GET'])
def get_all_node_details():
    nodes = get_nodes(details=True)
    return jsonify(nodes)
