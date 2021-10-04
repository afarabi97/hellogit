import json
import os
import requests
import sys
import unittest

from requests.models import Response

from app.utils.constants import RULESET_STATES
from pathlib import Path
from app.tests.base_test_setup import BaseTestCase
from typing import Dict, List

SENSOR_HOST_INFO_URL = "/api/policy/sensor/info"
CREATE_RULESET_URL = "/api/ruleset"
UPLOAD_RULE_URL = "/api/rule/upload"

class TestRulesetController(BaseTestCase):

    def setUp(self):
        super().setUp()

    def _verify_ruleset_count(self, expected_count: int):
        response = self.app.get("/api/ruleset")
        self.assertEqual(response.status_code, 200)
        rule_sets = response.json
        self.assertEqual(expected_count, len(rule_sets))

    def _verify_rule_count(self, rule_set_id: str, expected_count: int):
        response = self.app.get("/api/rules/" + str(rule_set_id))
        self.assertEqual(response.status_code, 200)
        rules = response.json
        self.assertEqual(expected_count, len(rules))

    def _verify_rule(self, expected: Dict, actual: Dict):
        self.assertEqual(expected["ruleName"], actual["ruleName"])
        try:
            actual["rule"]
            self.assertTrue(False)
        except KeyError:
            pass

        self.assertEqual(expected["isEnabled"], actual["isEnabled"])
        self.assertIsNotNone(actual["_id"])

    def _verify_ruleset(self, expected: Dict, actual: Dict, expected_state: str):
        self.assertEqual(expected["appType"], actual["appType"])
        self.assertEqual(expected["clearance"], actual["clearance"])
        self.assertEqual(expected["name"], actual["name"])
        self.assertEqual(expected["sensors"], actual["sensors"])
        self.assertEqual(expected_state, actual["state"])
        self.assertEqual(expected["isEnabled"], actual["isEnabled"])
        self.assertIsNotNone(actual["_id"])

    def test_upload_ruleset(self):
        ruleset = {
            "appType": "Suricata",
            "clearance": "TS",
            "name": "ruleSetOne",
            "sensors": [],
            "state": [],
            "state": "Dirty",
            "isEnabled": True
        }

        bro_ruleset = {
            "appType": "Zeek",
            "clearance": "TS",
            "name": "ruleSetTwo",
            "sensors": [],
            "state": [],
            "state": "Dirty",
            "isEnabled": True
        }

        response = self.app.post(CREATE_RULESET_URL, json=ruleset)
        self.assertEqual(response.status_code, 200)
        actual_result = response.json # type: Dict
        self.assertIsNotNone(actual_result['_id'])
        ruleset_id = actual_result['_id']
        self._verify_ruleset(ruleset, actual_result, RULESET_STATES[0])

        values = {'ruleSetForm': json.dumps(actual_result),
                  'upload_file': self._create_file_test_payload(self.sample_rules1)}

        response = self.app.post(UPLOAD_RULE_URL, data=values)
        self.assertEqual(200, response.status_code)
        self._verify_ruleset_count(1)
        self._verify_rule_count(ruleset_id, 1)

        values['upload_file'] = self._create_file_test_payload(self.invalid_sample_rules1)
        response = self.app.post(UPLOAD_RULE_URL, data=values)
        self.assertEqual(200, response.status_code)
        self.assertIsNotNone(response.json['error_message'])
        self._verify_ruleset_count(1)
        self._verify_rule_count(ruleset_id, 1)

        values['upload_file'] = self._create_file_test_payload(self.zip_rules)
        response = self.app.post(UPLOAD_RULE_URL, data=values)
        self.assertEqual(200, response.status_code)
        self._verify_ruleset_count(1)
        self._verify_rule_count(ruleset_id, 5)

        response = self.app.post(CREATE_RULESET_URL, json=bro_ruleset)
        self.assertEqual(response.status_code, 200)
        actual_result = response.json # type: Dict
        self.assertIsNotNone(actual_result['_id'])
        ruleset_id = actual_result['_id']
        self._verify_ruleset(bro_ruleset, actual_result, RULESET_STATES[0])

        values = {'ruleSetForm': json.dumps(actual_result),
                  'upload_file': self._create_file_test_payload(self.zeek_rules) }
        response = self.app.post(UPLOAD_RULE_URL, data=values)
        self.assertEqual(200, response.status_code)
        self._verify_ruleset_count(2)
        self._verify_rule_count(ruleset_id, 1)


    def test_crud_operations_for_rulesets_and_rules(self):
        create_rule_url = "/api/rule"
        ruleset = {
            "appType": "Suricata",
            "clearance": "TS",
            "name": "ruleSetOne",
            "sensors": [{"hostname": "dnavtest2-sensor1.lan", "ip": "172.16.77.35"}],
            "state": [{"hostname": "dnavtest2-sensor1.lan", "state": "Created"}],
            "state": "Dirty",
            "isEnabled": True
        }

        single_rule = {
            "ruleName": "ruleOne",
            "rule": 'alert udp $EXTERNAL_NET any -> $HOME_NET 161 (msg:"ET SNMP Attempted UDP Access Attempt to Cisco IOS 12.1 Hidden Read/Write Community String ILMI"; content:"ILMI"; nocase; reference:url,www.cisco.com/warp/public/707/cisco-sa-20010228-ios-snmp-community.shtml; reference:url,www.cisco.com/warp/public/707/cisco-sa-20010227-ios-snmp-ilmi.shtml; reference:url,doc.emergingthreats.net/2011011; classtype:attempted-admin; sid:2011011; rev:2; metadata:created_at 2010_07_30, updated_at 2010_07_30;)',
            "isEnabled": True,
            "byPassValidation": False
        }

        single_rule2 = {
            "ruleName": "ruleTwo",
            "rule": 'alert udp $EXTERNAL_NET any -> $HOME_NET 161 (msg:"GPL SNMP null community string attempt"; content:"|04 01 00|"; depth:15; offset:5; reference:bugtraq,2112; reference:bugtraq,8974; reference:cve,1999-0517; classtype:misc-attack; sid:2101892; rev:7; metadata:created_at 2010_09_23, updated_at 2010_09_23;)',
            "isEnabled": True,
            "byPassValidation": False
        }

        add_rule = {
            "rulesetID": None,
            "ruleToAdd": None
        }

        update_rule = {
            "rulesetID": None,
            "ruleToUpdate": None
        }

        self._verify_ruleset_count(0)
        # Test save new ruleset
        # Verify that the new ruleset is and its rules are set to the created state.
        response = self.app.post(CREATE_RULESET_URL, json=ruleset)
        self.assertEqual(response.status_code, 200)
        actual_result = response.json # type: Dict
        self.assertIsNotNone(actual_result['_id'])
        ruleset_id = actual_result['_id']
        self._verify_ruleset(ruleset , actual_result, RULESET_STATES[0])

        # Test Save rule, verify that ruleset is marked dirty.
        # Verify that ruleset state change to Dirty
        single_rule['rule_set_id'] = ruleset_id
        response = self.app.post(create_rule_url, json=single_rule)
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 1)
        actual_result = response.json # type: Dict
        self._verify_rule(single_rule, actual_result)
        self._verify_ruleset_count(1)
        response = self.app.get("/api/get_ruleset/" + str(ruleset_id))
        ruleset = response.json
        self.assertEqual(ruleset['state'], RULESET_STATES[1])

        # Test save same rule and make sure
        # Verify that the states is still dirty
        response = self.app.post(create_rule_url, json=single_rule)
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 2)

        # Test save different rule
        single_rule2['rule_set_id'] = ruleset_id
        response = self.app.post(create_rule_url, json=single_rule2)
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 3)

        # Test update rule
        single_rule2_w_id = response.json
        single_rule2_w_id["ruleName"] = "I updated the name!"
        single_rule2_w_id["isEnabled"] = False
        # update_rule["rulesetID"] = ruleset_id
        # update_rule["ruleToUpdate"] = single_rule2_w_id
        response = self.app.put("/api/rule", json=single_rule2_w_id)
        self.assertEqual(response.status_code, 200)
        self._verify_rule(single_rule2_w_id, response.json)
        self._verify_rule_count(ruleset_id, 3)

        # Test update ruleset
        response = self.app.get('/api/get_ruleset/' + str(ruleset_id))
        test_rule_set = response.json
        test_rule_set["state"] = "dirty"
        test_rule_set["isEnabled"] = False
        response = self.app.put("/api/ruleset", json=test_rule_set)
        self.assertEqual(response.status_code, 200)
        self._verify_ruleset(test_rule_set, response.json, RULESET_STATES[1])
        self._verify_rule_count(ruleset_id, 3)

        # Test delete rule
        response = self.app.delete("/api/rule/" + str(single_rule2_w_id['_id']))
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 2)

        # Test delete ruleset
        response = self.app.delete("/api/ruleset/" + str(ruleset_id))
        self.assertEqual(response.status_code, 200)
        self._verify_ruleset_count(0)

    def test_modifyruleset(self):
        create_rule_url = "/api/rule"
        ruleset = {
            "appType": "suricata",
            "clearance": "TS",
            "name": "ruleSetOne",
            "sensor": ["sensorOne", "sensorTwo"],
            "ip": ["192.168.1.12", "192.168.1.11"],
            "state": "synced",
            "isEnabled": True
        }

        single_rule = {
            "ruleName": "ruleTwo",
            "rule": 'alert udp $EXTERNAL_NET any -> $HOME_NET 161 (msg:"ET SNMP Attempted UDP Access Attempt to Cisco IOS 12.1 Hidden Read/Write Community String ILMI"; content:"ILMI"; nocase; reference:url,www.cisco.com/warp/public/707/cisco-sa-20010228-ios-snmp-community.shtml; reference:url,www.cisco.com/warp/public/707/cisco-sa-20010227-ios-snmp-ilmi.shtml; reference:url,doc.emergingthreats.net/2011011; classtype:attempted-admin; sid:2011011; rev:2; metadata:created_at 2010_07_30, updated_at 2010_07_30;)',
            "isEnabled": True,
            "byPassValidation": False
        }

        add_rule = {
            "rulesetID": None,
            "ruleToAdd": None
        }

        for i in range(10):
            ruleset["name"] = "ruleset" + str(i)
            response = self.app.post(CREATE_RULESET_URL, json=ruleset)
            self.assertEqual(response.status_code, 200)
            rule_set_id = response.json['_id']
            for x in range(5):
                single_rule["ruleName"] = "rule" + str(x)
                single_rule["rule"] = "ruleContent" + str(x)
                single_rule['rule_set_id'] = rule_set_id
                response = self.app.post(create_rule_url, json=single_rule)
                self.assertEqual(response.status_code, 200)
