#!/usr/bin/python
import requests
import os
from time import sleep

DIRECTOR_TOKEN = os.environ['DIRECTOR_TOKEN']
CONTROLLER_IPADDRESS = os.environ['CONTROLLER_IPADDRESS']
DIRECTOR_IPADDRESS = os.environ['DIRECTOR_IPADDRESS']
LOCAL_KIT_TOKEN = os.environ['LOCAL_KIT_TOKEN']
LOCAL_CA="/etc/ssl/certs/container/ca.crt"
DIRECTOR_CA="/etc/ssl/certs/container/director_ca.crt"

class RemoteHealthAgent:

    def __init__(self):
        self.local_url = "https://{}".format(CONTROLLER_IPADDRESS)
        self.director_url = "https://{}".format(DIRECTOR_IPADDRESS)
        self.verify = LOCAL_CA
        self.director_verify = DIRECTOR_CA

    def get_session(self, url, api) -> object:
        rq = requests.get("{}/{}".format(url, api), headers={"Authorization": "Bearer {}".format(LOCAL_KIT_TOKEN)}, verify=self.verify)
        if rq.status_code != 200:
            raise Exception(rq.text)
        return rq.json()

    def get_payload(self) -> list:
        try:
            data = {'token':DIRECTOR_TOKEN,'ipaddress':CONTROLLER_IPADDRESS}
            dashboard_status = self.get_session(self.local_url, "api/health/dashboard/status")
            node_status = self.get_session(self.local_url, "api/health/nodes/status")
            pod_status = self.get_session(self.local_url, "api/health/pods/status")
            kibana_info = self.get_session(self.local_url, "api/health/dashboard/kibana/info")
            hostname = self.get_session(self.local_url, "api/hostname")
            write_rejects = self.get_session(self.local_url, "api/write/rejects")
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
            print(e)

    def push_payload(self):
        try:
            payload = self.get_payload()
            print(payload)
            requests.post("{}/api/remote-health/agent".format(self.director_url), headers={"Authorization": "Bearer {}".format(DIRECTOR_TOKEN)}, json=payload, verify=self.director_verify)

        except Exception as e:
            print(e)

if __name__ == '__main__':
    agent = RemoteHealthAgent()

    try:
        while True:
            agent.push_payload()
            sleep(10)
    except Exception as e:
        print(e)
