#!/usr/bin/python3
import shutil
import os
import sys

MISP_MODULES_URL=os.environ['MISP_MODULES_URL']
MISP_MODULES_PORT=os.environ['MISP_MODULES_PORT']
URI = "http://{uri}:{port}/modules".format(uri=MISP_MODULES_URL, port=MISP_MODULES_PORT)
if __name__ == '__main__':
    while True:
        print("Waiting for MISP Modules to becoming ready...")
        try:
            r = requests.get(URI, headers={'Content-Type': 'application/json')
            if r.status_code == 200:
                sys.exit(0)
            time.sleep(2)
        except Exception as e:
            print("Setup Exception: " + str(e))
            time.sleep(2)
            continue
