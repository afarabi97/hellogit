#!/usr/bin/python
import requests
from requests.auth import HTTPBasicAuth
import time, os, sys, re
from kubernetes import config
from kubernetes.client import Configuration
from kubernetes.client.api import core_v1_api
from kubernetes.client.rest import ApiException
from kubernetes.stream import stream

URI="https://misp.default.svc.cluster.local"
CORTEX_URI="https://cortex.default.svc.cluster.local/api"
headers = {"Content-Type": "application/json", "Accept": "application/json"}
cortex_headers = {"Content-Type": "application/json", "Accept": "application/json"}
api_key = ''
HIVE_USER_EMAIL=os.environ['HIVE_USER_EMAIL']
FILEBEAT_USER_EMAIL=os.environ['FILEBEAT_USER_EMAIL']
FILEBEAT_USER_API_KEY=os.environ['FILEBEAT_USER_API_KEY']
HIVE_USER_API_KEY=os.environ['HIVE_USER_API_KEY']
CORTEX_USER_EMAIL=os.getenv('CORTEX_USER_EMAIL', default='')
CORTEX_USER_API_KEY=os.getenv('CORTEX_USER_API_KEY',default='')
ORG_ADMIN_USERNAME=os.getenv('CORTEX_ADMIN_USERNAME',default='')
ORG_ADMIN_PASSWORD=os.getenv('CORTEX_ADMIN_PASSWORD',default='')
CORTEX_USER_USERNAME=os.getenv('CORTEX_USER_USERNAME',default='')
CORTEX_INTEGRATION=os.getenv('CORTEX_INTEGRATION',default='')
ADMIN_PASS=os.environ['ADMIN_PASS']
ORG_NAME=os.environ['ORG_NAME']
VERIFY="/etc/ssl/certs/container/ca.crt"



