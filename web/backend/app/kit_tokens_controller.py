from flask.json import jsonify
from app.utils.logging import logger
from app import api, conn_mng, KIT_TOKEN_NS
from app.common import NOTFOUND_RESPONSE, ERROR_RESPONSE, CONFLICT_RESPONSE, NO_CONTENT
from app.middleware import login_required_roles
import subprocess

import re

from flask import request, Response
from flask_restx import Resource, fields

from bson import ObjectId

IP_ADDRESS_PATTERN = "^(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])$"

kit_token = api.model('KitToken', {
    "ipaddress": fields.String(pattern=IP_ADDRESS_PATTERN),
    "kit_token_id": fields.String(required=False)
}, strict=True)

kit_token_list = api.schema_model('KitTokenList', {
    "type": "array",
    "items": {"$ref": "#/definitions/KitToken"}
})

def generate_api_key(ipaddress: str):
    api_gen_cmd = '/opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --uid {} --roles "metrics" --displayName "Metrics Token" --exp 9999'.format(ipaddress)
    proc = subprocess.Popen(api_gen_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    stdout, _ = proc.communicate()
    return stdout.decode('utf-8').strip()

@KIT_TOKEN_NS.route('/kit/tokens')
class KitTokens(Resource):

    @KIT_TOKEN_NS.response(200, 'Kit Token list', kit_token_list)
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def get(self):
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

    @KIT_TOKEN_NS.response(200, 'Kit Token', kit_token)
    @KIT_TOKEN_NS.expect(kit_token, validate=True)
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def post(self):
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

@KIT_TOKEN_NS.route('/kit/tokens/<kit_token_id>')
class KitTokens(Resource):

    @KIT_TOKEN_NS.response(204, "")
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def put(self, kit_token_id: str):
        try:
            data = request.get_json()
            conn_mng.mongo_kit_tokens.replace_one({"_id": ObjectId(kit_token_id)}, data)
            return NO_CONTENT
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

    @KIT_TOKEN_NS.response(204, "")
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def delete(self, kit_token_id):
        try:
            document = conn_mng.mongo_kit_tokens.delete_one({"_id": ObjectId(kit_token_id)})
            if document.deleted_count == 0:
                return NOTFOUND_RESPONSE
            else:
                return NO_CONTENT
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@KIT_TOKEN_NS.route('/kit/tokens/generate/<ipaddress>')
class KitTokens(Resource):

    @KIT_TOKEN_NS.response(200, 'Kit Token list', kit_token_list)
    @login_required_roles(['controller-admin','controller-maintainer'], all_roles_req=False)
    def get(self, ipaddress: str):
        try:
            return jsonify(generate_api_key(ipaddress))
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE
