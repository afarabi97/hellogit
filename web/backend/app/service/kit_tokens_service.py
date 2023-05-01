import subprocess
from typing import Dict, List

from app.models.common import COMMON_SUCCESS_MESSAGE
from app.models.kit_tokens import KitTokenModel
from app.utils.collections import mongo_kit_tokens
from app.utils.exceptions import ResponseConflictError
from bson import ObjectId
from elasticsearch import NotFoundError


def get_kit_tokens() -> List[KitTokenModel]:
    response = []
    for kit_token in mongo_kit_tokens().find():
        kit_token_id = str(kit_token.pop("_id"))
        kit_token["kit_token_id"] = kit_token_id
        response.append(kit_token)
    return response

def post_kit_tokens(payload: Dict) -> KitTokenModel:
    kit_token = payload.copy() # type: KitTokenModel
    kit_token["token"] = _generate_api_key(kit_token["ipaddress"])
    if mongo_kit_tokens().find_one({"ipaddress": kit_token["ipaddress"]}):
        raise ResponseConflictError
    object_id = ObjectId()
    kit_token["_id"] = object_id
    mongo_kit_tokens().insert_one(kit_token)
    kit_token["kit_token_id"] = str(object_id)
    del kit_token["_id"]
    return kit_token

def delete_kit_tokens(kit_token_id: str) -> COMMON_SUCCESS_MESSAGE:
    document = mongo_kit_tokens().delete_one({"_id": ObjectId(kit_token_id)})
    if document.deleted_count == 0:
        raise NotFoundError
    else:
        return {"success_message": "deleted kit token."}


def _generate_api_key(ip_address: str):
    api_gen_cmd = f'/opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --uid {ip_address} --roles "metrics" --displayName "Metrics Token" --exp 9999'
    proc = subprocess.Popen(api_gen_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    stdout, _ = proc.communicate()
    return stdout.decode("utf-8").strip()
