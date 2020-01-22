from app import app, logger, conn_mng
from typing import Dict, List

DEFAULT_QUERY={"kind": "Elasticsearch"}

def create(data: Dict) -> None:
    conn_mng.mongo_elastic_deploy.insert(data, check_keys=False)


def read(query: dict=DEFAULT_QUERY) -> dict:
    deploy_config = conn_mng.mongo_elastic_deploy.find_one(query,{'_id': False})
    if deploy_config:
        return deploy_config
    return {}


def read_many() -> list:
    deploy_config = list(conn_mng.mongo_elastic_deploy.find({}))
    if deploy_config:
        return deploy_config
    return []


def update(data: Dict, query: dict=DEFAULT_QUERY) -> None:
    conn_mng.mongo_elastic_deploy.find_one_and_replace(query, data, upsert=True)


def delete(query: dict=DEFAULT_QUERY) -> None:
    conn_mng.mongo_elastic_deploy.delete_one(query)


def delete_many() -> None:
    conn_mng.mongo_elastic_deploy.delete_many({})
