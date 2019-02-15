"""
This is the main module for all the shared REST calls
"""
import json

from app import app, logger, conn_mng
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.job_manager import kill_job_in_queue, shell
from app.node_facts import get_system_info
from shared.constants import KICKSTART_ID
from shared.utils import filter_ip, netmask_to_cidr, decode_password
from flask import request, jsonify, Response
from typing import List


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

        node = get_system_info(management_ip, password)
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
                       potential_monitor_interfaces=potential_monitor_interfaces,
                       interfaces=json.dumps([interface. __dict__ for interface in node.interfaces]))
    except Exception as e:
        logger.exception(e)
        return jsonify(error_message=str(e))


@app.route('/api/kill_job', methods=['POST'])
def kill_job() -> Response:
    """
    Kills the job before it finishes processing.

    :return: OK response on success or server 500 on failure.
    """
    payload = request.get_json()
    try:
        kill_job_in_queue(payload['jobName'])
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
    cidr = netmask_to_cidr(mongo_document["form"]["netmask"])
    if cidr <= 24:
        command = "nmap -v -sn -n %s/24 -oG - | awk '/Status: Down/{print $2}'" % mng_ip
        cidr = 24
    else:
        command = "nmap -v -sn -n %s/%d -oG - | awk '/Status: Down/{print $2}'" % (mng_ip, cidr) 
   
    stdout_str, stderr_str = shell(command, use_shell=True)
    available_ip_addresses = stdout_str.decode("utf-8").split('\n')
    available_ip_addresses = [x for x in available_ip_addresses if not filter_ip(x)]
    ip_address_blocks = _get_ip_blocks(cidr)    
    available_ip_blocks = []
    for index, ip in enumerate(available_ip_addresses):
        pos = ip.rfind('.') + 1
        last_octet = int(ip[pos:])
        if last_octet in ip_address_blocks:
            if _is_valid_ip_block(available_ip_addresses, index):
                available_ip_blocks.append(ip)
    return jsonify(available_ip_blocks)
