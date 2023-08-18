#!/usr/bin/python
import os
import sys
import json
import gzip
import logging
from time import sleep
from logging.handlers import TimedRotatingFileHandler
import requests

DIRECTOR_TOKEN = os.environ['DIRECTOR_TOKEN']
CONTROLLER_IPADDRESS = os.environ['CONTROLLER_IPADDRESS']
DIRECTOR_IPADDRESS = os.environ['DIRECTOR_IPADDRESS']
LOCAL_KIT_TOKEN = os.environ['LOCAL_KIT_TOKEN']
LOCAL_CA="/etc/ssl/certs/container/ca.crt"
DIRECTOR_CA="/etc/ssl/certs/container/director_ca.crt"
LOGFILE_NAME="remote_agent.log"
LOGFILE_PATH="/var/log"

class GZipRotator:
    def __call__(self, source, dest):
        os.rename(source, dest)
        f_in = open(dest, 'rb')
        f_out = gzip.open("%s.gz" % dest, 'wb')
        f_out.writelines(f_in)
        f_out.close()
        f_in.close()
        os.remove(dest)
class RemoteHealthAgent():

    def __init__(self, _path=LOGFILE_PATH, _name=LOGFILE_NAME):
        self.local_url = f"https://{CONTROLLER_IPADDRESS}"
        self.director_url = f"https://{DIRECTOR_IPADDRESS}"
        self.verify = LOCAL_CA
        self.director_verify = DIRECTOR_CA
        self.log = self.create_log(f"{_path}/{_name}")

    def create_log(self, path):
        """"""
        formatter = logging.Formatter("%(asctime)s: %(levelname)s: %(name)s: %(message)s")
        logging.basicConfig(filename=path, filemode="w", level=logging.DEBUG, format="%(asctime)s: %(levelname)s: %(name)s: %(message)s")
        logger = logging.getLogger("RemoteHealthAgent")
        handler = TimedRotatingFileHandler(path, when="midnight", interval=1, backupCount=30, utc=True)
        handler.rotator = GZipRotator()
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        std_handler=logging.StreamHandler(sys.stdout)
        logging.getLogger().addHandler(std_handler)
        std_handler.setFormatter(formatter)
        logger.setLevel(logging.DEBUG)
        return logger

    def get_session(self, url, api) -> object:
        rq = requests.get(f"{url}/{api}", headers={"Authorization": f"Bearer {LOCAL_KIT_TOKEN}"}, verify=self.verify, timeout=60)
        if rq.status_code != 200:
            self.log.error(f"{rq.text}")
            raise Exception(rq.text)
        else:
            self.log.debug(f"get_session(): Status: {rq.status_code} URL: {url}/{api}")
        return rq.json()

    def get_payload(self) -> dict:
        try:
            data = {'token':DIRECTOR_TOKEN,'ipaddress':CONTROLLER_IPADDRESS}
            dashboard_status = self.get_session(self.local_url, "api/health/dashboard/status")
            node_status = self.get_session(self.local_url, "api/kubernetes/nodes/status")
            pod_status = self.get_session(self.local_url, "api/kubernetes/pods/status")
            kibana_info = self.get_session(self.local_url, "api/app/kibana/info")
            hostname = self.get_session(self.local_url, "api/health/hostname")
            write_rejects = self.get_session(self.local_url, "api/app/elasticsearch/rejects")
            zeek_packets = self.get_session(self.local_url, "api/app/zeek/packets")
            suricata_packets = self.get_session(self.local_url, "api/app/suricata/packets")

            data['dashboard_status'] = dashboard_status
            data['kibana_info'] = kibana_info
            data['node_status'] = node_status
            data['pod_status'] = pod_status
            data['hostname'] = hostname
            data['write_rejects'] = write_rejects
            data['zeek'] = zeek_packets
            data['suricata'] = suricata_packets

            return data
        except Exception as e:
            self.log.error(f"Exception in get_payload: {e}")

    def push_payload(self):
        try:
            payload = self.get_payload()
            rq = requests.post(f"{self.director_url}/api/health/remote/agent", headers={"Authorization": f"Bearer {DIRECTOR_TOKEN}"}, json=json.dumps(payload), verify=self.director_verify, timeout=60)
            if(not (rq.status_code>=200 and rq.status_code<=204)):
                self.log.error(f"Status: {rq.status_code} Reason: {rq.reason}")
                raise Exception(rq.reason)
            else:
                self.log.debug(f"push_payload(): Status: {rq.status_code} URL: {self.director_url}/api/health/remote/agent")
        except Exception as ex:
            self.log.error(f"Exception in push_payload: {ex}")

if __name__ == '__main__':
    agent = RemoteHealthAgent()
    try:
        agent.log.info("Starting Remote Health Agent")
        while True:
            agent.push_payload()
            sleep(10)
    except Exception as ex:
        print(f"Exception in __main__: {ex}")
