from typing import Dict

from app.models import Model
from app.utils.collections import mongo_elastic_deploy
from app.utils.namespaces import SCALE_NS
from flask_restx import fields
from marshmallow import Schema
from marshmallow import fields as marsh_fields

DEFAULT_QUERY = {"kind": "Elasticsearch"}


def create(data: Dict) -> None:
    mongo_elastic_deploy().insert(data, check_keys=False)


def read(query: dict = DEFAULT_QUERY) -> dict:
    deploy_config = mongo_elastic_deploy().find_one(query, {"_id": False})
    if deploy_config:
        return deploy_config
    return {}


def read_many() -> list:
    deploy_config = list(mongo_elastic_deploy().find({}))
    if deploy_config:
        return deploy_config
    return []


def update(data: Dict, query: dict = DEFAULT_QUERY) -> None:
    mongo_elastic_deploy().find_one_and_replace(query, data, upsert=True)


def delete(query: dict = DEFAULT_QUERY) -> None:
    mongo_elastic_deploy().delete_one(query)


def delete_many() -> None:
    mongo_elastic_deploy().delete_many({})


class ElasticScaleCheckModel(Model):
    DTO = SCALE_NS.model('ElasticScaleheckModel',{
        "status": fields.String(example="Ready")
    })


class ElasticScaleAdvancedConfigSchema(Schema):
    elastic = marsh_fields.Str(required=True, allow_none=False)

class ElasticScaleAdvancedConfigModel(Model):
    schema = ElasticScaleAdvancedConfigSchema()
    DTO = SCALE_NS.model('ElasticScaleAdvancedConfigModel',{
        "elastic": fields.String(required=True, allow_none=False)
    })


class ElasticScaleNodeInSchema(Schema):
    master = marsh_fields.Integer(required=True, example=3 , allow_none=False)
    data = marsh_fields.Integer(required=True, example=4, allow_none=False)
    ml = marsh_fields.Integer(required=True, example=1, allow_none=False)
    ingest = marsh_fields.Integer(required=True, example=0, allow_none=False)

class ElasticScaleNodeInModel(Model):
    schema = ElasticScaleNodeInSchema()
    DTO = SCALE_NS.model('ElasticScaleNodeInModel', {
        "master": fields.Integer(required=True, allow_none=False, example = 3),
        "data": fields.Integer(required=True, allow_none=False, example = 6),
        "ml": fields.Integer(required=True, allow_none=False, example = 1),
        "ingest": fields.Integer(required=True, allow_none=False, example = 0)
    })

    def __init__(self, master: int, data: int, m1: int, ingest: int):
            self.master = master
            self.data = data
            self.m1 = m1
            self.ingest = ingest


class ElasticScaleNodeOutSchema(Schema):
    master = marsh_fields.Integer(required=True, example=3 , allow_none=False)
    data = marsh_fields.Integer(required=True, example=4, allow_none=False)
    ml = marsh_fields.Integer(required=True, example=1, allow_none=False)
    ingest = marsh_fields.Integer(required=True, example=0, allow_none=False)
    max_scale_count_master: fields.Integer(required=False, example = 3, allow_none=True)
    max_scale_count_data: fields.Integer(required=False, example = 9, allow_none=True)
    max_scale_count_ml: fields.Integer(required=False, example = 9, allow_none=True)
    max_scale_count_ingest: fields.Integer(required=False, example = 0, allow_none=True)
    server_node_count: fields.Integer(required=False, example = 3, allow_none=True)

class ElasticScaleNodeOutModel(Model):
    schema = ElasticScaleNodeOutSchema()
    DTO = SCALE_NS.model('ElasticScaleNodeOutModel', {
        "master": fields.Integer(required=True, allow_none=False, example = 3),
        "data": fields.Integer(required=True, allow_none=False, example = 6),
        "ml": fields.Integer(required=True, allow_none=False, example = 1),
        "ingest": fields.Integer(required=True, allow_none=False, example = 0),
        "max_scale_count_master": fields.Integer(required=False, allow_none=True, example = 3),
        "max_scale_count_data": fields.Integer(required=False, allow_none=True, example = 9),
        "max_scale_count_ml": fields.Integer(required=False, allow_none=True, example = 9),
        "max_scale_count_ingest": fields.Integer(required=False, allow_none=True, example = 0),
        "server_node_count": fields.Integer(required=False, allow_none=True, example = 3)
    })

    def __init__(self, master: int, data: int, m1: int, ingest: int,
                 max_scale_count_master: int, max_scale_count_data: int,
                max_scale_count_ml: int, max_scale_count_ingest: int,
                server_node_count: int):
            self.master = master
            self.data = data
            self.m1 = m1
            self.ingest = ingest
            self.max_scale_count_master = max_scale_count_master
            self.max_scale_count_data = max_scale_count_data
            self.max_scale_count_ml = max_scale_count_ml
            self.max_scale_count_ingest = max_scale_count_ingest
            self.server_node_count = server_node_count
