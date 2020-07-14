#!/usr/bin/python
import requests
from requests.auth import HTTPBasicAuth
import time
import os

URI="https://cortex.default.svc.cluster.local/api"
SUPER_USERNAME=os.environ['CORTEX_SUPERADMIN_USERNAME']
SUPER_PASS=os.environ['CORTEX_SUPERADMIN_PASSWORD']
ORGANIZATION=os.environ['CORTEX_ORGANIZATION']
ORG_ADMIN_USERNAME=os.environ['CORTEX_ADMIN_USERNAME']
ORG_ADMIN_PASSWORD=os.environ['CORTEX_ADMIN_PASSWORD']
ORG_USER_USERNAME=os.environ['CORTEX_USER_USERNAME']
MISP_USER=os.environ['MISP_USER']
VERIFY="/etc/ssl/certs/container/ca.crt"


class CortexSetUp:
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
            print("Number of retries:" + str(c))
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
            print("Waiting for cortex to becoming ready...")
            try:
                r = requests.get(URI + "/status", verify=self._verify, headers=self._headers)
                if r.status_code == 200:
                    return True
                time.sleep(2)
            except Exception as e:
                print("Setup Exception: " + str(e))
                time.sleep(2)
                continue

    def es_get_status(self):
        while True:
            print("Waiting for elasticsearch to becoming ready...")
            try:
                r = requests.get("http://cortex-elastic.default.svc.cluster.local:9200/_cluster/health", verify=self._verify, headers=self._headers)
                if r.json()["status"] == "yellow" or r.json()["status"] == "green":
                    return True
                time.sleep(2)
            except Exception as e:
                print("Setup Exception: " + str(e))
                time.sleep(2)
                continue


    def create_org(self):
        print("Create Hive Org")
        url = URI + "/organization"
        data = {"name": ORGANIZATION,"description": ORGANIZATION,"status":"Active"}
        return self.post(url=url, data=data, requires_auth=True)


    def set_password(self, username, password):
        print("Setting Password for " + username)
        url = URI + "/user/" + username + "/password/set"
        data = {"password": password}
        return self.post(url=url, data=data, requires_auth=True)


    def create_user(self, username="", name="", roles=["read"], password=None, organization="", requires_auth=False):
        print("Creating {} ({})".format(name, username))
        data = {"login": username, "name": name, "roles": roles, "organization": organization}
        if password:
            data['password']=password
        url = URI + "/user"
        return self.post(url=url, data=data, requires_auth=requires_auth)


    def api_key_exists(self):
        print("Checking if api key exists.")

        url = URI + "/user/" + ORG_USER_USERNAME + "/key"
        s = self.get(url=url, requires_auth=True)
        print(s)
        if "status_code" in s:
            if s.status_code == 403:
                return False
            elif s.status_code == 200:
                return True
        return False


    def get_api_key(self):
        print("Return api key")
        url = URI + "/user/" + ORG_USER_USERNAME + "/key"
        return self.get(url=url, requires_auth=True)


    def create_api_key(self):
        print("Create api key")
        url = URI + "/user/" + ORG_USER_USERNAME + "/key/renew"
        return self.post(url=url, requires_auth=True)


if __name__ == '__main__':
    print("Running Cortex Setup Script")
    setup = CortexSetUp()
    if setup.get_status() and setup.es_get_status():
        print("Running Db Migration")
        migratedb = setup.post(url=URI + "/maintenance/migrate")
        print(migratedb.text)
        # Create superadmin
        setup.create_user(username=SUPER_USERNAME, name="Cortex Super Admin", password=SUPER_PASS, roles=["superadmin"], organization="cortex", requires_auth=False)
        org = setup.create_org()
        if org:
            print(org.json())
        # Create org admin
        setup.create_user(username=ORG_ADMIN_USERNAME, name="Hive Admin", password=ORG_ADMIN_PASSWORD, roles=["read","analyze","orgadmin"],organization=ORGANIZATION, requires_auth=True)
        # Create org user
        setup.create_user(username=ORG_USER_USERNAME, name="Hive User (DO NOT MODIFY)", password=None, roles=["read","analyze"],organization=ORGANIZATION, requires_auth=True)
        setup.create_user(username=MISP_USER, name="MISP User (DO NOT MODIFY)", password=None, roles=["read","analyze"],organization=ORGANIZATION, requires_auth=True)

        if setup.api_key_exists():
            api_key = setup.get_api_key()
        else:
            api_key = setup.create_api_key()

        if isinstance(api_key, requests.models.Response):
            print(api_key.text)
