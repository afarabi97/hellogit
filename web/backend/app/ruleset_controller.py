import os
import tempfile
import json

from app import (app, logger, conn_mng, get_next_sequence)
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.models.common import JobID
from app.service.job_service import run_command2
from app.service.rulesync_service import perform_rulesync
from datetime import datetime
from flask import jsonify, request, Response, send_file
from io import StringIO
from pathlib import Path
from pymongo import ReturnDocument
from pymongo.cursor import Cursor
from pymongo.results import InsertOneResult, DeleteResult
from app.utils.constants import (RULESET_STATES, DATE_FORMAT_STR,
                              PCAP_UPLOAD_DIR, SURICATA_IMAGE_VERSION,
                              RULE_TYPES, ZEEK_IMAGE_VERSION,
                              ZEEK_RULE_DIR)
from app.utils.utils import tar_folder
from typing import Dict, Tuple, List, Union
from werkzeug.utils import secure_filename
from zipfile import ZipFile
from app.middleware import operator_required


CHUNK_SIZE = 5000000


class InvalidRuleSyntax(Exception):
    pass


@app.route('/api/get_rulesets/', methods=['GET'])
def get_rulesets() -> Response:
    rule_sets = conn_mng.mongo_ruleset.find({}) # type: Cursor
    ret_val = []
    for rule_set in rule_sets:
        ret_val.append(rule_set)
    return jsonify(ret_val)


@app.route('/api/get_ruleset/<rule_set_id>', methods=['GET'])
def get_ruleset(rule_set_id: str) -> Response:
    rule_set = conn_mng.mongo_ruleset.find_one({'_id': int(rule_set_id)}) # type: Cursor
    if rule_set:
        return jsonify(rule_set)
    return jsonify({"error_message": "Failed to find the ruleset ID {}.".format(rule_set_id)})


@app.route('/api/get_rules/<rule_set_id>', methods=['GET'])
def get_rules(rule_set_id: str) -> Response:
    rules = conn_mng.mongo_rule.find({'rule_set_id': int(rule_set_id)}, projection={"rule": False})
    if rules:
        return jsonify(list(rules))
    return jsonify({"error_message": "Failed to find rules for ruleset ID {}.".format(rule_set_id)})


@app.route('/api/get_rules_content/<rule_set_id>/<rule_id>', methods=['GET'])
def get_rule_content(rule_set_id: str, rule_id: str) -> Response:
    rule = conn_mng.mongo_rule.find_one({'_id': int(rule_id)})
    if rule:
        return jsonify(rule)
    return jsonify({"error_message": "Failed to find rule content for ruleset ID {} and rule ID {}.".format(rule_set_id, rule_id)})


def create_ruleset_service(ruleset: Dict) -> InsertOneResult:
    ruleset['state'] = RULESET_STATES[0]
    ruleset["_id"] = get_next_sequence("rulesetid")
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    ruleset['createdDate'] = dt_string
    ruleset['lastModifiedDate'] = dt_string
    ret_val = conn_mng.mongo_ruleset.insert_one(ruleset)
    return ret_val


def create_rule_service(ruleset_id: int, rule: Dict, projection={"rule": False}) -> Dict:
    rule["_id"] = get_next_sequence("ruleid")
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
                ignore_errors:bool=False):
    rule = {
        "ruleName": rule_name,
        "rule": rule_content,
        "isEnabled": is_enabled
    }
    rule_set_id = rule_set["_id"]
    rule_type = rule_set['appType']
    is_valid = False
    error_output = "Unsupported rule type."
    if rule_type == RULE_TYPES[0]:
        is_valid, error_output = _validate_suricata_rule(rule)
    elif rule_type == RULE_TYPES[1]:
        is_valid, error_output = _validate_bro_rule(rule)

    if is_valid:
        return create_rule_service(rule_set_id, rule)

    if not ignore_errors:
        raise InvalidRuleSyntax(error_output.split('\n'))


def _get_file_name(filename: str, count: int) -> str:
    pos = filename.rfind('.')
    return "{}_{}{}".format(filename[0:pos], count, filename[pos:])


def create_rule_from_file(path: Path, rule_set: Dict, ignore_errors:bool=False) -> Union[Dict, List[Dict]]:
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
                    ret_val.append(create_rule_srv_wrapper(rule_set, filename, partial_rule.getvalue(), ignore_errors=ignore_errors))
                    partial_rule = StringIO()
                    count += 1
        return ret_val
    else:
        with path.open() as f:
            return create_rule_srv_wrapper(rule_set, path.name, f.read(), ignore_errors=ignore_errors)


