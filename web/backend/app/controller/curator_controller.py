import re

from app.middleware import controller_maintainer_required
from app.models.common import COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.service.curator_service import execute_curator
from app.utils.elastic import ElasticWrapper
from app.utils.logging import logger
from flask import Response, request
from flask_restx import Namespace, Resource

EXCLUDE_FILTER = ('^(.ml-config|.kibana|.monitoring|.watches|.apm|.triggered_watches|.security|.siem-signals|.security-tokens|'
                '.geoip_databases|.tasks|.async-search|arkime_dstats|arkime_stats|arkime_hunts|arkime_fields|arkime_lookups|'
                'arkime_users|arkime_files|arkime_queries|arkime_sequence).*$')
DEFAULT_ERROR_MESSAGE_INDICES = { "error_message": "Something went wrong getting the Elasticsearch indices." }
CURATOR_NS = Namespace("curator", description="Elasticsearch curator.")


def check_read_only_allow_delete(client, index) -> bool:
    settings = client.indices.get_settings(index)
    if "blocks" in settings[index]["settings"]["index"] \
    and "read_only_allow_delete" in settings[index]["settings"]["index"]["blocks"] \
    and settings[index]["settings"]["index"]["blocks"]["read_only_allow_delete"]:
        return True
    return False

def is_current_alias_writable(index, aliases) -> bool:
    for key, val in aliases.items():
        if "is_write_index" in val and val['is_write_index']:
            return True
    return False

@CURATOR_NS.route('/indices/closed')
class GetClosedIndices(Resource):

    @CURATOR_NS.response(200, 'Closed Indices')
    @CURATOR_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def get(self) -> Response:
        try:
            regex = re.compile(EXCLUDE_FILTER)
            deleteable_indices = []
            client = ElasticWrapper()
            indices = client.cat.indices(index="*", params={ "format": "json" })
            filtered_idx_names = [i['index'] for i in indices if not regex.match(i['index'])]
            filtered = [i for i in indices if not regex.match(i['index'])]
            all_aliases = client.indices.get_alias(index=filtered_idx_names)
            for index in filtered:
                size = None
                if not index['store.size']:
                    size = ""
                else:
                    size = index['store.size']
                idx_name = index["index"]
                aliases = all_aliases[idx_name]["aliases"]
                data = {'index': idx_name, 'size': size}
                if index['status'] == "close":
                    deleteable_indices.append(data)
                else:
                    if check_read_only_allow_delete(client, idx_name) \
                        and not is_current_alias_writable(idx_name, aliases):
                        deleteable_indices.append(data)
            if deleteable_indices:
                deleteable_indices = sorted(deleteable_indices, key=lambda d: d['index'])
            return deleteable_indices
        except Exception as exec:
           print(str(exec))
           logger.exception(exec)
           return { "error_message": "Something went wrong getting the Elasticsearch indices." }, 500


@CURATOR_NS.route('/indices')
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
            filtered = [i for i in indices if not regex.match(i['index'])]
            for index in filtered:
                idx_name = index['index']
                size = None
                if not index['store.size']:
                    size = "0kb"
                else:
                    size = index['store.size']
                open_indices.append({'index': idx_name, 'size': size})
            if open_indices:
                open_indices = sorted(open_indices, key=lambda d: d['index'])
            return open_indices
        except Exception as exec:
            print(str(exec))
            logger.exception(exec)
            return { "error_message": "Something went wrong getting the Elasticsearch indices." }, 500


@CURATOR_NS.route('/process')
class IndexMangement(Resource):

    @CURATOR_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @CURATOR_NS.response(200, 'Index Management', COMMON_SUCCESS_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        payload = request.get_json()

        if "action" not in payload or payload["action"] not in ["DeleteIndices", "CloseIndices", "CleanUpOptimize"]:
            return { "error_message": "Invalid value for action" }, 400
        if "index_list" not in payload or payload["index_list"] is None:
            return { "error_message": "Index required" }, 400
        if len(payload["index_list"]) < 1:
            return { "error_message": "Index list is empty" }, 400

        units = "minutes"
        age = "1"
        action = payload["action"]
        index_list = payload["index_list"]
        execute_curator.delay(action, index_list, units, age)
        return { "success_message": "Curator job submitted check notifications for progress."}
