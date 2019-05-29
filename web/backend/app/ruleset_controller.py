import os
import subprocess
import tempfile

from app import (app, logger, conn_mng, get_next_sequence, WEB_DIR)
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.job_manager import shell, spawn_job
from app.socket_service import log_to_console
from datetime import datetime
from flask import jsonify, request, Response, send_file
from pathlib import Path
from pymongo.collection import Collection
from pymongo import ReturnDocument
from pymongo.cursor import Cursor
from pymongo.results import InsertOneResult, UpdateResult
from shared.constants import (RULESET_STATES, DATE_FORMAT_STR, 
                              PCAP_UPLOAD_DIR, SURICATA_CONTAINER_VERSION, 
                              RULE_TYPES, BRO_CONTAINER_VERSION,
                              BRO_RULE_DIR)
from shared.utils import tar_folder
from typing import Dict, Tuple, List


@app.route('/api/get_rulesets/<rule_set_group_name>', methods=['GET'])
def get_rulesets(rule_set_group_name: str) -> Response:
    rule_sets = []
    if rule_set_group_name.lower() == "all":
        rule_sets = conn_mng.mongo_ruleset.find({}, projection={"rules": False}) # type: Cursor
    else:
        rule_sets = conn_mng.mongo_ruleset.find({"groupName": rule_set_group_name}, projection={"rules": False}) # type: Cursor

    ret_val = []
    for rule_set in rule_sets:
        ret_val.append(rule_set)
    return jsonify(ret_val)


@app.route('/api/get_ruleset/<rule_set_id>', methods=['GET'])
def get_ruleset(rule_set_id: str) -> Response:
    rule_set = conn_mng.mongo_ruleset.find_one({'_id': int(rule_set_id)},
                                                projection={"rules": False}) # type: Cursor
    if rule_set:
        return jsonify(rule_set)
    return jsonify({"error_message": "Failed to find the ruleset ID {}.".format(rule_set_id)})


@app.route('/api/get_ruleset_groups', methods=['GET'])
def get_ruleset_groups() -> Response:
    rule_sets = conn_mng.mongo_ruleset.find({}, projection={"groupName": True}).distinct("groupName") # type: List
    if rule_sets:
        rule_sets.append("All")
        return jsonify(rule_sets)
    return jsonify({"error_message": "Failed to find the ruleset group names."})


@app.route('/api/get_rules/<rule_set_id>', methods=['GET'])
def get_rules(rule_set_id: str) -> Response:
    rule_set = conn_mng.mongo_ruleset.find_one({'_id': int(rule_set_id)}, projection={"rules.rule": False})
    if rule_set:
        return jsonify(rule_set['rules'])
    return jsonify({"error_message": "Failed to find rules for ruleset ID {}.".format(rule_set_id)})


@app.route('/api/get_rules_content/<rule_set_id>/<rule_id>', methods=['GET'])
def get_rule_content(rule_set_id: str, rule_id: str) -> Response:
    rule_set = conn_mng.mongo_ruleset.find_one({'_id': int(rule_set_id), 'rules._id': int(rule_id)})
    if rule_set:
        for rule in rule_set['rules']:
            if rule["_id"] == int(rule_id):
                return jsonify(rule)
    return jsonify({"error_message": "Failed to find rule content for ruleset ID {} and rule ID {}.".format(rule_set_id, rule_id)})


def create_ruleset_service(ruleset: Dict) -> InsertOneResult:
    ruleset['rules'] = []
    ruleset['state'] = RULESET_STATES[0]
    ruleset["_id"] = get_next_sequence("rulesetid")
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    ruleset['createdDate'] = dt_string
    ruleset['lastModifiedDate'] = dt_string
    ret_val = conn_mng.mongo_ruleset.insert_one(ruleset)
    return ret_val


def create_ruleset_from_file(path: Path, ret_val: InsertOneResult):
    with path.open() as f:
        rule = {
            "ruleName": path.name,
            "rule": f.read(),
            "isEnabled": True
        }   
        create_rule_service(ret_val.inserted_id, rule)


@app.route('/api/create_ruleset', methods=['POST'])
def create_ruleset() -> Response:
    ruleset = request.get_json()    
    ret_val = create_ruleset_service(ruleset)
    if ret_val:
        return jsonify(ruleset)
    return jsonify({"error_message": "Failed to insert ruleset."})


@app.route('/api/update_ruleset', methods=['PUT'])
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
                                                         projection={"rules": False},
                                                         return_document=ReturnDocument.AFTER)
    if ret_val:
        return jsonify(ret_val)
    return jsonify({"error_message": "Failed to update ruleset ID {}.".format(ruleset_id)})