@app.route('/api/create_ruleset', methods=['POST'])
@operator_required
def create_ruleset() -> Response:
    ruleset = request.get_json()
    ret_val = create_ruleset_service(ruleset)
    if ret_val:
        return jsonify(ruleset)
    return jsonify({"error_message": "Failed to insert ruleset."})


@app.route('/api/update_ruleset', methods=['PUT'])
@operator_required
def update_ruleset() -> Response:
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
        return jsonify(ret_val)
    return jsonify({"error_message": "Failed to update ruleset ID {}.".format(ruleset_id)})


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


def _validate_bro_rule(rule: Dict) -> Tuple[bool, str]:
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
                                            script_dir=ZEEK_RULE_DIR,
                                            file_to_test=filename)

            stdoutput, ret_val = run_command2(cmd, use_shell=True)
            if ret_val == 0:
                return True, ""

    return False, stdoutput


def does_file_have_ext(some_path: str, extension: str) -> bool:
    pos = some_path.rfind(".")
    file_ext = some_path[pos:]
    return file_ext.lower() == extension


def _process_zipfile(export_path: str, some_zip: str, rule_set: Dict) -> List[Dict]:
    ret_val = []
    with ZipFile(some_zip) as f:
        f.extractall(export_path)
    for root, dirs, files in os.walk(export_path):
        for file_path in files:
            abs_path = root + "/" + file_path
            if does_file_have_ext(abs_path, '.txt') or does_file_have_ext(abs_path, '.rules'):
                rule_or_rules = create_rule_from_file(Path(abs_path), rule_set)
                if isinstance(rule_or_rules, list):
                    ret_val += rule_or_rules
                else:
                    ret_val.append(rule_or_rules)
    return ret_val


@app.route('/api/upload_rule', methods=['POST'])
@operator_required
def upload_rule() -> Response:
    rule_set = json.loads(request.form['ruleSetForm'],
                          encoding="utf-8")
    if 'upload_file' not in request.files:
        return jsonify({"error_message": "Failed to upload file. No file was found in the request."})

    rule_set = conn_mng.mongo_ruleset.find_one({'_id': rule_set['_id']})
    if rule_set:
        rule_set_file = request.files['upload_file']
        filename = secure_filename(rule_set_file.filename)

        with tempfile.TemporaryDirectory() as export_path:
            abs_save_path = str(export_path) + '/' + filename
            rule_set_file.save(abs_save_path)
            try:
                if does_file_have_ext(abs_save_path, '.zip'):
                    rule_or_rules = _process_zipfile(export_path, abs_save_path, rule_set)
                else:
                    rule_or_rules = create_rule_from_file(Path(abs_save_path), rule_set)
            except InvalidRuleSyntax as e:
                logger.error(str(e))
                return jsonify({"error_message": str(e)})
    if rule_or_rules:
        return jsonify(rule_or_rules)
    else:
        return jsonify({"error_message": "Failed to upload rules file for an unknown reason."})


@app.route('/api/create_rule', methods=['POST'])
@operator_required
def create_rule() -> Response:
    rule_add = request.get_json()
    ruleset_id = rule_add['rulesetID']
    rule = rule_add['ruleToAdd']
    rule["_id"] = get_next_sequence("ruleid")
    rule_set = conn_mng.mongo_ruleset.find_one({'_id': ruleset_id})
    error_output = None
    if rule_set:
        rule_type = rule_set['appType']
        is_valid = False
        error_output = ""
        if rule_type == RULE_TYPES[0]:
            is_valid, error_output = _validate_suricata_rule(rule)
        elif rule_type == RULE_TYPES[1]:
            is_valid, error_output = _validate_bro_rule(rule)

        if is_valid:
            rule = create_rule_service(ruleset_id, rule)
            conn_mng.mongo_ruleset.update_one({'_id': ruleset_id}, {"$set": {"state": RULESET_STATES[1]}})
            if rule:
                return jsonify(rule)
        elif error_output:
            return jsonify({"error_message": error_output.split('\n')})
    return jsonify({"error_message": "Failed to create a rule for ruleset ID {}.".format(ruleset_id)})


