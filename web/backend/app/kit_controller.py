"""
Main module for handling all of the Kit Configuration REST calls.
"""
from typing import Dict, Tuple
from flask import request, Response, jsonify
from flask_restplus import Resource
from pymongo.collection import ReturnDocument
from app import app, logger, conn_mng, KIT_SETUP_NS
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.inventory_generator import KitInventoryGenerator
from app.models import PostValidationError, DBModelNotFound
from app.models.common import JobID, COMMON_ERROR_DTO
from app.models.kit_setup import (DIPKickstartForm, DIPKitForm, DIPKitSchema, Node)
from app.service.node_service import execute_kit
from app.service.node_service import add_node
from app.middleware import controller_admin_required
from marshmallow.exceptions import ValidationError
from app.utils.constants import KIT_ID


def _generate_inventory(kit_form: DIPKitForm, kickstart: DIPKickstartForm):
    kit_generator = KitInventoryGenerator(kit_form, kickstart)
    kit_generator.generate()


@KIT_SETUP_NS.route("/kit")
class DIPKitCtrl(Resource):

    def _execute_kit_job(self, root_password: str) -> Dict:
        job = execute_kit.delay(password=root_password)
        conn_mng.mongo_catalog_saved_values.delete_many({})
        return JobID(job).to_dict()

    @KIT_SETUP_NS.response(200, 'DIPKitForm Model', DIPKitForm.DTO)
    def get(self):
        try:
            kit_form = DIPKitForm.load_from_db()
            schema = DIPKitSchema()
            return schema.dump(kit_form)
        except DBModelNotFound:
            return {}, 200

    @KIT_SETUP_NS.expect(Node.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @controller_admin_required
    def put(self):
        job = None
        try:
            kickstart_form = DIPKickstartForm.load_from_db()
            kit_form = DIPKitForm.load_from_db() # type: DIPKitForm
            add_node_payload = KIT_SETUP_NS.payload
            node_to_update = Node.load_from_db_using_hostname(add_node_payload["hostname"])
            node_to_update.update_kit_specific_fields(add_node_payload)
            kit_form.nodes.append(node_to_update)
            kit_form.save_to_db()
            _generate_inventory(kit_form, kickstart_form)
            job = add_node.delay(node_payload=add_node_payload,
                                 password=kickstart_form.root_password)
        except ValidationError as e:
            return e.normalized_messages(), 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            return {"post_validation": [str(e)]}, 400

        return JobID(job).to_dict()

    @KIT_SETUP_NS.expect(DIPKitForm.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self):
        new_kit = None
        try:
            kickstart = DIPKickstartForm.load_from_db()
            new_kit = DIPKitForm.load_from_request(KIT_SETUP_NS.payload)
            new_kit.post_validation()
            new_kit.save_to_db()
            _generate_inventory(new_kit, kickstart)
        except ValidationError as e:
            return e.normalized_messages(), 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            return {"post_validation": [str(e)]}, 400

        return self._execute_kit_job(kickstart.root_password)


@KIT_SETUP_NS.route("/generate_kit_inventory")
class DIPGenKitInventoryCtrl(Resource):

    @KIT_SETUP_NS.expect(DIPKitForm.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model')
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self):
        new_kit = None
        try:
            kickstart = DIPKickstartForm.load_from_db()
            new_kit = DIPKitForm.load_from_request(KIT_SETUP_NS.payload)
            new_kit.post_validation()
            new_kit.save_to_db()
            _generate_inventory(new_kit, kickstart)
            DIPKitForm.mark_complete_and_save()
        except ValidationError as e:
            return e.normalized_messages(), 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            return {"post_validation": [str(e)]}, 400

        return OK_RESPONSE
