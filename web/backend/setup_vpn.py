from argparse import ArgumentParser

import requests
import urllib3
from requests import Response

urllib3.disable_warnings()


class Vpn():
    def __init__(self, hostname: str, bearer: str):
        self.hostname = hostname
        self.headers = {"Authorization": "Bearer {}".format(bearer)}
        self.node = None
        self.deploy_job = None

    def get_node(self):
        url = "https://localhost/api/kit/node/{}".format(self.hostname)
        resp = requests.get(url=url, headers=self.headers,
                            verify=False)  # type: Response
        if resp.status_code == 200:
            self.node = resp.json()

    def connect(self):
        if self.node:
            url = "https://localhost/api/kit/node/{}/vpn".format(
                self.node["hostname"])
            data = {"vpn_status": True}
            req = requests.post(
                url=url, json=data, headers=self.headers, verify=False)  # type: Response
            if req.status_code == 200 or req.status_code == 201:
                print("{} connected to vpn.".format(self.node["hostname"]))

    def disconnect(self):
        if self.node:
            url = "https://localhost/api/kit/node/{}/vpn".format(
                self.node["hostname"])
            data = {"vpn_status": False}
            req = requests.post(
                url=url, json=data, headers=self.headers, verify=False)  # type: Response
            if req.status_code == 200 or req.status_code == 201:
                print("{} disconnected from vpn.".format(
                    self.node["hostname"]))

    def cancel_deploy_job(self):
        if self.deploy_job:
            if not self.deploy_job["complete"] and not self.deploy_job["error"]:
                url = "https://localhost/api/jobs/{}".format(
                    self.deploy_job["job_id"])
                req = requests.delete(
                    url=url, headers=self.headers, verify=False)  # type: Response
                if req.status_code == 200:
                    print("{} deploy job cancelled.".format(
                        self.node["hostname"]))

    def deploy_node(self):
        if self.node:
            url = "https://localhost/api/kit/node/{}/deploy".format(
                self.node["hostname"])
            req = requests.post(url=url, headers=self.headers,
                                verify=False)  # type: Response
            if req.status_code == 200 or req.status_code == 201:
                print("Starting deployment for {}.".format(
                    self.node["hostname"]))

    def get_deploy_job(self):
        if self.node:
            self.deploy_job = next(
                job for job in self.node["jobs"] if job["name"] == "deploy")


def main():
    parser = ArgumentParser(
        description="This is used to start the deployment of a remote node over vpn.")
    parser.add_argument("-s", "--state", dest="state", required=True,
                        help="Connect or Disconnect from vpn.")
    parser.add_argument("--hostname", dest="hostname", required=True,
                        help="The hostname of the node.")
    parser.add_argument("-b", "--bearer", dest="bearer_key", required=True,
                        help="Api bearer key.")
    args = parser.parse_args()
    vpn = Vpn(args.hostname, args.bearer_key)
    vpn.get_node()
    vpn.get_deploy_job()
    if args.state == "connect":
        vpn.connect()
        if "error" in vpn.deploy_job and vpn.deploy_job["error"]:
            print("Previous deploy stage failed restarting deploy stage.")
            vpn.deploy_node()
            return
        if "complete" in vpn.deploy_job and vpn.deploy_job["complete"]:
            print("{} is already deployed".format(vpn.hostname))
            return
        if "inprogress" in vpn.deploy_job and vpn.deploy_job["inprogress"]:
            print("{} deploy job is in progress no need to start the deploy stage.".format(
                vpn.hostname))
            return
        if "pending" in vpn.deploy_job and vpn.deploy_job["pending"]:
            vpn.deploy_node()
            return

    if args.state == "disconnect":
        vpn.disconnect()
        vpn.cancel_deploy_job()


if __name__ == '__main__':
    main()
