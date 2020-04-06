import logging
import random
import subprocess
from functools import wraps
from time import sleep
from typing import List


def retry(count=5, time_to_sleep_between_retries=20):
    """
    A function wrapper that can be used to auto retry the wrapped function if
    it fails.  To use this function

    @retry(count=10)
    def somefunction():
        pass

    :param count: The number of retries it will perform.
    :param time_to_sleep_between_retries: The time to sleep between retries.
    :return:
    """
    def decorator(func):
        @wraps(func)
        def result(*args, **kwargs):
            for i in range(count):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if (i + 1) == count:
                        raise
                    print(str(e))
                    print("Sleeping 10 seconds")
                    sleep(time_to_sleep_between_retries)
        return result
    return decorator


def is_ipv4_address(s: str) -> bool:
    if s is None or len(s) == 0:
        return False

    pieces = s.split('.')
    if len(pieces) != 4:
        return False

    try:
        return all(0<=int(p)<256 for p in pieces)
    except ValueError:
        return False


def _open_proc(command: str,
               working_dir: str=None,
               use_shell:bool=False):
    sout = None
    serr = None
    proc = None

    if use_shell:
        if working_dir:
            proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=working_dir)
        else:
            proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    else:
        if working_dir:
            proc = subprocess.Popen(shlex.split(command), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=working_dir)
        else:
            proc = subprocess.Popen(shlex.split(command), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    return proc

def _print_unavailable_ips(available_ip_addresses: List[str]):
    cached_octet = None
    print("Unavailable IPS")
    for i, ip in enumerate(available_ip_addresses):
        pos = ip.rfind('.') + 1
        if cached_octet is None:
            cached_octet = int(ip[pos:])
            continue

        if (cached_octet + 1) != int(ip[pos:]):
            print(ip)

        cached_octet = int(ip[pos:])
    print("END Unavailable IPS")


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

        if i == 31:
            break
    return True


def _get_ip_blocks(cidr: int) -> List[int]:
    """
    Gets IP blocks based on CIDR notation.
    It only accept /24 through /26 subnet ranges.

    It returns an array of the start of each IP /27 block.

    :param cidr: The network cidr

    :return: [1, 32, 64 ...]
    """
    cidr_to_host_mapping = {24: 254, 25: 126, 26: 62}
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


def netmask_to_cidr(netmask: str) -> int:
    '''
    Converts a standards netmask to the associated CIDR notation.

    :param netmask: netmask ip addr (eg: 255.255.255.0)
    :return: equivalent cidr number to given netmask ip (eg: 24)
    '''
    return sum([bin(int(x)).count('1') for x in netmask.split('.')])


def run_command(command: str,
                working_dir: str=None,
                use_shell:bool=False) -> str:
    proc = _open_proc(command, working_dir, use_shell)
    sout, _ = proc.communicate()
    return sout.decode('utf-8')


class IPAddressManager:
    unused_ip_blocks = None
    kit_block_ip = None
    next_ip = None
    unused_ips = None

    def __init__(self, network_id: str, kit_index: int=0):
        self._network_id = network_id
        self._kit_index = int(kit_index)
        if IPAddressManager.unused_ips is None:
            self._create_ip_address_cache()
        if IPAddressManager.unused_ip_blocks is None:
            self._create_ip_block_cache()
            IPAddressManager.kit_block_ip = IPAddressManager.unused_ip_blocks[self._kit_index]

        self._is_block_valid(IPAddressManager.kit_block_ip)

    def _is_block_valid(self, ip_block: List[str]) -> bool:
        pos = ip_block.rfind('.') + 1
        last_octet = int(ip_block[pos:])
        count = 0
        for i in range(last_octet, last_octet + 32):
            count = count + 1
            ipaddress = self._network_id[0: len(self._network_id) - 1] + str(i)
            if ipaddress not in IPAddressManager.unused_ips:
                logging.warn("{} is already in use. This may be because we have not deleted the old kit yet or it"
                             " may be a IP conflict.".format(ipaddress))

    def filter_ip(self, ipaddress: str) -> bool:
        """
        Filters IP addresses from NMAP functions commands.
        :return:
        """
        for i in range(0, 1):
            if ipaddress.endswith('.' + str(i)):
                return True

        if ipaddress == '':
            return True
        return False

    def _create_ip_address_cache(self):
        command = "nmap -v -sn -n %s/24 -oG - | awk '/Status: Down/{print $2}'" % self._network_id
        stdout_str = run_command(command, use_shell=True)
        available_ip_addresses = stdout_str.split('\n')
        IPAddressManager.unused_ips = [x for x in available_ip_addresses if not self.filter_ip(x)]

    def _create_ip_block_cache(self):
        """
        Get available IP blocks

        :param mng_ip: The management IP or controller IP address
        :param netmask: The netmask of the controller IP address.
        """
        ip_address_blocks = [81, 113, 145, 177, 209]
        available_ip_blocks = []
        for block in ip_address_blocks:
            available_ip_blocks.append(self._network_id[0:len(self._network_id)-2] + "." + str(block))
        IPAddressManager.unused_ip_blocks = available_ip_blocks

    def get_ctrl_address(self) -> str:
        return IPAddressManager.kit_block_ip

    def get_next_node_address(self) -> str:
        if IPAddressManager.next_ip is None:
            IPAddressManager.next_ip = IPAddressManager.kit_block_ip
        pos = IPAddressManager.next_ip.rfind('.') + 1
        last_octet = int(IPAddressManager.next_ip[pos:])
        IPAddressManager.next_ip = IPAddressManager.next_ip[:pos] + str(last_octet + 1)
        return IPAddressManager.next_ip

    def get_kubernetes_ip_block(self, kit_index: int=0) -> str:
        ip = IPAddressManager.kit_block_ip
        pos = ip.rfind('.') + 1
        last_octet = int(ip[pos:])
        return ip[:pos] + str(last_octet + 15)

    def get_dhcp_ip_block(self, kit_index: int=0):
        ip = IPAddressManager.kit_block_ip
        pos = ip.rfind('.') + 1
        last_octet = int(ip[pos:])
        return ip[:pos] + str(last_octet + 8)