class MISPSetup:
    def __init__(self):
        print("Running MISP Setup Script")
        self._verify = VERIFY
        self._hive_user = None
        self._misp_api_key = ''
        config.load_incluster_config()
        c = Configuration()
        c.assert_hostname = False
        Configuration.set_default(c)
        self._core_v1 = core_v1_api.CoreV1Api()
        self._misp_pod = {}

    def post(self, url=None, data=None, requires_auth=False):
        max_retries = 10
        c = 0
        r = None
        while c < max_retries:
            try:
                c += 1
                if data and requires_auth:
                    headers['Authorization'] = self._misp_api_key
                    r = requests.post(url, json=data, headers=headers, verify=VERIFY)
                elif data is None and requires_auth:
                    headers['Authorization'] = self._misp_api_key
                    r = requests.post(url, headers=headers, verify=VERIFY)
                elif data and requires_auth == False:
                    r = requests.post(url, json=data, verify=VERIFY)
                else:
                    r = requests.post(url, verify=VERIFY)

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

    def get_status(self):
        while True:
            print("Waiting for MISP to becoming ready...")
            try:
                headers['Authorization'] = 'THISISNOTREAL'
                r = requests.get(URI + "/admin/users",headers=headers,timeout=3,verify=VERIFY)
                if r.status_code == 200 or r.status_code == 403 or r.status_code == 401:
                    return True
                time.sleep(2)
            except Exception as e:
                print("Setup Exception: " + str(e))
                time.sleep(2)
                continue

    def search_for_pod(self):
        return self._core_v1.list_pod_for_all_namespaces(label_selector="component=misp", watch=False)

    def execute_command(self, pod_name: str, namespace: str, container: str, command: str):
        print("Executing CMD: "+command)
        exec_command = ['/bin/sh', '-c', command]
        resp = stream(self._core_v1.connect_get_namespaced_pod_exec,
                pod_name,
                namespace,
                container=container,
                command=exec_command,
                stderr=True, stdin=False,
                stdout=True, tty=False)
        return resp

    def reset_password(self):
        print("Executing Password Reset")
        exec_command = '/var/www/MISP/app/Console/cake Password admin@admin.test "{password}" -o'.format(password=ADMIN_PASS)
        return self.execute_command(pod_name=self._misp_pod.metadata.name, namespace=self._misp_pod.metadata.namespace, container='misp', command=exec_command)

    def reset_authkey(self):
        print("Executing Authkey Reset")
        exec_command = '/var/www/MISP/app/Console/cake Authkey admin@admin.test'
        resp = self.execute_command(pod_name=self._misp_pod.metadata.name, namespace=self._misp_pod.metadata.namespace, container='misp', command=exec_command)
        match = re.search(r'^[a-zA-z0-9]{40}$', resp, re.MULTILINE)
        try:
            self._misp_api_key = match[0]
            return self._misp_api_key
        except Exception as e:
            print("Something went wrong with resetting the API key")
        sys.exit(1)

    def conf_cortex_module(self, api_key: str):
        print("Updating Cortex Module")
        exec_command = [
            '/var/www/MISP/app/Console/cake Admin setSetting "Plugin.Cortex_services_enable" true',
            'chown www-data:www-data -R /var/www/MISP/app/Config',
            '/var/www/MISP/app/Console/cake Admin setSetting "Plugin.Cortex_authkey" "{api_key}"'.format(api_key=api_key),
            'chown www-data:www-data -R /var/www/MISP/app/Config',
        ]
        while True:
            if exec_command:
                com = exec_command.pop(0)
                resp = self.execute_command(pod_name=self._misp_pod.metadata.name, namespace=self._misp_pod.metadata.namespace, container='misp', command=com)
                print(resp)
                time.sleep(5)
            else:
                break

    def get_users(self, user: str):
        print("Getting all users")
        url = URI + "/admin/users"
        users = self.get(url=url, requires_auth=True)
        if users.status_code == 200 and len(users.json()) > 0:
            user_list = users.json()
            i = 0
            while i < len(user_list):
                if user_list[i]['User']['email'] == user:
                    return user_list[i]['User']['id']
                i += 1
        return False

    def create_user(self, email, role_id, org_id, authkey):
        str = "Creating {email}".format(email=email)
        print(str)
        data = {"email": email, "role_id": role_id}
        if org_id is not None:
            data['org_id'] = org_id
        if authkey is not None:
            data['authkey'] = authkey
        url = URI + "/admin/users/add"
        return self.post(url=url, data=data, requires_auth=True)

    def edit_user(self, user_id, email, role_id, org_id, authkey):
        str = "Editing {email}".format(email=email)
        print(str)
        data = {"email": email, "role_id": role_id}
        if org_id is not None:
            data['org_id'] = org_id
        if authkey is not None:
            data['authkey'] = authkey
        url = URI + "/admin/users/edit/"+user_id
        return self.post(url=url, data=data, requires_auth=True)

    def get_org(self, org_id=1):
        str = "Getting Org ID {org_id}".format(org_id=org_id)
        print(str)
        url = URI + "/organisations/view/{org_id}".format(org_id=org_id)
        return self.get(url=url, requires_auth=True)

    def edit_org_name(self, org_id=1, name="CPT HUNT"):
        str = "Editing Org ID {org_id} Name -> {name}".format(org_id=org_id, name=name)
        print(str)
        data = {"name": name, "nationality": "US", "local": True}
        url = URI + "/admin/organisations/edit/{org_id}".format(org_id=org_id)
        return self.post(url=url, data=data, requires_auth=True)

    def add_org(self, name="CPT HUNT"):
        str = "Adding Org {name}".format(name=name)
        print(str)
        data = {"name": name, "nationality": "US", "local": True}
        url = URI + "/admin/organisations/add"
        return self.post(url=url, data=data, requires_auth=True)

    def setup_misp_hive_user(self):
        user = self.get_users(HIVE_USER_EMAIL)
        if user is not None and user is not False:
            # Edit Hive User
            self.edit_user(user_id=user, email=HIVE_USER_EMAIL, role_id=5, org_id=None, authkey=HIVE_USER_API_KEY)
        else:
            # Create Hive User
            self.create_user(email=HIVE_USER_EMAIL, role_id=5, org_id=None, authkey=HIVE_USER_API_KEY)

    def setup_misp_cortex_user(self):
        user = self.get_users(CORTEX_USER_EMAIL)
        if user is not None and user is not False:
            # Edit Hive User
            self.edit_user(user_id=user, email=CORTEX_USER_EMAIL, role_id=1, org_id=None, authkey=CORTEX_USER_API_KEY)
        else:
            # Create Hive User
            self.create_user(email=CORTEX_USER_EMAIL, role_id=1, org_id=None, authkey=CORTEX_USER_API_KEY)

    def setup_misp_filebeat_user(self):
        user = self.get_users(FILEBEAT_USER_EMAIL)
        if user is not None and user is not False:
            # Edit Filebeat User
            self.edit_user(user_id=user, email=FILEBEAT_USER_EMAIL, role_id=6, org_id=None, authkey=FILEBEAT_USER_API_KEY)
        else:
            # Create Filebeat User
            self.create_user(email=FILEBEAT_USER_EMAIL, role_id=6, org_id=None, authkey=FILEBEAT_USER_API_KEY)

    def get_cortex_status(self):
        if not CORTEX_INTEGRATION == "true":
            return False
        print("Checking Cortex Status")
        try:
            r = requests.get(CORTEX_URI + "/status", verify=VERIFY, headers=cortex_headers)
            print(r)
            if r.status_code == 200:
                print(r)
                return True
        except Exception as e:
            print("Setup Exception: " + str(e))
            return False

    def enable_cortex_misp_analyzer(self):
        print("Enabling MISP Analyzer for Cortex")
        data = {
          "name": "MISP_2_0",
          "configuration": {
            "name": [
              "MISP Local"
            ],
            "url": [
              URI
            ],
            "key": [
              CORTEX_USER_API_KEY
            ],
            "cert_check": True,
            "cert_path": [
              VERIFY
            ],
            "auto_extract_artifacts": False,
            "check_tlp": True,
            "max_tlp": 2,
            "check_pap": True,
            "max_pap": 2
          },
          "jobCache": 10,
          "jobTimeout": 30
        }
        url = CORTEX_URI + "/organization/analyzer/MISP_2_0"
        return requests.post(url=url, json=data, auth=HTTPBasicAuth(ORG_ADMIN_USERNAME, ORG_ADMIN_PASSWORD), verify=VERIFY, headers=cortex_headers)

    def get_cortex_api(self):
        print("Getting Cortex API Key")
        url = CORTEX_URI + '/user/{cortex_user}/key/renew'.format(cortex_user=CORTEX_USER_USERNAME)
        response = requests.post(url=url, auth=HTTPBasicAuth(ORG_ADMIN_USERNAME, ORG_ADMIN_PASSWORD), verify=VERIFY, headers=cortex_headers)
        if response and response.status_code == 200:
            return response.text
        sys.exit(os.EX_CONFIG)


if __name__ == '__main__':
    setup = MISPSetup()
    if setup.get_status():
        print("MISP Ready")
        print("Searching for MISP pod")
        pods = setup.search_for_pod()
        if pods and len(pods.items) == 1:
            setup._misp_pod = pods.items[0]
            print("Found pod - "+setup._misp_pod.metadata.name)
            setup.reset_password()
            setup.reset_authkey()
            setup.setup_misp_filebeat_user()
            setup.setup_misp_hive_user()
            org = setup.get_org(org_id = 1)
            if org.status_code == 200:
                setup.edit_org_name(org_id=1,name=ORG_NAME)
            elif org.status_code == 404:
                setup.add_org(name=ORG_NAME)
        if setup.get_cortex_status():
            setup.setup_misp_cortex_user()
            setup.enable_cortex_misp_analyzer()
            api_key = setup.get_cortex_api()
            time.sleep(10)
            setup.conf_cortex_module(api_key)
