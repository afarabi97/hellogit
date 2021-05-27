import json
import os
import unittest

from app import app, conn_mng
from app.models.settings.kit_settings import KitSettingsForm
from app.tests.base_test_setup import BaseTestCase
from datetime import datetime, timedelta
from flask.wrappers import Response
from ipaddress import IPv4Address
from pathlib import Path
from rq.job import Job, JobStatus


class KickstartTests(BaseTestCase):

    def test_kickstart_add_node(self):
        response = self.app.put("/api/kickstart", json=self.add_node_json)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(['Kickstart has not been saved yet.'], response.json["post_validation"])

    def _kickstart_add_node_test(self):
        response = self.app.put("/api/kickstart", json=self.add_node_json)
        self.assertEqual(response.status_code, 200)
        response = self.app.get('/api/kickstart')
        self.assertEqual(response.status_code, 200)
        payload = response.json # type: Response
        self.assertEqual(4, len(payload["nodes"]))

    # @unittest.skip("")
    def test_kickstart_successful_conditions(self):
        self._run_dip_kickstart(True)
        #Test Add node
        self._kickstart_add_node_test()

    # @unittest.skip("")
    def test_kickstart_invalid_IP_Addresses(self):
        self.kickstart_form2["gateway"] = "thisisnotanipaddress"
        self.kickstart_form2["controller_interface"] = "thisisnotanipaddress"
        self.kickstart_form2["netmask"] = "thisisnotanipaddress"
        self.kickstart_form2["upstream_dns"] = "thisisnotanipaddress"
        self.kickstart_form2["upstream_ntp"] = "thisisnotanipaddress"
        self.kickstart_form2["dhcp_range"] = "thisisnotanipaddress"

        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 400)
        for key in response.json:
            self.assertEqual('Not a valid IPv4 address.', response.json[key][0])

    # @unittest.skip("")
    def test_kickstart_duplicate_macs(self):
        self.kickstart_form2["nodes"][0]["mac_address"] = "00:0a:29:6e:7f:f2"
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 400)
        self.assertEqual('server1 and sensor1 have the same MAC Address.',
                         response.json['post_validation'][0])

    # @unittest.skip("")
    def test_kickstart_duplicate_IP(self):
        self.kickstart_form2["nodes"][0]["ip_address"] = "10.40.12.147"
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 400)
        self.assertEqual('server1 and server2 have the same IP Address.',
                         response.json['post_validation'][0])

    # @unittest.skip("")
    def test_kickstart_duplicate_hostnames(self):
        self.kickstart_form2["nodes"][0]["hostname"] = "sensor1"
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 400)
        self.assertEqual('Two or more of your nodes have the same hostname.',
                         response.json['post_validation'][0])

    # @unittest.skip("")
    def test_kickstart_optional_fields(self):
        del self.kickstart_form2["upstream_dns"]
        del self.kickstart_form2["upstream_ntp"]
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 200)
        kickstart = KitSettingsForm.load_from_db()
        self.assertIsNotNone(kickstart)
        self.assertEqual(IPv4Address("0.0.0.0"), kickstart.upstream_dns)
        self.assertEqual(IPv4Address("0.0.0.0"), kickstart.upstream_ntp)

    # @unittest.skip("")
    def test_node_optional_fields_when_os_raid_is_false(self):
        # "raid_drives": "sda,sdb",
        # "os_raid": true,
        # "os_raid_root_size": 0
        self.kickstart_form2["nodes"][0]["os_raid"] = False
        del self.kickstart_form2["nodes"][0]["raid_drives"]
        del self.kickstart_form2["nodes"][0]["os_raid_root_size"]
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 200)

        # Test case where os_raid is still set to False but they decided
        # to leave out data_drive and boot_drive
        del self.kickstart_form2["nodes"][0]["data_drives"]
        del self.kickstart_form2["nodes"][0]["boot_drives"]
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(response.json["post_validation"]), 2)

    # @unittest.skip("")
    def test_node_optional_fields_when_os_raid_is_true(self):
        self.kickstart_form2["nodes"][0]["os_raid"] = True
        del self.kickstart_form2["nodes"][0]["data_drives"]
        del self.kickstart_form2["nodes"][0]["boot_drives"]
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(response.json["post_validation"]), 1)

        self.kickstart_form2["nodes"][0]["os_raid_root_size"] = 1
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 200)

        del self.kickstart_form2["nodes"][0]["raid_drives"]
        del self.kickstart_form2["nodes"][0]["os_raid_root_size"]
        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(response.json["post_validation"]), 2)

    @unittest.skip("")
    def test_password_conditions(self):
        #TODO
        pass

    @unittest.skip("")
    def test_hostname_conditions(self):
        #TODO
        pass

    @unittest.skip("")
    def test_drivename_conditions(self):
        #TODO
        pass
