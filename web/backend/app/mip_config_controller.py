from app import app, conn_mng
from flask import request, Response, jsonify
from app.inventory_generator import MIPConfigInventoryGenerator
from app.models.common import JobID
from app.models.kit_setup import MIPKickstartForm
from app.service.mip_config_service import perform_mip_config
from app.utils.constants import KICKSTART_ID, MIP_CONFIG_ID
from pymongo import ReturnDocument
from app.middleware import controller_admin_required

@app.route('/api/execute_mip_config_inventory', methods=['POST'])
@controller_admin_required
def execute_mip_config_inventory() -> Response:
    data = request.get_json()
    conn_mng.mongo_mip_config.find_one_and_replace({"id": MIP_CONFIG_ID}, {"id": MIP_CONFIG_ID, "data": data}, upsert=True)
    current_kickstart_config = MIPKickstartForm.load_from_db() #type: MIPKickstartForm
    root_password = current_kickstart_config.root_password
    controller_interface = current_kickstart_config.controller_interface
    data['controller_interface'] = controller_interface

    mip_config_generator = MIPConfigInventoryGenerator(data)
    mip_config_generator.generate()

    _type = data['type']
    cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + root_password + "' -t " + _type + " site.yml")
    job = perform_mip_config.delay(cmd_to_execute)
    return (jsonify(JobID(job).to_dict()), 200)

@app.route('/api/cache_mip_device_facts', methods=['POST'])
@controller_admin_required
def cache_mip_device_facts() -> Response:
    data = request.get_json()
    document = conn_mng.mongo_mip_config.find_one_and_replace({"id": 'mip_device_facts'}, {"id": 'mip_device_facts', "data": data}, upsert=True, return_document=ReturnDocument.AFTER)
    return jsonify(document['data'])
