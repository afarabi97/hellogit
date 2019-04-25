"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
import pymongo
from app import app, logger, conn_mng
from app.job_manager import shell

from app.job_manager import spawn_job
from app.socket_service import log_to_console
from app.common import OK_RESPONSE, ERROR_RESPONSE
from flask import request, Response, jsonify
from pathlib import Path
from shared.connection_mngs import (KubernetesWrapper, objectify, 
                                    KitFormNotFound, KUBEDIR)
from shared.constants import KIT_ID, KICKSTART_ID
from shared.utils import decode_password
from typing import List
from urllib3.exceptions import MaxRetryError


@app.route('/api/describe_pod/<pod_name>/<namespace>', methods=['GET'])
def describe_pod(pod_name: str, namespace: str) -> Response:
    """
    Runs a command and pulls the pods describe command output.

    :param pod_name: The name of the pod of cource.  
                     You can get it with 'kubectl get pods' on the main server node.
    """
    command = '/opt/tfplenum-frontend/tfp-env/bin/python describe_kubernetes_pod.py %s %s' % (pod_name, namespace)
    stdout, stderr = shell(command, working_dir="/opt/tfplenum-frontend/backend/fabfiles")

    if stdout:
        stdout = stdout.decode('utf-8')        

    if stderr:
        stderr = stderr.decode('utf-8')        

    return jsonify({'stdout': stdout, 'stderr': stderr})


@app.route('/api/describe_node/<node_name>', methods=['GET'])
def describe_node(node_name: str) -> Response:
    """
    Runs a command and pulls the pods describe command output.

    :param node_name: The name of the node of cource.  
                      You can get it with 'kubectl get nodes' on the main server node.
    """
    command = '/opt/tfplenum-frontend/tfp-env/bin/python describe_kubernetes_node.py %s' % node_name
    stdout, stderr = shell(command, working_dir="/opt/tfplenum-frontend/backend/fabfiles")        

    if stdout:
        stdout = stdout.decode('utf-8')        

    if stderr:
        stderr = stderr.decode('utf-8')        

    return jsonify({'stdout': stdout, 'stderr': stderr})


@app.route('/api/perform_systems_check', methods=['GET'])
def perform_systems_check() -> Response:
    """
    Kicks off a systems check job

    :return: Response object
    """
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_kickstart_configuration = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if current_kit_configuration:
        if current_kit_configuration["form"] and current_kickstart_configuration["form"]["root_password"]:
            cmd_to_execute = ("ansible-playbook -i /opt/tfplenum/playbooks/inventory.yml -e ansible_ssh_pass='" + 
                              decode_password(current_kickstart_configuration["form"]["root_password"]) + "' site.yml")
            spawn_job("SystemsCheck",
                    cmd_to_execute,
                    ["systems_check"],
                    log_to_console,
                    working_directory="/opt/tfplenum-integration-testing/playbooks")
            return OK_RESPONSE

    logger.warn("Perform systems check failed because the Kit configuration was not found in the mongo database.")
    return ERROR_RESPONSE


@app.route('/api/get_pods_statuses', methods=['GET'])
def get_pod_info() -> Response:
    try:
        with KubernetesWrapper(conn_mng) as kube_apiv1:
            api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
            return jsonify(api_response.to_dict()['items'])
    except Exception as e:
        logger.exception(e)

    return jsonify([])    


def _get_node_statues() -> List:
    with KubernetesWrapper(conn_mng) as kube_apiv1:
        api_response = kube_apiv1.list_node()
        ret_val = []
        for item in api_response.to_dict()['items']:                
            try:
                public_ip = item["metadata"]["annotations"]["flannel.alpha.coreos.com/public-ip"]
                item["metadata"]["public_ip"] = public_ip
                ret_val.append(item)
            except KeyError as e:
                item["metadata"]["public_ip"] = ''
                ret_val.append(item)
            except Exception as e:
                logger.warn(item)
                logger.exception(e)
        return ret_val
    return []


@app.route('/api/get_node_statuses', methods=['GET'])
def get_node_statuses() -> Response:
    try:
        try:
            return jsonify(_get_node_statues())
        except Exception as e:
            Path(KUBEDIR + '/config').unlink()
            return jsonify(_get_node_statues())
    except Exception as e:
        logger.exception(e)

    return jsonify([])
