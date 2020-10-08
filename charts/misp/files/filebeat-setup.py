#!/usr/bin/python
import requests
from requests.auth import HTTPBasicAuth
import time, os, sys, re


URI="https://misp.default.svc.cluster.local"
headers = {"Content-Type": "application/json", "Accept": "application/json"}
FILEBEAT_USER_EMAIL=os.environ['FILEBEAT_USER_EMAIL']
FILEBEAT_USER_API_KEY=os.environ['FILEBEAT_USER_API_KEY']
VERIFY="/etc/ssl/certs/container/ca.crt"

class MISPSetup:
    def __init__(self):
        print("Running MISP Setup Script")
        self._verify = VERIFY
        self._misp_api_key = FILEBEAT_USER_API_KEY

    def get(self, url=None, requires_auth=False):
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            print("Number of retries:" + str(c))
            try:
                c += 1
                if requires_auth:
                    headers['Authorization'] = self._misp_api_key
                    r = requests.get(url, headers=headers, verify=VERIFY)
                else:
                    r = requests.get(url, headers=headers,verify=VERIFY)

                print(str(r.status_code) + " " + r.text)

                if r.status_code == 200 or r.status_code == 201 or r.status_code == 204 or r.status_code == 403:
                    return r
                time.sleep(2)
            except Exception as e:
                c += 1
                print("Setup Exception: " + str(e))
                time.sleep(2)

    def check_filebeat_user(self):
        while True:
            print("Waiting for filbeat user to becoming ready...")
            try:
                headers['Authorization'] = FILEBEAT_USER_API_KEY
                headers['Accept'] = 'application/json'
                headers['Content-Type'] = 'application/json'
                r = requests.post(URI + "/attributes/restSearch",headers=headers,timeout=3,verify=VERIFY)
                print("Status: ", r.status_code)
                if r.status_code == 200:
                    sys.exit(0)
                else:
                    print("Status: ", r.json())
                time.sleep(2)
            except Exception as e:
                print("Setup Exception: " + str(e))
                time.sleep(2)
                continue

if __name__ == '__main__':
    setup = MISPSetup()
    setup.check_filebeat_user()
