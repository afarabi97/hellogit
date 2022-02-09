import json
import tempfile
import uuid
from datetime import datetime
from pathlib import Path

from app.common import ERROR_RESPONSE
from app.middleware import operator_required
from app.models.common import (COMMON_ERROR_MESSAGE, COMMON_MESSAGE,
                               COMMON_SUCCESS_MESSAGE, JobID)
from app.models.ruleset import (POLICY_NS, RuleModel, RuleSetModel,
                                TestAgainstPcap)
from app.service.ruleset_service import (InvalidRuleSyntax, ProhibitedExecFunc,
                                         check_zeek_exec_module,
                                         create_rule_from_file,
                                         create_rule_service,
                                         create_ruleset_service,
                                         does_file_have_ext, process_zipfile,
                                         test_pcap_against_suricata_rule,
                                         test_pcap_against_zeek_intel,
                                         test_pcap_against_zeek_script,
                                         test_pcap_against_zeek_signature,
                                         validate_suricata_rule,
                                         validate_zeek_intel,
                                         validate_zeek_script,
                                         validate_zeek_signature)
from app.service.rulesync_service import perform_rulesync
from app.utils.collections import mongo_rule, mongo_ruleset
from app.utils.constants import DATE_FORMAT_STR, RULE_TYPES, RULESET_STATES
from app.utils.logging import logger
from flask import Response, request
from flask_restx import Resource
from pymongo import ReturnDocument
from pymongo.cursor import Cursor
from pymongo.results import DeleteResult
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename


@POLICY_NS.route('/rules/<rule_set_id>')
class Rules(Resource):

    @POLICY_NS.doc(description="Returns a list of all the saved Rules based on the RuleSet ID passed in.")
    @POLICY_NS.response(200, 'Rules', [RuleModel.DTO])
    def get(self, rule_set_id: str) -> Response:
        rules = mongo_rule().find(
            {'rule_set_id': rule_set_id}, projection={"rule": False})
        return list(rules)


@POLICY_NS.route('/rule/<rule_id>/content')
class RuleContent(Resource):

    @POLICY_NS.doc(description="Gets the content for a single Rule by its ID.")
    @POLICY_NS.response(200, 'Rules', RuleModel.DTO)
    @POLICY_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    def get(self, rule_id: str) -> Response:
        rule = mongo_rule().find_one({'_id': rule_id})
        if rule:
            return rule
        return {"error_message": "Failed to find rule content for rule ID {}.".format(rule_id)}, 400


@POLICY_NS.route('/ruleset')
class Rulesets(Resource):

    @POLICY_NS.doc(description="Returns a list of all the saved RuleSets defined on the RuleSet Page.")
    @POLICY_NS.response(200, 'RuleSets', [RuleSetModel.DTO])
    def get(self) -> Response:
        rule_sets = mongo_ruleset().find({})  # type: Cursor
        ret_val = []
        for rule_set in rule_sets:
            ret_val.append(rule_set)
        return ret_val

    @POLICY_NS.doc(description="Saves a new Ruleset. The _id field is not required as a new one will be generated.")
    @POLICY_NS.response(200, 'RuleSet', RuleSetModel.DTO)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.expect(RuleSetModel.DTO)
    @operator_required
    def post(self) -> Response:
        ruleset = request.get_json()
        ret_val = create_ruleset_service(ruleset)
        if ret_val:
            return ruleset
        return {"error_message": "Failed to insert ruleset."}, 500

    @POLICY_NS.doc(description="Updates an existing Ruleset. The _id field is required.")
    @POLICY_NS.expect(RuleSetModel.DTO)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @operator_required
    def put(self) -> Response:
        ruleset = request.get_json()
        ruleset_id = ruleset["_id"]

        # We do not want to update rules with this update
        # This is a built in protection ensuring it will not happen.
        if 'rules' in ruleset:
            del ruleset['rules']

        ruleset['state'] = RULESET_STATES[1]
        ruleset['lastModifiedDate'] = datetime.utcnow().strftime(
            DATE_FORMAT_STR)
        ret_val = mongo_ruleset().find_one_and_update({'_id': ruleset_id},
                                                      {"$set": ruleset},
                                                      return_document=ReturnDocument.AFTER)
        if ret_val:
            return ret_val
        return {"error_message": "Failed to update ruleset ID {}.".format(ruleset_id)}, 500


