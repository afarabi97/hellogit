"""
Main module for handling all of the Kickstart Configuration REST calls.
"""
import json

from app import (app, logger, conn_mng)
from app.inventory_generator import KickstartInventoryGenerator
from app.job_manager import spawn_job, shell
from app.socket_service import log_to_console
from app.common import OK_RESPONSE, ERROR_RESPONSE
from shared.constants import KICKSTART_ID
from datetime import datetime
from flask import request, jsonify, Response
from pymongo.results import InsertOneResult
from bson import ObjectId


@app.route('/api/generate_kickstart_inventory', methods=['POST'])
def generate_kickstart_inventory() -> Response:
    """
    Generates the Kickstart inventory file from a JSON object that was posted from the
    Angular frontend component.

    :return:
    """
    payload = request.get_json()
    logger.debug(json.dumps(payload, indent=4, sort_keys=True))
    conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                  {"_id": KICKSTART_ID, "payload": payload},
                                                  upsert=True)  # type: InsertOneResult

    kickstart_generator = KickstartInventoryGenerator(payload)
    kickstart_generator.generate()

    spawn_job("Kickstart",
              "make",
              ["kickstart"],
              log_to_console,
              working_directory="/opt/tfplenum-deployer/playbooks")
    return OK_RESPONSE


@app.route('/api/remove_and_archive_kickstart', methods=['POST'])
def remove_and_archive() -> Response:
    """
    Removes the kickstart inventory from the main collection and then
    archives it in a separate collection.

    :return:
    """
    kickstart_form = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if kickstart_form is not None:
        del kickstart_form['_id']
        kickstart_form['archive_date'] = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        conn_mng.mongo_kickstart_archive.insert_one(kickstart_form)
        conn_mng.mongo_kickstart.delete_one({"_id": KICKSTART_ID})
    return OK_RESPONSE


@app.route('/api/restore_archived', methods=['POST'])
def restore_archived() -> Response:
    """
    Restores archived form from the archived collection.

    :return:
    """
    payload = request.get_json()
    logger.debug(json.dumps(payload, indent=4, sort_keys=True))

    kickstart_form = conn_mng.mongo_kickstart_archive.find_one_and_delete({"_id": ObjectId(payload["_id"])})
    if kickstart_form:
        conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                      {"_id": KICKSTART_ID, "payload": kickstart_form['payload']},
                                                      upsert=True)  # type: InsertOneResult
        return OK_RESPONSE
    return ERROR_RESPONSE


@app.route('/api/get_kickstart_archived')
def get_archived_ids() -> Response:
    """
    Returns all the archived Kickstart Configuration form ids and their associated archive dates.
    :return:
    """
    ret_val = []
    result = conn_mng.mongo_kickstart_archive.find({})  # , projection={"_id": True, "archive_date": True}
    if result:
        for item in result:
            item["_id"] = str(item["_id"])
            ret_val.append(item)

    return jsonify(ret_val)


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
    return jsonify(mongo_document["payload"])


def _filter_ip(ipaddress: str) -> bool:
    if ipaddress.endswith('0'):
        return True
    if ipaddress == '':
        return True
    return False


def _netmask_to_cidr(netmask: str) -> int:
    '''
    :param netmask: netmask ip addr (eg: 255.255.255.0)
    :return: equivalent cidr number to given netmask ip (eg: 24)
    '''
    return sum([bin(int(x)).count('1') for x in netmask.split('.')])


@app.route('/api/get_unused_ip_addrs', methods=['POST'])
def get_unused_ip_addrs() -> Response:
    """
    Gets unused IP Addresses from a given network.
    :return:
    """
    payload = request.get_json()    
    cidr = _netmask_to_cidr(payload['netmask'])    
    if cidr <= 24:
        command = "nmap -v -sn -n %s/24 -oG - | awk '/Status: Down/{print $2}'" % payload['mng_ip']
    else:
        command = "nmap -v -sn -n %s/%d -oG - | awk '/Status: Down/{print $2}'" % (payload['mng_ip'], cidr) 
    
    stdout_str, stderr_str = shell(command, use_shell=True)
    available_ip_addresses = stdout_str.decode("utf-8").split('\n')
    available_ip_addresses = [x for x in available_ip_addresses if not _filter_ip(x)]
    return jsonify(available_ip_addresses)
