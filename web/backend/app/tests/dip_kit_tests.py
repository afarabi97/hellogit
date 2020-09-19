import json
import os
import unittest

from app import app, conn_mng
from app.models.kit_setup import DIPKickstartSchema, DIPKickstartForm
from app.tests.base_test_setup import BaseTestCase
from datetime import datetime, timedelta
from flask.wrappers import Response
from ipaddress import IPv4Address
from pathlib import Path
from rq.job import Job, JobStatus


class KitTests(BaseTestCase):

    @unittest.skip("")
    def test_dip_kit_successful_conditions(self):
        self._run_dip_kickstart(False)

        response = self.app.post('/api/kit', json=self.kit_form)
        print(response)

    def test_dip_kit_failures(self):
        response = self.app.get('/api/kit')
        self.assertEqual({}, response.json)
        response = self.app.post('/api/kit', json=self.kit_form)
        self.assertIsNotNone(response.json['post_validation'])

        self._run_dip_kickstart(False)

        response = self.app.post('/api/kit', json=self.kit_form)
        print(response.json)
