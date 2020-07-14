#!/usr/bin/python3
import shutil
import os
import sys
import requests
from requests.auth import HTTPBasicAuth

CORTEX_SUPERADMIN_USERNAME=os.getenv('CORTEX_SUPERADMIN_USERNAME',default='')
CORTEX_SUPERADMIN_PASSWORD=os.getenv('CORTEX_SUPERADMIN_PASSWORD',default='')
CORTEX_USER_USERNAME=os.getenv('CORTEX_USER_USERNAME',default='')
MISP_API_KEY=os.getenv('MISP_API_KEY',default='')
KEYSTORE_PASSWORD=os.getenv('KEYSTORE_PASSWORD',default='')
OPEN_ID_SECRET=os.getenv('OPEN_ID_SECRET',default='')
CORTEX_INTEGRATION=os.getenv('CORTEX_INTEGRATION',default=False)
MISP_INTEGRATION=os.getenv('MISP_INTEGRATION',default=False)
CONF_FILE = '/tmp/hive/application.conf'
TRUST_STORE = '/tmp/keystore/cacerts'
CUSTOM_KEYSTORE = '/tmp/keystore/webCA.jks'
CA = '/etc/ssl/certs/container/ca.crt'

def get_cortex_api():
    url = 'https://cortex.default.svc.cluster.local/api/user/{cortex_user}/key'.format(cortex_user=CORTEX_USER_USERNAME)
    response = requests.get(url=url, auth=HTTPBasicAuth(CORTEX_SUPERADMIN_USERNAME, CORTEX_SUPERADMIN_PASSWORD),verify=CA)
    if response and response.status_code == 200:
        return response.text
    sys.exit(os.EX_CONFIG)

def update_config_file():
    print("Editing Hive Configuration File")
    try:
        if not os.path.isfile(CONF_FILE):
            shutil.copy('/data/config.conf',CONF_FILE)
        fin = open(CONF_FILE, "rt")
        data = fin.read()
        if CORTEX_INTEGRATION == 'true':
            print("Configuring Cortex Integration")
            CORTEX_API_KEY = get_cortex_api()
            data = data.replace('##CORTEX_API_KEY##', CORTEX_API_KEY)
        if MISP_INTEGRATION == 'true':
            print("Configuring MISP Integration")
            data = data.replace('##MISP_API_KEY##', MISP_API_KEY)
        data = data.replace('##KEYSTORE_PASSWORD##', KEYSTORE_PASSWORD)
        data = data.replace('##OPEN_ID_SECRET##', OPEN_ID_SECRET)
        fin.close()
        fin = open(CONF_FILE, "wt")
        fin.write(data)
        fin.close()
    except Exception as e:
        print("Setup Exception: " + str(e))
        sys.exit(os.EX_CONFIG)

def create_truststore():
    print("Create Custom Trust Store")
    truststore_cmd = 'keytool -importcert -noprompt -trustcacerts -file {ca} -alias webCA -keystore {truststore} -storepass {password}'.format(ca=CA,truststore=CUSTOM_KEYSTORE,password=KEYSTORE_PASSWORD)
    return os.system(truststore_cmd)

def update_system_truststore():
    print("Adding Kit CA to Java Trust Store")
    shutil.copy('/etc/ssl/certs/java/cacerts',TRUST_STORE)
    os.chmod(TRUST_STORE,0o664)
    truststore_cmd = 'keytool -importcert -noprompt -trustcacerts -file {ca} -alias webCA -keystore {truststore} -storepass changeit'.format(ca=CA,truststore=TRUST_STORE)
    os.system(truststore_cmd)

if __name__ == '__main__':
    update_config_file()
    create_truststore()
    update_system_truststore()
    print("Setting Directory Permissions")
    os.system('chown -R 1 /tmp/hive')
    os.system('chown -R 1000 /tmp/elastic-data')
