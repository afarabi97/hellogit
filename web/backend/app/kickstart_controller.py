"""
Main module for handling all of the Kickstart Configuration REST calls.
"""
import json

from app import (app, logger, conn_mng, DEPLOYER_DIR)
from app.archive_controller import archive_form
from app.inventory_generator import KickstartInventoryGenerator, MIPKickstartInventoryGenerator
from app.service.job_service import run_command
from app.service.kickstart_service import perform_kickstart
from app.common import OK_RESPONSE, ERROR_RESPONSE
from flask import request, jsonify, Response
from pymongo import ReturnDocument
from pymongo.results import InsertOneResult
from shared.constants import KICKSTART_ID, ADDNODE_ID
from shared.utils import netmask_to_cidr, filter_ip, encode_password, decode_password
from typing import Dict
from app.middleware import Auth, controller_admin_required

def _is_valid_ip(ip_address: str) -> bool:
    """
    Ensures that the IP passed in is valid.

    :param ip_address: Some ip address (IE: 192.168.1.1).

    :return:
    """
    command = "nmap -v -sn -n %s/32 -oG - | awk '/Status: Down/{print $2}'" % ip_address
    stdout_str = run_command(command, use_shell=True)
    if stdout_str != '':
        available_ip_addresses = stdout_str.split('\n')
        if len(available_ip_addresses) > 0:
            return True
    return False


def save_kickstart_to_mongo(kickstart_form: Dict) -> None:
    """
    Saves Kickstart to mongo database.

    :param kickstart_form: Dictionary for the Kickstart form
    """
    current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if current_config:
        archive_form(current_config['form'], True, conn_mng.mongo_kickstart_archive)

    kickstart_form["re_password"] = encode_password(kickstart_form["re_password"])
    kickstart_form["root_password"] = encode_password(kickstart_form["root_password"])

    conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                  {"_id": KICKSTART_ID, "form": kickstart_form},
                                                  upsert=True)  # type: InsertOneResult

def save_mip_kickstart_to_mongo(kickstart_form: Dict) -> None:
    """
    Saves Kickstart to mongo database.

    :param kickstart_form: Dictionary for the Kickstart form
    """
    current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if current_config:
        archive_form(current_config['form'], True, conn_mng.mongo_kickstart_archive)

    kickstart_form["re_password"] = encode_password(kickstart_form["re_password"])
    kickstart_form["root_password"] = encode_password(kickstart_form["root_password"])

    kickstart_form["luks_password"] = encode_password(kickstart_form["luks_password"])
    kickstart_form["confirm_luks_password"] = encode_password(kickstart_form["confirm_luks_password"])

    conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                  {"_id": KICKSTART_ID, "form": kickstart_form},
                                                  upsert=True)  # type: InsertOneResult



@app.route('/api/test123', methods=['GET'])
def test123() -> Response:
    t = {'hostname': 'sensor3.lan', 'ip_address': '172.16.77.27', 'mac_address': 'aa:bb:cc:dd:ee:ff', 'data_drive': 'sdb', 'boot_drive': 'sda', 'pxe_type': 'BIOS', 'continue': False}
    conn_mng.mongo_add_node_wizard.find_one_and_replace({"_id": "add_node_wizard"}, {"_id": "add_node_wizard", "form": t, "step": 3}, upsert=True)
    return OK_RESPONSE


@app.route('/api/get_add_node_wizard_state', methods=['GET'])
def get_add_node_wizard_state() -> Response:
    ret_val = conn_mng.mongo_add_node_wizard.find_one({"_id": ADDNODE_ID})
    return jsonify(ret_val)

class IndexNotFound(Exception):
    pass


