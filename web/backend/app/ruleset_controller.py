import os
import tempfile
import json
import uuid

from app import (app, conn_mng, POLICY_NS, api)
from app.utils.logging import logger
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.middleware import operator_required
from app.models.common import (JobID, COMMON_ERROR_DTO, COMMON_ERROR_MESSAGE,
                               COMMON_SUCCESS_MESSAGE, COMMON_MESSAGE)
from app.models.ruleset import RuleSetModel, RuleModel, TestAgainstPcap
from app.service.job_service import run_command2
from app.service.rulesync_service import perform_rulesync
from app.utils.utils import tar_folder, zip_folder
from datetime import datetime
from flask import jsonify, request, Response, send_file
from flask_restx import Resource
from io import StringIO
from pathlib import Path
from pymongo import ReturnDocument
from pymongo.cursor import Cursor
from pymongo.results import InsertOneResult, DeleteResult
from app.utils.constants import (RULESET_STATES, DATE_FORMAT_STR,
                              PCAP_UPLOAD_DIR, SURICATA_IMAGE_VERSION,
                              RULE_TYPES, ZEEK_IMAGE_VERSION,
                              ZEEK_SCRIPT_DIR, ZEEK_SIG_PATH, ZEEK_INTEL_PATH)
from typing import Dict, Tuple, List, Union
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from zipfile import ZipFile

CHUNK_SIZE = 5000000

class InvalidRuleSyntax(Exception):
    pass

@POLICY_NS.route('/rules/<rule_set_id>')
class Rules(Resource):

    @POLICY_NS.doc(description="Returns a list of all the saved Rules based on the RuleSet ID passed in.")
    @POLICY_NS.response(200, 'Rules', [RuleModel.DTO])
    def get(self, rule_set_id: str) -> Response:
        rules = conn_mng.mongo_rule.find({'rule_set_id': rule_set_id}, projection={"rule": False})
        return list(rules)

@POLICY_NS.route('/rule/<rule_id>/content')
class RuleContent(Resource):

    @POLICY_NS.doc(description="Gets the content for a single Rule by its ID.")
    @POLICY_NS.response(200, 'Rules', RuleModel.DTO)
    @POLICY_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    def get(self, rule_id: str) -> Response:
        rule = conn_mng.mongo_rule.find_one({'_id': rule_id})
        if rule:
            return rule
        return {"error_message": "Failed to find rule content for rule ID {}.".format(rule_id)}, 400

def create_ruleset_service(ruleset: Dict) -> InsertOneResult:
    ruleset['state'] = RULESET_STATES[0]
    ruleset["_id"] = uuid.uuid4().hex
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    ruleset['createdDate'] = dt_string
    ruleset['lastModifiedDate'] = dt_string
    ret_val = conn_mng.mongo_ruleset.insert_one(ruleset)
    return ret_val

def create_rule_service(rule: Dict, ruleset_id: str, projection={"rule": False}) -> Dict:
    rule["_id"] = uuid.uuid4().hex
    rule["rule_set_id"] = ruleset_id
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    rule['createdDate'] = dt_string
    rule['lastModifiedDate'] = dt_string
    ret_val = conn_mng.mongo_rule.insert_one(rule)
    return conn_mng.mongo_rule.find_one({'_id': ret_val.inserted_id}, projection=projection)

def create_rule_srv_wrapper(rule_set: Dict,
                rule_name: str,
                rule_content: str,
                is_enabled:bool=True,
                ignore_errors:bool=False,
                by_pass_validation:bool=False):
    rule = {
        "ruleName": rule_name,
        "rule": rule_content,
        "isEnabled": is_enabled
    }
    rule_set_id = rule_set["_id"]
    rule_type = rule_set['appType']
    is_valid = False
    error_output = "Unsupported rule type."
    if by_pass_validation:
        is_valid = True
    else:
        if rule_type == RULE_TYPES[0]:
            is_valid, error_output = _validate_suricata_rule(rule)
        elif rule_type == RULE_TYPES[1]:
            is_valid, error_output = _validate_zeek_script(rule)
        elif rule_type == RULE_TYPES[2]:
            is_valid, error_output = _validate_zeek_intel(rule)
        elif rule_type == RULE_TYPES[3]:
            is_valid, error_output = _validate_zeek_signature(rule)

    is_valid = True
    if is_valid:
        return create_rule_service(rule, rule_set_id)

    if not ignore_errors:
        raise InvalidRuleSyntax(list(filter(None, error_output.split('\n'))))


