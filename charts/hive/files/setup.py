#!/usr/bin/python
import requests
from requests.auth import HTTPBasicAuth
import time
import os

URI="http://localhost:9000/api"
SUPER_USERNAME=os.environ['THEHIVE_SUPERADMIN_USERNAME']
SUPER_PASS=os.environ['THEHIVE_SUPERADMIN_PASSWORD']
ALERT_USERNAME=os.environ['THEHIVE_ALERT_USERNAME']
ALERT_PASSWORD=os.environ['THEHIVE_ALERT_PASSWORD']
USER_USERNAME=os.environ['THEHIVE_USER_USERNAME']
USER_PASSWORD=os.environ['THEHIVE_USER_PASSWORD']

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
        print("Waiting for hive to becoming ready...")
        try:
            r = requests.get(URI + "/status")
            if r.status_code == 200:
                return True
            time.sleep(2)
        except Exception as e:
            print("Setup Exception: " + str(e))
            time.sleep(2)
            continue

def set_password(username, password):
    print("Setting Password for " + username)
    url = URI + "/user/" + username + "/password/set"
    data = {"password": password}
    return post(url=url, data=data, requires_auth=True)

def create_user(username, password, roles, requires_auth):
    print("Creating " + username)
    data = {"login": username,"name": username, "password": password, "roles": roles}
    url = URI + "/user"
    return post(url=url, data=data, requires_auth=requires_auth)

if __name__ == '__main__':
    print("Running The Hive Setup Script")
    if get_status():
        migratedb = post(url=URI + "/maintenance/migrate")
        create_user(username=SUPER_USERNAME, password=SUPER_PASS, roles=["read","write","admin"], requires_auth=False)
        create_user(username=ALERT_USERNAME, password=ALERT_PASSWORD, roles=["read","write","alert"], requires_auth=True)
        create_user(username=USER_USERNAME, password=USER_PASSWORD, roles=["read","write"], requires_auth=True)

