from tests.static_data import get_node_expected
from tests.test_base import BaseTestCase

class TestRulesetControllerTest(BaseTestCase):

    def test_pcap_rule_test(self):
        rule_content = 'alert tcp $EXTERNAL_NET $HTTP_PORTS -> $HOME_NET any (msg:"ET WEB_CLIENT Hex Obfuscation of String.fromCharCode %u UTF-16 Encoding"; flow:established,to_client; content:"%u5374%u7269%u6e67%u2e66%u726f%u6d43%u6861%u7243%u6f64%u65"; nocase; reference:url,cansecwest.com/slides07/csw07-nazario.pdf; reference:url,www.sophos.com/security/technical-papers/malware_with_your_mocha.html; classtype:bad-unknown; sid:2012109; rev:2; metadata:affected_product Web_Browsers, affected_product Web_Browser_Plugins, attack_target Client_Endpoint, created_at 2010_12_28, deployment Perimeter, signature_severity Major, tag Web_Client_Attacks, updated_at 2016_07_01;)'
        payload = {'pcap_name': 'wannacry.pcap',
                   'rule_content': rule_content,
                   'ruleType': 'Suricata'}
        results = self.flask_app.post('/api/policy/pcap/rule/test', json=payload)
        self.assertEquals(200, results.status_code)
        self.assertTrue(results.is_streamed)

        # Insure the json file returned is the same length as what is notated in the header.
        self.assertEqual(len(results.get_data()), int(results.headers['Content-Length']))

        # Attempt to run a rm -rf / on the controller.  This of course should not work with the secure_filename call.
        payload = {'pcap_name': '; rm -rf /;',
                   'rule_content': rule_content,
                   'ruleType': 'Suricata'}

        results = self.flask_app.post('/api/policy/pcap/rule/test', json=payload)
        self.assertEquals(400, results.status_code)
        self.assertTrue('error_message' in results.json)