def _get_index(kickstart_form: Dict, new_node: Dict) -> int:
    #{'hostname': 'sensor3.lan', 'ip_address': '172.16.77.27', 'mac_address': 'aa:bb:cc:dd:ee:ff',
    # 'data_drive': 'sdb', 'boot_drive': 'sda', 'pxe_type': 'BIOS', 'continue': False}
    for index, node in enumerate(kickstart_form["nodes"]):
        if node['hostname'] == new_node['hostname'] and node['ip_address'] == new_node['ip_address'] and node['os_raid']:
            return index
    raise IndexNotFound()


def _handle_add_node(add_node_payload: Dict) -> Dict:
    # This code executes when the payload is from the add node wizard on the frontend.
    kickstart_form = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})["form"]
    add_node_state = conn_mng.mongo_add_node_wizard.find_one({"_id": ADDNODE_ID})
    if add_node_state:
        #If a node already exists, check if it exists and remove it from the node collection
        try:
            index = _get_index(kickstart_form, add_node_state["form"])
            del kickstart_form["nodes"][index]
        except IndexNotFound:
            pass

    kickstart_form["nodes"].append(add_node_payload)
    kickstart_form["re_password"] = decode_password(kickstart_form["re_password"])
    kickstart_form["root_password"] = decode_password(kickstart_form["root_password"])
    conn_mng.mongo_add_node_wizard.find_one_and_replace({"_id": ADDNODE_ID}, {"_id": ADDNODE_ID, "form": add_node_payload, "step": 3}, upsert=True)
    return kickstart_form


@app.route('/api/generate_kickstart_inventory', methods=['POST'])
@controller_admin_required
def generate_kickstart_inventory() -> Response:
    """
    Generates the Kickstart inventory file from a JSON object that was posted from the
    Angular frontend component.

    :return:
    """
    payload = request.get_json()

    if 'nodes' in payload:
        kickstart_form = payload
        if not kickstart_form['continue']:
            invalid_ips = []
            for node in kickstart_form["nodes"]:
                if not _is_valid_ip(node["ip_address"]):
                    invalid_ips.append(node["ip_address"])

            invalid_ips_len = len(invalid_ips)
            if invalid_ips_len > 0:
                if invalid_ips_len == 1:
                    return jsonify(error_message="The IP {} is already being used on this network. Please use a different IP address."
                                                .format(', '.join(invalid_ips)))
                else:
                    return jsonify(error_message="The IPs {} are already being used on this network. Please use different IP addresses."
                                                .format(', '.join(invalid_ips)))
    else:
        kickstart_form = _handle_add_node(payload)

    #logger.debug(json.dumps(kickstart_form, indent=4, sort_keys=True))
    save_kickstart_to_mongo(kickstart_form)
    kickstart_generator = KickstartInventoryGenerator(kickstart_form)
    kickstart_generator.generate()
    cmd_to_execute = ("ansible-playbook site.yml -i inventory.yml -t preflight,setup,update_portal_client,chrony,dnsmasq,kickstart,profiles")
    task_id = perform_kickstart.delay(cmd_to_execute)
    conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Kickstart"},
                                                     {"_id": "Kickstart", "task_id": str(task_id), "pid": ""},
                                                     upsert=True)
    return (jsonify(str(task_id)), 200)


