import json
import os
os.environ["DEBUG_SRV"] = 'yes'
import requests
import sys
import unittest
import multiprocessing

from requests.models import Response
from pprint import pprint
from time import sleep

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

sys.path.append(SCRIPT_DIR + '/../')

from app.kickstart_controller import save_kickstart_to_mongo
from app.kit_controller import _replace_kit_inventory
from pathlib import Path
from app import conn_mng, socketio, app
from flask_socketio import SocketIO
from tests.integration.base_test_setup import BaseTestCase
from tests.integration.ruleset_tests import TestRulesetController
from tests.integration.pcap_tests import TestPcapController
from typing import Dict, List



class TestKickstartController(BaseTestCase):

    @unittest.skip('')
    def test_ipchange_detection_failure(self):
        response = self.session.put(self.base_url + '/api/update_kickstart_ctrl_ip/192.168.1.12') # type: Response
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.json()['error_message'])

    def test_ipchange_detection(self):
        save_kickstart_to_mongo(self.kickstart_form1)
        expected_result = '192.168.1.12'
        response = self.session.put(self.base_url + '/api/update_kickstart_ctrl_ip/' + expected_result) # type: Response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(expected_result, response.json()['controller_interface'][0])


class TestCommonController(BaseTestCase):

    @unittest.skip('')
    def test_reset_all_forms(self):
        save_kickstart_to_mongo(self.kickstart_form1)
        is_successful, _ = _replace_kit_inventory(self.kit_form1['kitForm'])
        self.assertTrue(is_successful)
        response = self.session.delete(self.base_url + '/api/archive_configurations_and_clear') # type: Response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(0, conn_mng.mongo_kickstart.count_documents({}))
        self.assertEqual(0, conn_mng.mongo_kit.count_documents({}))
        self.assertEqual(1, conn_mng.mongo_kickstart_archive.count_documents({}))
        self.assertEqual(1, conn_mng.mongo_kit_archive.count_documents({}))


class TestAgentBuilder(BaseTestCase):

    def test_api(self):
        # Exercise logic for building a windows installer
        response = self.session.post(
            self.base_url + '/api/generate_windows_installer', 
            json = {
                'pf_sense_ip': '172.16.72.2', 
                'winlogbeat_port': '123',
                'install_winlogbeat': False,
                'install_sysmon': True })
        print(response)
        print(response.headers)
        self.assertEqual(200, response.status_code)
        # Check to see the API call returned a file by saving the file and
        #  checking that its filesize isn't zero
        filename = 'monitor_install.exe'
        with open(filename, 'wb') as outputFile:
            for data in response.iter_content():
                outputFile.write(data)
        self.assertTrue(os.stat(filename).st_size > 0)
        print('Save the file "monitor_install.exe" on a Windows machine and '
                'test if you can install Winlogbeat and Sysmon.')


def start_debug_api_srv():
    socketio.run(app, host='0.0.0.0', port=5002, debug=False) # type: SocketIO


def run_integration_tests() -> bool:
    """
    Runs controller integration tests and returns true on success.

    :return:
    """    
    test_classes_to_run = [TestRulesetController, TestPcapController, TestCommonController, TestKickstartController]    
    loader = unittest.TestLoader()
    suites_list = []
    for test_class in test_classes_to_run:
        suite = loader.loadTestsFromTestCase(test_class)
        suites_list.append(suite)

    big_suite = unittest.TestSuite(suites_list)

    runner = unittest.TextTestRunner()
    results = runner.run(big_suite)
    if len(results.failures) > 0 or len(results.errors) > 0:
        return False
    return True


def main():
    p = multiprocessing.Process(target=start_debug_api_srv)
    p.start()
    sleep(5)
    if run_integration_tests():
        p.terminate()
        exit(0)
    else:
        p.terminate()
        exit(1)
    
if __name__ == '__main__':    
    main()
