"""
This is the main module for all the shared REST calls
"""
import ipaddress
from typing import List

import netifaces
from app.middleware import Auth
from app.models import DBModelNotFound
from app.models.common import COMMON_NS, COMMON_RETURNS
from app.models.settings.kit_settings import GeneralSettingsForm
from app.service.job_service import run_command
from app.utils.constants import CONTROLLER_INTERFACE_NAME
from app.utils.utils import filter_ip, is_ipv4_address
from flask import Response
from flask_restx import Resource


@COMMON_NS.route('/controller/info')
class ControllerInfo(Resource):
    def get(self) -> Response:
        interface = netifaces.ifaddresses(CONTROLLER_INTERFACE_NAME)
        interface_info = list(interface[netifaces.AF_INET])[0]
        controller_ip = interface_info["addr"]
        gateway_ip, interface = netifaces.gateways()['default'][netifaces.AF_INET]
        ip_address = ipaddress.ip_network("{}/{}".format(controller_ip, interface_info["netmask"]), strict=False)
        cidr_ranges = {}
        for x in ip_address.subnets(new_prefix=27):
            cidr_ranges[format(x[0])] = { "first": format(x[0]), "last": format(x[-1]) }
        filtered = filter(lambda x: ipaddress.ip_address(gateway_ip) not in x and ipaddress.ip_address(controller_ip) not in x, ip_address.subnets(new_prefix=27))
        valid_cidrs = list(map(lambda x: format(x[0]), filtered))

        if interface != CONTROLLER_INTERFACE_NAME:
            #TODO
            # GET WRECKED
            pass
        info = {
            "ip_address": controller_ip,
            "gateway": gateway_ip,
            "netmask": interface_info["netmask"],
            "name": CONTROLLER_INTERFACE_NAME,
            "cidrs": valid_cidrs,
            "cidr_ranges": cidr_ranges
        }
        return info, 200

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

def _nmap_scan(ip: str, netmask: str, used: bool=False) -> List:
    status = "Down"
    if used:
        status = "Up"
    cidr = ipaddress.IPv4Network("0.0.0.0/{}".format(netmask)).prefixlen
    command = "nmap -sn -n -T5 --min-parallelism 100 {}/{} -v -oG - | awk '/Status: {}/{{print $2}}'".format(ip, cidr, status)
    stdout_str = run_command(command, use_shell=True)
    addresses = stdout_str.split('\n')
    if addresses:
        return addresses
    return ""


def _get_available_ip_blocks(mng_ip: str, netmask: str) -> List:
    """
    Get available IP blocks

    :param mng_ip: The management IP or controller IP address
    :param netmask: The netmask of the controller IP address.
    """

    cidr = ipaddress.IPv4Network("0.0.0.0/{}".format(netmask)).prefixlen
    available_ip_addresses = _nmap_scan(ip=mng_ip, netmask=netmask, used=False)
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


@COMMON_NS.route("/available-ip-blocks")
class IPBlocks(Resource):

    @COMMON_NS.response(200, "Array of IP Address Strings", COMMON_RETURNS["ip_blocks"])
    @COMMON_NS.doc(description="Gets available IP blocks based on controllers "
                         "IP Address and netmask.")
    def get(self) -> Response:
        try:
            kickstart_form = GeneralSettingsForm.load_from_db()
            mng_ip = str(kickstart_form.controller_interface)
            netmask = str(kickstart_form.netmask)
            available_ip_blocks = _get_available_ip_blocks(mng_ip, netmask)
            return available_ip_blocks
        except DBModelNotFound:
            return {"message": "DBModelNotFound"}, 200


@COMMON_NS.route("/ip-blocks/<ip_or_network_id>/<netmask>")
@COMMON_NS.doc(params={'ip_or_network_id': "An IP within the subnet you wish to scan"
                                    " for available IP blocks.",
                 'netmask': 'The range you wish to scan. EX: 255.255.255.0'})
class IPBlocksGeneric(Resource):

    @COMMON_NS.response(200, "Array of IP Address Strings", COMMON_RETURNS["ip_blocks"])
    @COMMON_NS.doc(description="Gets available IP blocks based on "
                         "IP Address and netmask.")
    def get(self, ip_or_network_id: str, netmask: str) -> Response:
        available_ip_blocks = _get_available_ip_blocks(ip_or_network_id, netmask)
        return available_ip_blocks


@COMMON_NS.route("/unused-ip-addrs/<ip_or_network_id>/<netmask>")
@COMMON_NS.doc(params={'ip_or_network_id': "An IP within the subnet you wish to scan"
                                    " for available IP blocks.",
                 'netmask': 'The range you wish to scan. EX: 255.255.255.0'})
class UnusedIPAddresses(Resource):

    @COMMON_NS.response(200, "Array of IP Address Strings", COMMON_RETURNS["ip_addresses"])
    @COMMON_NS.doc(description="Gets available IP blocks based on "
                         "IP Address and netmask.")
    def get(self, ip_or_network_id: str, netmask: str) -> Response:
        """
        Gets unused IP Addresses from a given network.
        :return:
        """

        available_ip_addresses = _nmap_scan(ip=ip_or_network_id, netmask=netmask, used=False)
        available_ip_addresses = [x for x in available_ip_addresses if not filter_ip(x)]
        return available_ip_addresses


@COMMON_NS.route("/used-ip-addrs/<ip_or_network_id>/<netmask>")
@COMMON_NS.doc(params={'ip_or_network_id': "An IP within the subnet you wish to scan"
                                    " for available IP blocks.",
                 'netmask': 'The range you wish to scan. EX: 255.255.255.0'})
class UnusedIPAddresses(Resource):

    @COMMON_NS.response(200, "Array of IP Address Strings", COMMON_RETURNS["ip_addresses"])
    @COMMON_NS.doc(description="Get used IP blocks based on "
                         "IP Address and netmask.")
    def get(self, ip_or_network_id: str, netmask: str) -> Response:
        """
        Gets unused IP Addresses from a given network.
        :return:
        """

        available_ip_addresses = _nmap_scan(ip=ip_or_network_id, netmask=netmask, used=True)
        available_ip_addresses = [x for x in available_ip_addresses if not filter_ip(x)]
        return available_ip_addresses


@COMMON_NS.route('/current_user')
class CurrentUser(Resource):
    def get(self) -> Response:
        user = Auth.get_user()
        user['controller_admin'] = Auth.is_controller_admin()
        user['controller_maintainer'] = Auth.is_controller_maintainer()
        user['operator'] = Auth.is_operator()
        user['realm_admin'] = Auth.is_realm_admin()
        return user, 200