def _validate_suricata_rule(rule: Dict) -> Tuple[bool, str]:
    error_string = ""
    with tempfile.TemporaryDirectory() as tmpdirname:
        theRule = rule['rule']
        filename = '{}/suricata.rules'.format(tmpdirname)
        if isinstance(theRule, str):
            with Path(filename).open('w') as fp:
                fp.write(theRule)
        else:
            theRule.save(filename)
            theRule.stream.seek(0)

        cmd = ("docker run --rm "
               "-v {tmp_dir}:/etc/suricata/rules/ tfplenum/suricata:{version} "
               "suricata -c /etc/suricata/suricata.yaml -T").format(tmp_dir=tmpdirname, 
                                                                    version=SURICATA_CONTAINER_VERSION)

        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        error_string, serr = proc.communicate()
        if proc.returncode == 0:
            return True, ""
    
    return False, error_string.decode("UTF-8")


def _validate_bro_rule(rule: Dict) -> Tuple[bool, str]:
    error_string = ""
    with tempfile.TemporaryDirectory() as tmpdirname:
        theRule = rule['rule']
        filename = "custom.bro"
        filepath = '{}/{}'.format(tmpdirname, filename)
        if isinstance(theRule, str):
            with Path(filepath).open('w') as fp:
                fp.write(theRule)
        else:
            theRule.save(filepath)
            theRule.stream.seek(0)

        
        cmd = ("docker run --rm "
               "-v {tmp_dir}:{script_dir} tfplenum/bro:{version} "
               "-S {script_dir}/{file_to_test}").format(tmp_dir=tmpdirname, 
                                           version=BRO_CONTAINER_VERSION,
                                           script_dir=BRO_RULE_DIR,
                                           file_to_test=filename)
        
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        error_string, serr = proc.communicate()
        if proc.returncode == 0:
            return True, ""
    
    return False, error_string.decode("UTF-8")
    

def create_rule_service(ruleset_id: int, rule: Dict):    
    rule["_id"] = get_next_sequence("ruleid")
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    rule['createdDate'] = dt_string
    rule['lastModifiedDate'] = dt_string
    ret_val = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id},
                                                         {'$push': {'rules': rule}}, 
                                                         projection={"rules": False})

    return ret_val


@app.route('/api/load_rules_from_file', methods=['POST'])
def load_rules_from_file() -> Response:
    rule_file = request.files['file'] 

    if rule_file is None or not bool(rule_file):
        return jsonify({"error_message": "No rules file sent."})
    
    is_valid = False
    if request.form['appType'] == RULE_TYPES[0]:
        is_valid, error_msg = _validate_suricata_rule(rule)
    elif request.form['appType'] == RULE_TYPES[1]:
        is_valid, error_msg = _validate_bro_rule(rule)
    
    if not valid:
        return jsonify({"error_message": "Invalid Rules: {}".format(error_msg)})

    with tempfile.TemporaryDirectory() as tmpdirname:
        file_path='{}/{}'.format(tmpdirname, request.form['filename'])
        rule_file.save(file_path)
        #Now, read in the file and save it to the database
        ruleset = {
            "appType": request.form['appType'],
            "clearance": request.form['clearance'],
            "name": request.form['name'],
            "sensors": [],
            "state": "Created",
            "isEnabled": True,
            "groupName": request.form['groupname']
        }
        ret_val = create_ruleset_service(ruleset) 
        create_ruleset_from_file(path = Path(file_path), ret_val = ret_val)

    new_ruleset = conn_mng.mongo_ruleset.find_one({'_id': ret_val.inserted_id})
    return jsonify(new_ruleset)

@app.route('/api/create_rule', methods=['POST'])
def create_rule() -> Response:
    rule_add = request.get_json()
    ruleset_id = rule_add['rulesetID']
    rule = rule_add['ruleToAdd']
    rule["_id"] = get_next_sequence("ruleid")
    rule_set = conn_mng.mongo_ruleset.find_one({'_id': ruleset_id})
    if rule_set:
        rule_type = rule_set['appType']
        is_valid = False
        if rule_type == RULE_TYPES[0]:
            is_valid, error_output = _validate_suricata_rule(rule)
        elif rule_type == RULE_TYPES[1]:
            is_valid, error_output = _validate_bro_rule(rule)

        if is_valid:
            for old_rule in rule_set["rules"]:
                if old_rule["rule"] == rule["rule"]:
                    return jsonify({"error_message": "Failed to add " + rule["ruleName"] + 
                                ". The content of this rule matches another rule in the database."})
            
            dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
            rule['createdDate'] = dt_string
            rule['lastModifiedDate'] = dt_string
            ret_val = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id},
                                                                {'$push': {'rules': rule}, 
                                                                '$set': {'state': RULESET_STATES[1]}}, 
                                                                projection={"rules": False})
            if ret_val:
                return jsonify(rule)
        else:
            return jsonify({"error_message": error_output.split('\n')})
    return jsonify({"error_message": "Failed to create a rule for ruleset ID {}.".format(ruleset_id)})


