from typing import Dict, List

from app.models import Model, PostValidationBasicError
from app.utils.namespaces import CURATOR_NS
from app.utils.utils import camel_case_split
from flask_restx import fields
from typing import List, Dict
from app.utils.elastic import ElasticWrapper
from app.utils.minio import MinIOManager
from app.utils.logging import logger
from app.models.settings.minio_settings import RepoSettingsModel


ELASTIC_INDEX_DESC = "The name of the index stored in Elasticsearch."
ELASIC_INDEX_EXAMPLE = "auditbeat-internal-2022.05.30-000022"


class ElasticIndexModel(Model):
    DTO = CURATOR_NS.model('ElasticIndexModel', {
        "index": fields.String(required=True, example=ELASIC_INDEX_EXAMPLE,
                               description=ELASTIC_INDEX_DESC),
        "size": fields.String(required=True, example="12-28-2020 17:18:16",
                              description="The size of the index in human readable form.")
    })

    def __init__(self, index: str, size: str):
        self.index = index
        self.size = size

    @classmethod
    def load_from_elastic(cls, payload: Dict) -> 'ElasticIndexModel':
        size = ""
        if payload["store.size"]:
            size = payload["store.size"]
        idx_name = payload["index"]
        return ElasticIndexModel(idx_name, size)


class CuratorProcessModel(Model):
    DTO = CURATOR_NS.model('CuratorProcessModel', {
        "action": fields.String(required=True,
                                example="DeleteIndices|CloseIndices|BackupIndices",
                                description="The action"),
        "index_list": fields.List(fields.String(required=True,
                                                example=ELASIC_INDEX_EXAMPLE,
                                                description=ELASTIC_INDEX_DESC)),
    })

    def __init__(self, action: str, index_list: List[str]):
        self.action = action
        self.index_list = index_list


    @classmethod
    def load_from_request(cls, payload: Dict) -> 'CuratorProcessModel':
        action = payload["action"]
        index_list = payload["index_list"]
        return CuratorProcessModel(action, index_list)

    def get_readable_action(self):
        return camel_case_split(self.action)

    def _check_index_size(self):
        client = ElasticWrapper()
        indexes = ','.join(self.index_list)
        stats = client.indices.stats(indexes)
        settings = RepoSettingsModel.load_from_kubernetes_and_elasticsearch()
        mng = MinIOManager(settings)

        available_space_in_kilobytes = mng.get_available_data_drive_space()
        primary_size_in_bytes = stats["_all"]["primaries"]["store"]["size_in_bytes"]
        primary_size_in_kilobytes = primary_size_in_bytes / 1024

        logger.debug(f"available_space_in_kilobytes {available_space_in_kilobytes} primary_size_in_kilobytes: {primary_size_in_kilobytes}")
        if primary_size_in_kilobytes >= available_space_in_kilobytes:
            raise PostValidationBasicError("The indexes you selected are too large for the MinIO Server", 400)

    def post_validation(self):
        if self.action is None or self.action not in [
            "DeleteIndices",
            "CloseIndices",
            "BackupIndices"
        ]:
            raise PostValidationBasicError("Invalid value for action", 400)

        if self.index_list is None:
            raise PostValidationBasicError("Index required", 400)
        if len(self.index_list) == 0:
            raise PostValidationBasicError("Index list is empty", 400)
