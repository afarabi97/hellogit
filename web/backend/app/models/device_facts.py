import json
import os
import re
import uuid

from app import api, conn_mng, REDIS_CLIENT, rq_logger
from app.models import Model, DBModelNotFound, PostValidationError
from ipaddress import IPv4Address
from flask_restx import fields
from flask_restx.fields import Nested

from marshmallow import Schema, post_load, validate, validates, ValidationError
from marshmallow import fields as marsh_fields
from pymongo.results import InsertOneResult
from app.utils.utils import encode_password, decode_password
from typing import List, Dict, Tuple


class Disk(Model):
    """
    A disk object which represents a logical disk on a server.
    """
    DTO = api.model('Disk', {
        "has_root": fields.Boolean(description="Flag indicating whether or not a disk has the root of a filesystem present."),
        "name": fields.String(example="sdb", description="Name of disk / storage device."),
        "size_gb": fields.Float(example=50.0, description="The size of the storage device in GB."),
        "size_tb": fields.Float(example=0.048828125, description="The size of storage device in TB."),
        "disk_rotation": fields.Integer(example=1, description="Determines whether disk is HDD or SSD"),
    })

    def __init__(self, name: str):
        """
        Initializes the Disk object

        :param name: The name of the disk
        """
        self.name = name
        self.has_root = False
        self.size_gb = 0.0
        self.size_tb = 0.0
        self.disk_rotation = 0

    def set_size(self, ansible_size: str):
        """
        Sets the size of the disk.

        :param ansible_size: A string object EX: "250 GB"
        :return:
        """
        size_split = ansible_size.split(" ")

        self.size_gb = 0
        self.size_tb = 0

        size = float(size_split[0])

        if size_split[1] == "GB":
            self.size_gb = size
            self.size_tb = (size / 1024)
        if size_split[1] == "TB":
            self.size_gb = (size * 1024)
            self.size_tb = size

    def __str__(self):
        return "Disk: %s Size GB: %.2f Size TB: %.2f  HasRoot: %r Disk Rotation: %d" % (
                self.name, self.size_gb, self.size_tb, self.has_root, self.disk_rotation)


class Interface(Model):
    """
    An interface object which represents an interface on a server.
    """
    DTO = api.model('Interface', {
        "ip_address": fields.String(example="10.40.12.146",
                                    description="Ip Address of interface not all interfaces have an ip address."),
        "mac_address": fields.String(example="00:0a:29:6e:7f:ff",
                                     description="Mac address of interface not all interfaces have a mac address"),
        "name": fields.String(example="br0"),
        "speed": fields.Integer(example=0)
    })

    def __init__(self, name, ip_address, mac_address, speed):
        self.name = name
        self.ip_address = ip_address
        self.mac_address = mac_address
        self.speed = int(speed)

    def __str__(self):
        return "Interface: %s Ip: %s Mac: %s Speed: %d" % (self.name, self.ip_address, self.mac_address, self.speed)



class DefaultIpv4Settings(Model):
    DTO = api.model('DefaultIpv4Settings', {
        "address": fields.String(example="10.40.12.146", description="The default IP address used by the node."),
        "alias": fields.String(example="br0"),
        "broadcast": fields.String(example="10.40.12.255"),
        "gateway": fields.String(example="10.40.12.1"),
        "interface": fields.String(example="br0", description="The default alias or net interface used."),
        "macaddress": fields.String(example="00:0a:29:6e:7f:ff"),
        "mtu": fields.Integer(example=1500),
        "netmask": fields.String(example="255.255.255.0"),
        "network": fields.String(example="10.40.12.0"),
        "type": fields.String(example="bridge")
    })

    def __init__(self, payload: Dict):
        self.address = payload["address"]
        self.alias = payload["alias"]
        self.broadcast = payload["broadcast"]
        self.gateway = payload["gateway"]
        self.interface = payload["interface"]
        self.macaddress = payload["macaddress"]
        self.mtu = payload["mtu"]
        self.netmask = payload["netmask"]
        self.network = payload["network"]
        self.type = payload["type"]


