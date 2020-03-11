from app import app, socketio, logger, conn_mng
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
from flask import jsonify, request, Response, send_file
from typing import Dict, Tuple, List
from shared.connection_mngs import FabricConnectionWrapper
from app.catalog_service import delete_helm_apps, install_helm_apps, get_app_state, get_repo_charts, chart_info, generate_values, get_nodes, get_chart_release_lists, get_node_apps
import json
from bson import ObjectId
import requests
from celery import chain
from app.catalog import Catalog
from typing import Set, List

TILLER_SERVER = None
CHART_LIST = None

NAMESPACE = "default"
catalog = None

def check_catalog(force:bool = False) -> None:
    global catalog
    if catalog is None:
        catalog = Catalog()
    if force:
        catalog = Catalog()

@app.route('/api/catalog/<application>/saved_values', methods=['GET'])
def get_saved_values(application: str) -> str:
    if application:
        saved_values = list(conn_mng.mongo_catalog_saved_values.find({ "application": application }))
        return JSONEncoder().encode(saved_values)

    return ERROR_RESPONSE


def _add_to_set(sensor_hostname: str, values: List, out_ifaces: Set):
    for config in values:
        if sensor_hostname == config["values"]["node_hostname"]:
            for iface_name in config["values"]["interfaces"]:
                out_ifaces.add(iface_name)


@app.route('/api/catalog/get_configured_ifaces/<sensor_hostname>', methods=['GET'])
def get_configured_ifaces(sensor_hostname: str):
    if sensor_hostname:
        ifaces = set()
        zeek_values = list(conn_mng.mongo_catalog_saved_values.find({ "application": "zeek" }))
        suricata_values = list(conn_mng.mongo_catalog_saved_values.find({ "application": "suricata" }))
        if zeek_values and len(zeek_values) > 0:
            _add_to_set(sensor_hostname, zeek_values, ifaces)

        if suricata_values and len(suricata_values) > 0:
            _add_to_set(sensor_hostname, suricata_values, ifaces)

        return jsonify(list(ifaces))
    return ERROR_RESPONSE


@app.route('/api/catalog/install', methods=['POST'])
def install () -> Response:
    """
    Install an application using helm

    :return (Response): Returns a Reponse object
    """
    check_catalog()
    payload = request.get_json()
    application = payload["role"]
    processdic = payload["process"]
    process = processdic["selectedProcess"]
    node_affinity = processdic["node_affinity"]
    values = payload["values"]

    if process == "install":
        if catalog.tiller_service_ip and catalog.helm_repo_uri:
            results = install_helm_apps.delay(catalog.tiller_service_ip, catalog.helm_repo_uri, application, NAMESPACE, node_affinity=node_affinity, values=values)  #type: list
            catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))
            return (jsonify(str(results)), 200)

        results = dict()
        error_message = []
        if not catalog.tiller_service_ip:
            error_message.append("Unable to find tiller service ip")
        if not catalog.helm_repo_uri:
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
    check_catalog()
    payload = request.get_json()
    application = payload["role"]
    processdic = payload["process"]
    process = processdic["selectedProcess"]
    nodes = processdic["selectedNodes"]

    if process == "uninstall":
        results = delete_helm_apps.delay(catalog.tiller_service_ip, application, NAMESPACE, nodes)  #type: Response
        catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))
        return jsonify(str(results))

    logger.error("Executing /api/catalog/delete has failed.")
    return ERROR_RESPONSE

@app.route('/api/catalog/reinstall', methods=['POST'])
def reinstall() -> Response:
    """
    Reinstall an application using helm

    :return (Response): Returns a Reponse object
    """
    check_catalog()
    payload = request.get_json()
    application = payload["role"]
    processdic = payload["process"]
    process = processdic["selectedProcess"]
    nodes = processdic["selectedNodes"]
    node_affinity = processdic["node_affinity"]
    values = payload["values"]

    if process == "reinstall":
        if catalog.tiller_service_ip and catalog.helm_repo_uri:
            results = chain(delete_helm_apps.si(tiller_server_ip=catalog.tiller_service_ip, application=application, namespace=NAMESPACE, nodes=nodes),
            install_helm_apps.si(tiller_server_ip=catalog.tiller_service_ip, chart_repo_uri=catalog.helm_repo_uri, application=application, namespace=NAMESPACE, node_affinity=node_affinity, values=values))()
            catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))
            return jsonify(str(results))

        results = dict()
        error_message = []
        if not catalog.tiller_service_ip :
            error_message.append("Unable to find tiller service ip")
        if not catalog.helm_repo_uri:
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
    check_catalog()
    payload = request.get_json()
    application = payload["role"]
    configs = payload["configs"]
    if catalog.helm_repo_uri:
        results = generate_values(catalog.helm_repo_uri, application, NAMESPACE, configs)
        return jsonify(results)

    return ERROR_RESPONSE

def _get_all_charts() -> List:
    check_catalog()
    catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))
    if catalog.helm_repo_uri:
        charts = get_repo_charts(catalog.helm_repo_uri)  #type: list
        return charts
    return []

@app.route('/api/catalog/charts', methods=['GET'])
def get_all_charts() -> Response:
    check_catalog()
    charts = []
    catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))
    if catalog.helm_repo_uri:
        charts = get_repo_charts(catalog.helm_repo_uri)  #type: list
    return jsonify(charts)
    #return ERROR_RESPONSE

@app.route('/api/catalog/chart/<application>/status', methods=['GET'])
def get_app_status(application: str) -> Response:
    check_catalog()
    if catalog.chart_releases is None:
        catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))

    if catalog.chart_releases is not None:
        results = get_app_state(catalog.chart_releases, application, NAMESPACE)
        return jsonify(results)
    return ERROR_RESPONSE


@app.route('/api/catalog/chart/status_all', methods=['GET'])
def get_all_application_statuses() -> Response:
    check_catalog()
    ret_val = []
    charts = _get_all_charts()
    for chart in charts:
        catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))
        chart["nodes"] = get_app_state(catalog.chart_releases, chart['application'], NAMESPACE)
        ret_val.append(chart)
    return jsonify(ret_val)


@app.route('/api/catalog/chart/<application>/status/force', methods=['GET'])
def get_app_status_force(application: str) -> Response:
    check_catalog(True)
    if catalog.chart_releases is None:
        catalog.set_chart_releases(get_chart_release_lists(catalog.tiller_service_ip))

    if catalog.chart_releases is not None:
        results = get_app_state(catalog.chart_releases, application, NAMESPACE)
        return jsonify(results)
    return ERROR_RESPONSE

@app.route('/api/catalog/chart/<application>/info', methods=['GET'])
def get_chart_info(application: str) -> Response:
    check_catalog()
    if catalog.helm_repo_uri:
        results = chart_info(catalog.helm_repo_uri, application)  #type: list
        return jsonify(results)
    return ERROR_RESPONSE

@app.route('/api/nodes', methods=['GET'])
def get_all_node_details():
    nodes = get_nodes(details=True)
    return jsonify(nodes)


@app.route('/api/catalog/<node_hostname>/apps', methods=['GET'])
def pull_node_apps(node_hostname: str):
    results = get_node_apps(node_hostname)
    return jsonify(results)
