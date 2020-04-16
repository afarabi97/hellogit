"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
import os

from app import app, logger, conn_mng, CORE_DIR, STIGS_DIR
from app.archive_controller import archive_form
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.inventory_generator import KitInventoryGenerator
from app.service.kit_service import perform_kit
from app.service.time_service import change_time_on_nodes, NodeDirtyException
from flask import request, Response, jsonify
from pymongo.collection import ReturnDocument
from shared.constants import KIT_ID, KICKSTART_ID, ADDNODE_ID
from shared.connection_mngs import KUBEDIR
from shared.utils import decode_password
from typing import Dict, Tuple, Union
from celery import chain
from app.service.system_info_service import get_system_name


def _replace_kit_inventory(kit_form: Dict) -> Tuple[bool, str]:
    """
    Replaces the kit inventory if one exists.

    :param kit_form: The kit kit_form received from the frontend
    :return: True if successfull, False otherwise.
    """
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if current_kit_configuration:
        archive_form(current_kit_configuration['form'], True, conn_mng.mongo_kit_archive)

    current_kit_configuration = conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                            {"_id": KIT_ID, "form": kit_form},
                                            upsert=True,
                                            return_document=ReturnDocument.AFTER)  # type: InsertOneResult

    current_kickstart_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if (current_kit_configuration and
            current_kickstart_config and
            current_kit_configuration["form"] and
            current_kickstart_config["form"]["root_password"]):
        kit_generator = KitInventoryGenerator(kit_form, current_kickstart_config["form"])
        kit_generator.generate()
        return True, decode_password(current_kickstart_config["form"]["root_password"])
    return False, None


def _process_kit_and_time(payload: Dict) -> Tuple[bool, str]:
    """
    Main function for processing the kit and changing times on the nodes.

    :return: Returns True if its successfull.
    """
    is_sucessful, root_password = _replace_kit_inventory(payload['kitForm'])
    if is_sucessful:
        change_time_on_nodes(payload, root_password)
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
        conn_mng.mongo_catalog_saved_values.delete_many({})
        cmd_to_execute_one = "ansible-playbook site.yml -i inventory.yml -e ansible_ssh_pass='" + root_password + "'"
        cmd_to_execute_one = 'semanage permissive -a systemd_hostnamed_t && {} && semanage permissive -d systemd_hostnamed_t'.format(cmd_to_execute_one)
        cmd_to_execute_two = "ansible-playbook site.yml --tags server-stigs,sensor-stigs --skip-tags all-stigs,controller-stigs"
        
        results = chain(
            perform_kit.si(cmd_to_execute_one, cwd_dir=str(CORE_DIR / "playbooks")),
            perform_kit.si(cmd_to_execute_two,cwd_dir=str(STIGS_DIR / "playbooks"), job_name="Stignode")
        )()
        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Kit"},
                                                        {"_id": "Kit", "task_id": str(results), "pid": ""},
                                                        upsert=True)

        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Stignode"},
                                                        {"_id": "Stignode", "task_id": str(results), "pid": ""},
                                                        upsert=True)
        return (jsonify(str(results)), 200)

    logger.error("Executing /api/execute_kit_inventory has failed.")
    return ERROR_RESPONSE


@app.route('/api/generate_kit_inventory', methods=['POST'])
def generate_kit_inventory() -> Response:
    """
    Generates the kit inventory file which will be used in provisioning the system.

    :return: Response object
    """
    try:
        payload = request.get_json()
        is_successful, _ = _process_kit_and_time(payload)
        if is_successful:
            return OK_RESPONSE

    except NodeDirtyException as e:
        return (jsonify({"error_message": str(e)}), 500)

    error_msg = "Executing /api/generate_kit_inventory has failed."
    logger.error(error_msg)
    return (jsonify({"error_message": error_msg}), 500)


@app.route('/api/execute_add_node', methods=['POST'])
def execute_add_node() -> Response:
    """
    Generates the kit inventory file and executes the add node routine

    :return: Response object
    """
    add_node_payload = request.get_json()
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_kit_configuration["form"]["nodes"].append(add_node_payload)

    #Remove the state of the add node wizard
    conn_mng.mongo_add_node_wizard.delete_one({"_id": ADDNODE_ID})

    # logger.debug(json.dumps(payload, indent=4, sort_keys=True))
    is_sucessful, root_password = _replace_kit_inventory(current_kit_configuration["form"])
    if is_sucessful:
        cmd_to_execute_one = ("ansible-playbook site.yml -i inventory.yml "
            "-e ansible_ssh_pass='{playbook_pass}' "
            "-t repos,update-networkmanager,update-dnsmasq-hosts,update-dns,genkeys,preflight,common,openvpn"
        ).format(playbook_pass=root_password)

        cmd_to_execute_two = ("ansible-playbook site.yml -i inventory.yml "
            "-t crio,kube-node,logs,audit,frontend-health-metrics,node-health "
            "--limit localhost,{node}"
        ).format(
            playbook_pass=root_password,
            node=add_node_payload['hostname']
        )

        results = chain(perform_kit.si(cmd_to_execute_one, cwd_dir=str(CORE_DIR / "playbooks")),
            perform_kit.si(cmd_to_execute_two, cwd_dir=str(CORE_DIR / "playbooks"), job_name="Addnode"))()

        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Kit"},
                                                        {"_id": "Kit", "task_id": str(results), "pid": ""},
                                                        upsert=True)

        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Addnode"},
                                                        {"_id": "Addnode", "task_id": str(results), "pid": ""},
                                                        upsert=True)
        return OK_RESPONSE

    logger.error("Executing add node configuration has failed.")
    return ERROR_RESPONSE


@app.route('/api/execute_remove_node', methods=['POST'])
def execute_remove_node() -> Response:
    """
    Generates the kit inventory file and executes the add node routine

    :return: Response object
    """
    payload = request.get_json()
    is_sucessful, root_password = _replace_kit_inventory(payload)
    if is_sucessful:
        cmd_to_execute = ("ansible-playbook remove-node.yml -i inventory.yml -e ansible_ssh_pass='{playbook_pass}'"
                        ).format(playbook_pass=root_password)
        task_id = perform_kit.delay(cmd_to_execute, True)
        mongo_document = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
        kit_mongo_document = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Kit"},
                                                        {"_id": "Kit", "task_id": str(task_id), "pid": ""},
                                                        upsert=True)

        node_to_remove = None

        if "remove_node" in payload:
            node_to_remove = payload["remove_node"]

        kickstart_form = mongo_document["form"]
        kick_nodes = list(kickstart_form["nodes"])
        for node in kick_nodes:
            if str(node["hostname"]) == str(node_to_remove):
                kick_nodes.remove(node)

        kickstart_form["nodes"] = kick_nodes

        conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                      {"_id": KICKSTART_ID, "form": kickstart_form},
                                                      upsert=True,
                                                      return_document=ReturnDocument.AFTER)  # type: InsertOneResult
        kit_form = kit_mongo_document["form"]
        kit_nodes = list(kit_form["nodes"])
        for node in kit_nodes:
            if str(node["hostname"]) == str(node_to_remove):
                kit_nodes.remove(node)

        kit_form["nodes"] = kit_nodes

        conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                                {"_id": KIT_ID, "form": kit_form},
                                                upsert=True,
                                                return_document=ReturnDocument.AFTER)  # type: InsertOneResult

        return (jsonify(str(task_id)), 200)

    logger.error("Executing remove node configuration has failed.")
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