class DeviceFacts(Model):
    """
    A node object which represents a server weather physical or virtual with the
    following properties:
    """
    DTO = api.model('DeviceFacts', {
        "cpus_available": fields.Integer(example=16, description="The number of CPUs on the node."),
        "default_ipv4_settings": fields.List(fields.Nested(DefaultIpv4Settings.DTO)),
        "disks": fields.List(fields.Nested(Disk.DTO)),
        "hostname": fields.String(example="server1.lan"),
        "interfaces": fields.List(fields.Nested(Interface.DTO)),
        "management_ip": fields.String(example="10.40.12.124", description="The managment IP passed in."),
        "memory_available": fields.Float(example=15.5107421875),
        "memory_gb": fields.Float(example=15.5107421875),
        "memory_mb": fields.Float(example=15884.0),
        "potential_monitor_interfaces": fields.List(fields.String(example="ens192")),
        "product_name": fields.String(example="VMware Virtual Platform")
    })

    def __init__(self, json_object: Dict, management_ip: str):
        self.potential_monitor_interfaces = []
        self.default_ipv4_settings = None
        self.hostname = None
        self.disks = []
        self.interfaces = []
        self.memory_mb = 0.0
        self.memory_available = 0.0
        self.memory_gb = 0.0
        self.cpus_available = 0
        self.management_ip = management_ip

        if json_object is not None:
            self.product_name=json_object['ansible_facts']['ansible_product_name']
            self.default_ipv4_settings = DefaultIpv4Settings(json_object['ansible_facts']['ansible_default_ipv4'])
            self._transform(json_object)

    def set_memory(self, memory_mb: int) -> None:
        """
        Sets sets the memory_mb and memory_gb
        as a python float.

        :param memory_mb:
        :return:
        """
        mem = float(memory_mb)
        self.memory_mb = mem
        self.memory_gb = (mem / 1024)
        self.memory_available = self.memory_gb

    def set_interfaces(self, interfaces: List[Interface]) -> None:
        """
        Sets the interfaces to the appropriate value.

        :param interfaces:
        :return:
        """
        self.interfaces = interfaces

    def set_cpu_cores(self, cpu_cores: int) -> None:
        """
        Set the CPU cores for the given object.

        :param cpu_cores:
        :return:
        """
        self.cpus_available = int(cpu_cores)

    def set_disks(self, disks: List[Disk]) -> None:
        """
        Sets the disks List for the given object.

        :param disks:
        :return:
        """
        self.disks = disks

    def __str__(self) -> str:
        p_interfaces = '\n'.join([str(x) for x in self.interfaces])
        p_disks = '\n'.join([str(x) for x in self.disks])
        return "Hostname: %s\nInterface List:\n%s\nCPU Cores: %s\nMemory MB: %.2f\nMemory GB: %.2f\nDisk List:\n%s\n" % (
            self.hostname, p_interfaces, self.cpus_available, self.memory_mb, self.memory_gb, p_disks)

    def marshal(self):
        node = self
        setattr(node, 'interfaces', json.dumps([interface.__dict__ for interface in node.interfaces]))
        setattr(node, 'disks', json.dumps([disk.__dict__ for disk in node.disks]))
        return self.__dict__

    def _transform(self, json_object: Dict):
        """
        Function transforms json object to node object:

        :param json_object: python dictionary object from ansible setup module.

        :return: Node object as specified above
        """
        # Get Disk
        ansible_devices = json_object['ansible_facts']['ansible_devices']
        disks = []
        partition_links = {}
        for i, k in ansible_devices.items():
            # We only want logical volume disks
            if k['removable'] != "1" and ((len(k['holders']) > 0 and len(k['partitions']) == 0) or
            (len(k['holders']) == 0 and len([a for a,b in k['partitions'].items() if len(b['holders']) > 0]) > 0)):
                disk = Disk(i)
                disk.set_size(k['size'])
                disk.disk_rotation = k['rotational']
                disks.append(disk)
            for j in k['partitions']:
                partition_links[j] = i
        # Get Disk links
        disk_links = {}
        master_links = {}
        for i in json_object['ansible_facts']['ansible_device_links']['uuids']:
            for k in json_object['ansible_facts']['ansible_device_links']['uuids'][i]:
                disk_links[k] = i

        for i in json_object['ansible_facts']['ansible_device_links']['masters']:
            for k in json_object['ansible_facts']['ansible_device_links']['masters'][i]:
                master_links[k] = i

        # Get Interfaces
        interfaces = []
        for i in json_object['ansible_facts']['ansible_interfaces']:
            ip = ""
            mac = ""
            # Do not return interfaces with veth, cni, docker or flannel
            exclude = ["veth", "cni", "docker", "flannel", "virbr0", "lo", "cali", "tunl"]
            if not any([special in i for special in exclude]):
                name = "ansible_" + i
                interface = json_object['ansible_facts'][name]
                speed = '0'
                ip = ''
                mac = ''
                if 'ipv4' in interface:
                    ip = interface['ipv4']['address']
                if 'macaddress' in interface:
                    mac = interface['macaddress']
                if 'speed' in interface:
                    speed = interface['speed']
                if ip != "127.0.0.1":
                    interfaces.append(Interface(i, ip, mac, speed))

        # Determine location of root
        for i in json_object['ansible_facts']['ansible_mounts']:
            if i["mount"] == "/" or i["mount"] == "/boot":
                # Use the established reverse dictionaries to get our partition
                part_val = disk_links.get(i['uuid'])

                found_disk = next((x for x in disks if x.name == part_val), None)
                if found_disk is not None:
                    found_disk.has_root = True

                master_part_val = master_links.get(part_val)
                top_part_val = partition_links.get(part_val)
                found_disk = next((x for x in disks if x.name == top_part_val), None)
                if found_disk is not None:
                    found_disk.has_root = True
                found_disk = next((x for x in disks if x.name == master_part_val), None)
                if found_disk is not None:
                    found_disk.has_root = True
                top_part_val = partition_links.get(master_part_val)
                found_disk = next((x for x in disks if x.name == top_part_val), None)
                if found_disk is not None:
                    found_disk.has_root = True

        # Get Memory
        memory = json_object['ansible_facts']['ansible_memory_mb']['real']['total']

        # Get Cores
        cores = json_object['ansible_facts']['ansible_processor_vcpus']

        # Get FQDN
        fqdn = json_object['ansible_facts']['ansible_fqdn']

        self.hostname = fqdn
        self.set_memory(memory)
        self.set_interfaces(interfaces)
        self.set_cpu_cores(cores)
        self.set_disks(disks)

        for interface in self.interfaces:
            if interface.ip_address != self.management_ip:
                self.potential_monitor_interfaces.append(interface.name)


