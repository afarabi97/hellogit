from app.tests.base_test_setup import BaseTestCase


class TestPcapController(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.inital_count = None

    def _verify_count(self, expected_count: int):
        response = self.app.get('/api/pcaps')
        results = response.json
        self.assertEqual(len(results), expected_count + self.inital_count)

    def test_create_pcap(self):
        # Set the initial count.
        response = self.app.get('/api/pcaps')
        results = response.json
        self.inital_count = len(results)

        files = {'upload_file': open(str(self.kit3_pth), 'rb' )}
        response = self.app.post("/api/pcap/upload", data=files)
        self.assertEqual(400, response.status_code)
        self.assertIsNotNone(response.json['error_message'])

        payload = self._create_file_test_payload(self.sample_pcap1)
        pcap_name = payload[1]
        files = {'upload_file': payload}
        response = self.app.post("/api/pcap/upload", data=files)

        self.assertEqual(200, response.status_code)
        self.assertIsNotNone(response.json['success_message'])
        self._verify_count(1)

        response = self.app.delete('/api/pcap/{}'.format(pcap_name))
        self.assertEqual(200, response.status_code)
        self.assertIsNotNone(response.json['success_message'])
        self._verify_count(0)