@app.route('/api/generate_mip_kickstart_inventory', methods=['POST'])
@controller_admin_required
def generate_mip_kickstart_inventory() -> Response:
    kickstart_form = request.get_json()

    if not kickstart_form['continue']:
        invalid_ips = []
        for node in kickstart_form["nodes"]:
            if not _is_valid_ip(node["ip_address"]):
                invalid_ips.append(node["ip_address"])

        invalid_ips_len = len(invalid_ips)
        if invalid_ips_len > 0:
            if invalid_ips_len == 1:
                return jsonify(error_message="The IP {} is already being used on this network. Please use a different IP address."
                                                .format(', '.join(invalid_ips)))
            else:
                return jsonify(error_message="The IPs {} are already being used on this network. Please use different IP addresses."
                                                .format(', '.join(invalid_ips)))

    save_mip_kickstart_to_mongo(kickstart_form)

    kickstart_form["root_password"] = decode_password(kickstart_form["root_password"])
    kickstart_form["re_password"] = decode_password(kickstart_form["re_password"])

    kickstart_form["luks_password"] = decode_password(kickstart_form["luks_password"])
    kickstart_form["confirm_luks_password"] = decode_password(kickstart_form["confirm_luks_password"])

    kickstart_generator = MIPKickstartInventoryGenerator(kickstart_form)
    kickstart_generator.generate()

    cmd_to_execute = ("ansible-playbook site.yml -t 'kickstart,profiles' -i inventory.yml")

    task_id = perform_kickstart.delay(cmd_to_execute, 'MIP')
    conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Kickstart"},
                                                     {"_id": "Kickstart", "task_id": str(task_id), "pid": ""},
                                                     upsert=True)
    return (jsonify(str(task_id)), 200)

@app.route('/api/update_kickstart_ctrl_ip/<new_ctrl_ip>', methods=['PUT'])
@controller_admin_required
def update_kickstart_ctrl_ip(new_ctrl_ip: str) -> Response:
    """
    Updates the Kickstart controller IP address in the mongo form.

    :return:
    """
    ret_val = conn_mng.mongo_kickstart.find_one_and_update({"_id": KICKSTART_ID},
                                                           {'$set': {'form.controller_interface': [new_ctrl_ip]}},
                                                            return_document=ReturnDocument.AFTER,
                                                            upsert=False
                                                          )
    if ret_val:
        return jsonify(ret_val["form"])
    return jsonify(error_message='Failed to update IP {} on Kickstart configuration page.')


@app.route('/api/get_kickstart_form', methods=['GET'])
def get_kickstart_form() -> Response:
    """
    Gets the Kickstart form that was generated by the user on the Kickstart
    configuration page.

    :return:
    """
    mongo_document = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})

    if mongo_document is None:
        return OK_RESPONSE

    mongo_document['_id'] = str(mongo_document['_id'])
    mongo_document["form"]["root_password"] = decode_password(mongo_document["form"]["root_password"])
    mongo_document["form"]["re_password"] = decode_password(mongo_document["form"]["re_password"])

    return jsonify(mongo_document["form"])

@app.route('/api/get_mip_kickstart_form', methods=['GET'])
def get_mip_kickstart_form() -> Response:
    """
    Gets the MIP Kickstart form that was generated by the user on the Kickstart
    configuration page.

    :return:
    """
    mongo_document = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})

    if mongo_document is None:
        return OK_RESPONSE

    mongo_document['_id'] = str(mongo_document['_id'])
    mongo_document["form"]["root_password"] = decode_password(mongo_document["form"]["root_password"])
    mongo_document["form"]["re_password"] = decode_password(mongo_document["form"]["re_password"])
    mongo_document["form"]["luks_password"] = decode_password(mongo_document["form"]["luks_password"])
    mongo_document["form"]["confirm_luks_password"] = decode_password(mongo_document["form"]["confirm_luks_password"])

    return jsonify(mongo_document["form"])


@app.route('/api/get_unused_ip_addrs', methods=['POST'])
def get_unused_ip_addrs() -> Response:
    """
    Gets unused IP Addresses from a given network.
    :return:
    """
    payload = request.get_json()
    cidr = netmask_to_cidr(payload['netmask'])
    if cidr <= 24:
        command = "nmap -v -sn -n %s/24 -oG - | awk '/Status: Down/{print $2}'" % payload['mng_ip']
    else:
        command = "nmap -v -sn -n %s/%d -oG - | awk '/Status: Down/{print $2}'" % (payload['mng_ip'], cidr)

    stdout_str = run_command(command, use_shell=True)
    available_ip_addresses = stdout_str.split('\n')
    available_ip_addresses = [x for x in available_ip_addresses if not filter_ip(x)]
    return jsonify(available_ip_addresses)
