import io
import os
import json
import unittest

from app import conn_mng, _initalize_counters, app
from app.models.settings.kit_settings import KitSettingsForm
from datetime import datetime, timedelta
from ipaddress import IPv4Address
from pathlib import Path
from rq.job import JobStatus
from time import sleep
from typing import Union, Tuple


SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__)) + '/'


class BaseTestCase(unittest.TestCase):

    # executed prior to each test
    def setUp(self):
        self.app = app.test_client()
        self.assertEqual(app.debug, False)

        invalid_kickstart1 = Path(SCRIPT_DIR + '/testfiles/kickstart1.json')
        valid_kickstart2 = Path(SCRIPT_DIR + '/testfiles/kickstart2.json')
        mip_kickstart = Path(SCRIPT_DIR + '/testfiles/mip_kickstart.json')

        add_node = Path(SCRIPT_DIR + '/testfiles/add_node.json')
        self.kickstart_form1 = json.loads(invalid_kickstart1.read_text(), encoding='utf-8')
        self.kickstart_form2 = json.loads(valid_kickstart2.read_text(), encoding='utf-8')
        self.mip_kickstart = json.loads(mip_kickstart.read_text(), encoding='utf-8')

        self.add_node_json = json.loads(add_node.read_text(), encoding='utf-8')
        self.kit_form = json.loads(Path(SCRIPT_DIR + '/testfiles/kit.json').read_text(), encoding='utf-8')
        self.kit3_pth = Path(SCRIPT_DIR + '/testfiles/kit3.json')
        self.sample_pcap1 = Path(SCRIPT_DIR + '/testfiles/ipv4frags.pcap')
        self.kit_form3 = json.loads(self.kit3_pth.read_text(), encoding='utf-8')
        self.sample_rules1 = Path(SCRIPT_DIR + '/testfiles/small.rules')
        self.invalid_sample_rules1 = Path(SCRIPT_DIR + '/testfiles/invalid-small.rules')
        self.zip_rules = Path(SCRIPT_DIR + '/testfiles/rules.zip')
        self.zeek_rules = Path(SCRIPT_DIR + '/testfiles/small.zeek')
        self.windows_events = Path(SCRIPT_DIR + '/testfiles/windows_events.zip')
        self.linux_system_events = Path(SCRIPT_DIR + '/testfiles/system_logs.zip')
        self.apache_logs = Path(SCRIPT_DIR + '/testfiles/apache.zip')
        self.suricata_event_logs = Path(SCRIPT_DIR + '/testfiles/suricata_events.zip')
        self.auditd_event_logs = Path(SCRIPT_DIR + '/testfiles/audit_logs.zip')
        conn_mng.mongo_client.drop_database("tfplenum_database")
        _initalize_counters()

    # executed after each test
    def tearDown(self):
        pass

    def _wait_for_job_to_finish(self, job_id: str, minutes_timeout: int=10):
        future_time = datetime.utcnow() + timedelta(minutes=minutes_timeout)

        while True:
            if future_time <= datetime.utcnow():
                print("The {} took way too long.".format(job_id))
                exit(3)

            sleep(5)
            response = self.app.get("/api/job/" + job_id)
            self.assertEqual(response.status_code, 200)
            if response.json["status"] == JobStatus.FINISHED:
                return
            elif response.json["status"] == JobStatus.FAILED:
                self.fail("The job {} failed.".format(job_id))

    def _create_file_test_payload(self, file_path: Union[str, Path]) -> Tuple[io.BytesIO, str]:
        """
        :return Tuple of the bytes and file string of the object.
        """
        if isinstance(file_path, str):
            file_path = Path(file_path)
        with open(str(file_path),'rb') as f:
            return (io.BytesIO(f.read()), file_path.name)

    def _run_dip_kickstart(self, wait_for_completion: bool):
        response = self.app.get('/api/kickstart')
        self.assertEqual(response.status_code, 200)
        payload = response.json # type: Response
        self.assertEqual({}, payload)
        self.assertIsNotNone(payload)

        response = self.app.post('/api/kickstart', json=self.kickstart_form2)
        job_id = response.json["job_id"]
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(job_id)
        kickstart = KitSettingsForm.load_from_db() #Type: dict
        self.assertEqual(IPv4Address("10.10.101.11"), kickstart.upstream_dns)
        self.assertEqual(IPv4Address("10.10.101.12"), kickstart.upstream_ntp)
        if wait_for_completion:
            self._wait_for_job_to_finish(job_id)
            response = self.app.get("/api/job/" + job_id)
            return response
        else:
            return response
