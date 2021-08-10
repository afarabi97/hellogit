#!/usr/bin/python3
import os
import sys
import requests
import time
from requests.auth import HTTPBasicAuth

VERIFY="/etc/ssl/certs/container/ca.crt"
MISP_MODULES_URL=os.environ['MISP_MODULES_URL']
MISP_MODULES_PORT=os.environ['MISP_MODULES_PORT']
MM_URI = "http://{uri}:{port}/modules".format(uri=MISP_MODULES_URL, port=MISP_MODULES_PORT)
CORTEX_URI="https://cortex.default.svc.cluster.local/api"
CORTEX_USER_USERNAME=os.getenv('CORTEX_USER_USERNAME',default='')
ORG_ADMIN_USERNAME=os.getenv('CORTEX_ADMIN_USERNAME',default='')
ORG_ADMIN_PASSWORD=os.getenv('CORTEX_ADMIN_PASSWORD',default='')
CORTEX_INTEGRATION=os.getenv('CORTEX_INTEGRATION',default='')
cortex_headers = {"Content-Type": "application/json", "Accept": "application/json"}
ENV_FILE = '/tmp/misp1/application.env'

class MISPSetup:
    def __init__(self):
        print("Running MISP Init Setup Script")
        self._verify = VERIFY

    def get_cortex_status(self):
        if not CORTEX_INTEGRATION == "true":
            return False
        print("Checking Cortex Status")
        try:
            r = requests.get(CORTEX_URI + "/status", verify=VERIFY, headers=cortex_headers)
            print(r)
            if r.status_code == 200:
                print(r)
                return True
        except Exception as e:
            print("Setup Exception: " + str(e))
            return False

    def get_cortex_api(self):
        print("Getting Cortex API Key")
        url = CORTEX_URI + '/user/{cortex_user}/key/renew'.format(cortex_user=CORTEX_USER_USERNAME)
        response = requests.post(url=url, auth=HTTPBasicAuth(ORG_ADMIN_USERNAME, ORG_ADMIN_PASSWORD), verify=VERIFY, headers=cortex_headers)
        if response and response.status_code == 200:
            return response.text
        sys.exit(os.EX_CONFIG)

    def update_cortex_env_file(self, api_key):
        lines = []
        try:
            print("Setting Cortex API Key")
            lines.append('SETTING_Plugin_Cortex_authkey={}'.format(api_key))
            with open(ENV_FILE, 'wt') as fp:
                fp.write('\n'.join(lines))
        except Exception as e:
            print("Setup Exception: " + str(e))
            sys.exit(os.EX_CONFIG)


if __name__ == '__main__':
    setup = MISPSetup()
    with open(ENV_FILE, 'wt') as fp:
        fp.write('MISP=true\n')
    if CORTEX_INTEGRATION == 'true':
        while not setup.get_cortex_status():
            time.sleep(2)
        api_key = setup.get_cortex_api()
        time.sleep(10)
        setup.update_cortex_env_file(api_key)
    while True:
        print("Waiting for MISP Modules to becoming ready...")
        try:
            r = requests.get(MM_URI, headers={'Content-Type': 'application/json'})
            if r.status_code == 200:
                print("MISP Modules is ready.  Exiting.")
                sys.exit(0)
            time.sleep(2)
        except Exception as e:
            print("Setup Exception: " + str(e))
            time.sleep(2)
            continue