@POLICY_NS.route('/ruleset/<ruleset_id>')
class DeleteRuleSet(Resource):

    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(200, 'SuccessMessage', COMMON_SUCCESS_MESSAGE)
    @operator_required
    def delete(self, ruleset_id: str) -> Response:
        rules_deleted = mongo_rule().delete_many({'rule_set_id': ruleset_id})
        if rules_deleted:
            ret_val = mongo_ruleset().delete_one({'_id': ruleset_id})
            if ret_val.deleted_count == 1:
                return {"success_message": "Successfully deleted rule set."}
        return {"error_message": "Failed to delete ruleset ID {}.".format(ruleset_id)}, 500


upload_parser = POLICY_NS.parser()
upload_parser.add_argument('upload_file', location='files',
                           type=FileStorage, required=True)
upload_parser.add_argument('ruleSetForm', type=str, required=True, location='form',
                           help='JSON String of the RuleSet Model.  Copy and paste it here.')


@POLICY_NS.route('/rule/upload')
class UploadRule(Resource):

    @POLICY_NS.doc(description="Uploads large rule files.  Uploading them as ZIP is highly recommend for rulesets larger than 10 MB.")
    @POLICY_NS.expect(upload_parser)
    @POLICY_NS.response(200, 'Rules', [RuleModel.DTO])
    @POLICY_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    def post(self) -> Response:
        rule_set = json.loads(request.form['ruleSetForm'], encoding="utf-8")
        if 'upload_file' not in request.files:
            return {"error_message": "Failed to upload file. No file was found in the request."}, 400

        by_pass_validation = rule_set.get('byPassValidation', False)
        rule_set = mongo_ruleset().find_one({'_id': rule_set['_id']})
        rule_or_rules = []
        if rule_set:
            rule_set_file = request.files['upload_file']
            filename = secure_filename(rule_set_file.filename)
            with tempfile.TemporaryDirectory() as export_path:
                abs_save_path = str(export_path) + '/' + filename
                rule_set_file.save(abs_save_path)
                try:
                    if does_file_have_ext(abs_save_path, '.zip'):
                        rule_or_rules = process_zipfile(
                            export_path, abs_save_path, rule_set, by_pass_validation=by_pass_validation)
                    else:
                        rule_or_rules = create_rule_from_file(
                            Path(abs_save_path), rule_set, by_pass_validation=by_pass_validation)
                except InvalidRuleSyntax as e:
                    logger.error(str(e))
                    errormsg = "Error loading rulesets: Duplicate or invalid rulesets detected: "
                    loglocationmsg = "see /var/log/tfplenum/tfplenum.log for more detail"
                    return {"error_message": errormsg + loglocationmsg}, 422
                except ProhibitedExecFunc as e:
                    return {"error_message": str(e)}, 403
        if rule_or_rules:
            if not isinstance(rule_or_rules, list):
                return [rule_or_rules]
            return rule_or_rules
        else:
            return {"error_message": "Failed to upload rules file for an unknown reason."}, 500


