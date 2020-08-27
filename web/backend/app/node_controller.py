from app.service.node_service import add_node, remove_node
from app.middleware import Auth, controller_admin_required
from flask import request, Response, jsonify
from app import app, logger, conn_mng, CORE_DIR, STIGS_DIR
from app.common import OK_RESPONSE, ERROR_RESPONSE
from app.kit_controller import _replace_kit_inventory
from shared.constants import KIT_ID, KICKSTART_ID, ADDNODE_ID
from shared.utils import decode_password
from typing import Dict, Tuple, Union

@app.route('/api/execute_add_node', methods=['POST'])
@controller_admin_required
def execute_add_node() -> Response:
    """
    Generates the kit inventory file and executes the add node routine

    :return: Response object
    """
    add_node_payload = request.get_json()
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_kit_configuration["form"]["nodes"].append(add_node_payload)

    # logger.debug(json.dumps(payload, indent=4, sort_keys=True))
    is_successful, root_password = _replace_kit_inventory(
        current_kit_configuration["form"])
    if is_successful:
        task_id = add_node.delay(node_payload=add_node_payload, password=root_password)

        return (jsonify(str(task_id)), 200)

    logger.error("Executing add node configuration has failed.")
    return ERROR_RESPONSE

@app.route('/api/execute_remove_node', methods=['POST'])
@controller_admin_required
def execute_remove_node() -> Response:
    """
    Generates the kit inventory file and executes the add node routine

    :return: Response object
    """
    payload = request.get_json()
    root_password = None

    current_kickstart_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if (current_kickstart_config and
            current_kickstart_config["form"]["root_password"]):
        root_password = decode_password(current_kickstart_config["form"]["root_password"])

    node_to_remove = None

    if "remove_node" in payload:
        node_to_remove = payload["remove_node"]

    task_id = remove_node.delay(node=node_to_remove, password=root_password)

    return (jsonify(str(task_id)), 200)