@app.route('/api/update_rule', methods=['PUT'])
@operator_required
def update_rule() -> Response:
    update_rule = request.get_json()
    ruleset_id = update_rule["rulesetID"]
    rule = update_rule['ruleToUpdate']
    id_to_modify = rule['_id']

    rule_set = conn_mng.mongo_ruleset.find_one({'_id': ruleset_id})
    if rule_set:
        rule_type = rule_set['appType']
        is_valid = False

        if rule_type == RULE_TYPES[0]:
            is_valid, error_output = _validate_suricata_rule(rule)
        elif rule_type == RULE_TYPES[1]:
            is_valid, error_output = _validate_bro_rule(rule)

        if is_valid:
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
                    return jsonify(rule)
        else:
            return jsonify({"error_message": error_output.split('\n')})
    return jsonify({"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)})


@app.route('/api/toggle_rule', methods=['PUT'])
@operator_required
def toggle_rule() -> Response:
    """
    Enables or disables a rule without validating the rule for the quick checkboxes.

    :return:
    """
    update_rule = request.get_json()
    ruleset_id = update_rule["rulesetID"]
    rule = update_rule['ruleToUpdate']
    id_to_modify = rule['_id']

    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    rule['lastModifiedDate'] = dt_string
    rule = conn_mng.mongo_rule.find_one_and_update({'_id': id_to_modify},
                                                   {'$set': rule},
                                                    projection={"rule": False},
                                                    return_document=ReturnDocument.AFTER)
    if rule:
        rule_set = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id},
                                                              {'$set': {"state": RULESET_STATES[1],
                                                                        "lastModifiedDate": dt_string }},
                                                              return_document=ReturnDocument.AFTER)
        if rule_set:
            return jsonify(rule)
    return jsonify({"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)})


@app.route('/api/delete_rule/<rule_set_id>/<rule_id>', methods=['DELETE'])
@operator_required
def delete_rule(rule_set_id: str, rule_id: str) -> Response:
    ret_val = conn_mng.mongo_rule.delete_one({'_id': int(rule_id)})  # type: DeleteResult
    if ret_val.deleted_count == 1:
        return jsonify({"success_message": "Successfully deleted rule ID {} from the rule set.".format(rule_id)})
    return jsonify({"error_message": "Failed to delete a rule for ruleset ID {}.".format(rule_set_id)})


@app.route('/api/delete_ruleset/<ruleset_id>', methods=['DELETE'])
@operator_required
def delete_ruleset(ruleset_id: str) -> Response:
    rules_deleted = conn_mng.mongo_rule.delete_many({'rule_set_id': int(ruleset_id)})
    if rules_deleted:
        ret_val = conn_mng.mongo_ruleset.delete_one({'_id': int(ruleset_id)})
        if ret_val.deleted_count == 1:
            return jsonify({"success_message": "Successfully deleted rule set."})
    return jsonify({"error_message": "Failed to delete ruleset ID {}.".format(ruleset_id)})


@app.route('/api/sync_rulesets', methods=['GET', 'POST'])
@operator_required
def sync_rulesets_api() -> Response:
    job = perform_rulesync.delay()
    return (jsonify(JobID(job).to_dict()), 200)


@app.route('/api/validate_rule', methods=['POST'])
@operator_required
def validate_rule() -> Response:
    payload = request.get_json()
    rule = payload['ruleToValidate']
    rule_type = payload['ruleType']

    error_output = "Unknown Error"
    if rule_type == RULE_TYPES[0]:
        is_success, error_output = _validate_suricata_rule(rule)
        if is_success:
            return jsonify({"success_message": "Suricata signatures successfully validated!"})
    elif rule_type == RULE_TYPES[1]:
        is_success, error_output = _validate_bro_rule(rule)
        if is_success:
            return jsonify({"success_message": "Zeek script successfully validated!"})

    return jsonify({"error_message": error_output.split('\n')})


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

    return jsonify({"message": output})


def _test_pcap_against_bro_rule(pcap_name: str, rule_content: str) -> Response:
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
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-r /pcaps/{pcap_name} {script_dir}/{file_to_test}").format(tmp_dir=rules_tmp_dir,
                                                                        pcap_dir=PCAP_UPLOAD_DIR,
                                                                        version=ZEEK_IMAGE_VERSION,
                                                                        script_dir=ZEEK_RULE_DIR,
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
                    results_tar_ball = results_tmp_dir + "/results"
                    tar_folder(results_tmp_dir, results_tar_ball)
                    return send_file(results_tar_ball + ".tar.gz", mimetype="application/tar+gzip")

    return jsonify({"message": stdoutput})


@app.route('/api/test_rule_against_pcap', methods=['POST'])
@operator_required
def test_rule_against_pcap() -> Response:
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
        return _test_pcap_against_bro_rule(pcap_name, rule_content)

    return ERROR_RESPONSE
