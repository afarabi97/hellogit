
from app import app, logger, CORE_DIR
from app.common import ERROR_RESPONSE, OK_RESPONSE
from flask import request, jsonify, Response
import traceback
from app.service.scale_service import es_cluster_status, check_scale_status, get_es_nodes, parse_nodes, get_allowable_scale_count
from app.dao import elastic_deploy

@app.route('/api/scale/elastic', methods=['POST'])
def scale_es() -> Response:
    """
    Scale elasticsearch

    :return (Response): Returns a Reponse object
    """
    payload = request.get_json()
    master_count = None
    coordinating_count = None
    data_count = None
    try:
        if "elastic" in payload:
            elastic = payload["elastic"]
            if "master" in elastic:
                master_count = elastic["master"]
            if "coordinating" in elastic:
                coordinating_count = elastic["coordinating"]
            if "data" in elastic:
                data_count = elastic["data"]

        deploy_config = elastic_deploy.read()
        if "spec" in deploy_config:
            spec = deploy_config["spec"]
            if "nodeSets" in spec:
                nodeSets = deploy_config["spec"]["nodeSets"]
                for n in nodeSets:
                    if n["name"] == "master":
                        n["count"] = master_count
                    if n["name"] == "coordinating":
                        n["count"] = coordinating_count
                    if n["name"] == "data":
                        n["count"] = data_count
        elastic_deploy.update(deploy_config)

        return OK_RESPONSE
    except Exception as e:
        traceback.print_exc()
        return ERROR_RESPONSE
    return OK_RESPONSE


@app.route('/api/scale/elastic/nodes', methods=['GET'])
def get_es_node_count() -> Response:
    """
    Get current elasticsearch node count

    :return (Response): Returns a Reponse object
    """

    nodeList = get_es_nodes()
    nodes = parse_nodes(nodeList)
    if nodeList:
        max_node_count = get_allowable_scale_count()
        nodes.update(max_node_count)
    if nodes:
        return (jsonify({ "elastic": nodes }), 200)

    return ERROR_RESPONSE


@app.route('/api/scale/check', methods=['GET'])
def check_scale_progress() -> Response:
    status = es_cluster_status()
    return (jsonify({ "status": status }), 200)
