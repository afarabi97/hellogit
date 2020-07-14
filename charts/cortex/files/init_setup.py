#!/usr/bin/python3
import shutil
import os
import sys

OPEN_ID_SECRET=os.environ['OPEN_ID_SECRET']
CORTEX_ORGANIZATION=os.environ['CORTEX_ORGANIZATION']
CONF_FILE = '/tmp/cortex/application.conf'
TRUST_STORE = '/tmp/keystore/cacerts'


if __name__ == '__main__':
    if not os.path.isfile(CONF_FILE):
        shutil.copy('/data/config.conf',CONF_FILE)

    print("Editing Cortex Configuration File")
    fin = open(CONF_FILE, "rt")
    data = fin.read()
    print("Injecting OpenID Secret to Configuration File")
    data = data.replace('##OPEN_ID_SECRET##', OPEN_ID_SECRET)
    print("Injecting Default Cortex Org Name to Configuration File")
    data = data.replace('##CORTEX_ORGANIZATION##', CORTEX_ORGANIZATION)
    fin.close()
    fin = open(CONF_FILE, "wt")
    fin.write(data)
    fin.close()

    print("Setting Directory Permissions")
    os.system('chown -R 1 /tmp/cortex')
    os.system('chown -R 1000 /tmp/elastic-data')

    print("Adding Kit CA to Java Trust Store")
    shutil.copy('/etc/ssl/certs/java/cacerts',TRUST_STORE)
    os.chmod(TRUST_STORE,0o664)
    truststore_cmd = 'keytool -importcert -noprompt -trustcacerts -file /etc/ssl/certs/container/ca.crt -alias webCA -keystore {truststore} -storepass changeit'.format(truststore=TRUST_STORE)
    os.system(truststore_cmd)
