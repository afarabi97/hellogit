"""
This is the main module for all the shared REST calls
"""
import os, signal

from app import app, logger, conn_mng, api
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.service.job_service import run_command
from app.service.socket_service import NotificationMessage, NotificationCode
from app.models.common import COMMON_RETURNS
from app.models.kit_setup import DIPKickstartForm, DBModelNotFound, DIPKitForm, Node, MIPKickstartForm
from app.models.device_facts import DeviceFacts, create_device_facts_from_ansible_setup
from flask import request, jsonify, Response
from flask_restx import Resource
from app.utils.constants import KICKSTART_ID, KIT_ID, NODE_TYPES
from app.utils.utils import filter_ip, netmask_to_cidr, decode_password, is_ipv4_address
from typing import List, Dict, Tuple
from app.service.system_info_service import get_system_name
from app.middleware import Auth, controller_admin_required, login_required_roles
from marshmallow.exceptions import ValidationError

@app.route('/api/get_system_name', methods=['GET'])
def get_system_name_api():
    system_name = get_system_name()
    if system_name:
        return jsonify({'system_name': system_name})

    return jsonify({'message': 'Could not get the system_name.'}), 404

@app.route('/api/metrics', methods=['POST'])
@login_required_roles(['metrics'], all_roles_req=False)
def replace_metrics():
    data = request.get_json()
    status = 200
    replaced = []
    for document in data:
        try:
            conn_mng.mongo_metrics.find_one_and_replace({"node": document['node'], "name": document["name"], "type": document["type"]}, document, upsert=True)
            replaced.append(document)
        except Exception as e:
            logger.exception(e)
            status = 500

    return jsonify(replaced), status

MIN_MBPS = 1000

@api.route("/api/gather-device-facts/<management_ip>")
@api.doc(params={'management_ip': "The IP we wish to get additional information from."})
class DeviceFactsCtrl(Resource):

    @api.response(200, "DeviceFacts", DeviceFacts.DTO)
    @api.doc(description="Gathers the device facts and displays it in the form of JSON.")
    def get(self, management_ip: str):
        try:
            if management_ip in ["127.0.0.1", "localhost"]:
                return create_device_facts_from_ansible_setup("localhost", "").to_dict()
            try:
                return create_device_facts_from_ansible_setup(management_ip, get_kickstart_form_from_db().root_password).to_dict()
            except DBModelNotFound as e:
                return create_device_facts_from_ansible_setup(management_ip, "").to_dict()

        except Exception as e:
            logger.exception(e)
            return {"error_message": str(e)}, 400

def get_kickstart_form_from_db():
    try:
        return DIPKickstartForm.load_from_db()
    except ValidationError:
        return MIPKickstartForm.load_from_db()

