import logging
import re

from app.middleware import controller_maintainer_required
from app.models.common import COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.service.curator_service import execute_curator
from app.utils.elastic import ElasticWrapper
from app.utils.logging import logger
from flask import Response, request
from flask_restx import Namespace, Resource

EXCLUDE_FILTER = "^(.ml-config|.kibana|.monitoring|.watches|.apm|.triggered_watches|.security|.siem-signals|.security-tokens).*$"
DEFAULT_ERROR_MESSAGE_INDICES = { "error_message": "Something went wrong getting the Elasticsearch indices." }
CURATOR_NS = Namespace("curator", description="Elasticsearch curator.")

@CURATOR_NS.route('/closed_indices')
class GetClosedIndices(Resource):

    @CURATOR_NS.response(200, 'Closed Indices')
    @CURATOR_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def get(self) -> Response:
        try:
            filtered_indices = []
            client = ElasticWrapper()
            indices = client.cat.indices(index="*", params={ "format": "json" })
            for index in indices:
                if index['status'] == "close":
                    filtered_indices.append(index["index"])
            filtered_indices.sort()
            return filtered_indices
        except Exception as exec:
            logger.exception(exec)
            return { "error_message": "Something went wrong getting the Elasticsearch indices." }


@CURATOR_NS.route('/opened_indices')
class GetOpenedIndices(Resource):

    @CURATOR_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @CURATOR_NS.response(200, 'Opened Indices')
    @controller_maintainer_required
    def get(self) -> Response:
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
            return open_indices
        except Exception as exec:
            logger.exception(exec)
            return { "error_message": "Something went wrong getting the Elasticsearch indices." }


@CURATOR_NS.route('/index_management')
class IndexMangement(Resource):

    @CURATOR_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @CURATOR_NS.response(200, 'Index Management', COMMON_SUCCESS_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        payload = request.get_json()

        if "action" not in payload or payload["action"] not in ["DeleteIndices", "CloseIndices"]:
            return { "error_message": "Invalid value for action" }
        if "index_list" not in payload or payload["index_list"] is None:
            return { "error_message": "Index required" }
        if len(payload["index_list"]) < 1:
            return { "error_message": "Index list is empty" }

        units = "minutes"
        age = "1"
        action = payload["action"]
        index_list = payload["index_list"]
        execute_curator.delay(action, index_list, units, age)
        return { "success_message": "Curator job submitted check notifications for progress."}
