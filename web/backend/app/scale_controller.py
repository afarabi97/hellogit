
from app import app, logger, CORE_DIR
from app.common import ERROR_RESPONSE, OK_RESPONSE, FORBIDDEN_RESPONSE
from flask import request, jsonify, Response
import traceback
from app.service.scale_service import es_cluster_status, check_scale_status, get_es_nodes, parse_nodes, get_allowable_scale_count
from app.dao import elastic_deploy
import yaml, json
from app.middleware import Auth, controller_maintainer_required

@app.route('/api/scale/elastic', methods=['POST'])
@controller_maintainer_required
def scale_es() -> Response:
    """
    Scale elasticsearch

    :return (Response): Returns a Reponse object
    """
    payload = request.get_json()
    master_count = None
    coordinating_count = None
    data_count = None
    ml_count = None
    try:
        if "elastic" in payload:
            elastic = payload["elastic"]
            if "master" in elastic:
                master_count = elastic["master"]
            if "coordinating" in elastic:
                coordinating_count = elastic["coordinating"]
            if "data" in elastic:
                data_count = elastic["data"]
            if "ml" in elastic:
                ml_count = elastic["ml"]

        deploy_config = elastic_deploy.read()
        if "spec" in deploy_config:
            spec = deploy_config["spec"]
            if "nodeSets" in spec:
                node_sets = deploy_config["spec"]["nodeSets"]
                for n in node_sets:
                    if n["name"] == "master":
                        n["count"] = master_count
                    if n["name"] == "coordinating":
                        n["count"] = coordinating_count
                    if n["name"] == "data":
                        n["count"] = data_count
                    if n["name"] == "ml":
                        n["count"] = ml_count
        elastic_deploy.update(deploy_config)

        return OK_RESPONSE
    except Exception as e:
        logger.exception(e)
        traceback.print_exc()
        return ERROR_RESPONSE
    return OK_RESPONSE

@app.route('/api/scale/elastic/advanced', methods=['POST'])
@controller_maintainer_required
def scale_es_advanced() -> Response:
    """
    Scale elasticsearch

    :return (Response): Returns a Reponse object
    """
    deploy_config = {}
    payload = request.get_json()
    try:
        if "elastic" in payload:
            deploy_config = yaml.load(payload['elastic'])
            elastic_deploy.update(deploy_config)

        return OK_RESPONSE
    except Exception as e:
        logger.exception(e)
        traceback.print_exc()
        return ERROR_RESPONSE
    return OK_RESPONSE

@app.route('/api/scale/elastic/advanced', methods=['GET'])
def get_es_full_config() -> Response:
    """
    Scale elasticsearch

    :return (Response): Returns a Reponse object
    """
    deploy_config = {};
    try:
        deploy_config = elastic_deploy.read()
        return (jsonify({ "elastic": yaml.dump(deploy_config) }), 200)
    except Exception as e:
        logger.exception(e)
        traceback.print_exc()
        return ERROR_RESPONSE
    return OK_RESPONSE

@app.route('/api/scale/elastic/nodes', methods=['GET'])
def get_es_node_count() -> Response:
    """
    Get current elasticsearch node count

    :return (Response): Returns a Reponse object
    """

    node_list = get_es_nodes()
    nodes = parse_nodes(node_list)
    if node_list:
        max_node_count = get_allowable_scale_count()
        nodes.update(max_node_count)
    if nodes:
        return (jsonify({ "elastic": nodes }), 200)

    return ERROR_RESPONSE


@app.route('/api/scale/check', methods=['GET'])
def check_scale_progress() -> Response:
    status = es_cluster_status()
    return (jsonify({ "status": status }), 200)
