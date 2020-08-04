import os
import sys
import requests
import json
import unittest
import pymongo
import shutil

from datetime import datetime, timedelta
from pathlib import Path
from time import sleep


SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../'

sys.path.append(SCRIPT_DIR + '/../')

from app import conn_mng, _initalize_counters
from app.service.job_service import run_command2


class BaseTestCase(unittest.TestCase):
    CONTROLLER_API_KEY = None

    @classmethod
    def setUpClass(cls):
        api_gen_cmd = '/opt/tfplenum/web/tfp-env/bin/python3 /opt/sso-idp/gen_api_token.py --roles "controller-admin,controller-maintainer,operator" --exp 0.5'
        api_key, ret_code = run_command2(api_gen_cmd)
        cls.CONTROLLER_API_KEY = api_key.strip()

    def setUp(self):
        self.session = requests.Session()
        self.session.headers.update({ 'Authorization': 'Bearer '+ self.CONTROLLER_API_KEY })
        self.base_url = 'http://localhost:5002'
        self.create_rule_url = self.base_url + "/api/create_rule"
        conn_mng.mongo_client.drop_database("tfplenum_database")
        _initalize_counters()
        kickstart1 = Path(SCRIPT_DIR + '/testfiles/kickstart1.json')
        self.kickstart_form1 = json.loads(kickstart1.read_text(), encoding='utf-8')
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
        shutil.rmtree('/var/www/html/pcaps/', ignore_errors=True)


class CeleryTaskFailed(Exception):
    pass


def wait_for_mongo_job(job_name: str, minutes_timeout: int):
    print("wait_for_mongo_job")
    future_time = datetime.utcnow() + timedelta(minutes=minutes_timeout)

    while True:
        if future_time <= datetime.utcnow():
            print("The {} took way too long.".format(job_name))
            exit(3)

        result = conn_mng.mongo_last_jobs.find_one({"_id": job_name})
        print(result)
        if result:
            if result["return_code"] != 0:
                raise CeleryTaskFailed("{name} failed with message: {message}".format(name=result["_id"], message=result["message"]))
            else:
                print("{name} job completed successfully".format(name=job_name))
            break
        else:
            print("Waiting for {} to complete sleeping 5 seconds then rechecking.".format(job_name))
            sleep(5)
