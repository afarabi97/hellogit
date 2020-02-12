import os
import sys
import requests
import json
import unittest
import shutil

from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../'

sys.path.append(SCRIPT_DIR + '/../')

from app import conn_mng, _initalize_counters


class BaseTestCase(unittest.TestCase):

    def setUp(self):
        self.session = requests.Session()
        self.base_url = 'http://localhost:5002'
        conn_mng.mongo_client.drop_database("tfplenum_database")
        _initalize_counters()
        kickstart1 = Path(SCRIPT_DIR + '/testfiles/kickstart1.json')
        self.kickstart_form1 = json.loads(kickstart1.read_text(), encoding='utf-8')
        self.kit3_pth = Path(SCRIPT_DIR + '/testfiles/kit3.json')
        self.sample_pcap1 = Path(SCRIPT_DIR + '/testfiles/ipv4frags.pcap')
        self.kit_form3 = json.loads(self.kit3_pth.read_text(), encoding='utf-8')
        shutil.rmtree('/var/www/html/pcaps/', ignore_errors=True)
