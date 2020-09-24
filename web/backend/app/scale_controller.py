
from app import app, logger
from app.common import ERROR_RESPONSE, OK_RESPONSE
from flask import request, jsonify, Response
import traceback
from app.service.scale_service import es_cluster_status, get_es_nodes, parse_nodes, get_allowable_scale_count
from app.dao import elastic_deploy
import yaml
from app.middleware import controller_maintainer_required

@app.route('/api/scale/elastic', methods=['POST'])
@controller_maintainer_required
def scale_es() -> Response:
    """
    Scale elasticsearch

    :return (Response): Returns a Reponse object
    """
    def scale(deployment, name, count):
        if count:
            for node_set in deployment['spec']['nodeSets']:
                if node_set['name'] == name:
                    node_set['count'] = count
    
    def get_new_count_from_payload(payload, name):
        if payload.get('elastic', None):
            return payload['elastic'].get(name, None)
        else:
            return None

    try:
        deployment = elastic_deploy.read()

        scale(deployment, 'master', get_new_count_from_payload(request.get_json(), 'master'))
        scale(deployment, 'coordinating', get_new_count_from_payload(request.get_json(), 'coordinating'))
        scale(deployment, 'ml', get_new_count_from_payload(request.get_json(), 'ml'))
        scale(deployment, 'data', get_new_count_from_payload(request.get_json(), 'data'))

        elastic_deploy.update(deployment)
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
