"""
This is the main module for all the shared REST calls
"""
import json
import os, signal

from app import app, logger, conn_mng, celery
from app.archive_controller import archive_form
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.service.job_service import run_command
from app.node_facts import get_system_info
from celery.app.control import Control, Inspect

from shared.constants import KICKSTART_ID, KIT_ID, NODE_TYPES
from shared.utils import filter_ip, netmask_to_cidr, decode_password
from flask import request, jsonify, Response
from typing import List, Dict, Tuple
from app.service.socket_service import NotificationMessage, NotificationCode


MIN_MBPS = 1000

@app.route('/api/gather_device_facts', methods=['POST'])
def gather_device_facts() -> Response:
    """
    Gathers device facts or sends back a HTTP error to the
    user if something fails.

    :return: A jsonified response object.
    """
    try:
        payload = request.get_json()
        management_ip = payload.get('management_ip')
        current_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
        if current_config:
            password = decode_password(current_config["form"]["root_password"])
        else:
            password = ''

        node, default_ipv4 = get_system_info(management_ip, password)
        potential_monitor_interfaces = []
        for interface in node.interfaces:
            if interface.ip_address != management_ip:
                potential_monitor_interfaces.append(interface.name)
            # TODO Commented out to support dirty builds. Consider removing this later.
            # if interface.ip_address == management_ip:
            #     if interface.speed < MIN_MBPS:
            #         return jsonify(error_message="ERROR: Please check your "
            #                        "network configuration. The link speed on {} is less than {} Mbps."
            #                        .format(interface.name, MIN_MBPS))

        return jsonify(cpus_available=node.cpu_cores,
                       memory_available=node.memory_gb,
                       disks= json.dumps([disk. __dict__ for disk in node.disks]),
                       hostname=node.hostname,
                       default_ipv4_settings=default_ipv4,
                       potential_monitor_interfaces=potential_monitor_interfaces,
                       interfaces=json.dumps([interface. __dict__ for interface in node.interfaces]))
    except Exception as e:
        logger.exception(e)
        return jsonify(error_message=str(e))

def check_pid(pid):
    """ Check For the existence of a unix pid. """
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True

@app.route('/api/kill_job', methods=['POST'])
def kill_job() -> Response:
    """
    Kills the job before it finishes processing.

    :return: OK response on success or server 500 on failure.
    """
    payload = request.get_json()
    try:
        job_name = payload['jobName']
        task = conn_mng.mongo_celery_tasks.find_one({"_id": job_name})
        if task:
            celery.control.revoke(task["task_id"], terminate=True, signal='SIGKILL')
            if check_pid(task["pid"]):
                os.kill(task["pid"], signal.SIGTERM)

            # Delete task from mongodb
            conn_mng.mongo_celery_tasks.delete_one({"_id": job_name})

            # Send notification that the task has been cancelled
            notification = NotificationMessage(role=job_name.lower())
            notification.setMessage("%s cancelled." % job_name.capitalize())
            notification.setStatus(NotificationCode.CANCELLED.name)
            notification.post_to_websocket_api()

        return OK_RESPONSE
    except Exception as e:
        logger.exception(e)
    return ERROR_RESPONSE


def _is_valid_ip_block(available_ip_addresses: List[str], index: int) -> bool:
    """
    Ensures that the /28 IP blocks ip are all available.
    If a given /28 blocks IP address has been taken by some other node on the network,
    the block gets thrown out.

    :param available_ip_addresses: A list of unused IP on the subnet.
    :param index:
    """
    cached_octet = None
    for i, ip in enumerate(available_ip_addresses[index:]):
        pos = ip.rfind('.') + 1
        last_octet = int(ip[pos:])
        if cached_octet is None:
            cached_octet = last_octet
        else:
            if (cached_octet + 1) == last_octet:
                cached_octet = last_octet
            else:
                return False

        if i == 15:
            break
    return True


