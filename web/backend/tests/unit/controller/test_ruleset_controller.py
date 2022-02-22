from tests.unit.static_data import zeek_rule, zeek_ruleset, zeek_rule_update, zeek_prohibited_rule

def test_pcap_rule_test(client):
    rule_content = 'alert tcp $EXTERNAL_NET $HTTP_PORTS -> $HOME_NET any (msg:"ET WEB_CLIENT Hex Obfuscation of String.fromCharCode %u UTF-16 Encoding"; flow:established,to_client; content:"%u5374%u7269%u6e67%u2e66%u726f%u6d43%u6861%u7243%u6f64%u65"; nocase; reference:url,cansecwest.com/slides07/csw07-nazario.pdf; reference:url,www.sophos.com/security/technical-papers/malware_with_your_mocha.html; classtype:bad-unknown; sid:2012109; rev:2; metadata:affected_product Web_Browsers, affected_product Web_Browser_Plugins, attack_target Client_Endpoint, created_at 2010_12_28, deployment Perimeter, signature_severity Major, tag Web_Client_Attacks, updated_at 2016_07_01;)'
    # payload = {
    #     "pcap_name": "wannacry.pcap",
    #     "rule_content": rule_content,
    #     "ruleType": "Suricata",
    # }
    # results = client.post("/api/policy/pcap/rule/test", json=payload)
    # assert 200 == results.status_code
    # assert results.is_streamed

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


def test_create_and_update_zeek_rule(client, mocker):
    mocker.patch("app.utils.collections.mongo.db.ruleset.find_one", return_value=zeek_ruleset)
    mocker.patch("app.controller.ruleset_controller.validate_zeek_script", return_value=(True, ""))
    mocker.patch("app.controller.ruleset_controller.create_rule_service", return_value=zeek_rule_update)
    mocker.patch("app.utils.collections.mongo.db.ruleset.update_one", return_value="")
    # Test create rule
    results = client.post("/api/policy/rule", json=zeek_rule)
    assert 200 == results.status_code
    assert results.json['ruleName'] == zeek_rule['ruleName']

    #Test update existing rule
    mocker.patch("app.utils.collections.mongo.db.rule.find_one_and_update", return_value=zeek_rule_update)
    results = client.put("/api/policy/rule", json=zeek_rule)
    assert 200 == results.status_code
    assert results.json['ruleName'] == zeek_rule['ruleName']

    #Test prohibited zeek exec function
    results = client.post("/api/policy/rule", json=zeek_prohibited_rule)
    assert 403 == results.status_code
    assert "error_message" in results.json

    #Test update rule with prohibited zeek exec function
    results = client.put("/api/policy/rule", json=zeek_prohibited_rule)
    assert 403 == results.status_code
    assert "error_message" in results.json

    #Test invalid rule
    mocker.patch("app.controller.ruleset_controller.validate_zeek_script", return_value=(False, "Not Valid rule"))
    results = client.post("/api/policy/rule", json=zeek_rule)
    assert 400 == results.status_code
    assert "error_message" in results.json

    #Test update invalid rule
    results = client.put("/api/policy/rule", json=zeek_rule)
    assert 400 == results.status_code
    assert "error_message" in results.json

    #Test ruleset doesn't exist
    mocker.patch("app.utils.collections.mongo.db.ruleset.find_one", return_value=False)
    results = client.post("/api/policy/rule", json=zeek_rule)
    assert 500 == results.status_code
    assert "error_message" in results.json

    #Test ruleset doesn't exist for update
    results = client.put("/api/policy/rule", json=zeek_rule)
    assert 500 == results.status_code
    assert "error_message" in results.json

def test_validate_rule(client, mocker):
    mocker.patch("app.utils.collections.mongo.db.ruleset.find_one", return_value=zeek_ruleset)
    mocker.patch("app.controller.ruleset_controller.validate_zeek_script", return_value=(True, ""))
    #Test validate rule
    results = client.post("/api/policy/rule/validate", json=zeek_rule)
    assert 200 == results.status_code
    assert "success_message" in results.json

    #Test validate prohibited zeek exec function
    results = client.post("/api/policy/rule/validate", json=zeek_prohibited_rule)
    assert 403 == results.status_code
    assert "error_message" in results.json

    #Test validate prohibited zeek exec function
    zeek_ruleset['appType'] = None
    mocker.patch("app.utils.collections.mongo.db.ruleset.find_one", return_value=zeek_ruleset)
    results = client.post("/api/policy/rule/validate", json=zeek_rule)
    assert 500 == results.status_code
    assert "error_message" in results.json

