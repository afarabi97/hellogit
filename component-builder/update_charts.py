import argparse
import os
from pathlib import Path
import subprocess
import sysconfig
from typing import Dict

import requests
import urllib3
import yaml
from build import Builder, filter_helm_components, get_all_components
from jinja2 import Environment, select_autoescape
from jinja2.loaders import FileSystemLoader

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


CHART_FOLDER = "/opt/tfplenum/charts"
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
HELM_URL = "https://nexus.sil.lab/repository/tfplenum-helm"
CHART_MUSEUM_URI = "http://localhost:5002/api/charts"

parser = argparse.ArgumentParser(description='Update local or remote repository')
parser.add_argument('--chart', choices=['local','remote'], help='Charts will be updated locally or remotely')
parser.add_argument('--docker', choices=['local'], const="local", nargs='?', help='Docker image will be updated in local docker registry')
args = parser.parse_args()


def get_local_auth_header(content_type: str = "application/json") :
    """
    Returns the authorization header for local authentication.

    Args:
        content_type (str): The content type of the request. Defaults to "application/json".

    Returns:
        dict: The authorization header with the bearer token and content type.
    """
    # trunk-ignore(bandit/B603)
    process = subprocess.Popen(["/opt/tfplenum/.venv/bin/python3", "/opt/sso-idp/gen_api_token.py", "--roles", "operator"], stdout=subprocess.PIPE, shell=False)
    output, error = process.communicate()
    if error:
        print(error)
        sysconfig.exit(1)
    token = output.decode("utf-8").strip('\n')
    return {"Authorization": f"Bearer {token}", "Content-Type": content_type}


def download_file(url: str, download_loc: str = None):
    print("Downloading {}".format(url))
    local_filename = url.split('/')[-1]
    if download_loc is not None:
        local_filename= download_loc + "/" + local_filename

    with requests.get(url, stream=True, verify=False ) as r:
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                # If you have chunk encoded response uncomment if
                # and set chunk_size parameter to None.
                #if chunk:
                f.write(chunk)
    return local_filename

class NexusHelmChartUpdater:

    def __init__(self):
        self._helm_charts = []
        self._set_helm_packages()

    def _set_helm_packages(self) -> Dict:
        yaml_dict = {}
        with open(SCRIPT_DIR + "/../versions.yml", "r") as stream:
            yaml_dict = yaml.safe_load(stream)

        jinja2_environment = Environment(
            loader = FileSystemLoader(SCRIPT_DIR + "/../"),
            # Explicitly configure as a security measure
            autoescape=select_autoescape()
        )
        template = jinja2_environment.get_template('versions.yml')
        rendered_template = template.render(yaml_dict)
        yaml_dict = yaml.safe_load(rendered_template)
        self._helm_charts = yaml_dict["helm_packages"]

    def _delete_chart(self, chart_tar_name: str):
        pos = chart_tar_name.rfind('-') + 1
        pos2 = chart_tar_name.rfind('.')
        chart_version = chart_tar_name[pos:pos2]
        chart_name = chart_tar_name[0: pos -1]
        url = CHART_MUSEUM_URI + "/" + chart_name + "/" + chart_version
        print("Deleting {}".format(url))
        headers = get_local_auth_header()
        requests.delete(url, verify=False, headers=headers)

    def _push_chart(self, chart_tar_name: str):
        chart_tar_path=CHART_FOLDER + "/" + chart_tar_name
        data = None
        if os.path.exists(chart_tar_path):
            data = open(chart_tar_path, 'rb')

        if data:
            headers = get_local_auth_header('application/octet-stream')
            print("Pushing up {}".format(chart_tar_name))
            r = requests.post(CHART_MUSEUM_URI, data=data, headers=headers, verify=False)
            if (r.status_code == 200 or r.status_code ==201):
                print(chart_tar_name + " updated successfully.")
            else:
                print(chart_tar_name + "Update failed.")
                print(r.text)

    def _local_update(self):
        components = get_all_components()
        helm_components = filter_helm_components(components)
        for helm_component in helm_components:
            build = Builder(helm_component)
            build.build_helm_chart(remote=False)

    def execute(self, location: str):
        Path(CHART_FOLDER).mkdir(parents=False, exist_ok=True)
        if location == "local":
            self._local_update()
        for chart_tar_name in self._helm_charts:
            if location == "remote":
                download_file(HELM_URL + "/" + chart_tar_name, CHART_FOLDER)
            self._delete_chart(chart_tar_name)
            self._push_chart(chart_tar_name)
        print("All charts were saved to {} for verfication purposes.".format(CHART_FOLDER))

    def parse_args(self, args: dict):
        if args.chart == "remote":
            self.execute(args.chart)
        elif args.chart == "local":
            self.execute(args.chart)
        elif args.docker == "local":
            print("TODO")
        else:
            parser.print_help()

def main():
    updater = NexusHelmChartUpdater()
    updater.parse_args(args)

if __name__ == '__main__':
    main()
