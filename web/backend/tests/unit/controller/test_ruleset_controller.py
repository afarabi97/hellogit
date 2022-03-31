import os
import json
import pytest
from app.utils.collections import Collections, get_collection
from tests.unit.static_data.rule_set import (zeek_prohibited_rule, zeek_rule,
                                             zeek_rule_update, zeek_ruleset)

RULE_UPLOAD_ENDPOINT = "/api/policy/rule/upload"
RULE_UPLOAD_CONTENT_TYPE = "multipart/form-data"
ZEEK_FILE_LINES = [
    b"event zeek_init()\n",
    b"\t{\n",
    b"\tprint \"Hello, World!\";\n",
    b"\t{\n"
]
ZEEK_FILE_NAME = "ruleset.zeek"
VALID_SURICATA_RULES_BYTES = b'alert ip [1.189.88.67] any -> $HOME_NET any (msg:"ET 3CORESec Poor Reputation IP group 1"; reference:url,blacklist.3coresec.net/lists/et-open.txt; threshold: type limit, track by_src, seconds 3600, count 1; classtype:misc-attack; sid:2525000; rev:390; metadata:affected_product Any, attack_target Any, deployment Perimeter, tag 3CORESec, signature_severity Major, created_at 2020_07_20, updated_at 2022_01_14;)\n'
INVALID_SYNTAX_SURICATA_RULES_BYTES = b'alert tip [1.189.88.67] any -> $HOME_NET any (msg:"ET 3CORESec Poor Reputation IP group 1";)\n'
ruleset_collection = [
    {
        "_id": "0d336cd7d36648d7a7f0c379a6115ef2",
        "name": "test",
        "clearance": "Unclassified",
        "sensors": [],
        "appType": "Suricata",
        "isEnabled": "true",
        "state": "Created",
        "createdDate": "2022-02-02 05:29:15",
        "lastModifiedDate": "2022-02-02 05:29:15"
    },
]


def binary_line_generator(lines):
    for line in lines:
        yield line

@pytest.fixture
def ruleset_client(client):
    get_collection(Collections.RULESET).insert_one(zeek_ruleset)
    return client


@pytest.fixture
def ruleset_file(tmp_path):
    ruleset_file = os.path.join(tmp_path, ZEEK_FILE_NAME)
    with open(ruleset_file, "wb") as fp:
        fp.writelines(binary_line_generator(ZEEK_FILE_LINES))
    return ruleset_file


def test_pcap_rule_test(client):
    rule_content = 'alert tcp $EXTERNAL_NET $HTTP_PORTS -> $HOME_NET any (msg:"ET WEB_CLIENT Hex Obfuscation of String.fromCharCode %u UTF-16 Encoding"; flow:established,to_client; content:"%u5374%u7269%u6e67%u2e66%u726f%u6d43%u6861%u7243%u6f64%u65"; nocase; reference:url,cansecwest.com/slides07/csw07-nazario.pdf; reference:url,www.sophos.com/security/technical-papers/malware_with_your_mocha.html; classtype:bad-unknown; sid:2012109; rev:2; metadata:affected_product Web_Browsers, affected_product Web_Browser_Plugins, attack_target Client_Endpoint, created_at 2010_12_28, deployment Perimeter, signature_severity Major, tag Web_Client_Attacks, updated_at 2016_07_01;)'

    # Insure the json file returned is the same length as what is notated in the header.
    # assert len(results.get_data()) == int(results.headers["Content-Length"])

    # Attempt to run a rm -rf / on the controller.  This of course should not work with the secure_filename call.
    payload = {
        "pcap_name": "; rm -rf /;",
        "rule_content": rule_content,
        "ruleType": "Suricata",
    }

    results = client.post("/api/policy/pcap/rule/test", json=payload)
    assert 400 == results.status_code
    assert "error_message" in results.json

    zeek_payload = {
        "pcap_name": "test",
        "rule_content": zeek_prohibited_rule['rule'],
        "ruleType": "Zeek Scripts",
    }

    results = client.post("/api/policy/pcap/rule/test", json=zeek_payload)
    assert 403 == results.status_code
    assert "error_message" in results.json

