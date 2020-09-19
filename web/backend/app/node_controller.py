from app.service.node_service import add_node, remove_node
from app.middleware import controller_admin_required
from flask import request, Response, jsonify
from app import app, logger, conn_mng
from app.common import ERROR_RESPONSE
from app.models.common import JobID
from app.models.kit_setup import DIPKickstartForm
from app.utils.constants import KIT_ID, KICKSTART_ID
from app.utils.utils import decode_password


@app.route('/api/execute_remove_node', methods=['POST'])
@controller_admin_required
def execute_remove_node() -> Response:
    """
    Generates the kit inventory file and executes the add node routine

    :return: Response object
    """
    payload = request.get_json()
    root_password = None

    current_kickstart_config = DIPKickstartForm.load_from_db() #type: DIPKickstartForm
    node_to_remove = None

    if "remove_node" in payload:
        node_to_remove = payload["remove_node"]

    job = remove_node.delay(node=node_to_remove, password=current_kickstart_config.root_password)

    return (jsonify(JobID(job).to_dict()), 200)