def _is_valid_ip_block(available_ip_addresses: List[str], index: int) -> bool:
    """
    Ensures that the /27 IP blocks ip are all available.
    If a given /27 blocks IP address has been taken by some other node on the network,
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

    It returns an array of the start of each IP /27 block.

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

        if count == 32:
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
        command = "nmap -v -T5 --min-parallelism 100 -sn -n %s/24 -oG - | awk '/Status: Down/{print $2}'" % mng_ip
        cidr = 24
    else:
        command = "nmap -v -T5 --min-parallelism 100 -sn -n %s/%d -oG - | awk '/Status: Down/{print $2}'" % (mng_ip, cidr)

    stdout_str = run_command(command, use_shell=True)
    available_ip_addresses = stdout_str.split('\n')
    available_ip_addresses = [x for x in available_ip_addresses if not filter_ip(x)]
    ip_address_blocks = _get_ip_blocks(cidr)
    available_ip_blocks = []
    for index, ip in enumerate(available_ip_addresses):
        if not is_ipv4_address(ip):
            continue

        pos = ip.rfind('.') + 1
        last_octet = int(ip[pos:])
        if last_octet in ip_address_blocks and _is_valid_ip_block(available_ip_addresses, index):
            available_ip_blocks.append(ip)
    return available_ip_blocks


@api.route("/api/available-ip-blocks")
class IPBlocks(Resource):

    @api.response(200, "Array of IP Address Strings", COMMON_RETURNS["ip_blocks"])
    @api.doc(description="Gets available IP blocks based on controllers "
                         "IP Address and netmask.")
    def get(self):
        try:
            kickstart_form = DIPKickstartForm.load_from_db()
            mng_ip = str(kickstart_form.controller_interface)
            netmask = str(kickstart_form.netmask)
            available_ip_blocks = _get_available_ip_blocks(mng_ip, netmask)
            return available_ip_blocks
        except DBModelNotFound as e:
            return {}


@api.route("/api/ip-blocks/<ip_or_network_id>/<netmask>")
@api.doc(params={'ip_or_network_id': "An IP within the subnet you wish to scan"
                                    " for available IP blocks.",
                 'netmask': 'The range you wish to scan. EX: 255.255.255.0'})
class IPBlocksGeneric(Resource):

    @api.response(200, "Array of IP Address Strings", COMMON_RETURNS["ip_blocks"])
    @api.doc(description="Gets available IP blocks based on "
                         "IP Address and netmask.")
    def get(self, ip_or_network_id: str, netmask: str):
        available_ip_blocks = _get_available_ip_blocks(ip_or_network_id, netmask)
        return available_ip_blocks


@api.route("/api/unused-ip-addrs/<ip_or_network_id>/<netmask>")
@api.doc(params={'ip_or_network_id': "An IP within the subnet you wish to scan"
                                    " for available IP blocks.",
                 'netmask': 'The range you wish to scan. EX: 255.255.255.0'})
class UnusedIPAddresses(Resource):

    @api.response(200, "Array of IP Address Strings", COMMON_RETURNS["ip_addresses"])
    @api.doc(description="Gets available IP blocks based on "
                         "IP Address and netmask.")
    def get(self, ip_or_network_id: str, netmask: str):
        """
        Gets unused IP Addresses from a given network.
        :return:
        """
        cidr = netmask_to_cidr(netmask)
        if cidr <= 24:
            command = "nmap -v -T5 --min-parallelism 100 -sn -n %s/24 -oG - | awk '/Status: Down/{print $2}'" % ip_or_network_id
        else:
            command = "nmap -v -T5 --min-parallelism 100 -sn -n %s/%d -oG - | awk '/Status: Down/{print $2}'" % (ip_or_network_id, cidr)

        stdout_str = run_command(command, use_shell=True)
        available_ip_addresses = stdout_str.split('\n')
        available_ip_addresses = [x for x in available_ip_addresses if not filter_ip(x)]
        return jsonify(available_ip_addresses)


def _get_mng_ip_and_mac(node: Node) -> Tuple[str, str]:
    try:
        iface = node.deviceFacts['default_ipv4_settings']
        return iface['address'], iface['macaddress']
    except KeyError:
        pass
    return None, None


@app.route('/api/get_sensor_hostinfo', methods=['GET'])
def get_sensor_hostinfo() -> Response:
    ret_val = []
    kit_configuration = DIPKitForm.load_from_db() # type: DIPKitForm

    for node in kit_configuration.nodes:
        if node.node_type == NODE_TYPES[1]:
            host_simple = {}
            mng_ip, mac = _get_mng_ip_and_mac(node)
            host_simple['hostname'] = node.hostname
            host_simple['management_ip'] = mng_ip
            host_simple['mac'] = mac
            ret_val.append(host_simple)

    return jsonify(ret_val)

@app.route('/api/current_user', methods=['GET'])
def get_current_user() -> Response:
    user = Auth.get_user()
    user['controller_admin'] = Auth.is_controller_admin()
    user['controller_maintainer'] = Auth.is_controller_maintainer()
    user['operator'] = Auth.is_operator()
    user['realm_admin'] = Auth.is_realm_admin()
    return jsonify(user)
