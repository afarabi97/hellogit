from functools import wraps

from app.models import DBModelNotFound, PostValidationError
from app.service.mip_service import add_mip_to_database, deploy_mip
from app.utils.logging import logger
from app.utils.namespaces import KIT_SETUP_NS
from flask import Response, request
from flask_restx import Resource
from marshmallow import Schema, ValidationError
from marshmallow import fields as marsh_fields

def required_params(schema):
    def decorator(fn):

        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                schema.load(request.get_json())
            except ValidationError as err:
                error = {
                    "status": "error",
                    "messages": err.messages
                }
                return error, 400
            return fn(*args, **kwargs)
        return wrapper
    return decorator


class MIPSchema(Schema):
    hostname = marsh_fields.Str(required=True)
    ip_address = marsh_fields.IPv4(required=True)
    deployment_type = marsh_fields.Str(required=True)

    # if baremetal
    mac_address = marsh_fields.Str(required=False, allow_none=True) # required if baremetal

    # if virtual
    virtual_cpu = marsh_fields.Integer(required=False, allow_none=True)
    virtual_mem = marsh_fields.Integer(required=False, allow_none=True)
    virtual_os = marsh_fields.Integer(required=False, allow_none=True)


@KIT_SETUP_NS.route("/mip")
class MipCtrl(Resource):
    @required_params(MIPSchema())
    def post(self) -> Response:
        try:
            mip = add_mip_to_database(KIT_SETUP_NS.payload)
            job = deploy_mip(mip)
            return job, 202
        except ValidationError as e:
            logger.exception(e)
            return e.normalized_messages(), 400
        except DBModelNotFound:
            logger.exception(e)
            return {"error_message": "DBModelNotFound."}, 400
        except PostValidationError as e:
            logger.exception(e)
            return {"post_validation": e.errors_msgs}, 400
        except:
            return "error", 500
