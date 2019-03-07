"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
import os

from app import app, logger, conn_mng
from app.archive_controller import archive_form
from app.common import OK_RESPONSE
from app.inventory_generator import KitInventoryGenerator
from app.job_manager import spawn_job
from app.socket_service import log_to_console
from bson import ObjectId
from datetime import datetime
from flask import request, Response, jsonify
from pymongo.collection import ReturnDocument
from shared.constants import KIT_ID, KICKSTART_ID
from shared.connection_mngs import KUBEDIR, FabricConnectionManager
from shared.utils import decode_password
from typing import Dict, Tuple


def _delete_kubernetes_conf():
    """
    Delets the kubernetes file on disk so that the next time we connect
    using our Kubernenets in our connection_mng.py module. It will reset to 
    a new configuration file.
    
    :return: 
    """
    config_path = KUBEDIR + '/config'
    if os.path.exists(config_path) and os.path.isfile(config_path):
        os.remove(config_path)


def _replace_kit_inventory(kit_form: Dict) -> Tuple[bool, str]:
    """
    Replaces the kit inventory if one exists.

    :param kit_form: The kit kit_form received from the frontend
    :return: True if successfull, False otherwise.        
    """
    # import json
    # print(json.dumps(kit_form, indent=4, sort_keys=True))
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if current_kit_configuration:
        archive_form(current_kit_configuration['form'], True, conn_mng.mongo_kit_archive)

    current_kit_configuration = conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                            {"_id": KIT_ID, "form": kit_form},
                                            upsert=True,
                                            return_document=ReturnDocument.AFTER)  # type: InsertOneResult

    current_kickstart_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if current_kit_configuration and current_kickstart_config:
        if current_kit_configuration["form"] and current_kickstart_config["form"]["root_password"]:
            kit_generator = KitInventoryGenerator(kit_form)
            kit_generator.generate()
            return True, decode_password(current_kickstart_config["form"]["root_password"])
    return False, None


def zero_pad(num: int) -> str:
    """
    Zeros pads the numers that are lower than 10.

    :return: string of the new number.
    """
    if num < 10:
        return "0" + str(num)
    return num


def _execute_cmds(timeForm: Dict, password: str, ip_address: str) -> None:
    """
    Executes commands

    :param timeForm: The time form from the main payload passed in from the Kit configuration page.
    :param password: The ssh password of the box.
    :param ip_address: The IP Address of the node.

    :return:
    """
    hours, minutes = timeForm['time'].split(':')
    with FabricConnectionManager('root', password, ip_address) as cmd:
        ret_val = cmd.run('timedatectl set-timezone {}'.format(timeForm['timezone']))
        time_cmd = "timedatectl set-time '{year}-{month}-{day} {hours}:{minutes}:00'".format(year=timeForm['date']['year'],
                                                                                             month=zero_pad(timeForm['date']['month']),
                                                                                             day=zero_pad(timeForm['date']['day']),
                                                                                             hours=hours,
                                                                                             minutes=minutes
                                                                                            )
        cmd.run('timedatectl set-ntp false', warn=True)
        cmd.run(time_cmd)
        cmd.run('timedatectl set-ntp true', warn=True)


def _change_time_on_nodes(payload: Dict, password: str) -> None:
    """
    Sets the time on the nodes.  This function throws an exception on failure.

    :param payload: The dictionary object containing the payload.
    :return: None
    """
    timeForm = payload['timeForm']
    for server in payload['kitForm']["servers"]:
        _execute_cmds(timeForm, password, server["host_server"])

    for sensor in payload['kitForm']["sensors"]:
        _execute_cmds(timeForm, password, server["host_server"])


def _process_kit_and_time(payload: Dict) -> Tuple[bool, str]:
    """
    Main function for processing the kit and changing times on the nodes.

    :return: Returns True if its successfull. 
    """
    isSucessful, root_password = _replace_kit_inventory(payload['kitForm'])
    _delete_kubernetes_conf()
    if isSucessful:
        _change_time_on_nodes(payload, root_password)
        return True, root_password
    return False, None


@app.route('/api/execute_kit_inventory', methods=['POST'])
def execute_kit_inventory() -> Response:
    """
    Generates and executes Kit inventory file which will be used in provisioning the system.

    :return: Response object
    """
    payload = request.get_json()
    is_successful, root_password = _process_kit_and_time(payload)
    if is_successful:
        cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + root_password + "' site.yml")
        if payload["kitForm"]["install_grr"]:
            cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + root_password + "' site.yml; "
                              "ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + root_password + "' grr-only.yml")
        spawn_job("Kit",
                cmd_to_execute,
                ["kit"],
                log_to_console,
                working_directory="/opt/tfplenum/playbooks")
        
        return OK_RESPONSE

    logger.error("Executing /api/execute_kit_inventory has failed.")
    return ERROR_RESPONSE


@app.route('/api/generate_kit_inventory', methods=['POST'])
def generate_kit_inventory() -> Response:
    """
    Generates the kit inventory file which will be used in provisioning the system.

    :return: Response object
    """
    payload = request.get_json()
    is_successful, _ = _process_kit_and_time(payload)
    if is_successful:
        return OK_RESPONSE

    logger.error("Executing /api/enerate_kit_inventory has failed.")
    return ERROR_RESPONSE


@app.route('/api/execute_add_node', methods=['POST'])
def execute_add_node() -> Response:
    """
    Generates the kit inventory file and executes the add node routine

    :return: Response object
    """
    payload = request.get_json()
    # logger.debug(json.dumps(payload, indent=4, sort_keys=True))
    isSucessful, root_password = _replace_kit_inventory(payload['kitForm'])
    if isSucessful:
        for nodeToAdd in payload['nodesToAdd']:
            cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='{playbook_pass}' -e node_to_add='{node}' -t preflight-add-node,disable-firewall,repos,update-networkmanager,update-dnsmasq-hosts,update-dns,yum-update,genkeys,preflight,common,vars-configmap site.yml; "
                            "ansible-playbook -i inventory.yml -e ansible_ssh_pass='{playbook_pass}' -e node_to_add='{node}' -t docker -l {node} site.yml; "
                            "ansible-playbook -i inventory.yml -e ansible_ssh_pass='{playbook_pass}' -e node_to_add='{node}' -t pull_join_script,kube-node,ceph,es-scale,bro-scale,moloch-scale,enable-sensor-monitor-interface site.yml"
                            ).format(playbook_pass=root_password, node=nodeToAdd['hostname'])
            spawn_job("Add_Node",
                    cmd_to_execute,
                    ["kit"],
                    log_to_console,
                    working_directory="/opt/tfplenum/playbooks",
                    is_shell=True)
        return OK_RESPONSE

    logger.error("Executing add node configuration has failed.")
    return ERROR_RESPONSE


@app.route('/api/get_kit_form', methods=['GET'])
def get_kit_form() -> Response:
    """
    Gets the Kit form that was generated by the user on the Kit
    configuration page.

    :return:
    """
    mongo_document = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if mongo_document is None:
        return OK_RESPONSE

    mongo_document['_id'] = str(mongo_document['_id'])
    return jsonify(mongo_document["form"])
