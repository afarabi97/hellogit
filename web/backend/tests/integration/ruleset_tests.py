import json
import os
import requests
import sys
import unittest

from requests.models import Response
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR + '/../../')

from app.kickstart_controller import save_kickstart_to_mongo
from app.kit_controller import _replace_kit_inventory
from shared.constants import RULESET_STATES
from pathlib import Path
from tests.integration.base_test_setup import BaseTestCase
from typing import Dict, List


class TestRulesetController(BaseTestCase):

    def setUp(self):
        super().setUp()

    def _verify_ruleset_count(self, expected_count: int):
        response = self.session.get(self.base_url + "/api/get_rulesets/")
        self.assertEqual(response.status_code, 200)
        rule_sets = response.json()
        self.assertEqual(expected_count, len(rule_sets))

    def _verify_rule_count(self, rule_set_id: str, expected_count: int):
        response = self.session.get(self.base_url + "/api/get_rules/" + str(rule_set_id))
        self.assertEqual(response.status_code, 200)
        rules = response.json()
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

    def test_get_sensor_hostinfo(self):
        response = self.session.get(self.base_url + "/api/get_sensor_hostinfo")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

        # Add in a valid kickstart and kit configuration.
        save_kickstart_to_mongo(self.kickstart_form1)
        is_successful, _ = _replace_kit_inventory(self.kit_form3)
        self.assertTrue(is_successful)

        response = self.session.get(self.base_url + "/api/get_sensor_hostinfo")
        self.assertEqual(response.status_code, 200)

        host_info = response.json() # type: List
        self.assertEqual(2, len(host_info))

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

        response = self.session.post(self.base_url + "/api/create_ruleset", json=ruleset)
        self.assertEqual(response.status_code, 200)
        actual_result = response.json() # type: Dict
        self.assertIsNotNone(actual_result['_id'])
        ruleset_id = actual_result['_id']
        self._verify_ruleset(ruleset, actual_result, RULESET_STATES[0])

        files = {'upload_file': open(self.sample_rules1,'rb')}
        values = {'ruleSetForm': json.dumps(actual_result)}

        response = requests.post(self.base_url + "/api/upload_rule", files=files, data=values)
        self.assertEqual(200, response.status_code)
        self._verify_ruleset_count(1)
        self._verify_rule_count(ruleset_id, 1)

        files['upload_file'] = open(self.invalid_sample_rules1,'rb')
        response = requests.post(self.base_url + "/api/upload_rule", files=files, data=values)
        self.assertEqual(200, response.status_code)
        self.assertIsNotNone(response.json()['error_message'])
        self._verify_ruleset_count(1)
        self._verify_rule_count(ruleset_id, 1)

        files['upload_file'] = open(self.zip_rules,'rb')
        response = requests.post(self.base_url + "/api/upload_rule", files=files, data=values)
        self.assertEqual(200, response.status_code)
        self._verify_ruleset_count(1)
        self._verify_rule_count(ruleset_id, 5)

        response = self.session.post(self.base_url + "/api/create_ruleset", json=bro_ruleset)
        self.assertEqual(response.status_code, 200)
        actual_result = response.json() # type: Dict
        self.assertIsNotNone(actual_result['_id'])
        ruleset_id = actual_result['_id']
        self._verify_ruleset(bro_ruleset, actual_result, RULESET_STATES[0])

        files['upload_file'] = open(self.zeek_rules,'rb')
        values = {'ruleSetForm': json.dumps(actual_result)}
        response = requests.post(self.base_url + "/api/upload_rule", files=files, data=values)
        self.assertEqual(200, response.status_code)
        self._verify_ruleset_count(2)
        self._verify_rule_count(ruleset_id, 1)


    def test_crud_operations_for_rulesets_and_rules(self):
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
            "isEnabled": True
        }

        single_rule2 = {
            "ruleName": "ruleTwo",
            "rule": 'alert udp $EXTERNAL_NET any -> $HOME_NET 161 (msg:"GPL SNMP null community string attempt"; content:"|04 01 00|"; depth:15; offset:5; reference:bugtraq,2112; reference:bugtraq,8974; reference:cve,1999-0517; classtype:misc-attack; sid:2101892; rev:7; metadata:created_at 2010_09_23, updated_at 2010_09_23;)',
            "isEnabled": True
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
        response = self.session.post(self.base_url + "/api/create_ruleset", json=ruleset)
        self.assertEqual(response.status_code, 200)
        actual_result = response.json() # type: Dict
        self.assertIsNotNone(actual_result['_id'])
        ruleset_id = actual_result['_id']
        self._verify_ruleset(ruleset , actual_result, RULESET_STATES[0])

        # Test Save rule, verify that ruleset is marked dirty.
        # Verify that ruleset state change to Dirty
        add_rule['rulesetID'] = ruleset_id
        add_rule['ruleToAdd'] = single_rule
        response = self.session.post(self.create_rule_url, json=add_rule)
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 1)
        actual_result = response.json() # type: Dict
        self._verify_rule(single_rule, actual_result)
        self._verify_ruleset_count(1)
        response = self.session.get(self.base_url + "/api/get_ruleset/" + str(ruleset_id))
        ruleset = response.json()
        self.assertEqual(ruleset['state'], RULESET_STATES[1])

        # Test save same rule and make sure
        # Verify that the states is still dirty
        add_rule['rulesetID'] = ruleset_id
        add_rule['ruleToAdd'] = single_rule
        response = self.session.post(self.create_rule_url, json=add_rule)
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 2)

        # Test save different rule
        add_rule['rulesetID'] = ruleset_id
        add_rule['ruleToAdd'] = single_rule2
        response = self.session.post(self.create_rule_url, json=add_rule)
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 3)

        # Test update rule
        single_rule2_w_id = response.json()
        single_rule2_w_id["ruleName"] = "I updated the name!"
        single_rule2_w_id["isEnabled"] = False
        update_rule["rulesetID"] = ruleset_id
        update_rule["ruleToUpdate"] = single_rule2_w_id
        response = self.session.put(self.base_url + "/api/update_rule", json=update_rule)
        self.assertEqual(response.status_code, 200)
        self._verify_rule(single_rule2_w_id, response.json())
        self._verify_rule_count(ruleset_id, 3)

        # Test update ruleset
        response = self.session.get(self.base_url + '/api/get_ruleset/' + str(ruleset_id))
        test_rule_set = response.json()
        test_rule_set["state"] = "dirty"
        test_rule_set["isEnabled"] = False
        response = self.session.put(self.base_url + "/api/update_ruleset", json=test_rule_set)
        self.assertEqual(response.status_code, 200)
        self._verify_ruleset(test_rule_set, response.json(), RULESET_STATES[1])
        self._verify_rule_count(ruleset_id, 3)

        # Test delete rule
        response = self.session.delete(self.base_url + "/api/delete_rule/" + str(ruleset_id) + "/" + str(single_rule2_w_id['_id']))
        self.assertEqual(response.status_code, 200)
        self._verify_rule_count(ruleset_id, 2)

        # Test delete ruleset
        response = self.session.delete(self.base_url + "/api/delete_ruleset/" + str(ruleset_id))
        self.assertEqual(response.status_code, 200)
        self._verify_ruleset_count(0)

    @unittest.skip('')
    def test_modifyruleset(self):
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
            "isEnabled": True
        }

        add_rule = {
            "rulesetID": None,
            "ruleToAdd": None
        }

        for i in range(10):
            ruleset["name"] = "ruleset" + str(i)
            response = self.session.post(self.base_url + "/api/create_ruleset", json=ruleset)
            self.assertEqual(response.status_code, 200)
            rule_set_id = response.json()['_id']
            for x in range(5):
                single_rule["ruleName"] = "rule" + str(x)
                single_rule["rule"] = "ruleContent" + str(x)
                add_rule['rulesetID'] = rule_set_id
                add_rule['ruleToAdd'] = single_rule
                response = self.session.post(self.create_rule_url, json=add_rule)
                self.assertEqual(response.status_code, 200)
