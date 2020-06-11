#!/usr/bin/python
import requests
import time
import os
import subprocess

URI="https://localhost"
headers = {"Content-Type": "application/json", "Accept": "application/json"}
api_key = ''
HIVE_USER_EMAIL=os.environ['HIVE_USER_EMAIL']
HIVE_USER_API_KEY=os.environ['HIVE_USER_API_KEY']
ADMIN_PASS=os.environ['ADMIN_PASS']
ORG_NAME=os.environ['ORG_NAME']
#HIVE_USER_API_KEY="P6iX7ht5UqjmL5Hktk44kDSymHuRnOJIq78URU4c"

def post(url=None, data=None, requires_auth=False):
    max_retries = 10
    c = 0
    r = None
    while c < max_retries:
        try:
            c += 1
            if data and requires_auth:
                headers['Authorization'] = api_key
                r = requests.post(url, json=data,headers=headers,verify=False)
            elif data is None and requires_auth:
                headers['Authorization'] = api_key
                r = requests.post(url,headers=headers,verify=False)
            elif data and requires_auth == False:
                r = requests.post(url, json=data,verify=False)
            else:
                r = requests.post(url,verify=False)

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
                headers['Authorization'] = api_key
                r = requests.get(url,headers=headers,verify=False)
            else:
                r = requests.get(url,headers=headers,verify=False)

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
        print("Waiting for MISP to becoming ready...")
        try:
            headers['Authorization'] = 'THISISNOTREAL'
            r = requests.get(URI + "/admin/users",headers=headers,timeout=3,verify=False)
            if r.status_code == 200 or r.status_code == 403 or r.status_code == 401:
                return True
            time.sleep(2)
        except Exception as e:
            print("Setup Exception: " + str(e))
            time.sleep(2)
            continue

def create_user(email, role_id, org_id, authkey):
    str = "Creating {email}".format(email=email)
    print(str)
    data = {"email": email, "role_id": role_id}
    if org_id != None:
        data['org_id'] = org_id
    if authkey != None:
        data['authkey'] = authkey
    url = URI + "/admin/users/add"
    return post(url=url, data=data, requires_auth=True)

def edit_user(user_id, email, role_id, org_id, authkey):
    str = "Editing {email}".format(email=email)
    print(str)
    data = {"email": email, "role_id": role_id}
    if org_id != None:
        data['org_id'] = org_id
    if authkey != None:
        data['authkey'] = authkey
    url = URI + "/admin/users/edit/"+user_id
    return post(url=url, data=data, requires_auth=True)

def get_users():
    print("Getting all users")
    url = URI + "/admin/users"
    return get(url=url, requires_auth=True)

def get_org(org_id = 1):
    str = "Getting Org ID {org_id}".format(org_id=org_id)
    print(str)
    url = URI + "/organisations/view/{org_id}".format(org_id=org_id)
    return get(url=url, requires_auth=True)

def edit_org_name(org_id = 1, name = "ORGNAME"):
    str = "Editing Org ID {org_id} Name -> {name}".format(org_id=org_id,name=name)
    print(str)
    data = {"name": name, "nationality": "US", "local": True}
    url = URI + "/admin/organisations/edit/{org_id}".format(org_id=org_id)
    return post(url=url, data=data, requires_auth=True)

def add_org(name = "ORGNAME"):
    str = "Adding Org {name}".format(name=name)
    print(str)
    data = {"name": name, "nationality": "US"}
    url = URI + "/admin/organisations/add"
    return post(url=url, data=data, requires_auth=True)

if __name__ == '__main__':
    print("Running MISP Setup Script")
    if get_status():
        # Set password for admin@admin.test
        set_pass = "/var/www/MISP/app/Console/cake Password admin@admin.test \"{password}\" -o".format(password=ADMIN_PASS)
        password = os.popen(set_pass).readlines()
        # Get API key for admin@admin.test
        api_key_arr = os.popen("/var/www/MISP/app/Console/cake Authkey admin@admin.test").readlines()
        api_key = api_key_arr[-1].strip()
        users = get_users()
        if users.status_code == 200 and len(users.json()) > 0:
            user_list = users.json()
            user_id = None;
            i = 0
            while i < len(user_list):
                if user_list[i]['User']['email'] == HIVE_USER_EMAIL:
                    user_id = user_list[i]['User']['id']
                    break
                i += 1
        if user_id != None:
            # Edit Hive User
            edit_user(user_id=user_id, email=HIVE_USER_EMAIL, role_id=1, org_id=None, authkey=HIVE_USER_API_KEY)
        else:
            # Create Hive User
            create_user(email=HIVE_USER_EMAIL, role_id=1, org_id=None, authkey=HIVE_USER_API_KEY)
        org = get_org(org_id = 1)
        if org.status_code == 200:
            edit_org_name(org_id = 1,name = ORG_NAME)
        elif org.status_code == 404:
            add_org(name = ORG_NAME)
