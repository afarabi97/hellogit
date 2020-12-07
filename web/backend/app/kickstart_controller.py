"""
Main module for handling all of the Kickstart Configuration REST calls.
"""
import json

from app import (app, logger, conn_mng, DEPLOYER_DIR, KIT_SETUP_NS)
from app.inventory_generator import KickstartInventoryGenerator, MIPKickstartInventoryGenerator
from app.service.job_service import run_command
from app.service.kickstart_service import perform_kickstart
from app.common import OK_RESPONSE, ERROR_RESPONSE
from flask import request, jsonify, Response
from flask_restplus import Resource
from pymongo import ReturnDocument
from pymongo.results import InsertOneResult
from app.utils.constants import KICKSTART_ID, ADDNODE_ID
from app.utils.utils import netmask_to_cidr, filter_ip, encode_password, decode_password
from typing import Dict, List, Union
from app.middleware import Auth, controller_admin_required
from app.models import DBModelNotFound, PostValidationError
from app.models.common import JobID, COMMON_ERROR_DTO
from app.models.kit_setup import (DIPKickstartForm, Node, DIPKickstartSchema,
                                  NodeSchema, AddNodeWizard, AddNodeWizardSchema,
                                  MIPKickstartForm, MIP, MIPSchema, MIPKickstartSchema)

from marshmallow.exceptions import ValidationError
from rq.job import Job


def _is_valid_ip(ip_address: str) -> bool:
    """
    Ensures that the IP passed in is valid.

    :param ip_address: Some ip address (IE: 192.168.1.1).

    :return:
    """
    command = "nmap -v -sn -n %s/32 -oG - | awk '/Status: Down/{print $2}'" % ip_address
    stdout_str = run_command(command, use_shell=True)
    if stdout_str != '':
        available_ip_addresses = stdout_str.split('\n')
        if len(available_ip_addresses) > 0:
            return True
    return False


@KIT_SETUP_NS.route("/add_node_wizard")
class AddNodeWizardCtrl(Resource):

    @KIT_SETUP_NS.response(200, 'AddNodeWizard Model', AddNodeWizard.DTO)
    def get(self):
        try:
            add_node_wizard = AddNodeWizard.load_from_db()
            schema = AddNodeWizardSchema()
            return schema.dump(add_node_wizard)
        except DBModelNotFound:
            return {}, 200


@KIT_SETUP_NS.route("/kickstart")
class DIPKickstartCtrl(Resource):

    def _execute_kickstart_job(self, kickstart_form: DIPKickstartForm, tags: List[str]) -> Dict:
        schema = DIPKickstartSchema()
        kickstart_generator = KickstartInventoryGenerator(schema.dump(kickstart_form))
        kickstart_generator.generate()
        cmd_to_execute = ("ansible-playbook site.yml -i inventory.yml -t {tags}".format(tags=",".join(tags)))
        result = perform_kickstart.delay(cmd_to_execute)
        return JobID(result).to_dict()

    @KIT_SETUP_NS.response(200, 'DIPKickstartForm Model', DIPKickstartForm.DTO)
    def get(self):
        try:
            kickstart_form = DIPKickstartForm.load_from_db()
            schema = DIPKickstartSchema()
            return schema.dump(kickstart_form)
        except DBModelNotFound:
            return {}, 200

    @KIT_SETUP_NS.expect(DIPKickstartForm.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self):
        tags = ['preflight','setup','chrony','dnsmasq','kickstart','profiles','update_portal_client']
        new_kickstart = None
        try:
            new_kickstart = DIPKickstartForm.load_from_request(KIT_SETUP_NS.payload)
            new_kickstart.post_validation()
        except ValidationError as e:
            return e.normalized_messages(), 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400

        new_kickstart.save_to_db(delete_kit=True, delete_add_node_wizard=True)
        return self._execute_kickstart_job(new_kickstart, tags)

    @KIT_SETUP_NS.expect(Node.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @KIT_SETUP_NS.doc(description="Adds a node to the Kickstart configuration and reruns the deployers playbook.")
    @controller_admin_required
    def put(self):
        tags = ['preflight','setup','chrony','dnsmasq','kickstart','profiles']
        schema = NodeSchema()
        new_node = None
        try:
            kickstart_form = DIPKickstartForm.load_from_db() # type: DIPKickstartForm
            new_node = Node.load_from_request(KIT_SETUP_NS.payload)
            kickstart_form.nodes = self.node_update_handler(new_node, kickstart_form.nodes)
            kickstart_form.post_validation()
            wizard = AddNodeWizard(3, new_node)
            wizard.save_to_db()
        except ValidationError as e:
            return e.normalized_messages(), 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400
        except DBModelNotFound as e:
            return {"post_validation": [str(e)]}, 400

        kickstart_form.save_to_db()
        return self._execute_kickstart_job(kickstart_form, tags)

    def node_update_handler(self, new_node, node_list):
        """
        Evaluates the node is being updated or if it is being
        added for the first time. Returns the updated list
        """
        index_to_remove = -1
        for index, node in enumerate(node_list):
            if (node._id == new_node._id):
                index_to_remove = index
                break

        if index_to_remove >= 0:
            del node_list[index_to_remove]

        node_list.append(new_node)
        return node_list


@KIT_SETUP_NS.route("/mip_kickstart")
class MIPKickstartCtrl(Resource):

    def _execute_kickstart_job(self, kickstart_form: MIPKickstartForm) -> Dict:
        schema = MIPKickstartSchema()
        kickstart_generator = MIPKickstartInventoryGenerator(kickstart_form)
        kickstart_generator.generate()
        cmd_to_execute = ("ansible-playbook site.yml -t 'kickstart,profiles' -i inventory.yml")
        result = perform_kickstart.delay(cmd_to_execute, 'MIP')
        return JobID(result).to_dict()

    @KIT_SETUP_NS.response(200, 'MIPKickstartForm Model', MIPKickstartForm.DTO)
    def get(self):
        try:
            kickstart_form = MIPKickstartForm.load_from_db()
            schema = MIPKickstartSchema()
            return schema.dump(kickstart_form)
        except DBModelNotFound:
            return {}, 200

    @KIT_SETUP_NS.expect(MIPKickstartForm.DTO)
    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @controller_admin_required
    def post(self):
        new_kickstart = None
        try:
            new_kickstart = MIPKickstartForm.load_from_request(KIT_SETUP_NS.payload)
            new_kickstart.post_validation()
        except ValidationError as e:
            return e.normalized_messages(), 400
        except PostValidationError as e:
            return {"post_validation": e.errors_msgs}, 400

        new_kickstart.save_to_db()
        return self._execute_kickstart_job(new_kickstart)
