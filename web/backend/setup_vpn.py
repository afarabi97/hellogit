import requests
from requests import Response
from argparse import ArgumentParser, Namespace
import urllib3
urllib3.disable_warnings()

class Vpn():
    def __init__(self, hostname: str, bearer: str):
        self.hostname = hostname
        self.headers = {"Authorization": "Bearer {}".format(bearer)}

    def get_node(self):
        url = "https://localhost/api/node/{}".format(self.hostname)
        return requests.get(url=url, headers=self.headers, verify=False)

    def connect(self):
        url = "https://localhost/api/node/{}/vpn".format(self.hostname)
        data = { "vpn_status": True }
        requests.post(url=url, json=data, headers=self.headers, verify=False)

    def disconnect(self):
        url = "https://localhost/api/node/{}/vpn".format(self.hostname)
        data = { "vpn_status": False }
        requests.post(url=url, json=data, headers=self.headers, verify=False)

    def deploy_node(self):
        url = "https://localhost/api/node/{}/deploy".format(self.hostname)
        requests.post(url=url, headers=self.headers, verify=False)


def main():
    parser = ArgumentParser(description="This is used to start the deployment of a remote node over vpn.")
    parser.add_argument("-s", "--state", dest="state", required=True,
                        help="Connect or Disconnect from vpn.")
    parser.add_argument("--hostname", dest="hostname", required=True,
                        help="The hostname of the node.")
    parser.add_argument("-b", "--bearer", dest="bearer_key", required=True,
                        help="Api bearer key.")
    args = parser.parse_args()
    vpn = Vpn(args.hostname, args.bearer_key)
    if args.state == "connect":
        vpn.connect()
        response = vpn.get_node() # type: requests.Response
        if response:
            node = response.json()
            if node:
                for job in node["jobs"]:
                    if job["name"] == "deploy":
                        if not job["complete"]:
                            print("Starting deployment of virtual sensor")
                            vpn.deploy_node()

    if args.state == "disconnect":
        vpn.disconnect()

if __name__ == '__main__':
    main()