def create_device_facts_from_ansible_setup(server_ip: str, password: str=None) -> DeviceFacts:
    """
    Function opens ansible process to run setup on specified server and returns a json object

    :param server_ip: fully qualified domain name of server
    :param password: password to server to create ansible ssh connection

    :return: Json object from ansible setup output
    """
    # Disable ssh host key checking
    os.environ[
        'ANSIBLE_SSH_ARGS'] = "-o ControlMaster=auto -o ControlPersist=60s -o " \
                              "UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"

    # The following runs ansible setup module on the target node
    if password:
        password = password.replace('"', '\\"')
        if password.find("'") != -1:
            raise ValueError("The password you typed contained a single ' which is not allowed.")

        ansible_string = "ansible all -m setup -e ansible_ssh_pass='" + password + "' -i " + server_ip + ","
    if server_ip == "localhost" or server_ip == "127.0.0.1":
        ansible_string = "ansible -m setup " + server_ip

    pid_object = os.popen(ansible_string).read()
    json_object = {}

    if pid_object.startswith(server_ip + " | UNREACHABLE! => "):
        # This removes "hostname | status =>" (ie: "192.168.1.21 | SUCCESS =>")
        # from the beginning of the return to make the return a valid json object.
        pid_object = pid_object.replace(server_ip + " | UNREACHABLE! => ", "")
        json_object = json.loads(pid_object)

    if pid_object.startswith(server_ip + " | SUCCESS => "):
        # This removes "hostname | status =>" (ie: "192.168.1.21 | SUCCESS =>")
        # from the beginning of the return to make the return a valid json object.
        pid_object = pid_object.replace(server_ip + " | SUCCESS => ", "")
        json_object = json.loads(pid_object)

    if 'unreachable' in json_object and json_object['unreachable'] is True:
        raise Exception("Error: " + json_object['msg'])

    return DeviceFacts(json_object, server_ip)
