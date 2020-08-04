#!/opt/tfplenum/web/tfp-env/bin/python
import os
import json
import requests
import sys

from argparse import ArgumentParser, Namespace
from base64 import b64decode
from requests import Response
from kubernetes import client, config
from typing import Tuple, Dict


config.load_kube_config()
api_instance = client.CoreV1Api()


def get_elastic_auth() -> Tuple:
    es_user = 'elastic'
    elastic_secret = api_instance.read_namespaced_secret('tfplenum-es-elastic-user', 'default')
    es_pass = b64decode(elastic_secret.data[es_user]).decode('utf-8')
    return es_user, es_pass


class ELKAPIError(Exception):
    pass


class ELKAPI:

    def __init__(self, elk_host: str, elk_port: str):
        self._base_url = "https://{}:{}".format(elk_host, elk_port)
        self._auth = get_elastic_auth()

    def elk_get(self, url: str) -> Response:
        headers={'Accept': 'application/json', 'Content-type': 'application/json'}
        response = requests.get(self._base_url + url, auth=self._auth, verify=False, headers=headers)
        if response.status_code != 200:
            raise ELKAPIError()
        return response

    def elk_put(self, url: str, json_body: Dict) -> Response:
        headers={'Accept': 'application/json', 'Content-type': 'application/json'}
        response = requests.put(self._base_url + url, auth=self._auth, verify=False, headers=headers, json=json_body)
        if response.status_code != 200:
            raise ELKAPIError()
        return response


def add_external_filebeat_template(api: ELKAPI, elk_version: str):
    response = api.elk_get("/_template/filebeat-{}".format(elk_version))
    new_template = response.json()['filebeat-{}'.format(elk_version)]
    # Modify default filebeat template before putting it back into ELK.
    new_template['index_patterns'] = ["filebeat-external-*"]
    new_template['settings']['index']['lifecycle'] = {
        "name" : "filebeat-external",
        "rollover_alias" : "filebeat-external"
    }
    new_template['settings']['index']['default_pipeline'] = "filebeat-external_modules"
    api.elk_put("/_template/filebeat-external", new_template)


def _create_processor(pipeline_name: str):
    module_name = pipeline_name.split('-')[2]
    return {
      "pipeline" : {
        "name" : pipeline_name,
        "if" : "ctx.event.module == '{}'".format(module_name)
      }
    }


def add_external_filebeat_pipeline(api: ELKAPI, elk_version: str):
    response = api.elk_get("/_ingest/pipeline/filebeat-{}*?filter_path=*.description".format(elk_version))
    ingest_pipeline = {
        "processors" : []
    }
    for key in response.json():
        ingest_pipeline["processors"].append(_create_processor(key))

    api.elk_put("/_ingest/pipeline/filebeat-external_modules", ingest_pipeline)


def main():
    parser = ArgumentParser(description="This application is used to fix filebeat external template and pipelines.")
    parser.add_argument("-e", "--elastic-host", dest="elastic_host", required=True,
                        help="The IP Address or DNS host for your elasticsearch instance.")
    parser.add_argument("-p", "--elastic-port", dest="elastic_port", required=True,
                        help="The elasticsearch port number.")
    parser.add_argument("-v", "--elastic-version", dest="elastic_version", required=True,
                        help="The username of the ACAS server.")
    args = parser.parse_args()

    api = ELKAPI(args.elastic_host, args.elastic_port)
    add_external_filebeat_template(api, args.elastic_version)
    add_external_filebeat_pipeline(api, args.elastic_version)


if __name__ == "__main__":
    main()
