import logging
import time
import re

from datetime import timedelta, datetime
from models.common import NodeSettings
from models.node import NodeSettingsV2
from util.connection_mngs import KubernetesWrapper
from typing import Dict, Union
from urllib3.exceptions import MaxRetryError


def _check_pod_states(items: Dict) -> bool:
    """
    Check pod states

    :param items:
    :return:
    """
    ret_val = True
    logging.info("====================PODS THAT ARE STILL DOWN====================================")
    for item in items:
        pod_msg_list = []
        container_stat = True
        # Ignore Pods that are marked as Sucessfull.  All Containers in the Pod have terminated in success, and will not be restarted.
        if item["status"]["phase"] == "Succeeded":
            continue
        else:
            pod_msg = "{name} current state: {phase}".format(name=item["metadata"]["name"],phase=item["status"]["phase"])

        if item["status"]["container_statuses"]:
            for status in item["status"]["container_statuses"]:
                if not status["ready"]:
                    container_stat = False
                    msg = "Not Ready"
                    if status["state"]["waiting"]:
                        msg = split_camel_case(status["state"]["waiting"]["reason"])
                    if status["state"]["terminated"]:
                        msg = split_camel_case(status["state"]["terminated"]["reason"])
                    if status["state"]["running"]:
                        msg = "Running But Not Ready Yet"
                    pod_msg_list.append("{name}: {msg}".format(name=status["name"], msg=msg))
                    if ret_val:
                        ret_val = False
        if not container_stat:
            logging.info(pod_msg)
            for msg in pod_msg_list:
                logging.info(msg)

    return ret_val


def split_camel_case(string: str) -> str:
    return ''.join(map(lambda x: " "+x if x.isupper() else x, string)).strip()


def wait_for_pods_to_be_alive(primary_srv: Union[NodeSettings, NodeSettingsV2], timeout_minutes: int=10):
    """
    This functions waits for all the pods of a Kubernetes primary node to be ready before continuing.
    It will time out after a period of time

    :param primary_srv: The primary server node we want to connect to for finding out the statuses of nodes.
    :param timeout_minutes: The time in minutes it will wait before failing.  The default is 10 minutes.
    :return:
    """
    if isinstance(primary_srv, NodeSettingsV2):
        username = primary_srv.username
        password = primary_srv.kit_settings.settings.password
        ip_address = primary_srv.ip_address
    elif isinstance(primary_srv, NodeSettings):
        username = primary_srv.username
        password = primary_srv.password
        ip_address = primary_srv.ipaddress
    else:
        raise ValueError("Primary_srv must be of type NodeSettings or NodeSettingsV2.")

    future_time = datetime.utcnow() + timedelta(minutes=timeout_minutes)

    with KubernetesWrapper(username, password, ip_address) as api:
        while True:
            if future_time <= datetime.utcnow():
                logging.info("wait_for_pods_to_be_alive took too long to complete. Exiting application.")
                exit(3)

            try:
                api_response = api.core_V1_API.list_pod_for_all_namespaces(watch=False)
                items = api_response.to_dict()['items']
                if _check_pod_states(items):
                    break
            except MaxRetryError as e:
                logging.warn(e)

            time.sleep(5)

def _check_job_states(items: Dict, deployments: list) -> bool:
    """
    Check Job states

    :param items:
    :return:
    """
    ret_val = True
    # logging.info("====================JOBS THAT ARE STILL ACTIVE====================================")
    for item in items:
        job_name = item['metadata']['name']
        find = re.findall("({list})".format(list='|'.join(map(re.escape, deployments))), job_name)
        if len(find) > 0:
            status = item['status']
            if status['active'] and status['active'] > 0:
                logging.info("{name} still running".format(name=job_name))
                ret_val = False
            elif status['succeeded'] and status['succeeded'] > 0:
                pass
            elif status['failed'] and status['failed'] > 0:
                last_condition = status['conditions'][-1]
                reason = last_condition['message']
                logging.info("{name} Failed. \"{reason}\".".format(name=job_name, reason=reason))
                logging.info("Exiting application.")
                exit(3)
    return ret_val

def wait_for_jobs_to_complete(deployments: list, primary_srv: NodeSettingsV2, timeout_minutes: int=10):
    """
    This functions waits for all the current Jobs in the Kubernetes cluster to be complete before continuing.
    It will time out after a period of time

    :param primary_srv: The primary server node we want to connect to for finding out the statuses of nodes.
    :param timeout_minutes: The time in minutes it will wait before failing.  The default is 10 minutes.
    :return:
    """
    username = primary_srv.username
    password = primary_srv.kit_settings.settings.password
    ip_address = primary_srv.ip_address
    future_time = datetime.utcnow() + timedelta(minutes=timeout_minutes)
    with KubernetesWrapper(username, password, ip_address) as api:
        while True:
            if future_time <= datetime.utcnow():
                logging.info("wait_for_jobs_to_complete took too long to complete. Exiting application.")
                exit(3)
            try:
                jobs = api.batch_V1_API.list_job_for_all_namespaces(watch=False)
                items = jobs.to_dict()['items']
                if len(items) == 0 or _check_job_states(items, deployments):
                    break
            except MaxRetryError as e:
                logging.warn(e)

            time.sleep(15)

def _check_deployment_states(items: Dict, deployments: list) -> bool:
    """
    Check Deployment states

    :param items:
    :return:
    """
    ret_val = True
    matching_dep = False
    # logging.info("====================DEPLOYMENTS THAT ARE NOT READY====================================")
    for item in items:
        deployment_name = item['metadata']['name']
        find = re.findall("({list})".format(list='|'.join(map(re.escape, deployments))), deployment_name)
        if len(find) > 0:
            matching_dep = True
            status = item['status']
            if status['replicas'] and status['ready_replicas'] != status['replicas']:
                logging.info("{name} is not ready".format(name=deployment_name))
                ret_val = False
    if not matching_dep:
        logging.info("No deployments matching: {list}".format(list=', '.join(deployments)))
        ret_val = False
    return ret_val

def wait_for_deployments_to_ready(deployments: list, primary_srv: NodeSettingsV2, timeout_minutes: int=10):
    """
    This functions waits for all the current Jobs in the Kubernetes cluster to be complete before continuing.
    It will time out after a period of time

    :param primary_srv: The primary server node we want to connect to for finding out the statuses of nodes.
    :param timeout_minutes: The time in minutes it will wait before failing.  The default is 10 minutes.
    :return:
    """
    username = primary_srv.username
    password = primary_srv.kit_settings.settings.password
    ip_address = primary_srv.ip_address
    future_time = datetime.utcnow() + timedelta(minutes=timeout_minutes)
    with KubernetesWrapper(username, password, ip_address) as api:
        while True:
            if future_time <= datetime.utcnow():
                logging.info("wait_for_deployments_to_ready took too long to complete. Exiting application.")
                exit(3)
            try:
                deployment_list = api.apps_V1_API.list_namespaced_deployment(namespace='default',watch=False)
                stateful_set_list = api.apps_V1_API.list_namespaced_stateful_set(namespace='default',watch=False)
                items = deployment_list.to_dict()['items'] + stateful_set_list.to_dict()['items']
                if len(items) == 0 or _check_deployment_states(items, deployments):
                    break
            except MaxRetryError as e:
                logging.warn(e)

            time.sleep(5)
