#!/usr/bin/python
import requests
from requests.auth import HTTPBasicAuth
import time
import os

URI="https://hive.default.svc.cluster.local/api"
SUPER_USERNAME=os.environ['THEHIVE_SUPERADMIN_USERNAME']
SUPER_PASS=os.environ['THEHIVE_SUPERADMIN_PASSWORD']
ALERT_USERNAME=os.environ['THEHIVE_ALERT_USERNAME']
ALERT_PASSWORD=os.environ['THEHIVE_ALERT_PASSWORD']
USER_USERNAME=os.environ['THEHIVE_USER_USERNAME']
USER_PASSWORD=os.environ['THEHIVE_USER_PASSWORD']
CASE_TEMPLATE=os.environ['CASE_TEMPLATE']
VERIFY="/etc/ssl/certs/container/ca.crt"


class HiveSetUp:
    def __init__(self):
        self._auth = HTTPBasicAuth(SUPER_USERNAME, SUPER_PASS)
        self._verify = VERIFY
        self._headers = {'Content-Type': 'application/json','Accept': 'application/json'}

    def post(self, url=None, data=None, requires_auth=False):
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            try:
                c += 1
                if data and requires_auth:
                    r = requests.post(url=url, json=data, auth=self._auth, verify=self._verify, headers=self._headers)
                elif data is None and requires_auth:
                    r = requests.post(url=url, auth=self._auth, verify=self._verify, headers=self._headers)
                elif data and requires_auth == False:
                    r = requests.post(url=url, json=data, verify=self._verify, headers=self._headers)
                else:
                    r = requests.post(url=url, verify=self._verify, headers=self._headers)
                print(str(r.status_code) + " " + r.text)
                if r.status_code == 200 or r.status_code == 201 or r.status_code == 204 or r.status_code == 403:
                    return r
                time.sleep(2)
            except Exception as e:
                c += 1
                print("Setup Exception: " + str(e))
                time.sleep(2)


    def get(self, url=None, requires_auth=False):
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            try:
                c += 1
                if requires_auth:
                    r = requests.get(url=url, auth=self._auth, verify=self._verify, headers=self._headers)
                else:
                    r = requests.get(url=url, verify=self._verify, headers=self._headers)
                print(str(r.status_code) + " " + r.text)
                if r.status_code == 200 or r.status_code == 201 or r.status_code == 204 or r.status_code == 403:
                    return r
                time.sleep(2)
            except Exception as e:
                c += 1
                print("Setup Exception: " + str(e))
                time.sleep(2)

    def get_status(self):
        while True:
            print("Waiting for hive to becoming ready...")
            try:
                r = requests.get(URI + "/status", verify=self._verify, headers=self._headers)
                if r.status_code == 200:
                    return True
                time.sleep(2)
            except Exception as e:
                print("Setup Exception: " + str(e))
                time.sleep(2)
                continue

    def set_password(self, username, password):
        print("Setting Password for " + username)
        url = URI + "/user/" + username + "/password/set"
        data = {"password": password}
        return self.post(url=url, data=data, requires_auth=True)

    def create_user(self, username, name, password, roles, requires_auth):
        print("Creating {} ({})".format(name, username))
        data = {"login": username,"name": name, "password": password, "roles": roles}
        url = URI + "/user"
        return self.post(url=url, data=data, requires_auth=requires_auth)

    def create_misp_template(self, name, titlePrefix, description=""):
        print("Creating {} template".format(name))
        data = {"name": name, "titlePrefix": "[{prefix}]".format(prefix=titlePrefix), "severity": 2, "tlp": 2, "pap": 2, "tags": [], "tasks": [], "metrics": {},"customFields": {}, "description": description}
        url = URI + "/case/template"
        return self.post(url=url, data=data, requires_auth=True)

if __name__ == '__main__':
    print("Running The Hive Setup Script")
    setup = HiveSetUp()
    if setup.get_status():
        migratedb = setup.post(url=URI + "/maintenance/migrate")
        setup.create_user(username=SUPER_USERNAME, name="Hive Admin", password=SUPER_PASS, roles=["read","write","admin"], requires_auth=False)
        setup.create_user(username=ALERT_USERNAME, name="Hive Alert User", password=ALERT_PASSWORD, roles=["read","write","alert"], requires_auth=True)
        setup.create_user(username=USER_USERNAME, name="Hive User", password=USER_PASSWORD, roles=["read","write"], requires_auth=True)
        setup.create_misp_template(name=CASE_TEMPLATE, titlePrefix=CASE_TEMPLATE, description="Case from MISP")
