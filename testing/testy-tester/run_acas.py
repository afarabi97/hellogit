import json
import os
import requests
import time

from argparse import ArgumentParser, Namespace
from datetime import datetime, timedelta
from pathlib import Path
from requests import Response
from time import sleep
from typing import Dict, Union, List
from uuid import uuid4

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__)) + "/"
PROJECT_ROOT_DIR = SCRIPT_DIR + "../../"

class ScanNameNotFound(Exception):
    pass


class ScanResultNotFound(Exception):
    pass


class ReportNotFound(Exception):
    pass


def print_json(some_obj: Union[Dict, List]):
    print(json.dumps(some_obj, indent=4, sort_keys=True))


class ACASRunner:

    def __init__(self, ip_or_host: str, username: str, password: str):
        self._ip_or_host = ip_or_host
        self._base_url = "https://{}".format(self._ip_or_host)
        self._session = requests.Session()
        self._cached_cookies = None # type: requests.cookies.RequestsCookieJar
        self._username = username
        self._password = password
        self._headers = None # type: Dict
        self._scan_obj = None #type: Dict

    def _get_current_utc_unixtime_stamp(self) -> str:
        d = datetime.utcnow()
        unixtime = time.mktime(d.timetuple())
        return int(unixtime)

    def _gen_random_string(self) -> str:
        rando = str(uuid4())
        rando = rando.replace("-", "")
        rando = rando + str(uuid4())[:8]
        return rando

    def _exit_if_not_200(self, response: Response):
        if response.status_code != 200:
            print("Failed to run {} with status code {}.".format(response.url, response.status_code))
            payload = response.json()
            if payload:
                print(json.dumps(payload, indent=4, sort_keys=True))
            exit(1)

    def _get_scan_id_by_name(self, name: str) -> int:
        response = self._get(self._base_url + "/rest/scan?filter=usable&fields=canUse%2CcanManage%2Cowner%2Cgroups%2CownerGroup%2Cstatus%2Cname%2CcreatedTime%2Cschedule%2Cpolicy%2Cplugin%2Ctype")
        response_body = response.json()
        for scan_obj in response_body["response"]["usable"]:
            if scan_obj["name"] == name:
                return int(scan_obj["id"])

        raise ScanNameNotFound("{} was not found.".format(name))

    def _login(self):
        payload = {"username":self._username,
                   "password":self._password,
                   "releaseSession": "false",
                   "a": str(self._get_current_utc_unixtime_stamp()),
                   "b": self._gen_random_string()}
        response = self._session.post(self._base_url + '/rest/token', json=payload, verify=False)
        self._exit_if_not_200(response)
        self._cached_cookies = response.cookies
        token = str(response.json()['response']['token'])
        self._headers = {"X-SecurityCenter" : token, "Content-Type" : "application/json"}
        print("Log in successful")

    def _post(self, url: str, payload: Dict) -> Response:
        response = self._session.post(url,
                                      json=payload,
                                      verify=False,
                                      headers=self._headers,
                                      cookies=self._cached_cookies)
        self._exit_if_not_200(response)
        return response

    def _get(self, url: str) -> Response:
        response = self._session.get(url,
                                     verify=False,
                                     headers=self._headers,
                                     cookies=self._cached_cookies)
        self._exit_if_not_200(response)
        return response

    def _patch(self, url: str, payload: Dict) -> Response:
        response = self._session.patch(url,
                                       json=payload,
                                       verify=False,
                                       headers=self._headers,
                                       cookies=self._cached_cookies)
        self._exit_if_not_200(response)
        return response

    def _patch_scan(self, scan_id: int, nodes_to_scan: List[str]):
        print(self._scan_obj)
        payload = {
            "repository":{
                "id": int(self._scan_obj["repository"]["id"])
            },
            "schedule":{
                "start":"TZID=America/New_York:20200319T173000",
                "repeatRule":"FREQ=TEMPLATE;INTERVAL=1",
                "type":"template",
                "enabled":"true"
            },
            "policy":{
                "id": str(self._scan_obj["policy"]["id"])
            },
            "ipList": ','.join(nodes_to_scan),
            "assets":[

            ],
            "plugin":{
                "id":-1
            }
        }
        self._patch(self._base_url + "/rest/scan/{}".format(scan_id), payload)

    def _execute_scan(self, scan_id: int, scan_name: str) -> int:
        payload = {
            "id":scan_id,
            "name":scan_name,
            "description":"",
            "context":"",
            "status":0,
            "createdTime":int(self._get_current_utc_unixtime_stamp()),
            "modifiedTime":None,
            "group":{
                "id":0,
                "name":"Administrator"
            },
            "repository":{

            },
            "schedule":{
                "start":"TZID=:Invalid dateInvalid date",
                "repeatRule":"FREQ=TEMPLATE;INTERVAL=",
                "type":"template",
                "enabled":"true"
            },
            "dhcpTracking":"false",
            "emailOnLaunch":"false",
            "emailOnFinish":"false",
            "type":"policy",
            "policy":{
                "id":"1000001"
            },
            "plugin":{
                "id":-1,
                "name":"",
                "description":""
            },
            "zone":{
                "id":-1
            },
            "scanningVirtualHosts":"false",
            "classifyMitigatedAge":0,
            "assets":[

            ],
            "ipList":""
        }
        response = self._post(self._base_url + "/rest/scan/{}/launch".format(scan_id), payload)
        return int(response.json()["response"]["scanResult"]["id"])

    def _download_report(self, report_id: int):
        download_url = self._base_url + "/rest/report/{}/download".format(report_id)
        payload = {"id":report_id, "name":"test","description":"",
                   "context":"","status":"Completed","createdTime":None,"modifiedTime":None,"pubSites":[]}
        with self._session.request(
            method='POST',
            url=download_url,
            json=payload,
            headers=self._headers,
            cookies=self._cached_cookies,
            verify=False,
            stream=True
        ) as response:
            response.raise_for_status()
            file_to_save = "{}TFPlenum_ACAS_Report.pdf".format(PROJECT_ROOT_DIR)
            with open(file_to_save, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            print("Successfully exported report to {}".format(file_to_save))

    def _get_latest_running_report(self) -> Dict:
        response = self._get(self._base_url + "/rest/report?filter=usable&fields=name%2CjobID%2Cstatus%2Crunning%2CstartTime%2CfinishTime")
        response_dict = response.json()
        print_json(response_dict)
        cached_report = None
        for report in response_dict["response"]["usable"] :
            if cached_report is None:
                cached_report = report
                continue

            if int(cached_report["id"]) < int(report["id"]) and report["running"] == "true":
                cached_report = report

        if cached_report["running"] == "false":
            raise ReportNotFound()

        return cached_report

    def _wait_for_report_to_complete(self, report_id: int, timeout_min:int=60):
        start_time = datetime.utcnow()
        while True:
            response = self._get(self._base_url + "/rest/report?filter=usable&fields=name%2CjobID%2Cstatus%2Crunning%2CstartTime%2CfinishTime")
            response_dict = response.json()
            cached_report = None
            for report in response_dict["response"]["usable"] :
                if report_id == int(report["id"]) and report["running"] == "false":
                    return
            current_time = datetime.utcnow()
            if current_time > (start_time + timedelta(minutes=timeout_min)):
                print("Waiting for scan to complete timed out after %d minutes." % timeout_min)
                break

    def _export_report(self):
        latest_running_report = self._get_latest_running_report()
        report_id = int(latest_running_report["id"])
        self._wait_for_report_to_complete(report_id)
        self._download_report(report_id)

    def _get_scan_result_status(self, response_dict: Dict, scan_result_id: int) -> Dict:
        for scan_result in response_dict["response"]["usable"]:
            if int(scan_result["id"]) == scan_result_id:
                return scan_result
        raise ScanResultNotFound("{} was not found".format(scan_result_id))

    def _check_scan_result(self, scan_result_id: int, timeout_min:int=360):
        start_time = datetime.utcnow()
        while True:
            sleep(10)
            response = self._get(self._base_url + "/rest/scanResult?filter=usable&optimizeCompletedScans=true&fields=canUse%2CcanManage%2Cowner%2Cgroups%2CownerGroup%2Cstatus%2Cname%2Cdetails%2CdiagnosticAvailable%2CimportStatus%2CcreatedTime%2CstartTime%2CfinishTime%2CimportStart%2CimportFinish%2Crunning%2CtotalIPs%2CscannedIPs%2CcompletedIPs%2CcompletedChecks%2CtotalChecks%2CdataFormat%2CdownloadAvailable%2CdownloadFormat%2Crepository%2CresultType%2CresultSource%2CscanDuration")
            response_dict = response.json()

            if response_dict["response"]["usable"] is None:
                break

            if len(response_dict["response"]["usable"]) == 0:
                break

            scan_result = self._get_scan_result_status(response_dict, scan_result_id)
            if scan_result["status"] != "Running":
                break

            current_time = datetime.utcnow()
            if current_time > (start_time + timedelta(minutes=timeout_min)):
                print("Waiting for scan to complete timed out after %d minutes." % timeout_min)
                break
        sleep(30) # Wait for report to launch after scan completes.

    def execute(self, scan_name: str, nodes_to_scan: List[str]):
        self._login()
        scan_id = self._get_scan_id_by_name(scan_name)
        response = self._get(self._base_url + "/rest/scan/{}".format(scan_id))
        self._scan_obj = response.json()["response"]
        self._patch_scan(scan_id, nodes_to_scan)
        scan_result_id = self._execute_scan(scan_id, scan_name)
        self._check_scan_result(scan_result_id)
        self._export_report()


def main():
    parser = ArgumentParser(description="The ACAS Runner can be used to run specific scans defined within ACAS's tenable interface.")
    parser.add_argument("-a", "--ipaddress", dest="ip_address", required=True,
                        help="The IP Address or DNS entry for your ACAS server.")
    parser.add_argument("-u", "--username", dest="username", required=True,
                        help="The username of the ACAS server.")
    parser.add_argument("-p", "--password", dest="password", required=True,
                        help="The password of the ACAS server.")
    parser.add_argument("-s", "--scan_name", dest="scan_name", required=True,
                        help="The name of the scan you wish to execute.")
    parser.add_argument('--nodes-to-scan', dest='nodes_to_scan', nargs="+", \
                         required=True, help="The nodes that will be scaned for the ACAS report.")
    args = parser.parse_args()

    runner = ACASRunner(args.ip_address, args.username, args.password)
    runner.execute(args.scan_name, args.nodes_to_scan)


if __name__ == '__main__':
    main()