def _get_file_name(filename: str, count: int) -> str:
    pos = filename.rfind('.')
    return "{}_{}{}".format(filename[0:pos], count, filename[pos:])

def create_rule_from_file(path: Path, rule_set: Dict, ignore_errors:bool=False, by_pass_validation:bool=False) -> Union[Dict, List[Dict]]:
    # If the file is greater than 5 MB we need to split up the file into smaller pieces
    if path.stat().st_size > CHUNK_SIZE:
        partial_rule = StringIO()
        count = 1
        ret_val = []
        with path.open() as f:
            for line in f.readlines():
                partial_rule.write(line)
                if partial_rule.tell() >= CHUNK_SIZE:
                    filename = _get_file_name(path.name, count)
                    ret_val.append(create_rule_srv_wrapper(rule_set, filename, partial_rule.getvalue(), ignore_errors=ignore_errors, by_pass_validation=by_pass_validation))
                    partial_rule = StringIO()
                    count += 1
        return ret_val
    else:
        with path.open() as f:
            return [create_rule_srv_wrapper(rule_set, path.name, f.read(), ignore_errors=ignore_errors)]

@POLICY_NS.route('/ruleset')
class Rulesets(Resource):

    @POLICY_NS.doc(description="Returns a list of all the saved RuleSets defined on the RuleSet Page.")
    @POLICY_NS.response(200, 'RuleSets', [RuleSetModel.DTO])
    def get(self) -> Response:
        rule_sets = conn_mng.mongo_ruleset.find({}) # type: Cursor
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
        ruleset['lastModifiedDate'] = datetime.utcnow().strftime(DATE_FORMAT_STR)
        ret_val = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id},
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
        rules_deleted = conn_mng.mongo_rule.delete_many({'rule_set_id': ruleset_id})
        if rules_deleted:
            ret_val = conn_mng.mongo_ruleset.delete_one({'_id': ruleset_id})
            if ret_val.deleted_count == 1:
                return {"success_message": "Successfully deleted rule set."}
        return {"error_message": "Failed to delete ruleset ID {}.".format(ruleset_id)}, 500

def _validate_suricata_rule(rule: Dict) -> Tuple[bool, str]:
    with tempfile.TemporaryDirectory() as tmpdirname:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = conn_mng.mongo_rule.find_one({"_id": rule["_id"]})['rule']

        filename = '{}/suricata.rules'.format(tmpdirname)
        if isinstance(the_rule, str):
            with Path(filename).open('w') as fp:
                fp.write(the_rule)
        else:
            the_rule.save(filename)
            the_rule.stream.seek(0)

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/suricata:{}".format(SURICATA_IMAGE_VERSION)
        cmd = ("docker run --rm "
               "-v {tmp_dir}:/etc/suricata/rules/ localhost:5000/tfplenum/suricata:{version} "
               "suricata -c /etc/suricata/suricata.yaml -T").format(tmp_dir=tmpdirname,
                                                                    version=SURICATA_IMAGE_VERSION)

        stdout, ret_val = run_command2(pull_docker_cmd, use_shell=True)
        if ret_val == 0:
            stdout, ret_val = run_command2(cmd, use_shell=True)
            if ret_val == 0:
                return True, ""

    return False, stdout

def _validate_zeek_script(rule: Dict) -> Tuple[bool, str]:
    with tempfile.TemporaryDirectory() as tmpdirname:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = conn_mng.mongo_rule.find_one({"_id": rule["_id"]})['rule']

        filename = "custom.zeek"
        filepath = '{}/{}'.format(tmpdirname, filename)
        if isinstance(the_rule, str):
            with Path(filepath).open('w') as fp:
                fp.write(the_rule)
        else:
            the_rule.save(filepath)
            the_rule.stream.seek(0)

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(ZEEK_IMAGE_VERSION)
        stdoutput, ret_val = run_command2(pull_docker_cmd, use_shell=True)
        if ret_val == 0:
            cmd = ("docker run --rm "
                "-v {tmp_dir}:{script_dir} localhost:5000/tfplenum/zeek:{version} "
                "-S {script_dir}/{file_to_test}").format(tmp_dir=tmpdirname,
                                            version=ZEEK_IMAGE_VERSION,
                                            script_dir=ZEEK_SCRIPT_DIR,
                                            file_to_test=filename)

            stdoutput, ret_val = run_command2(cmd, use_shell=True)
            if ret_val == 0:
                return True, ""

    return False, stdoutput

