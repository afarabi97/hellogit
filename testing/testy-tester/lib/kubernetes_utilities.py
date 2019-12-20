"""
Contains utility functions for kubernetes API calls.
"""
import json
import logging
import time

from datetime import datetime, timedelta
from lib.model.node import Node
from lib.connection_mngs import KubernetesWrapper
from typing import Dict


def objectify(some_dict: Dict) -> Dict:
    """
    Converts a given dictionary into a savable mongo object.
    It removes things that are set to None.

    :param some_dict:
    :return:
    """
    for key in list(some_dict):
        if some_dict[key] is None:
            del some_dict[key]
        elif isinstance(some_dict[key], datetime):
            some_dict[key] = some_dict[key].strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(some_dict[key], list):
            for index, item in enumerate(some_dict[key]):
                if item is None:
                    some_dict[key].pop(index)
                elif isinstance(item, datetime):
                    some_dict[key][index] = item.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(item, dict):
                    objectify(item)
        elif isinstance(some_dict[key], dict):
            objectify(some_dict[key])

    return some_dict


def print_kubernetes_obj(some_dict: Dict):
    """
    Prints stuff

    :param some_dict:
    :return:
    """
    print(json.dumps(objectify(some_dict), indent=4, sort_keys=True))


def _check_pod_states(items: Dict) -> bool:
    """
    Check pod states

    :param items:
    :return:
    """
    ret_val = True
    logging.info("====================PODS THAT ARE STILL DOWN====================================")
    for item in items:
        # Ignore curator pods as they are cron jobs that are more often than not in a terminated state.
        if "curator" in item["metadata"]["name"]:
            continue

        if item["status"]["phase"] == "Pending":
            logging.info(item["metadata"]["name"] + " is in Pending state")
            ret_val = False

        if item["status"]["container_statuses"]:
            for status in item["status"]["container_statuses"]:
                if not status["ready"]:
                    logging.info(item["metadata"]["name"])
                    if ret_val:
                        ret_val = False

    return ret_val


def wait_for_pods_to_be_alive(master_srv: Node, timeout_minutes: int=10):
    """
    This functions waits for all the pods of a Kubernetes master node to be ready before continuing.
    It will time out after a period of time

    :param master_srv: The master server node we want to connect to for finding out the statuses of nodes.
    :param timeout_minutes: The time in minutes it will wait before failing.  The default is 10 minutes.
    :return:
    """
    username = master_srv.username
    password = master_srv.password
    ip_address = master_srv.management_interface.ip_address
    future_time = datetime.utcnow() + timedelta(minutes=timeout_minutes)

    #logging.info("Wait for kubernetes to update its weird state.")
    #time.sleep(60)

    with KubernetesWrapper(username, password, ip_address) as kube_apiv1:
        while True:
            if future_time <= datetime.utcnow():
                logging.info("wait_for_pods_to_be_alive took too long to complete. Exiting application.")
                exit(3)
            api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
            items = api_response.to_dict()['items']
            if _check_pod_states(items):
                break

            time.sleep(5)