def test_rule_upload(ruleset_client, ruleset_file, mocker):
    mocker.patch("app.service.ruleset_service.validate_zeek_script", return_value=(True, ""))
    payload = {
        "upload_file": (
            open(ruleset_file, "rb"),
            ZEEK_FILE_NAME,
        ),
        "ruleSetForm": '{"_id": "ffb76d57576245e2b1466b9368b2a119"}'
    }

    #Test upload file
    response = ruleset_client.post(RULE_UPLOAD_ENDPOINT, data=payload, content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert 200 == response.status_code

def test_rule_upload_broken(ruleset_client, ruleset_file, mocker):
    mocker.patch("app.service.ruleset_service.validate_zeek_script", return_value=(False, "Not Valid rule"))
    payload = {
        "upload_file": (
            open(ruleset_file, "rb"),
            ZEEK_FILE_NAME,
        ),
        "ruleSetForm": '{"_id": "ffb76d57576245e2b1466b9368b2a119"}'
    }

    #Test upload bad file
    response = ruleset_client.post(RULE_UPLOAD_ENDPOINT, data=payload, content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert 422 == response.status_code
    assert "error_message" in response.json


def test_create_and_update_zeek_rule(ruleset_client, mocker):
    mocker.patch("app.controller.ruleset_controller.validate_zeek_script", return_value=(True, ""))
    # Test create rule
    results = ruleset_client.post("/api/policy/rule", json=zeek_rule)
    assert 200 == results.status_code
    assert results.json['ruleName'] == zeek_rule['ruleName']

    # Test update existing rule
    mocker.patch("app.utils.collections.mongo.db.rule.find_one_and_update", return_value=zeek_rule_update)
    results = ruleset_client.put("/api/policy/rule", json=zeek_rule)
    assert 200 == results.status_code
    assert results.json['ruleName'] == zeek_rule['ruleName']

    # Test prohibited zeek exec function
    results = ruleset_client.post("/api/policy/rule", json=zeek_prohibited_rule)
    assert 403 == results.status_code
    assert "error_message" in results.json

    # Test update rule with prohibited zeek exec function
    results = ruleset_client.put("/api/policy/rule", json=zeek_prohibited_rule)
    assert 403 == results.status_code
    assert "error_message" in results.json

    # Test invalid rule
    mocker.patch("app.controller.ruleset_controller.validate_zeek_script", return_value=(False, "Not Valid rule"))
    results = ruleset_client.post("/api/policy/rule", json=zeek_rule)
    assert 400 == results.status_code
    assert "error_message" in results.json

    # Test update invalid rule
    results = ruleset_client.put("/api/policy/rule", json=zeek_rule)
    assert 400 == results.status_code
    assert "error_message" in results.json

    # Test ruleset doesn't exist
    get_collection(Collections.RULESET).delete_one({"_id": zeek_ruleset['_id']})
    results = ruleset_client.post("/api/policy/rule", json=zeek_rule)
    assert 500 == results.status_code
    assert "error_message" in results.json

    # Test ruleset doesn't exist for update
    results = ruleset_client.put("/api/policy/rule", json=zeek_rule)
    assert 500 == results.status_code
    assert "error_message" in results.json


def test_validate_rule(ruleset_client, mocker):
    mocker.patch("app.controller.ruleset_controller.validate_zeek_script", return_value=(True, ""))
    # Test validate rule
    results = ruleset_client.post("/api/policy/rule/validate", json=zeek_rule)
    assert 200 == results.status_code
    assert "success_message" in results.json

    # Test validate prohibited zeek exec function
    results = ruleset_client.post("/api/policy/rule/validate", json=zeek_prohibited_rule)
    assert 403 == results.status_code
    assert "error_message" in results.json

    # Test validate prohibited zeek exec function
    get_collection(Collections.RULESET).delete_one({"_id": zeek_ruleset['_id']})
    zeek_ruleset['appType'] = None
    get_collection(Collections.RULESET).insert_one(zeek_ruleset)
    results = ruleset_client.post("/api/policy/rule/validate", json=zeek_rule)
    assert 500 == results.status_code
    assert "error_message" in results.json
    zeek_ruleset['appType'] = "Zeek Scripts"


def test_ruleset(client):
    get_collection(Collections.RULESET).insert_many(ruleset_collection)
    results = client.get("/api/policy/ruleset")
    assert ruleset_collection == results.get_json()


def test_duplicate_rule_error_msg(tmp_path, client):
    upload_file_name = "test_duplicate_rules_file.txt"
    get_collection(Collections.RULESET).insert_many(ruleset_collection)
    rules_file = os.path.join(tmp_path, upload_file_name)
    with open(rules_file, "wb") as f:
        f.write(VALID_SURICATA_RULES_BYTES)
        f.write(VALID_SURICATA_RULES_BYTES)
    rulesfile = open(rules_file, 'rb')
    payload = {"upload_file": (rulesfile, upload_file_name), 
               "ruleSetForm": json.dumps({"_id": "0d336cd7d36648d7a7f0c379a6115ef2"})}
    results = client.post("/api/policy/rule/upload", data=payload,
                            content_type="multipart/form-data")
    errormsg = "Error loading rulesets: Duplicate or invalid rulesets detected: "
    loglocationmsg = "see /var/log/tfplenum/tfplenum.log for more detail"
    assert 422 == results.status_code
    assert errormsg + loglocationmsg == results.json["error_message"]


def test_invalid_syntax_rule_error_msg(tmp_path, client):
    upload_file_name = "test_duplicate_rules_file.txt"
    get_collection(Collections.RULESET).insert_many(ruleset_collection)
    rules_file = os.path.join(tmp_path, upload_file_name)
    with open(rules_file, "wb") as f:
        f.write(INVALID_SYNTAX_SURICATA_RULES_BYTES)
    rulesfile = open(rules_file, 'rb')
    payload = {"upload_file": (rulesfile, upload_file_name), 
               "ruleSetForm": json.dumps({"_id": "0d336cd7d36648d7a7f0c379a6115ef2"})}
    results = client.post("/api/policy/rule/upload", data=payload,
                            content_type="multipart/form-data")
    errormsg = "Error loading rulesets: Duplicate or invalid rulesets detected: "
    loglocationmsg = "see /var/log/tfplenum/tfplenum.log for more detail"
    assert 422 == results.status_code
    assert errormsg + loglocationmsg == results.json["error_message"]