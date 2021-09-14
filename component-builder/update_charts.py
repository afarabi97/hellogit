import os
import yaml
import requests
import tempfile
from pathlib import Path


from typing import Dict
from jinja2 import Environment, select_autoescape
from jinja2.loaders import FileSystemLoader

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


CHART_FOLDER = "/opt/tfplenum/charts"
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
HELM_URL = "https://nexus.sil.lab/repository/tfplenum-helm"
CHART_MUSEUM_URI = "http://localhost:5002/api/charts"


def download_file(url: str, download_loc: str = None):
    print("Downloading {}".format(url))
    local_filename = url.split('/')[-1]
    if download_loc is not None:
        local_filename= download_loc + "/" + local_filename

    with requests.get(url, stream=True, verify=False) as r:
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
        requests.delete(url, verify=False)

    def _push_chart(self, chart_tar_name: str, tmp_dir_path: str):
        chart_tar_path=tmp_dir_path + "/" + chart_tar_name
        data = None
        if os.path.exists(chart_tar_path):
            data = open(chart_tar_path, 'rb')

        if data:
            headers = {'Content-type': 'application/octet-stream'}
            print("Pushing up {}".format(chart_tar_name))
            r = requests.post(CHART_MUSEUM_URI, data=data, headers=headers)
            if (r.status_code == 200 or r.status_code ==201):
                print(chart_tar_name + " updated successfully.")
            else:
                print(chart_tar_name + "Update failed.")
                print(r.text)

    def execute(self):
        Path(CHART_FOLDER).mkdir(parents=False, exist_ok=True)
        for chart_tar_name in self._helm_charts:
            download_file(HELM_URL + "/" + chart_tar_name, CHART_FOLDER)
            self._delete_chart(chart_tar_name)
            self._push_chart(chart_tar_name, CHART_FOLDER)
        print("All charts were saved to {} for verfication purposes.".format(CHART_FOLDER))

def main():
    updater = NexusHelmChartUpdater()
    updater.execute()


if __name__ == '__main__':
    main()
