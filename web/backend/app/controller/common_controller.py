"""
This is the main module for all the shared REST calls
"""
import ipaddress
from typing import List

import netifaces
from app.middleware import Auth
from app.models.common import COMMON_NS, COMMON_RETURNS
from app.service.job_service import run_command
from app.utils.constants import CONTROLLER_INTERFACE_NAME
from app.utils.utils import filter_ip
from flask import Response
from flask_restx import Resource


@COMMON_NS.route("/controller/info")
class ControllerInfo(Resource):
    def get(self) -> Response:
        interface = netifaces.ifaddresses(CONTROLLER_INTERFACE_NAME)
        interface_info = list(interface[netifaces.AF_INET])[0]
        controller_ip = interface_info["addr"]
        gateway_ip, interface = netifaces.gateways()["default"][netifaces.AF_INET]
        ip_address = ipaddress.ip_network(
            "{}/{}".format(controller_ip, interface_info["netmask"]), strict=False
        )
        cidr_ranges = {}
        for x in ip_address.subnets(new_prefix=27):
            cidr_ranges[format(x[0])] = {"first": format(x[0]), "last": format(x[-1])}
        filtered = filter(
            lambda x: ipaddress.ip_address(gateway_ip) not in x
            and ipaddress.ip_address(controller_ip) not in x,
            ip_address.subnets(new_prefix=27),
        )
        valid_cidrs = list(map(lambda x: format(x[0]), filtered))

        if interface != CONTROLLER_INTERFACE_NAME:
            # TODO
            # GET WRECKED
            pass
        info = {
            "ip_address": controller_ip,
            "gateway": gateway_ip,
            "netmask": interface_info["netmask"],
            "name": CONTROLLER_INTERFACE_NAME,
            "cidrs": valid_cidrs,
            "cidr_ranges": cidr_ranges,
        }
        return info, 200


def _nmap_scan(ip: str, netmask: str, used: bool = False) -> List:
    status = "Down"
    if used:
        status = "Up"
    cidr = ipaddress.IPv4Network("0.0.0.0/{}".format(netmask)).prefixlen
    ip = ipaddress.IPv4Address(ip)
    command = "nmap -sn -n -T5 --min-parallelism 100 {}/{} -v -oG - | awk '/Status: {}/{{print $2}}'".format(
        str(ip), cidr, status
    )
    stdout_str = run_command(command, use_shell=True)
    addresses = stdout_str.split("\n")
    if addresses:
        return addresses
    return []


@COMMON_NS.route("/unused-ip-addrs/<ip_or_network_id>/<netmask>")
@COMMON_NS.doc(
    params={
        "ip_or_network_id": "An IP within the subnet you wish to scan"
        " for available IP blocks.",
        "netmask": "The range you wish to scan. EX: 255.255.255.0",
    }
)
class UnusedIPAddresses(Resource):
    @COMMON_NS.response(
        200, "Array of IP Address Strings", COMMON_RETURNS["ip_addresses"]
    )
    @COMMON_NS.doc(
        description="Gets available IP blocks based on " "IP Address and netmask."
    )
    def get(self, ip_or_network_id: str, netmask: str) -> Response:
        """
        Gets unused IP Addresses from a given network.
        :return:
        """
        try:
            available_ip_addresses = _nmap_scan(
                ip=ip_or_network_id, netmask=netmask, used=False
            )
            available_ip_addresses = [
                x for x in available_ip_addresses if not filter_ip(x)
            ]
            return available_ip_addresses
        except ipaddress.AddressValueError as e:
            return {"message": "Invalid IP Address Error"}, 500
        except ipaddress.NetmaskValueError as e:
            return {"message": "Invalid Netmask Error"}, 500


@COMMON_NS.route("/used-ip-addrs/<ip_or_network_id>/<netmask>")
@COMMON_NS.doc(
    params={
        "ip_or_network_id": "An IP within the subnet you wish to scan"
        " for available IP blocks.",
        "netmask": "The range you wish to scan. EX: 255.255.255.0",
    }
)
class UsedIPAddresses(Resource):
    @COMMON_NS.response(
        200, "Array of IP Address Strings", COMMON_RETURNS["ip_addresses"]
    )
    @COMMON_NS.doc(description="Get used IP blocks based on " "IP Address and netmask.")
    def get(self, ip_or_network_id: str, netmask: str) -> Response:
        """
        Gets unused IP Addresses from a given network.
        :return:
        """
        try:
            available_ip_addresses = _nmap_scan(
                ip=ip_or_network_id, netmask=netmask, used=True
            )
            available_ip_addresses = [
                x for x in available_ip_addresses if not filter_ip(x)
            ]
            return available_ip_addresses
        except ipaddress.AddressValueError as e:
            return {"message": "Invalid IP Address Error"}, 500
        except ipaddress.NetmaskValueError as e:
            return {"message": "Invalid Netmask Error"}, 500


@COMMON_NS.route("/current_user")
class CurrentUser(Resource):
    def get(self) -> Response:
        user = Auth.get_user()
        user["controller_admin"] = Auth.is_controller_admin()
        user["controller_maintainer"] = Auth.is_controller_maintainer()
        user["operator"] = Auth.is_operator()
        user["realm_admin"] = Auth.is_realm_admin()
        return user, 200