def _get_ip_blocks(cidr: int) -> List[int]:
    """
    Gets IP blocks based on CIDR notation.
    It only accept /24 through /27 subnet ranges.

    It returns an array of the start of each IP /28 block.

    :param cidr: The network cidr

    :return: [1, 16, 32 ...]
    """
    cidr_to_host_mapping = {24: 254, 25: 126, 26: 62, 27: 30}
    count = 0
    number_of_hosts = cidr_to_host_mapping[cidr]
    valid_ip_blocks = []
    for i in range(number_of_hosts):
        count += 1
        if count == 1:
            if i == 0:
                valid_ip_blocks.append(i + 1)
            else:
                valid_ip_blocks.append(i)

        if count == 16:
            count = 0
    return valid_ip_blocks


def _get_available_ip_blocks(mng_ip: str, netmask: str) -> List:
    """
    Get available IP blocks

    :param mng_ip: The management IP or controller IP address
    :param netmask: The netmask of the controller IP address.
    """
    cidr = netmask_to_cidr(netmask)
    if cidr <= 24:
        command = "nmap -v -sn -n %s/24 -oG - | awk '/Status: Down/{print $2}'" % mng_ip
        cidr = 24
    else:
        command = "nmap -v -sn -n %s/%d -oG - | awk '/Status: Down/{print $2}'" % (mng_ip, cidr)

    stdout_str = run_command(command, use_shell=True)
    available_ip_addresses = stdout_str.split('\n')
    available_ip_addresses = [x for x in available_ip_addresses if not filter_ip(x)]
    ip_address_blocks = _get_ip_blocks(cidr)
    available_ip_blocks = []
    for index, ip in enumerate(available_ip_addresses):
        pos = ip.rfind('.') + 1
        last_octet = int(ip[pos:])
        if last_octet in ip_address_blocks:
            if _is_valid_ip_block(available_ip_addresses, index):
                available_ip_blocks.append(ip)
    return available_ip_blocks


@app.route('/api/get_available_ip_blocks', methods=['GET'])
def get_available_ip_blocks() -> Response:
    """
    Grabs available /28 or 16 host blocks from a /24, /25, /26, or /27
    IP subnet range.

    :return:
    """
    mongo_document = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if mongo_document is None:
        return jsonify([])

    mng_ip = mongo_document["form"]["controller_interface"][0]
    netmask = mongo_document["form"]["netmask"]
    available_ip_blocks = _get_available_ip_blocks(mng_ip, netmask)
    return jsonify(available_ip_blocks)


@app.route('/api/get_ip_blocks/<controller_ip>/<netmask>', methods=['GET'])
def get_ip_blocks(controller_ip: str, netmask: str) -> Response:
    available_ip_blocks = _get_available_ip_blocks(controller_ip, netmask)
    return jsonify(available_ip_blocks)


@app.route('/api/archive_configurations_and_clear', methods=['DELETE'])
def archive_configurations_and_clear() -> Response:
    """
    Archives both configurations and then clears them.

    :return
    """
    kickstart_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    if kickstart_config:
        archive_form(kickstart_config['form'], True, conn_mng.mongo_kickstart_archive)
        conn_mng.mongo_kickstart.delete_one({"_id": KICKSTART_ID})

    kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if kit_configuration:
        archive_form(kit_configuration['form'], True, conn_mng.mongo_kit_archive)
        conn_mng.mongo_kit.delete_one({"_id": KIT_ID})

    return OK_RESPONSE


def _get_mng_ip_and_mac(node: Dict) -> Tuple[str, str]:
    try:
        iface = node['deviceFacts']['default_ipv4_settings']
        return iface['address'], iface['macaddress']
    except KeyError as e:
        pass
    return None, None


@app.route('/api/get_sensor_hostinfo', methods=['GET'])
def get_sensor_hostinfo() -> Response:
    ret_val = []
    kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if kit_configuration:
        for node in kit_configuration['form']['nodes']:
            if node["node_type"] == NODE_TYPES[1]:
                host_simple = {}
                mng_ip, mac = _get_mng_ip_and_mac(node)
                host_simple['hostname'] = node['hostname']
                host_simple['management_ip'] = mng_ip
                host_simple['mac'] = mac
                ret_val.append(host_simple)

    return jsonify(ret_val)