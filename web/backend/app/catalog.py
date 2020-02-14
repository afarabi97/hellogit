from app import app, logger
from typing import Dict, Tuple, List
from shared.connection_mngs import FabricConnectionWrapper
import json
import requests

CHART_REPO_PORT = "8080"

class Catalog(object):
    def __init__(self):
        self.tiller_service_ip = self.get_tiller_service()
        print(self.tiller_service_ip)
        self.chart_repo_service_ip = self.get_helm_repo_service()
        self.helm_repo_uri = self.get_helm_repo()
        self.chart_releases = None

    def set_chart_releases(self, charts: dict) -> None:
        self.chart_releases = charts


    def get_helm_repo_health(self) -> bool:
        """
        Gets the helm repo health from chartmuseum

        """
        healthy = False
        data = None
        if self.chart_repo_service_ip != "":
            URL = "http://" + self.chart_repo_service_ip + ":" + CHART_REPO_PORT + "/health"
            r = requests.get(url = URL)
            data = r.json()

        if data and "healthy" in data:
            healthy = True

        return healthy

    def get_tiller_service(self) -> str:
        """
        Gets tiller service ip address from kubernetes

        :return (str): Return tiller service ip address
        """

        with FabricConnectionWrapper() as ssh_conn:
            execute_cmd_get_ip = ("kubectl get service tiller-deploy -n kube-system --no-headers | awk '{ print $4 }'")
            ip_ret_val = ssh_conn.run(execute_cmd_get_ip, hide=True)  # type: Result
            ip_ret_val = ip_ret_val.stdout.strip() # type: str
            if ip_ret_val == '<none>' or ip_ret_val == '':
                ip_ret_val = None
            return ip_ret_val
        return None

    def get_helm_repo_service(self) -> str:
        """
        Gets tiller service ip address from kubernetes

        :return (str): Return tiller service ip address
        """
        ip_ret_val = ""

        with FabricConnectionWrapper() as ssh_conn:
            execute_cmd_get_ip = ("kubectl get service chartmuseum --no-headers | awk '{ print $4 }'")
            ip_ret_val = ssh_conn.run(execute_cmd_get_ip, hide=True)  # type: Result
            ip_ret_val= ip_ret_val.stdout.strip()  # type: str
            if ip_ret_val == '<none>' or ip_ret_val == '':
                ip_ret_val = None

        return ip_ret_val

    def get_helm_repo(self) -> str:
        """
        Gets the helm repo ip and health

        """
        healthy = False
        if self.chart_repo_service_ip is not None:
            healthy = self.get_helm_repo_health()
        if healthy:
            return "http://" + self.chart_repo_service_ip + ":" + CHART_REPO_PORT

        return None
