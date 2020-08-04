import os
import sys
import json
import shutil
import tempfile
import unittest
import zipfile
from datetime import datetime
from time import sleep
from elasticsearch import Elasticsearch

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR + '/../../')

from app import conn_mng
from app.service.cold_log_service import JOB_NAME
from app.service.scale_service import get_elastic_service_ip, get_elastic_password
from tests.integration.base_test_setup import BaseTestCase, wait_for_mongo_job
from typing import Dict, List


class TestColdLogController(BaseTestCase):

    def setUp(self):
        super().setUp()

    def _perform_test_upload(self, files: Dict, cold_log_form: Dict, minutes_timeout:int=3):
        payload = { "coldLogForm":
            json.dumps(cold_log_form)
        }
        response = self.session.post(self.base_url + "/api/upload_cold_log_file",
                                     files=files,
                                     data=payload)
        self.assertEqual(200, response.status_code)

        wait_for_mongo_job(JOB_NAME.capitalize(), minutes_timeout=minutes_timeout)
        elasticsearch_ip, elasticsearch_port = get_elastic_service_ip()
        password = get_elastic_password()
        es = Elasticsearch(elasticsearch_ip,
                           scheme="https",
                           port=elasticsearch_port,
                           http_auth=('elastic', password),
                           use_ssl=True,
                           verify_certs=False)

        expected_index = 'filebeat-external-{}-{}'.format(
            cold_log_form['index_suffix'],
            cold_log_form['module'])

        result = es.count(index=expected_index, params={"format": "json"})
        self.assertGreater(result['count'], 100)
        delete_result = es.indices.delete(index=expected_index)
        self.assertTrue(delete_result['acknowledged'])


    def _get_logs(self, path_to_zip: str, tmp_dir_path: str) -> List:
        logs = []
        shutil.copy2(path_to_zip, tmp_dir_path)
        with zipfile.ZipFile(path_to_zip) as zip_ref:
            zip_ref.extractall(tmp_dir_path)

            for root, dirs, files in os.walk(tmp_dir_path):
                for file_path in files:
                    abs_path = root + "/" + file_path
                    if ".zip" in abs_path.lower():
                        continue
                    logs.append(abs_path)
        return logs


    # @unittest.skip('')
    def test_cold_log_system(self):
        files = {
            'upload_file': open(str(self.linux_system_events), 'rb' ),
        }
        cold_log_form = {
            "module": "system",
            "index_suffix": "cold-log0",
            "send_to_logstash": False
        }

        self._perform_test_upload(files, cold_log_form, 10)

    # @unittest.skip('')
    def test_cold_log_auditd(self):
        files = {
            'upload_file': open(str(self.auditd_event_logs), 'rb' ),
        }
        cold_log_form = {
            "module": "auditd",
            "index_suffix": "cold-log1",
            "send_to_logstash": False
        }

        self._perform_test_upload(files, cold_log_form, 10)

    # @unittest.skip('')
    def test_cold_log_suricata(self):
        files = {
            'upload_file': open(str(self.suricata_event_logs), 'rb' ),
        }
        cold_log_form = {
            "module": "suricata",
            "index_suffix": "cold-log2",
            "send_to_logstash": False
        }

        self._perform_test_upload(files, cold_log_form)

    # @unittest.skip('')
    def test_cold_log_apache(self):
        files = {
            'upload_file': open(str(self.apache_logs), 'rb' ),
        }
        cold_log_form = {
            "module": "apache",
            "index_suffix": "cold-log3",
            "send_to_logstash": False
        }

        self._perform_test_upload(files, cold_log_form)

    @unittest.skip('')
    def test_cold_log_system_indivdual_files(self):
        with tempfile.TemporaryDirectory() as tmp_dir_path:
            logs = self._get_logs(str(self.suricata_event_logs), tmp_dir_path)
            for index, log in enumerate(logs):
                print("PROCESSING " + log)
                files = {
                    'upload_file': open(log, 'rb' ),
                }
                cold_log_form = {
                    "module": "suricata",
                    "index_suffix": "test-individual{}".format(index)
                }
                self._perform_test_upload(files, cold_log_form, 10)

    # TODO We cannot run this test as we do not setup a Windows VM with virtual kits.
    @unittest.skip('')
    def test_cold_log_windows(self):
        files = {
            'upload_file': open(str(self.windows_events), 'rb' ),
        }
        cold_log_form = {
            "module": "windows",
            "index_suffix": "cold-log5",
            "send_to_logstash": False
        }

        self._perform_test_upload(files, cold_log_form, 10)
