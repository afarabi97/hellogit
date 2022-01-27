from tests.test_base import BaseTestCase
from unittest.mock import patch
from unittest.mock import MagicMock

class TestCommonControllerTest(BaseTestCase):

    @patch('app.controller.common_controller._nmap_scan')
    def test_used_ip_address(self, test: MagicMock):
        test.return_value = ["10.40.12.12", "10.40.12.13"]
        ip_or_network_id = "10.40.12.0"
        netmask = "255.255.255.0"
        results = self.flask_app.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(200, results.status_code)
        self.assertGreater(len(results.json), 0)

    def test_used_ip_address_failure_cases(self):
        # Test invalid netmask
        ip_or_network_id = "10.40.12.0"
        netmask = "255.25255.0"
        results = self.flask_app.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid Netmask Error', results.json['message'])

        # Test invalid ip address
        ip_or_network_id = "10.40.12"
        netmask = "255.255.255.0"
        results = self.flask_app.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid IP Address Error', results.json['message'])

        # Test command injection
        ip_or_network_id = "10.40.12.0%3Bip%20addr%3B"
        netmask = "255.255.255.0"
        results = self.flask_app.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid IP Address Error', results.json['message'])

        ip_or_network_id = "10.40.12.0"
        netmask = "10.40.12.0%3Bip%20addr%3B"
        results = self.flask_app.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid Netmask Error', results.json['message'])

    @patch('app.controller.common_controller._nmap_scan')
    def test_unused_ip_address(self, test: MagicMock):
        # Test successful condition
        test.return_value = ["10.40.12.12", "10.40.12.13"]
        ip_or_network_id = "10.40.12.0"
        netmask = "255.255.255.0"
        results = self.flask_app.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(200, results.status_code)
        self.assertGreater(len(results.json), 0)

    def test_unused_ip_address_failure_cases(self):
        # Test invalid netmask
        ip_or_network_id = "10.40.12.0"
        netmask = "255.25255.0"
        results = self.flask_app.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid Netmask Error', results.json['message'])

        # Test invalid ip address
        ip_or_network_id = "10.40.12"
        netmask = "255.255.255.0"
        results = self.flask_app.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid IP Address Error', results.json['message'])

        # Test command injection
        ip_or_network_id = "10.40.12.0%3Bip%20addr%3B"
        netmask = "255.255.255.0"
        results = self.flask_app.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid IP Address Error', results.json['message'])

        ip_or_network_id = "10.40.12.0"
        netmask = "10.40.12.0%3Bip%20addr%3B"
        results = self.flask_app.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
        self.assertEquals(500, results.status_code)
        self.assertEquals('Invalid Netmask Error', results.json['message'])
