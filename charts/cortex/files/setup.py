#!/usr/bin/python
import requests
from requests.auth import HTTPBasicAuth
import time
import os

URI="http://localhost:9001/api"
SUPER_USERNAME=os.environ['CORTEX_SUPERADMIN_USERNAME']
SUPER_PASS=os.environ['CORTEX_SUPERADMIN_PASSWORD']
ORGANIZATION=os.environ['CORTEX_ORGANIZATION']
ORG_ADMIN_USERNAME=os.environ['CORTEX_ADMIN_USERNAME']
ORG_ADMIN_PASSWORD=os.environ['CORTEX_ADMIN_PASSWORD']
ORG_USER_USERNAME=os.environ['CORTEX_USER_USERNAME']
ORG_USER_PASSWORD=os.environ['CORTEX_USER_PASSWORD']


def post(url=None, data=None, requires_auth=False):
    max_retries = 10
    c = 0
    r = None
    while c < max_retries:
        try:
            c += 1
            if data and requires_auth:
                r = requests.post(url, json=data, auth=HTTPBasicAuth(SUPER_USERNAME, SUPER_PASS))
            elif data is None and requires_auth:
                r = requests.post(url, auth=HTTPBasicAuth(SUPER_USERNAME, SUPER_PASS))
            elif data and requires_auth == False:
                r = requests.post(url, json=data)
            else:
                r = requests.post(url)

            print(str(r.status_code) + " " + r.text)

            if r.status_code == 200 or r.status_code == 201 or r.status_code == 204 or r.status_code == 403:
                return r
            time.sleep(2)
        except Exception as e:
            c += 1
            print("Setup Exception: " + str(e))
            time.sleep(2)


def get(url=None, requires_auth=False):
    max_retries = 10
    c = 0
    r = None
    while c < max_retries:
        print("Number of retries:" + str(c))
        try:
            c += 1
            if requires_auth:
                r = requests.get(url, auth=HTTPBasicAuth(SUPER_USERNAME, SUPER_PASS))
            else:
                r = requests.get(url)

            print(str(r.status_code) + " " + r.text)

            if r.status_code == 200 or r.status_code == 201 or r.status_code == 204 or r.status_code == 403:
                return r
            time.sleep(2)
        except Exception as e:
            c += 1
            print("Setup Exception: " + str(e))
            time.sleep(2)


def get_status():
    while True:
        print("Waiting for cortex to becoming ready...")
        try:
            r = requests.get(URI + "/status")
            if r.status_code == 200:
                return True
            time.sleep(2)
        except Exception as e:
            print("Setup Exception: " + str(e))
            time.sleep(2)
            continue

def es_get_status():
    while True:
        print("Waiting for elasticsearch to becoming ready...")
        try:
            r = requests.get("http://localhost:9200/_cluster/health")
            if r.json()["status"] == "yellow" or r.json()["status"] == "green":
                return True
            time.sleep(2)
        except Exception as e:
            print("Setup Exception: " + str(e))
            time.sleep(2)
            continue


def create_org():
    print("Create Hive Org")
    url = URI + "/organization"
    data = {"name": ORGANIZATION,"description": ORGANIZATION,"status":"Active"}
    return post(url=url, data=data, requires_auth=True)


def set_password(username, password):
    print("Setting Password for " + username)
    url = URI + "/user/" + username + "/password/set"
    data = {"password": password}
    return post(url=url, data=data, requires_auth=True)


def create_user(username, name, roles, password, organization, requires_auth):
    print("Creating {} ({})".format(name, username))
    data = {"login": username, "name": name, "password": password, "roles": roles, "organization": organization}
    url = URI + "/user"
    return post(url=url, data=data, requires_auth=requires_auth)


def api_key_exists():
    print("Checking if api key exists.")

    url = URI + "/user/" + ORG_USER_USERNAME + "/key"
    s = get(url=url, requires_auth=True)
    print(s)
    if "status_code" in s:
        if s.status_code == 403:
            return False
        elif s.status_code == 200:
            return True
    return False


def get_api_key():
    print("Return api key")
    url = URI + "/user/" + ORG_USER_USERNAME + "/key"
    return get(url=url, requires_auth=True)


def create_api_key():
    print("Create api key")
    url = URI + "/user/" + ORG_USER_USERNAME + "/key/renew"
    return post(url=url, requires_auth=True)


if __name__ == '__main__':
    print("Running Cortex Setup Script")
    if get_status() and es_get_status():
        print("Running Db Migration")
        migratedb = post(url=URI + "/maintenance/migrate")
        print(migratedb.text)
        # Create superadmin
        create_user(username=SUPER_USERNAME, name="Cortex Super Admin", password=SUPER_PASS, roles=["superadmin"], organization="cortex", requires_auth=False)
        org = create_org()
        if org:
            print(org.json())
        # Create org admin
        create_user(username=ORG_ADMIN_USERNAME, name="Hive Admin", password=ORG_ADMIN_PASSWORD, roles=["read","analyze","orgadmin"],organization=ORGANIZATION, requires_auth=True)
        # Create org user
        create_user(username=ORG_USER_USERNAME, name="Hive User", password=ORG_USER_PASSWORD, roles=["read","analyze"],organization=ORGANIZATION, requires_auth=True)

        if api_key_exists():
            api_key = get_api_key()
        else:
            api_key = create_api_key()

        if isinstance(api_key, requests.models.Response):
            print(api_key.text)
