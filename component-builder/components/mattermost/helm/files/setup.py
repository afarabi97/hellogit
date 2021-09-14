#!/usr/bin/python
import requests
import time
import os

URI="https://mattermost.default.svc.cluster.local"
API_URI="{url}/api/v4".format(url=URI)
TEAM_NAME=os.environ['TEAM_NAME']
ADMIN_USER=os.environ['ADMIN_USER']
ADMIN_EMAIL=os.environ['ADMIN_EMAIL']
ADMIN_PASS=os.environ['ADMIN_PASS']
TEAM_NAME=os.environ['TEAM_NAME']
TEAM_ID = TEAM_NAME.replace(' ', '_').lower()
VERIFY="/etc/ssl/certs/container/ca.crt"

class MattermostSetUp:
    def __init__(self):
        self._token = ''
        self._team_guid = ''
        self._session = requests.Session()
        self._session.verify = VERIFY
        self._session.headers.update({'content-type': 'application/json'})

    def post(self, url=None, data=None, requires_auth=False):
        auth_headers = {
            'Authorization': 'Bearer ' + self._token
        }
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            try:
                c += 1
                if data and requires_auth:
                    r = self._session.post(url=url, json=data, headers=auth_headers)
                elif data is None and requires_auth:
                    r = self._session.post(url=url, headers=auth_headers)
                elif data and requires_auth == False:
                    r = self._session.post(url=url, json=data)
                else:
                    r = self._session.post(url=url)

                print(str(r.status_code) + " " + r.text)

                if r.status_code == 200 or r.status_code == 201 or r.status_code == 204 or r.status_code == 403:
                    return r
                time.sleep(2)
            except Exception as e:
                c += 1
                print("Setup Exception: " + str(e))
                time.sleep(2)

    def put(self, url=None, data=None, requires_auth=False):
        auth_headers = {
            'Authorization': 'Bearer ' + self._token
        }
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            try:
                c += 1
                if data and requires_auth:
                    r = self._session.put(url=url, json=data, headers=auth_headers)
                elif data is None and requires_auth:
                    r = self._session.put(url=url, headers=auth_headers)
                elif data and requires_auth == False:
                    r = self._session.put(url=url, json=data)
                else:
                    r = self._session.put(url=url)

                print(str(r.status_code) + " " + r.text)

                if r.status_code == 200 or r.status_code == 201 or r.status_code == 204 or r.status_code == 403:
                    return r
                time.sleep(2)
            except Exception as e:
                c += 1
                print("Setup Exception: " + str(e))
                time.sleep(2)

    def get(self, url=None, requires_auth=False):
        auth_headers = {
            'Authorization': 'Bearer ' + self._token
        }
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            try:
                c += 1
                if requires_auth:
                    r = self._session.get(url=url, headers=auth_headers)
                else:
                    r = self._session.get(url=url)
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
            print("Waiting for Mattermost to becoming ready...")
            try:
                r = self._session.get(URI + "/status")
                if r.status_code == 200:
                    return True
                time.sleep(2)
            except Exception as e:
                print("Setup Exception: " + str(e))
                time.sleep(2)
                continue

    def create_admin_user(self):
        print("Creating Admin user")
        data = {"email": ADMIN_EMAIL, "username": ADMIN_USER, "password": ADMIN_PASS, "first_name": "Mattermost", "last_name": "Admin", "allow_marketing":False}
        response = self.post(url=API_URI+"/users", data=data, requires_auth=False)
        return response

    def login_as_admin(self):
        print("Loging in as Admin")
        data = {"device_id":"","login_id":ADMIN_USER,"password":ADMIN_PASS,"token":""}
        response = self.post(url=API_URI+"/users/login", data=data, requires_auth=False)
        self._token = response.headers.get('token')
        return response

    def create_default_team(self):
        print("Creating default team")
        data = {"display_name":TEAM_NAME,"name":TEAM_ID,"type":"O"}
        response = self.post(url=API_URI+"/teams", data=data, requires_auth=True)
        self._team_guid = response.json()['id']
        return response

    def set_team_invite(self):
        print("Updating team to Open Invite")
        data = {"id":self._team_guid,"display_name":TEAM_NAME,"allow_open_invite":True}
        response = self.put(url=API_URI+"/teams/"+self._team_guid, data=data, requires_auth=True)
        return response

    def check_teams(self):
        print("Checking teams")
        response = self.get(url=API_URI+"/users/me/teams", requires_auth=True)
        if response and len(response.json()) == 0:
            self.create_default_team()
            self.set_team_invite()
        return response

if __name__ == '__main__':
    print("Running Mattermost Setup Script")
    setup = MattermostSetUp()
    if setup.get_status():
        setup.create_admin_user()
        setup.login_as_admin()
        setup.check_teams()
