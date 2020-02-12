import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR + '/../../')

from tests.integration.base_test_setup import BaseTestCase

class TestPcapController(BaseTestCase):

    def setUp(self):
        super().setUp()

    def _verify_count(self, expected_count: int):
        response = self.session.get(self.base_url + '/api/get_pcaps')
        results = response.json()
        self.assertEqual(len(results), expected_count)

    def test_create_pcap(self):
        files = {'upload_file': open(str(self.kit3_pth), 'rb' )}
        response = self.session.post(self.base_url + "/api/create_pcap", files=files)
        self.assertEqual(200, response.status_code)
        self.assertIsNotNone(response.json()['error_message'])

        files = {'upload_file': open(str(self.sample_pcap1), 'rb' )}
        response = self.session.post(self.base_url + "/api/create_pcap", files=files)
        self.assertEqual(200, response.status_code)
        self.assertIsNotNone(response.json()['success_message'])
        self._verify_count(1)

        response = self.session.get(self.base_url + '/api/get_pcaps')
        pcap_name = response.json()[0]["name"]
        response = self.session.delete(self.base_url + '/api/delete_pcap/{}'.format(pcap_name))
        self.assertEqual(200, response.status_code)
        self.assertIsNotNone(response.json()['success_message'])
        self._verify_count(0)
