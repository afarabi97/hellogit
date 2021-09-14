#!/usr/bin/python3
import requests
import time
import os
import json
import uuid

URI="https://wikijs.default.svc.cluster.local"
SETUP_URI="http://wikijs-setup.default.svc.cluster.local"
API_URI="{url}/graphql".format(url=URI)
ADMIN_EMAIL=os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD=os.environ['ADMIN_PASSWORD']
SSO_IDP_CRT=os.environ['SSO_IDP_CRT']
SAML_KEY=os.environ['SAML_KEY']
URL=os.environ['URL']
VERIFY="/etc/ssl/certs/container/ca.crt"

class WikiSetUp:
    def __init__(self):
        self._session = requests.Session()
        self._session.verify = VERIFY
        self._session.headers.update({'content-type': 'application/json', 'Accept': 'application/json'})

    def post(self, url=URI+"/graphql", data=None):
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            try:
                c += 1
                if data:
                    r = self._session.post(url=url, json=data)
                elif data is None:
                    r = self._session.post(url=url)
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
            print("Waiting for WikiJS to becoming ready...")
            try:
                r = self._session.get(SETUP_URI + "/login")
                if r.status_code == 200:
                    return True
                time.sleep(2)
            except Exception as e:
                print("Setup Exception: " + str(e))
                time.sleep(2)
                continue

    def setup_admin(self):
        print("Creating Admin User")
        data = {
          "adminEmail": ADMIN_EMAIL,
          "adminPassword": ADMIN_PASSWORD,
          "adminPasswordConfirm": ADMIN_PASSWORD,
          "siteUrl": URL,
          "telemetry": False
        }
        response = self.post(url=SETUP_URI+"/finalize", data=data)

    def login_as_admin(self):
        print("Logging in as Admin")
        query = "mutation ($username: String!, $password: String!, $strategy: String!) {\n authentication {\n login(username: $username, password: $password, strategy: $strategy) {\n responseResult {\n succeeded\n errorCode\n slug\n message\n __typename\n }\n jwt\n mustChangePwd\n mustProvideTFA\n mustSetupTFA\n continuationToken\n redirect\n tfaQRImage\n __typename\n }\n __typename\n }\n}\n"
        data = {
            "operationName": None,
            "extensions":{},
            "query": query,
            "variables":{
                "username":ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "strategy":"local"
            }
        }
        response = self.post(url=URI+"/graphql", data=data)
        if response.status_code == 200:
            self._session.headers.update({'Authorization': 'Bearer '+response.json()['data']['authentication']['login']['jwt']})

    def setup_saml(self):
        print("Setting up SAML Authentication")
        query = "mutation ($strategies: [AuthenticationStrategyInput]!) {\n authentication {\n updateStrategies(strategies: $strategies) {\n responseResult {\n succeeded\n errorCode\n slug\n message\n __typename\n }\n __typename\n }\n __typename\n }\n}\n"
        data = {
            "operationName": None,
            "extensions": {},
            "query": query,
            "variables": {
                "strategies": [
                    {
                    "key": "local",
                    "strategyKey": "local",
                    "displayName": "Local",
                    "order": 0,
                    "isEnabled": True,
                    "config": [],
                    "selfRegistration": False,
                    "domainWhitelist": [],
                    "autoEnrollGroups": []
                    },
                    {
                        "key": str(uuid.uuid4()),
                        "strategyKey": "saml",
                        "displayName": "SAML 2.0",
                        "order": 1,
                        "isEnabled": True,
                        "config": [],
                        "selfRegistration": True,
                        "domainWhitelist": [],
                        "autoEnrollGroups": [1]
                    }
                ]
            }
        }
        with open('/saml.json') as f:
            saml_json = json.load(f)
            saml_json['cert'] = SSO_IDP_CRT.replace('\n', '\\n')
            saml_json['privateCert'] = SAML_KEY.replace('\n', '\\n')
            saml_json['decryptionPvk'] = SAML_KEY.replace('\n', '\\n')
            saml_json['issuer'] = URL;
            temp = []
            for key, value in saml_json.items():
                val = "\"{value}\"".format(value=value)
                if type(value) == bool:
                    val = "{value}".format(value=str(value).lower())
                temp.append({
                    "key": key,
                    "value": "{{ \"v\": {val} }}".format(val=val)
                })
            data['variables']['strategies'][1]['config'] = temp
        response = self.post(url=URI+"/graphql", data=data)

    def apply_locale(self):
        print("Applying EN Locale")
        query = "mutation ($locale: String!, $autoUpdate: Boolean!, $namespacing: Boolean!, $namespaces: [String]!) {\n  localization {\n    updateLocale(locale: $locale, autoUpdate: $autoUpdate, namespacing: $namespacing, namespaces: $namespaces) {\n      responseResult {\n        succeeded\n        errorCode\n        slug\n        message\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
        data = {
            "operationName": None,
            "extensions":{},
            "query": query,
            "variables":{
                "locale": "en",
                "autoUpdate": True,
                "namespacing": False,
                "namespaces": ["en"]
            }
        }
        response = self.post(url=URI+"/graphql", data=data)

if __name__ == '__main__':
    print("Running WikiJS Setup Script")
    setup = WikiSetUp()
    if setup.get_status():
        setup.setup_admin()
        setup.login_as_admin()
        setup.setup_saml()
        setup.apply_locale()
