from app.models import Model, PostValidationBasicError
from app.utils.utils import camel_case_split
from flask_restx import fields, Namespace
from typing import List, Dict


CURATOR_NS = Namespace("curator", description="Elasticsearch curator.")
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
