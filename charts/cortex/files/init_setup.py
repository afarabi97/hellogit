#!/usr/bin/python3
import shutil
import os

CONF_FILE = '/tmp/cortex/application.conf'
TRUST_STORE = '/tmp/keystore/cacerts'


if __name__ == '__main__':
    print("Setting Directory Permissions")
    os.system('chown -R 1 /tmp/cortex')
    os.system('chown -R 1000 /tmp/elastic-data')

    print("Adding Kit CA to Java Trust Store")
    shutil.copy('/etc/ssl/certs/java/cacerts',TRUST_STORE)
    os.chmod(TRUST_STORE,0o664)
    truststore_cmd = 'keytool -importcert -noprompt -trustcacerts -file /etc/ssl/certs/container/ca.crt -alias webCA -keystore {truststore} -storepass changeit'.format(truststore=TRUST_STORE)
    os.system(truststore_cmd)
