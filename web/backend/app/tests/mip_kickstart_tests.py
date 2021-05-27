import json
import os
import unittest

from app import app, conn_mng
from app.models.settings.mip_settings import MipSettingsForm
from app.tests.base_test_setup import BaseTestCase
from datetime import datetime, timedelta
from flask.wrappers import Response
from ipaddress import IPv4Address
from pathlib import Path
from rq.job import Job, JobStatus


class MIPKickstartTests(BaseTestCase):

    # @unittest.skip("")
    def test_mip_kickstart_successful_conditions(self):
        response = self.app.get('/api/kickstart/mip')
        self.assertEqual(response.status_code, 200)
        payload = response.json # type: Response
        self.assertEqual({}, payload)
        self.assertIsNotNone(payload)

        response = self.app.post('/api/kickstart/mip', json=self.mip_kickstart)
        job_id = response.json["job_id"]
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(job_id)
        kickstart = MipSettingsForm.load_from_db()
        self.assertEqual(IPv4Address("10.10.101.11"), kickstart.dns)
        response = self.app.get("/api/job/" + job_id)
        self._wait_for_job_to_finish(job_id)

    # @unittest.skip("")
    def test_mip_kickstart_invalid_IP_Addresses(self):
        self.mip_kickstart["gateway"] = "thisisnotanipaddress"
        self.mip_kickstart["controller_interface"] = "thisisnotanipaddress"
        self.mip_kickstart["netmask"] = "thisisnotanipaddress"
        self.mip_kickstart["dns"] = "thisisnotanipaddress"
        self.mip_kickstart["dhcp_range"] = "thisisnotanipaddress"

        response = self.app.post('/api/kickstart/mip', json=self.mip_kickstart)
        self.assertEqual(response.status_code, 400)
        for key in response.json:
            self.assertEqual('Not a valid IPv4 address.', response.json[key][0])

    # @unittest.skip("")
    def test_mip_kickstart_duplicate_macs(self):
        self.mip_kickstart["nodes"][0]["mac_address"] = "00:0a:29:6e:7f:f2"
        response = self.app.post('/api/kickstart/mip', json=self.mip_kickstart)
        self.assertEqual(response.status_code, 400)
        self.assertEqual('server1 and sensor1 have the same MAC Address.',
                         response.json['post_validation'][0])

    # @unittest.skip("")
    def test_mip_kickstart_duplicate_IP(self):
        self.mip_kickstart["nodes"][0]["ip_address"] = "10.40.12.147"
        response = self.app.post('/api/kickstart/mip', json=self.mip_kickstart)
        self.assertEqual(response.status_code, 400)
        self.assertEqual('server1 and server2 have the same IP Address.',
                         response.json['post_validation'][0])

    # @unittest.skip("")
    def test_mip_kickstart_duplicate_hostnames(self):
        self.mip_kickstart["nodes"][0]["hostname"] = "sensor1"
        response = self.app.post('/api/kickstart/mip', json=self.mip_kickstart)
        self.assertEqual(response.status_code, 400)
        self.assertEqual('Two or more of your nodes have the same hostname.',
                         response.json['post_validation'][0])

    @unittest.skip("")
    def test_mip_kickstart_optional_fields(self):
        del self.mip_kickstart["dns"]
        response = self.app.post('/api/kickstart/mip', json=self.mip_kickstart)
        self.assertEqual(response.status_code, 200)
        kickstart = MipSettingsForm.load_from_db()
        self.assertIsNotNone(kickstart)
        self.assertEqual(IPv4Address("0.0.0.0"), kickstart.upstream_dns)
        self.assertEqual(IPv4Address("0.0.0.0"), kickstart.upstream_ntp)

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
