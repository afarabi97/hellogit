import logging
from base64 import b64decode

import curator
from elasticsearch import Elasticsearch
from flask import Response, jsonify, request

from app import app, conn_mng
from app.middleware import Auth, controller_maintainer_required
from app.service.curator_service import execute_curator
from shared.connection_mngs import KubernetesWrapper
from app.service.scale_service import get_elastic_password, get_elastic_service_ip


@app.route('/api/closed_indices', methods=['GET'])
@controller_maintainer_required
def get_closed_indices() -> Response:
    password = get_elastic_password()
    service_ip, port = get_elastic_service_ip()
    client = Elasticsearch(service_ip, scheme="https", port=port, http_auth=('elastic', password), use_ssl=True, verify_certs=False)
    ilo = curator.IndexList(client)
    ilo.filter_closed(exclude=False)
    indicies = ilo.indices
    indicies.sort()
    return (jsonify(indicies), 200)


@app.route('/api/opened_indices', methods=['GET'])
@controller_maintainer_required
def get_opened_indices() -> Response:
    password = get_elastic_password()
    service_ip, port = get_elastic_service_ip()
    client = Elasticsearch(service_ip, scheme="https", port=port, http_auth=('elastic', password), use_ssl=True, verify_certs=False)
    ilo = curator.IndexList(client)
    ilo.filter_closed()
    ilo.filter_by_regex(kind="prefix", value="^(.kibana|.monitoring|.watches|.apm|.triggered_watches|.security).*$", exclude=True)
    indicies = ilo.indices
    indicies.sort()
    return (jsonify(indicies), 200)


@app.route('/api/index_management', methods=['POST'])
@controller_maintainer_required
def index_management() -> Response:
    logging.basicConfig(level=logging.INFO)
    payload = request.get_json()

    if "action" not in payload or payload["action"] not in ["DeleteIndices", "CloseIndices"]:
        return (jsonify({ "message": "Invalid value for action" }), 400)
    #if "age" not in payload or payload["age"] <= 0:
    #    return (jsonify({ "message": "Invalid value for age" }), 400)
    if "index_list" not in payload or payload["index_list"] is None:
        return (jsonify("Index required"), 400)
    if len(payload["index_list"]) < 1:
        return (jsonify("Index list is empty"), 400)
    #if "units" not in payload or payload["units"] not in ["minutes","hours","days","weeks","months","years"]:
    #    return (jsonify({ "message": "Invalid value for units" }), 400)

    units = "minutes" # payload["units"]
    age = "1" # payload["age"]
    action = payload["action"]
    index_list = payload["index_list"]
    execute_curator.delay(action, index_list, units, age)
    return (jsonify({ "message": "Curator job submitted check notifications for progress." }), 200)