@POLICY_NS.route('/rule')
class RulesCtrl(Resource):

    @POLICY_NS.doc(description="Saves a new Rule.")
    @POLICY_NS.response(200, 'Rule', RuleModel.DTO)
    @POLICY_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(403, 'ErrorMessage')
    @POLICY_NS.expect(RuleModel.DTO)
    @operator_required
    def post(self) -> Response:
        rule = request.get_json()
        rule["_id"] = uuid.uuid4().hex
        ruleset_id = rule["rule_set_id"]
        by_pass_validation = rule['byPassValidation']
        rule_set = mongo_ruleset().find_one({'_id': ruleset_id})
        error_output = None
        if rule_set:
            rule_type = rule_set['appType']
            is_valid = False
            error_output = ""

            if check_zeek_exec_module(rule_type, rule['rule']):
                return {"error_message": "Exec module prohibited"}, 403

            if by_pass_validation:
                is_valid = True
            else:
                if rule_type == RULE_TYPES[0]:
                    is_valid, error_output = validate_suricata_rule(rule)
                elif rule_type == RULE_TYPES[1]:
                    is_valid, error_output = validate_zeek_script(rule)
                elif rule_type == RULE_TYPES[2]:
                    is_valid, error_output = validate_zeek_intel(rule)
                elif rule_type == RULE_TYPES[3]:
                    is_valid, error_output = validate_zeek_signature(rule)

            if is_valid:
                del rule["byPassValidation"]
                rule = create_rule_service(rule, ruleset_id)
                mongo_ruleset().update_one({'_id': ruleset_id}, {
                    "$set": {"state": RULESET_STATES[1]}})
                if rule:
                    return rule
            elif error_output:
                return {"error_message": error_output.split('\n')}, 400
        return {"error_message": "Failed to create a rule for ruleset ID {}.".format(ruleset_id)}, 500

    @POLICY_NS.doc(description="Updates an exiting Rule.")
    @POLICY_NS.expect(RuleModel.DTO)
    @POLICY_NS.response(200, 'Rule', RuleModel.DTO)
    @POLICY_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(403, 'ErrorMessage')
    @operator_required
    def put(self) -> Response:
        rule = request.get_json()
        ruleset_id = rule["rule_set_id"]
        id_to_modify = rule['_id']
        by_pass_validation = rule['byPassValidation']

        rule_set = mongo_ruleset().find_one({'_id': ruleset_id})
        if rule_set:
            rule_type = rule_set['appType']
            is_valid = False

            if check_zeek_exec_module(rule_type, rule['rule']):
                return {"error_message": "Exec module prohibited"}, 403

            if by_pass_validation:
                is_valid = True
            else:
                if rule_type == RULE_TYPES[0]:
                    is_valid, error_output = validate_suricata_rule(rule)
                elif rule_type == RULE_TYPES[1]:
                    is_valid, error_output = validate_zeek_script(rule)
                elif rule_type == RULE_TYPES[2]:
                    is_valid, error_output = validate_zeek_intel(rule)
                elif rule_type == RULE_TYPES[3]:
                    is_valid, error_output = validate_zeek_signature(rule)

            if is_valid:
                del rule["byPassValidation"]
                dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
                rule['lastModifiedDate'] = dt_string
                rule = mongo_rule().find_one_and_update({'_id': id_to_modify},
                                                        {"$set": rule},
                                                        projection={
                                                            "rule": False},
                                                        return_document=ReturnDocument.AFTER)
                if rule:
                    rule_set = mongo_ruleset().find_one_and_update({'_id': ruleset_id},
                                                                   {'$set': {"state": RULESET_STATES[1],
                                                                             "lastModifiedDate": dt_string}},
                                                                   return_document=ReturnDocument.AFTER)
                    if rule_set:
                        return rule
            else:
                return {"error_message": error_output.split('\n')}, 400
        return {"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)}, 500


@POLICY_NS.route('/rule/<rule_id>')
class DeleteRule(Resource):

    @POLICY_NS.doc(description="Deletes a Rule by id.")
    @POLICY_NS.response(200, 'SuccessMessage', COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @operator_required
    def delete(self, rule_id: str) -> Response:
        ret_val = mongo_rule().delete_one(
            {'_id': rule_id})  # type: DeleteResult
        if ret_val.deleted_count == 1:
            return {"success_message": "Successfully deleted rule ID {} from the rule set.".format(rule_id)}
        return {"error_message": "Failed to delete a rule for ruleset ID {}.".format(rule_id)}, 500


@POLICY_NS.route('/rule/<rule_id>/toggle')
class ToggleRule(Resource):

    @POLICY_NS.doc(description="Enables or disables a rule without validating the rule for the quick checkboxes.")
    @POLICY_NS.response(200, 'Rule', RuleModel.DTO)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @operator_required
    def put(self, rule_id: str) -> Response:
        rule = mongo_rule().find_one({'_id': rule_id},
                                     projection={"rule": False})
        ruleset_id = rule["rule_set_id"]
        dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
        rule['lastModifiedDate'] = dt_string
        rule['isEnabled'] = not rule['isEnabled']
        rule = mongo_rule().find_one_and_update({'_id': rule_id},
                                                {'$set': rule},
                                                projection={"rule": False},
                                                return_document=ReturnDocument.AFTER)
        if rule:
            rule_set = mongo_ruleset().find_one_and_update({'_id': ruleset_id},
                                                           {'$set': {"state": RULESET_STATES[1],
                                                                     "lastModifiedDate": dt_string}},
                                                           return_document=ReturnDocument.AFTER)
            if rule_set:
                return rule
        return {"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)}, 500


@POLICY_NS.doc(description="Syncs Rulesets ")
@POLICY_NS.route('/rulesets/sync')
class SyncRuleSets(Resource):

    def _perform_operation(self):
        job = perform_rulesync.delay()
        return JobID(job).to_dict()

    @POLICY_NS.response(200, 'JobID', JobID.DTO)
    @operator_required
    def post(self) -> Response:
        return self._perform_operation()

    @POLICY_NS.response(200, 'JobID', JobID.DTO)
    @operator_required
    def get(self) -> Response:
        return self._perform_operation()


@POLICY_NS.route('/rule/validate')
class ValidateRule(Resource):

    @POLICY_NS.doc(description="Validates a Rule.")
    @POLICY_NS.expect(RuleModel.DTO)
    @POLICY_NS.response(200, 'SuccessMessage', COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.response(403, 'ErrorMessage')
    @operator_required
    def post(self) -> Response:
        rule = request.get_json()
        rule_set = mongo_ruleset().find_one({"_id": rule['rule_set_id']})
        rule_type = rule_set['appType']
        error_output = "Unknown Error"

        if check_zeek_exec_module(rule_type, rule['rule']):
            return {"error_message": "Exec module prohibited"}, 403

        if rule_type == RULE_TYPES[0]:
            is_success, error_output = validate_suricata_rule(rule)
            if is_success:
                return {"success_message": "Suricata signatures successfully validated!"}
        elif rule_type == RULE_TYPES[1]:
            is_success, error_output = validate_zeek_script(rule)
            if is_success:
                return {"success_message": "Zeek script successfully validated!"}
        elif rule_type == RULE_TYPES[2]:
            is_success, error_output = validate_zeek_intel(rule)
            if is_success:
                return{"success_message": "Zeek intel successfully validated!"}
        elif rule_type == RULE_TYPES[3]:
            is_success, error_output = validate_zeek_signature(rule)
            if is_success:
                return {"success_message": "Zeek signature successfully validated!"}
        return {"error_message": error_output}, 500


@POLICY_NS.route('/pcap/rule/test')
class TestRuleAgainstPCAP(Resource):

    @POLICY_NS.doc(description="Tests a PCAP against passed in rule content.")
    @POLICY_NS.response(200, 'Message', COMMON_MESSAGE)
    @POLICY_NS.response(501, 'ErrorMessage')
    @POLICY_NS.response(500, 'ErrorMessage')
    @POLICY_NS.response(403, 'ErrorMessage')
    @POLICY_NS.expect(TestAgainstPcap.DTO)
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        pcap_name = secure_filename(payload["pcap_name"])
        rule_content = payload['rule_content']
        rule_type = payload['ruleType']

        if pcap_name == '' or rule_content == '':
            r = Response()
            r.status_code = 501
            return r

        if check_zeek_exec_module(rule_type, rule_content):
            return {"error_message": "Exec module prohibited"}, 403

        if rule_type == RULE_TYPES[0]:
            return test_pcap_against_suricata_rule(pcap_name, rule_content)
        elif rule_type == RULE_TYPES[1]:
            return test_pcap_against_zeek_script(pcap_name, rule_content)
        elif rule_type == RULE_TYPES[2]:
            return test_pcap_against_zeek_intel(pcap_name, rule_content)
        elif rule_type == RULE_TYPES[3]:
            return test_pcap_against_zeek_signature(pcap_name, rule_content)

        return ERROR_RESPONSE
