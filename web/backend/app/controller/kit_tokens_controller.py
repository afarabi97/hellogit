import subprocess

from app.common import (CONFLICT_RESPONSE, ERROR_RESPONSE, NO_CONTENT,
                        NOTFOUND_RESPONSE)
from app.middleware import login_required_roles
from app.models.kit_tokens import TOKEN_NS, kit_token, kit_token_list
from app.utils.db_mngs import conn_mng
from app.utils.logging import logger
from bson import ObjectId
from flask import Response, request
from flask_restx import Resource


def generate_api_key(ipaddress: str):
    api_gen_cmd = '/opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --uid {} --roles "metrics" --displayName "Metrics Token" --exp 9999'.format(ipaddress)
    proc = subprocess.Popen(api_gen_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    stdout, _ = proc.communicate()
    return stdout.decode('utf-8').strip()

@TOKEN_NS.route('')
class KitTokens(Resource):

    @TOKEN_NS.response(200, 'Kit Token list', kit_token_list)
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def get(self) -> Response:
        try:
            response = []
            for kit_token in conn_mng.mongo_kit_tokens.find():
                kit_token_id = str(kit_token.pop("_id"))
                kit_token["kit_token_id"] = kit_token_id
                response.append(kit_token)
            return response
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

    @TOKEN_NS.response(200, 'Kit Token', kit_token)
    @TOKEN_NS.expect(kit_token, validate=True)
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def post(self) -> Response:
        try:
            data = request.get_json()
            kit_token = data.copy()
            kit_token["token"] = generate_api_key(kit_token["ipaddress"])

            if conn_mng.mongo_kit_tokens.find_one({"ipaddress": kit_token["ipaddress"]}):
                return CONFLICT_RESPONSE

            object_id = ObjectId()
            kit_token["_id"] = object_id
            conn_mng.mongo_kit_tokens.insert_one(kit_token)

            kit_token["kit_token_id"] = str(object_id)
            del kit_token["_id"]

            return (kit_token, 201)
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@TOKEN_NS.route('/<kit_token_id>')
class KitTokens(Resource):

    @TOKEN_NS.response(204, "")
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def delete(self, kit_token_id) -> Response:
        try:
            document = conn_mng.mongo_kit_tokens.delete_one({"_id": ObjectId(kit_token_id)})
            if document.deleted_count == 0:
                return NOTFOUND_RESPONSE
            else:
                return NO_CONTENT
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE
