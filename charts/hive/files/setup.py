#!/usr/bin/python
import requests
from requests.auth import HTTPBasicAuth
import time
import os

LEGACY_URI="https://hive.default.svc.cluster.local/api"
URI="https://hive.default.svc.cluster.local/api/v1"
ORGANIZATION=os.environ['THEHIVE_ORGANIZATION']
SUPER_USERNAME='admin@thehive.local'
SUPER_PASS=os.environ['THEHIVE_SUPERADMIN_PASSWORD']
ORG_ADMIN_USERNAME=os.environ['THEHIVE_ADMIN_USERNAME']
ORG_ADMIN_PASSWORD=os.environ['THEHIVE_ADMIN_PASSWORD']
ORG_USER_USERNAME=os.environ['THEHIVE_USER_USERNAME']
ORG_USER_PASSWORD=os.environ['THEHIVE_USER_PASSWORD']
CASE_TEMPLATE=os.environ['CASE_TEMPLATE']
VERIFY="/etc/ssl/certs/container/ca.crt"


class HiveSetUp:
    def __init__(self):
        self._auth_super_admin = HTTPBasicAuth(SUPER_USERNAME, 'secret')
        self._auth_org_admin = HTTPBasicAuth(ORG_ADMIN_USERNAME, ORG_ADMIN_PASSWORD)
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
                    r = requests.post(url=url, json=data, auth=requires_auth, verify=self._verify, headers=self._headers)
                elif data is None and requires_auth:
                    r = requests.post(url=url, auth=requires_auth, verify=self._verify, headers=self._headers)
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
                    r = requests.get(url=url, auth=self._auth_super_admin, verify=self._verify, headers=self._headers)
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
        return self.post(url=url, data=data, requires_auth=self._auth_super_admin)

    def change_password(self, username, password, current_password):
        print("Changing Password for " + username)
        url = URI + "/user/" + username + "/password/change"
        data = {"password": password, "currentPassword": current_password}
        return self.post(url=url, data=data, requires_auth=self._auth_super_admin)

    def create_org(self):
        print("Create Hive Org")
        url = URI + "/organisation"
        data = {"name": ORGANIZATION,"description": ORGANIZATION}
        return self.post(url=url, data=data, requires_auth=self._auth_super_admin)

    def create_user(self, login="", name="", profile="read-only", password=None, organization=""):
        print("Creating {} ({})".format(name, login))
        data = {"login": login, "name": name, "profile": profile, "organisation": organization}
        if password:
            data['password']=password
        url = URI + "/user"
        return self.post(url=url, data=data, requires_auth=self._auth_super_admin)

    def create_misp_template(self, name, titlePrefix, description=""):
        print("Creating {} template".format(name))
        data = {"name": name, "displayName": name, "titlePrefix": "[{prefix}]".format(prefix=titlePrefix), "severity": 2, "tlp": 2, "pap": 2, "tags": [], "tasks": [], "metrics": {},"customFields": {}, "description": description}
        url = LEGACY_URI + "/case/template"
        return self.post(url=url, data=data, requires_auth=self._auth_org_admin)

if __name__ == '__main__':
    print("Running The Hive Setup Script")
    setup = HiveSetUp()
    if setup.get_status():
        # Create org
        org = setup.create_org()
        if org:
            print(org.json())
        # Create org admin
        setup.create_user(login=ORG_ADMIN_USERNAME, name="Org Admin", password=ORG_ADMIN_PASSWORD, profile="org-admin", organization=ORGANIZATION)
        # Create org user
        setup.create_user(login=ORG_USER_USERNAME, name="Hive User (DO NOT MODIFY)", password=ORG_USER_PASSWORD, profile="analyst", organization=ORGANIZATION)
        setup.create_misp_template(name=CASE_TEMPLATE, titlePrefix=CASE_TEMPLATE, description="Case from MISP")
        # Change password for admin user
        setup.change_password(SUPER_USERNAME, SUPER_PASS, "secret")
