#!/usr/bin/python
import requests
import time
import os
import subprocess

URI="http://localhost"
headers = {"Content-Type": "application/json", "Accept": "application/json"}
api_key = ''
HIVE_USER_EMAIL=os.environ['HIVE_USER_EMAIL']
HIVE_USER_API_KEY=os.environ['HIVE_USER_API_KEY']
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
                r = requests.post(url, json=data,headers=headers)
            elif data is None and requires_auth:
                headers['Authorization'] = api_key
                r = requests.post(url,headers=headers)
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
                headers['Authorization'] = api_key
                r = requests.get(url,headers=headers)
            else:
                r = requests.get(url,headers=headers)

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
            r = requests.get(URI + "/admin/users",headers=headers,timeout=3)
            if r.status_code == 200 or r.status_code == 403 or r.status_code == 401:
                return True
            time.sleep(2)
        except Exception as e:
            print("Setup Exception: " + str(e))
            time.sleep(2)
            continue

def create_user(email, role_id, org_id, authkey):
    print("Creating " + email)
    data = {"email": email, "role_id": role_id}
    if org_id != None:
        data['org_id'] = org_id
    if authkey != None:
        data['authkey'] = authkey
    url = URI + "/admin/users/add"
    return post(url=url, data=data, requires_auth=True)

def edit_user(user_id, email, role_id, org_id, authkey):
    print("Editing " + email)
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

if __name__ == '__main__':
    print("Running MISP Setup Script")
    if get_status():
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
