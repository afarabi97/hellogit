import logging
import re
from flask import Response, jsonify, request
from app import app
from app.utils.logging import logger
from app.middleware import controller_maintainer_required
from app.service.curator_service import execute_curator
from app.utils.elastic import ElasticWrapper


EXCLUDE_FILTER = "^(.ml-config|.kibana|.monitoring|.watches|.apm|.triggered_watches|.security|.siem-signals|.security-tokens).*$"

@app.route('/api/closed_indices', methods=['GET'])
@controller_maintainer_required
def get_closed_indices() -> Response:
    try:
        filtered_indices = []
        client = ElasticWrapper()
        indices = client.cat.indices(index="*", params={ "format": "json" })
        for index in indices:
            if index['status'] == "close":
                filtered_indices.append(index["index"])
        filtered_indices.sort()
        return (jsonify(filtered_indices), 200)
    except Exception as exec:
        logger.exception(exec)
        return (jsonify({ "message": "Something went wrong getting the Elasticsearch indices." }), 500)


@app.route('/api/opened_indices', methods=['GET'])
@controller_maintainer_required
def get_opened_indices() -> Response:
    try:
        regex = re.compile(EXCLUDE_FILTER)
        open_indices = []
        client = ElasticWrapper()
        indices = client.cat.indices(index="*", params={ "format": "json" })
        filtered = [i['index'] for i in indices if not regex.match(i['index']) and i['status'] == 'open']
        all_aliases = client.indices.get_alias(index=filtered)
        for index in filtered:
            for key, val in all_aliases[index]["aliases"].items():
                if "is_write_index" in val and not val['is_write_index']:
                    open_indices.append(index)
        open_indices.sort()
        return (jsonify(open_indices), 200)
    except Exception as exec:
        print(str(exec))
        logger.exception(exec)
        return (jsonify({ "message": "Something went wrong getting the Elasticsearch indices." }), 500)


@app.route('/api/index_management', methods=['POST'])
@controller_maintainer_required
def index_management() -> Response:
    logging.basicConfig(level=logging.INFO)
    payload = request.get_json()

    if "action" not in payload or payload["action"] not in ["DeleteIndices", "CloseIndices"]:
        return (jsonify({ "message": "Invalid value for action" }), 400)
    if "index_list" not in payload or payload["index_list"] is None:
        return (jsonify("Index required"), 400)
    if len(payload["index_list"]) < 1:
        return (jsonify("Index list is empty"), 400)

    units = "minutes"
    age = "1"
    action = payload["action"]
    index_list = payload["index_list"]
    execute_curator.delay(action, index_list, units, age)
    return (jsonify({ "message": "Curator job submitted check notifications for progress." }), 200)