def _validate_zeek_intel(rule: Dict) -> Tuple[bool, str]:
    pcap_name = "wannacry.pcap"
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = conn_mng.mongo_rule.find_one({"_id": rule["_id"]})['rule']

        filename = "local.zeek"
        filepath = '{}/{}'.format(rules_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write("@load frameworks/intel/seen\nredef Intel::read_files += { \"/opt/tfplenum/zeek/intel.dat\" };")

        Intel_Name = "intel.dat"
        Intel_Path = '{}/{}'.format(rules_tmp_dir, Intel_Name)
        with Path(Intel_Path).open('w') as fp:
            fp.write(the_rule)
	        #"1.2.3.4 Intel::ADDR     source1 Sending phishing email  http://source1.com/badhosts/1.2.3.4\n"
	        #"a.b.com Intel::DOMAIN   source2 Name used for data exfiltration -")

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(ZEEK_IMAGE_VERSION)
        cmd = ("docker run --rm "
               "-v {tmp_dir}/{file_to_test}:{script_dir}/{file_to_test} "
               "-v {tmp_dir}/{Intel_File}:{script_dir}/{Intel_File} "
               "-v {pcap_dir}/{Pcap_Name}:/pcaps/{Pcap_Name} "
               "-w /data/ "
               "localhost:5000/tfplenum/zeek:{version} "
               "-r /pcaps/{Pcap_Name} {script_dir}/{file_to_test}").\
               format(file_to_test=filename,
                      Intel_File=Intel_Name,
                      pcap_dir=PCAP_UPLOAD_DIR,
                      Pcap_Name=pcap_name,
                      script_dir=ZEEK_INTEL_PATH,
                      tmp_dir=rules_tmp_dir,
                      version=ZEEK_IMAGE_VERSION)
        stdoutput, ret_val = run_command2(pull_docker_cmd, use_shell=True)
        if ret_val == 0:
            stdoutput, ret_val = run_command2(cmd, use_shell=True)

            if stdoutput == '':
                return True, ""

    return False, stdoutput

def _validate_zeek_signature(rule: Dict) -> Tuple[bool, str]:
    with tempfile.TemporaryDirectory() as tmpdirname:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = conn_mng.mongo_rule.find_one({"_id": rule["_id"]})['rule']

        filename = "custom.sig"
        filepath = '{}/{}'.format(tmpdirname, filename)
        if isinstance(the_rule, str):
            with Path(filepath).open('w') as fp:
                fp.write(the_rule)
        else:
            the_rule.save(filepath)
            the_rule.stream.seek(0)

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(ZEEK_IMAGE_VERSION)
        stdoutput, ret_val = run_command2(pull_docker_cmd, use_shell=True)
        if ret_val == 0:
            cmd = ("docker run --rm "
                "-v {tmp_dir}:{sig_path} localhost:5000/tfplenum/zeek:{version} "
                "-s {sig_path}").format(tmp_dir=filepath,
                                            version=ZEEK_IMAGE_VERSION,
                                            sig_path=ZEEK_SIG_PATH)
            stdoutput, ret_val = run_command2(cmd, use_shell=True)
            if ret_val == 0:
                return True, ""

    return False, stdoutput

def does_file_have_ext(some_path: str, extension: str) -> bool:
    pos = some_path.rfind(".")
    file_ext = some_path[pos:]
    return file_ext.lower() == extension

def _process_zipfile(export_path: str, some_zip: str, rule_set: Dict, by_pass_validation:bool=False) -> List[Dict]:
    ret_val = []
    with ZipFile(some_zip) as f:
        f.extractall(export_path)
    for root, dirs, files in os.walk(export_path):
        for file_path in files:
            abs_path = root + "/" + file_path
            if does_file_have_ext(abs_path, '.txt') or does_file_have_ext(abs_path, '.rules'):
                rule_or_rules = create_rule_from_file(Path(abs_path), rule_set, by_pass_validation=by_pass_validation)
                if isinstance(rule_or_rules, list):
                    ret_val += rule_or_rules
                else:
                    ret_val.append(rule_or_rules)
    return ret_val

upload_parser = api.parser()
upload_parser.add_argument('upload_file', location='files',
                           type=FileStorage, required=True)
upload_parser.add_argument('ruleSetForm', type=str, required=True, location='form',
                           help='JSON String of the RuleSet Model.  Copy and paste it here.')

@POLICY_NS.route('/rule/upload')
class UploadRule(Resource):

    @POLICY_NS.doc(description="Uploads large rule files.  Uploading them as ZIP is highly recommend for rulesets larger than 10 MB.")
    @POLICY_NS.expect(upload_parser)
    @POLICY_NS.response(200, 'Rules', [RuleModel.DTO])
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    def post(self) -> Response:
        rule_set = json.loads(request.form['ruleSetForm'], encoding="utf-8")
        if 'upload_file' not in request.files:
            return {"error_message": "Failed to upload file. No file was found in the request."}

        by_pass_validation = rule_set.get('byPassValidation', False)
        rule_set = conn_mng.mongo_ruleset.find_one({'_id': rule_set['_id']})
        if rule_set:
            rule_set_file = request.files['upload_file']
            filename = secure_filename(rule_set_file.filename)

            with tempfile.TemporaryDirectory() as export_path:
                abs_save_path = str(export_path) + '/' + filename
                rule_set_file.save(abs_save_path)
                try:
                    if does_file_have_ext(abs_save_path, '.zip'):
                        rule_or_rules = _process_zipfile(export_path, abs_save_path, rule_set, by_pass_validation=by_pass_validation)
                    else:
                        rule_or_rules = create_rule_from_file(Path(abs_save_path), rule_set, by_pass_validation=by_pass_validation)
                except InvalidRuleSyntax as e:
                    logger.error(str(e))
                    return {"error_message": str(e)}
        if rule_or_rules:
            if not isinstance(rule_or_rules, list):
                return [rule_or_rules]
            return rule_or_rules
        else:
            return {"error_message": "Failed to upload rules file for an unknown reason."}

@POLICY_NS.route('/rule')
class RulesCtrl(Resource):

    @POLICY_NS.doc(description="Saves a new Rule.")
    @POLICY_NS.response(200, 'Rule', RuleModel.DTO)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @POLICY_NS.expect(RuleModel.DTO)
    @operator_required
    def post(self) -> Response:
        rule = request.get_json()
        rule["_id"] = uuid.uuid4().hex
        ruleset_id = rule["rule_set_id"]
        by_pass_validation = rule['byPassValidation']
        rule_set = conn_mng.mongo_ruleset.find_one({'_id': ruleset_id})
        error_output = None
        if rule_set:
            rule_type = rule_set['appType']
            is_valid = False
            error_output = ""

            if by_pass_validation:
                is_valid = True
            else:
                if rule_type == RULE_TYPES[0]:
                    is_valid, error_output = _validate_suricata_rule(rule)
                elif rule_type == RULE_TYPES[1]:
                    is_valid, error_output = _validate_zeek_script(rule)
                elif rule_type == RULE_TYPES[2]:
                    is_valid, error_output = _validate_zeek_intel(rule)
                elif rule_type == RULE_TYPES[3]:
                    is_valid, error_output = _validate_zeek_signature(rule)

            if is_valid:
                del rule["byPassValidation"]
                rule = create_rule_service(rule, ruleset_id)
                conn_mng.mongo_ruleset.update_one({'_id': ruleset_id}, {"$set": {"state": RULESET_STATES[1]}})
                if rule:
                    return rule
            elif error_output:
                return {"error_message": error_output.split('\n')}
        return {"error_message": "Failed to create a rule for ruleset ID {}.".format(ruleset_id)}

    @POLICY_NS.doc(description="Updates an exiting Rule.")
    @POLICY_NS.expect(RuleModel.DTO)
    @POLICY_NS.response(200, 'Rule', RuleModel.DTO)
    @operator_required
    def put(self) -> Response:
        rule = request.get_json()
        ruleset_id = rule["rule_set_id"]
        id_to_modify = rule['_id']
        by_pass_validation = rule['byPassValidation']

        rule_set = conn_mng.mongo_ruleset.find_one({'_id': ruleset_id})
        if rule_set:
            rule_type = rule_set['appType']
            is_valid = False

            if by_pass_validation:
                is_valid = True
            else:
                if rule_type == RULE_TYPES[0]:
                    is_valid, error_output = _validate_suricata_rule(rule)
                elif rule_type == RULE_TYPES[1]:
                    is_valid, error_output = _validate_zeek_script(rule)
                elif rule_type == RULE_TYPES[2]:
                    is_valid, error_output = _validate_zeek_intel(rule)
                elif rule_type == RULE_TYPES[3]:
                    is_valid, error_output = _validate_zeek_signature(rule)

            if is_valid:
                del rule["byPassValidation"]
                dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
                rule['lastModifiedDate'] = dt_string
                rule = conn_mng.mongo_rule.find_one_and_update({'_id': id_to_modify},
                                                            {"$set": rule},
                                                            projection={"rule": False},
                                                            return_document=ReturnDocument.AFTER)
                if rule:
                    rule_set = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id},
                                                                        {'$set': { "state": RULESET_STATES[1],
                                                                                    "lastModifiedDate": dt_string }},
                                                                        return_document=ReturnDocument.AFTER)
                    if rule_set:
                        return rule
            else:
                return {"error_message": error_output.split('\n')}
        return {"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)}

@POLICY_NS.route('/rule/<rule_id>')
class DeleteRule(Resource):

    @POLICY_NS.doc(description="Deletes a Rule by id.")
    @POLICY_NS.response(200, 'SuccessMessage', COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @operator_required
    def delete(self, rule_id: str) -> Response:
        ret_val = conn_mng.mongo_rule.delete_one({'_id': rule_id})  # type: DeleteResult
        if ret_val.deleted_count == 1:
            return {"success_message": "Successfully deleted rule ID {} from the rule set.".format(rule_id)}
        return {"error_message": "Failed to delete a rule for ruleset ID {}.".format(rule_id)}, 500

@POLICY_NS.route('/rule/<rule_id>/toggle')
class ToggleRule(Resource):

    @POLICY_NS.doc(description="Enables or disables a rule without validating the rule for the quick checkboxes.")
    @POLICY_NS.response(200, 'Rule', RuleModel.DTO)
    @POLICY_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @operator_required
    def put(self, rule_id: str) -> Response:
        rule = conn_mng.mongo_rule.find_one({'_id': rule_id},
                                            projection={"rule": False})
        ruleset_id = rule["rule_set_id"]
        dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
        rule['lastModifiedDate'] = dt_string
        rule['isEnabled'] = not rule['isEnabled']
        rule = conn_mng.mongo_rule.find_one_and_update({'_id': rule_id},
                                                       {'$set': rule},
                                                       projection={"rule": False},
                                                       return_document=ReturnDocument.AFTER)
        if rule:
            rule_set = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id},
                                                                  {'$set': {"state": RULESET_STATES[1],
                                                                            "lastModifiedDate": dt_string }},
                                                                  return_document=ReturnDocument.AFTER)
            if rule_set:
                return rule
        return {"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)}, 400

@POLICY_NS.doc(description="Syncs Rulesets ")
@POLICY_NS.route('/rulesets/sync')
class SyncRuleSets(Resource):

    def _perform_operation(self):
        job = perform_rulesync.delay()
        return JobID(job).to_dict()

    @POLICY_NS.response(200, 'JobID', JobID.DTO)
    @operator_required
    def post(self):
        return self._perform_operation()

    @POLICY_NS.response(200, 'JobID', JobID.DTO)
    @operator_required
    def get(self):
        return self._perform_operation()

@POLICY_NS.route('/rule/validate')
class ValidateRule(Resource):

    @POLICY_NS.doc(description="Validates a Rule.")
    @POLICY_NS.expect(RuleModel.DTO)
    @POLICY_NS.response(200, 'SuccessMessage', COMMON_SUCCESS_MESSAGE)
    @POLICY_NS.response(500, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @operator_required
    def post(self) -> Response:
        rule = request.get_json()
        rule_set = conn_mng.mongo_ruleset.find_one({"_id": rule['rule_set_id']})
        rule_type = rule_set['appType']

        error_output = "Unknown Error"
        if rule_type == RULE_TYPES[0]:
            is_success, error_output = _validate_suricata_rule(rule)
            if is_success:
                return jsonify({"success_message": "Suricata signatures successfully validated!"})
        elif rule_type == RULE_TYPES[1]:
            is_success, error_output = _validate_zeek_script(rule)
            if is_success:
                return jsonify({"success_message": "Zeek script successfully validated!"})
        elif rule_type == RULE_TYPES[2]:
            is_success, error_output = _validate_zeek_intel(rule)
            if is_success:
                return jsonify({"success_message": "Zeek intel successfully validated!"})
        elif rule_type == RULE_TYPES[3]:
            is_success, error_output = _validate_zeek_signature(rule)
            if is_success:
                return jsonify({"success_message": "Zeek signature successfully validated!"})
        return {"error_message": error_output}, 500

def _test_pcap_against_suricata_rule(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = '{}/suricata.rules'.format(rules_tmp_dir)
        with Path(filename).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/suricata:{}".format(SURICATA_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {rules_dir}:/etc/suricata/rules/ "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/var/log/suricata/ "
                   "localhost:5000/tfplenum/suricata:{version} "
                   "-c /etc/suricata/suricata.yaml --set stats.enabled=true -r /pcaps/{pcap_name} -l /var/log/suricata/")\
                    .format(rules_dir=rules_tmp_dir,
                            pcap_dir=PCAP_UPLOAD_DIR,
                            results_dir=results_tmp_dir,
                            pcap_name=pcap_name,
                            version=SURICATA_IMAGE_VERSION)
            output, ret_val = run_command2(pull_docker_cmd, use_shell=True)
            if ret_val == 0:
                output, ret_val = run_command2(cmd, use_shell=True)
                if ret_val == 0:
                    results = Path(results_tmp_dir)
                    for results_path in results.glob("eve-*"):
                        return send_file(str(results_path))

    return jsonify({"error_message": output}), 400

def _test_pcap_against_zeek_script(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = "custom.zeek"
        filepath = '{}/{}'.format(rules_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(ZEEK_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {tmp_dir}:{script_dir} "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/data/ "
                   "-w /data/ "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-r /pcaps/{pcap_name} {script_dir}/{file_to_test}").format(tmp_dir=rules_tmp_dir,
                                                                        pcap_dir=PCAP_UPLOAD_DIR,
                                                                        version=ZEEK_IMAGE_VERSION,
                                                                        script_dir=ZEEK_SCRIPT_DIR,
                                                                        pcap_name=pcap_name,
                                                                        results_dir=results_tmp_dir,
                                                                        file_to_test=filename)
            stdoutput, ret_val = run_command2(pull_docker_cmd, use_shell=True)
            if ret_val == 0:
                stdoutput, ret_val = run_command2(cmd, use_shell=True)
                if stdoutput != '':
                    with Path(results_tmp_dir + '/stdout.log').open('w') as output:
                        output.write(stdoutput)

                if ret_val == 0:
                    with tempfile.TemporaryDirectory() as output_dir:
                        results_tar_ball = output_dir + "/results"
                        zip_folder(results_tmp_dir, results_tar_ball)
                        return send_file(results_tar_ball + ".zip", mimetype="application/zip")

    return jsonify({"error_message": stdoutput}), 400


def _test_pcap_against_zeek_intel(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = "local.zeek"
        filepath = '{}/{}'.format(rules_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write("@load frameworks/intel/seen\nredef Intel::read_files += { \"/opt/tfplenum/zeek/intel.dat\" };")

        Intel_Name = "intel.dat"
        Intel_Path = '{}/{}'.format(rules_tmp_dir, Intel_Name)
        with Path(Intel_Path).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(ZEEK_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {tmp_dir}/{file_to_test}:{script_dir}/{file_to_test} "
                   "-v {tmp_dir}/{Intel_File}:{script_dir}/{Intel_File} "
                   "-v {pcap_dir}/{Pcap_Name}:/pcaps/{Pcap_Name} "
                   "-v {results_dir}/:/data/ "
                   "-w /data/ "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-r /pcaps/{Pcap_Name} "
                   "{script_dir}/{file_to_test}").\
                   format(file_to_test=filename,
                          Intel_File=Intel_Name,
                          pcap_dir=PCAP_UPLOAD_DIR,
                          Pcap_Name=pcap_name,
                          results_dir=results_tmp_dir,
                          script_dir=ZEEK_INTEL_PATH,
                          tmp_dir=rules_tmp_dir,
                          version=ZEEK_IMAGE_VERSION)
            stdoutput, ret_val = run_command2(pull_docker_cmd, use_shell=True)
            if ret_val == 0:
                stdoutput, ret_val = run_command2(cmd, use_shell=True)
                if stdoutput != '':
                    with Path(rules_tmp_dir + '/stdout.log').open('w') as output:
                        output.write(stdoutput)

                if ret_val == 0:
                    with tempfile.TemporaryDirectory() as output_dir:
                        results_tar_ball = output_dir + "/results"
                        zip_folder(results_tmp_dir, results_tar_ball)
                        return send_file(results_tar_ball + ".zip", mimetype="application/zip")

    return jsonify({"error_message": stdoutput}), 400

def _test_pcap_against_zeek_signature(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as sigs_tmp_dir:
        filename = "custom.sig"
        filepath = '{}/{}'.format(sigs_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(ZEEK_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {tmp_dir}:{sig_path} "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/data/ "
                   "-w /data/ "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-r /pcaps/{pcap_name} -s {sig_path}").format(tmp_dir=filepath,
                                                                        pcap_dir=PCAP_UPLOAD_DIR,
                                                                        version=ZEEK_IMAGE_VERSION,
                                                                        sig_path=ZEEK_SIG_PATH,
                                                                        pcap_name=pcap_name,
                                                                        results_dir=results_tmp_dir,
                                                                        file_to_test=filename)
            stdoutput, ret_val = run_command2(pull_docker_cmd, use_shell=True)
            if ret_val == 0:
                stdoutput, ret_val = run_command2(cmd, use_shell=True)
                if stdoutput != '':
                    with Path(results_tmp_dir + '/stdout.log').open('w') as output:
                        output.write(stdoutput)

                if ret_val == 0:
                    with tempfile.TemporaryDirectory() as output_dir:
                        results_tar_ball = output_dir + "/results"
                        zip_folder(results_tmp_dir, results_tar_ball)
                        return send_file(results_tar_ball + ".zip", mimetype="application/zip")

    return jsonify({"error_message": stdoutput}), 400

@POLICY_NS.route('/pcap/rule/test')
class TestRuleAgainstPCAP(Resource):

    @POLICY_NS.doc(description="Tests a PCAP against passed in rule content.")
    @POLICY_NS.response(200, 'Message', COMMON_MESSAGE)
    @POLICY_NS.response(501, 'ErrorMessage')
    @POLICY_NS.response(500, 'ErrorMessage')
    @POLICY_NS.expect(TestAgainstPcap.DTO)
    @operator_required
    def post(self) -> Response:
        payload = request.get_json()
        pcap_name = payload["pcap_name"]
        rule_content = payload['rule_content']
        rule_type = payload['ruleType']

        if pcap_name == '' or rule_content == '':
            r = Response()
            r.status_code = 501
            return r

        if rule_type == RULE_TYPES[0]:
            return _test_pcap_against_suricata_rule(pcap_name, rule_content)
        elif rule_type == RULE_TYPES[1]:
            return _test_pcap_against_zeek_script(pcap_name, rule_content)
        elif rule_type == RULE_TYPES[2]:
            return _test_pcap_against_zeek_intel(pcap_name, rule_content)
        elif rule_type == RULE_TYPES[3]:
            return _test_pcap_against_zeek_signature(pcap_name, rule_content)

        return ERROR_RESPONSE


