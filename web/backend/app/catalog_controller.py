from app import app, socketio, logger
from app.common import OK_RESPONSE, ERROR_RESPONSE
from flask import jsonify, request, Response, send_file
from typing import Dict, Tuple, List
from shared.connection_mngs import FabricConnectionWrapper
from app.catalog_service import delete_helm_apps, install_helm_apps, get_app_state
import json
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


@app.route('/api/catalog/<application>', methods=['GET'])
def get_application_state (application: str) -> list:
    """
    Get application state

    :return (list): Return a list of applications with state
    """

    results = []
    tiller_ip = get_tiller_service()
    if tiller_ip:
        results = get_app_state(get_tiller_service(),application, NAMESPACE)  #type: list
        return jsonify(results)
    else:
        logger.error('Unable to find tiller service ip')
        return (jsonify('Unable to find tiller service ip'), 500)

@app.route('/api/catalog/install', methods=['POST'])
def install () -> Response:
    """
    Install an application using helm

    :return (Response): Returns a Reponse object
    """
    payload = request.get_json()
    application = payload["role"]
    process = payload["process"]["selectedProcess"]
    configs = payload["configs"]

    if process == "install":
        tiller_ip = get_tiller_service()
        helm_repo_uri = get_helm_repo()
        if tiller_ip and helm_repo_uri:
            results = install_helm_apps.delay(get_tiller_service(), get_helm_repo(), application, NAMESPACE, configs)  #type: list
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
    process = payload["process"]["selectedProcess"]
    sensors = payload["process"]["selectedNodes"]

    if process == "uninstall":
        results = delete_helm_apps.delay(get_tiller_service(), application, NAMESPACE, sensors)  #type: Response
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
    process = payload["process"]["selectedProcess"]
    sensors = payload["process"]["selectedNodes"]
    configs = payload["configs"]

    if process == "reinstall":
        tiller_ip = get_tiller_service()
        helm_repo_uri = get_helm_repo()
        if tiller_ip and helm_repo_uri:
            results = chain(delete_helm_apps.si(tiller_server_ip=get_tiller_service(), application=application, namespace=NAMESPACE, sensors=sensors),
            install_helm_apps.si(tiller_server_ip=get_tiller_service(), chart_repo_uri=get_helm_repo(), application=application, namespace=NAMESPACE, configs=configs))()
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


@app.route('/api/catalog/', methods=['GET'])
def get_charts() -> Response:
    charts = [{
      "id": "Elasticsearch",
      "type": "chart",
      "formControls": [{
        "type": "textinput",
        "default_value": "50%",
        "description": "Enter Cpu Percent",
        "required": "true",
        "regexp": "",
        "name": "CPU_PER"
        },
        {
        "type": "textinput",
        "default_value": "50%",
        "description": "Enter Memory Percent",
        "required": "true",
        "regexp": "",
        "name": "MEM_PER"
        },
        {
        "type": "textinput",
        "default_value": "0.0.0.0/0",
        "description": "Enter Your Mission Partner Network",
        "required": "true",
        "regexp": "",
        "name": "HOME_NET"
        },
        {
        "type": "textinput",
        "default_value": "",
        "description": "Enter Your Kit Network",
        "required": "false",
        "regexp": "",
        "name": "EXTERNAL_NET"
        }],
      "attributes": {
        "description": "Flexible and powerful open source, distributed real-time search and analytics engine.",
        "home": "https://www.elastic.co/products/elasticsearch",
        "icon": "assets/catalog/elasticsearch_logo.png",
        "name": "Elasticsearch",
        "verison": "6.5.3"
      }
    },
    {
      "id": "Moloch",
      "type": "chart",
      "formControls": [{
        "type": "textinput",
        "default_value": "50%",
        "description": "Enter Cpu Percent",
        "required": "true",
        "regexp": "",
        "name": "CPU_PER"
        },
        {
        "type": "textinput",
        "default_value": "50%",
        "description": "Enter Memory Percent",
        "required": "true",
        "regexp": "",
        "name": "MEM_PER"
        },
        {
        "type": "textinput",
        "default_value": "0.0.0.0/0",
        "description": "Enter Your Mission Partner Network",
        "required": "true",
        "regexp": "",
        "name": "HOME_NET"
        },
        {
        "type": "textinput",
        "default_value": "",
        "description": "Enter Your Kit Network",
        "required": "false",
        "regexp": "",
        "name": "EXTERNAL_NET"
        }],
      "attributes": {
        "description": "Flexible and powerful open source, distributed real-time search and analytics engine.",
        "home": "https://www.elastic.co/products/elasticsearch",
        "icon": "assets/catalog/moloch_logo2.png",
        "name": "Moloch",
        "verison": "6.5.3"
      }
    },
    {
      "id": "Bro",
      "type": "chart",
      "formControls": [{
        "type": "textinput",
        "default_value": "50%",
        "description": "Enter Cpu Percent",
        "required": "true",
        "regexp": "",
        "name": "CPU_PER"
        },
        {
        "type": "textinput",
        "default_value": "50%",
        "description": "Enter Memory Percent",
        "required": "true",
        "regexp": "",
        "name": "MEM_PER"
        },
        {
        "type": "textinput",
        "default_value": "0.0.0.0/0",
        "description": "Enter Your Mission Partner Network",
        "required": "true",
        "regexp": "",
        "name": "HOME_NET"
        },
        {
        "type": "textinput",
        "default_value": "",
        "description": "Enter Your Kit Network",
        "required": "false",
        "regexp": "",
        "name": "EXTERNAL_NET"
        }],
      "attributes": {
        "description": "Flexible and powerful open source, distributed real-time search and analytics engine.",
        "home": "https://www.elastic.co/products/elasticsearch",
        "icon": "assets/catalog/bro_logo.png",
        "name": "Bro",
        "verison": "6.5.3"
      },
    },
    {
        "id": "suricata",
        "type": "chart",
        "formControls": [{
        "type": "textinput",
        "default_value": "1000m",
        "description": "Enter Cpu Request",
        "required": "true",
        "regexp": "",
        "name": "cpu_request",
        "error_message": "Enter BS here"
        },
        {
        "type": "textinputlist",
        "default_value": "any",
        "description": "Enter Your Mission Partner Network",
        "required": "true",
        "regexp": "any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9])",
        "name": "home_net",
        "error_message": "Enter BS here"
        },
        {
        "type": "textinputlist",
        "default_value": "any",
        "description": "Enter Your Kit Network",
        "required": "false",
        "regexp": "any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9])",
        "name": "external_net",
        "error_message": "Enter BS here"
        },
        {
        "type": "interface",
        "default_value": "",
        "description": "Select You Network Interfaces",
        "required": "true",
        "regexp": "",
        "name": "interfaces",
        "error_message": "Enter BS here"
        },
        {
        "type": "invisible",
        "default_value": "",
        "description": "",
        "required": "true",
        "regexp": "",
        "name": "affinity_hostname"
        }
        ],
        "attributes": {
            "description": "Suricata is a free and open source, mature, fast and robust network threat detection engine.",
            "home": "https://suricata.readthedocs.io/en/suricata-4.1.3/",
            "icon": "assets/catalog/suricata_logo.png",
            "name": "Suricata",
            "verison": "4.1.3"
      }

    }]
    return jsonify(charts)