@app.route('/api/update_rule', methods=['PUT'])
def update_rule() -> Response:
    update_rule = request.get_json()
    ruleset_id = update_rule["rulesetID"]
    rule = update_rule['ruleToUpdate']    
    id_to_modify = rule['_id']

    rule_set = conn_mng.mongo_ruleset.find_one({'_id': ruleset_id}, projection={"rules": False})
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
            rule_set = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id, 'rules._id': id_to_modify}, 
                                                                  {'$set': { "rules.$": rule, 
                                                                             "state": RULESET_STATES[1], 
                                                                             "lastModifiedDate": dt_string }},
                                                                  return_document=ReturnDocument.AFTER)
            if rule_set:
                rule['_id'] = id_to_modify
                return jsonify(rule)
        else:
            return jsonify({"error_message": error_output.split('\n')})
    return jsonify({"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)})


@app.route('/api/toggle_rule', methods=['PUT'])
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
    rule_set = conn_mng.mongo_ruleset.find_one_and_update({'_id': ruleset_id, 'rules._id': id_to_modify}, 
                                                            {'$set': { "rules.$.isEnabled": rule["isEnabled"], 
                                                                        "state": RULESET_STATES[1], 
                                                                        "lastModifiedDate": dt_string }},
                                                            return_document=ReturnDocument.AFTER)
    if rule_set:
        rule['_id'] = id_to_modify
        return jsonify(rule)
    return jsonify({"error_message": "Failed to update a rule for ruleset ID {}.".format(ruleset_id)})


@app.route('/api/delete_rule/<rule_set_id>/<rule_id>', methods=['DELETE'])
def delete_rule(rule_set_id: str, rule_id: str) -> Response:
    ret_val = conn_mng.mongo_ruleset.update_one({'_id': int(rule_set_id)},
                                                {'$pull': {'rules': {'_id': int(rule_id)}}, 
                                                 '$set': {'state': RULESET_STATES[1]} 
                                                })  # type: UpdateResult
    if ret_val.modified_count == 1:
        return jsonify({"success_message": "Successfully deleted rule ID {} from the rule set.".format(rule_id)})
    return jsonify({"error_message": "Failed to delete a rule for ruleset ID {}.".format(rule_set_id)})


@app.route('/api/delete_ruleset/<ruleset_id>', methods=['DELETE'])
def delete_ruleset(ruleset_id: str) -> Response:
    ret_val = conn_mng.mongo_ruleset.delete_one({'_id': int(ruleset_id)})
    if ret_val.deleted_count == 1:
        return jsonify({"success_message": "Successfully deleted rule set."})
    return jsonify({"error_message": "Failed to delete ruleset ID {}.".format(ruleset_id)})


@app.route('/api/sync_rulesets', methods=['GET', 'POST'])
def sync_rulesets_api() -> Response:
    cmd_to_execute = str(WEB_DIR / 'tfp-env/bin/python') + ' sync_rulesets.py'
    spawn_job("SyncRuleSets",
               cmd_to_execute,
               ["sync_rulesets"],
               log_to_console,
               working_directory=str(WEB_DIR / "backend/fabfiles"))
    return OK_RESPONSE


@app.route('/api/validate_rule', methods=['POST'])
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
            return jsonify({"success_message": "Bro script successfully validated!"})

    return jsonify({"error_message": error_output.split('\n')})


def _test_pcap_against_suricata_rule(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = '{}/suricata.rules'.format(rules_tmp_dir)
        with Path(filename).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            cmd = ("docker run --rm "
                   "-v {rules_dir}:/etc/suricata/rules/ "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/var/log/suricata/ "
                   "tfplenum/suricata:{version} "
                   "suricata -c /etc/suricata/suricata.yaml -r /pcaps/{pcap_name}").format(rules_dir=rules_tmp_dir,
                                                                                           pcap_dir=PCAP_UPLOAD_DIR,
                                                                                           results_dir=results_tmp_dir,
                                                                                           pcap_name=pcap_name,
                                                                                           version=SURICATA_CONTAINER_VERSION)

            proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            error_string, serr = proc.communicate()
            if proc.returncode == 0:
                results = Path(results_tmp_dir)
                for results_path in results.glob("eve-*"):
                    return send_file(str(results_path))

    return ERROR_RESPONSE


def _test_pcap_against_bro_rule(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = "custom.bro"
        filepath = '{}/{}'.format(rules_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            cmd = ("docker run --rm "
                   "-v {tmp_dir}:{script_dir} "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/data/ "
                   " tfplenum/bro:{version} "
                   "-r /pcaps/{pcap_name} {script_dir}/{file_to_test}").format(tmp_dir=rules_tmp_dir, 
                                                                        pcap_dir=PCAP_UPLOAD_DIR,
                                                                        version=BRO_CONTAINER_VERSION,
                                                                        script_dir=BRO_RULE_DIR,
                                                                        pcap_name=pcap_name,
                                                                        results_dir=results_tmp_dir,
                                                                        file_to_test=filename)            
            proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            std_out_bytes, serr = proc.communicate()

            if std_out_bytes != b'':
                with Path(results_tmp_dir + '/stdout.log').open('w') as output:
                    output.write(std_out_bytes.decode("utf-8"))

            if proc.returncode == 0:
                results_tar_ball = results_tmp_dir + "/results"
                tar_folder(results_tmp_dir, results_tar_ball)
                return send_file(results_tar_ball + ".tar.gz", mimetype="application/tar+gzip")            

    return ERROR_RESPONSE


@app.route('/api/test_rule_against_pcap', methods=['POST'])
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
