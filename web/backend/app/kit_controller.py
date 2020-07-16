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
from app.middleware import Auth, controller_admin_required


def _replace_kit_inventory(kit_form: Dict) -> Tuple[bool, str]:
    """
    Replaces the kit inventory if one exists.

    :param kit_form: The kit kit_form received from the frontend
    :return: True if successfull, False otherwise.
    """
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if current_kit_configuration:
        archive_form(
            current_kit_configuration['form'], True, conn_mng.mongo_kit_archive)

    current_kit_configuration = conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                                                        {"_id": KIT_ID,
                                                                            "form": kit_form},
                                                                        upsert=True,
                                                                        return_document=ReturnDocument.AFTER)  # type: InsertOneResult

    current_kickstart_config = conn_mng.mongo_kickstart.find_one(
        {"_id": KICKSTART_ID})
    if (current_kit_configuration and
            current_kickstart_config and
            current_kit_configuration["form"] and
            current_kickstart_config["form"]["root_password"]):
        kit_generator = KitInventoryGenerator(
            kit_form, current_kickstart_config["form"])
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
@controller_admin_required
def execute_kit_inventory() -> Response:
    """
    Generates and executes Kit inventory file which will be used in provisioning the system.

    :return: Response object
    """
    payload = request.get_json()
    is_successful, root_password = _process_kit_and_time(payload)
    if is_successful:
        conn_mng.mongo_catalog_saved_values.delete_many({})
        cmd_to_execute_one = "ansible-playbook site.yml -i inventory.yml -e ansible_ssh_pass='{password}'".format(password=root_password)
        system_name = get_system_name()
        if system_name == "GIP":
            cmd_to_execute_one = "ansible-playbook site.yml -i inventory.yml -e ansible_ssh_pass='{password}' --skip-tags moloch".format(password=root_password)

        cmd_to_execute_two = "make dip-stigs"

        results = chain(
            perform_kit.si(cmd_to_execute_one,
                    cwd_dir=str(CORE_DIR / "playbooks")),
            perform_kit.si(cmd_to_execute_two,
                    cwd_dir=str(STIGS_DIR / "playbooks"), job_name="Stignode")
        )()

        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Kit"},
                                                         {"_id": "Kit", "task_id": str(
                                                             results), "pid": ""},
                                                         upsert=True)

        conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Stignode"},
                                                         {"_id": "Stignode", "task_id": str(
                                                             results), "pid": ""},
                                                         upsert=True)
        return (jsonify(str(results)), 200)

    logger.error("Executing /api/execute_kit_inventory has failed.")
    return ERROR_RESPONSE


@app.route('/api/generate_kit_inventory', methods=['POST'])
@controller_admin_required
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
