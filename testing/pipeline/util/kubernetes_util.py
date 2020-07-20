import logging
import time

from datetime import timedelta, datetime
from models.common import NodeSettings
from util.connection_mngs import KubernetesWrapper
from typing import Dict
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
                    pod_msg_list.append("{name}: {msg}".format(name=status["name"],msg=msg))
                    if ret_val:
                        ret_val = False
        if not container_stat:
            logging.info(pod_msg)
            logging.info('\n'.join(pod_msg_list))

    return ret_val

def split_camel_case(string: str) -> str:
    return ''.join(map(lambda x: " "+x if x.isupper() else x, string)).strip()

def wait_for_pods_to_be_alive(master_srv: NodeSettings, timeout_minutes: int=10):
    """
    This functions waits for all the pods of a Kubernetes master node to be ready before continuing.
    It will time out after a period of time

    :param master_srv: The master server node we want to connect to for finding out the statuses of nodes.
    :param timeout_minutes: The time in minutes it will wait before failing.  The default is 10 minutes.
    :return:
    """
    username = master_srv.username
    password = master_srv.password
    ip_address = master_srv.ipaddress
    future_time = datetime.utcnow() + timedelta(minutes=timeout_minutes)

    with KubernetesWrapper(username, password, ip_address) as kube_apiv1:
        while True:
            if future_time <= datetime.utcnow():
                logging.info("wait_for_pods_to_be_alive took too long to complete. Exiting application.")
                exit(3)

            try:
                api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
                items = api_response.to_dict()['items']
                if _check_pod_states(items):
                    break
            except MaxRetryError as e:
                logging.warn(e)

            time.sleep(5)
