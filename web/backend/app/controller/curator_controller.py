import re

from app.middleware import controller_maintainer_required
from app.models import PostValidationBasicError
from app.models.common import COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.models.curator import ElasticIndexModel, CURATOR_NS, CuratorProcessModel
from app.models.settings.minio_settings import RepoSettingsModel
from app.service.curator_service import execute_curator
from app.utils.elastic import ElasticWrapper, wait_for_elastic_cluster_ready, Timeout
from app.utils.logging import logger
from app.utils.minio import MinIOManager
from flask import Response, request
from flask_restx import Resource


EXCLUDE_FILTER = (
    "^(.ml-config|.kibana|.monitoring|.watches|.apm|.triggered_watches|.security|.siem-signals|.security-tokens|"
    ".geoip_databases|.tasks|.async-search|arkime_dstats|arkime_stats|arkime_hunts|arkime_fields|arkime_lookups|"
    "arkime_users|arkime_files|arkime_queries|arkime_sequence).*$"
)
DEFAULT_ERROR_MESSAGE_INDICES = {
    "error_message": "Something went wrong getting the Elasticsearch indices."
}


def check_read_only_allow_delete(client, index) -> bool:
    settings = client.indices.get_settings(index)
    if (
        "blocks" in settings[index]["settings"]["index"]
        and "read_only_allow_delete" in settings[index]["settings"]["index"]["blocks"]
        and settings[index]["settings"]["index"]["blocks"]["read_only_allow_delete"]
    ):
        return True
    return False


def is_current_alias_writable(index, aliases) -> bool:
    for key, val in aliases.items():
        if "is_write_index" in val and val["is_write_index"]:
            return True
    return False


@CURATOR_NS.route("/indices/<status>")
class GetIndices(Resource):
    VALID_PARAMS = ["open", "close"]

    @CURATOR_NS.doc(description="Get Elastic index names and their sizes for close, backup and delete operations. \
                                 This call excludes private indicies to ensure that users do not accidentally delete them.",
                    params={"status": "Can be either open or close"})
    @CURATOR_NS.response(200, "Closed Indices", [ElasticIndexModel.DTO])
    @CURATOR_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @CURATOR_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def get(self, status: str) -> Response:
        if status not in self.VALID_PARAMS:
            return {"error_message": f"Must be {str(self.VALID_PARAMS)}"}, 400

        try:
            regex = re.compile(EXCLUDE_FILTER)
            indicies = []
            client = ElasticWrapper()
            indices = client.cat.indices(index="*", params={"format": "json"})
            filtered_idx_names = [
                i["index"] for i in indices if not regex.match(i["index"])
            ]
            filtered = [i for i in indices if not regex.match(i["index"])]
            all_aliases = client.indices.get_alias(index=filtered_idx_names)
            for index in filtered:
                model = ElasticIndexModel.load_from_elastic(index)
                if index["status"] == status:
                    indicies.append(model.to_dict())
                else:
                    aliases = all_aliases[model.index]["aliases"]
                    if check_read_only_allow_delete(client, model.index) \
                        and not is_current_alias_writable(model.index, aliases):
                            indicies.append(model.to_dict())

            indicies = sorted(indicies, key=lambda d: d["index"])
            return indicies
        except Exception as exec:
            logger.exception(exec)
            return {
                "error_message": "Something went wrong getting the Elasticsearch indices."
            }, 500


@CURATOR_NS.route("/process")
class IndexMangement(Resource):

    @CURATOR_NS.doc(description="Main process function for processing the close, backup or \
                                 delete operation on a list of inidicies passed in.")
    @CURATOR_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @CURATOR_NS.response(200, "Index Management", COMMON_SUCCESS_MESSAGE)
    @CURATOR_NS.expect(CuratorProcessModel.DTO)
    @controller_maintainer_required
    def post(self) -> Response:
        try:
            payload = request.get_json()
            model = CuratorProcessModel.load_from_request(payload)
            model.post_validation()
            execute_curator.delay(model)
            return {
                "success_message": "Curator job submitted check notifications for progress."
            }
        except PostValidationBasicError as e:
            return e.error_payload, e.http_code
        except Exception as e:
            logger.exception(e)
            return {"error_message": str(e)}, 500


@CURATOR_NS.route("/minio_check")
class MinioMng(Resource):

    @CURATOR_NS.doc(description="Does a simple minio connectivity check and \
                                 ensures the saved credentials are also valid.")
    @CURATOR_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @CURATOR_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @controller_maintainer_required
    def get(self) -> Response:
        try:
            wait_for_elastic_cluster_ready(minutes=0)
            model = RepoSettingsModel.load_from_kubernetes_and_elasticsearch()
            mng = MinIOManager(model)
            is_connected, msg = mng.is_connected()
            if is_connected:
                return {"success_message": "MinIO is up!"}, 200
            else:
                return {"error_message": msg}, 500
        except Timeout as e:
            logger.exception(e)
            return {"error_message": "Elastic cluster is not in a ready state."}, 500
        except Exception as e:
            logger.exception(e)
            return {"error_message": str(e)}, 500
