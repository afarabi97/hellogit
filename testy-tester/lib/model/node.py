#!/usr/bin/env python

from typing import List

class Interface(object):
    def __init__(self, name: str, interface_type: str, ip_address: str, start_connected: str) -> None:
        self.name = name
        self.interface_type = interface_type
        self.ip_address = ip_address
        self.start_connected = start_connected

    def set_mac_auto_generated(self, mac_auto_generated: bool) -> None:
        self.mac_auto_generated = mac_auto_generated

    def set_mac_address(self, mac_address: str) -> None:
        self.mac_address = mac_address

    def set_dv_portgroup_name(self, dv_portgroup_name: str) -> None:
        self.dv_portgroup_name = dv_portgroup_name
    
    def set_std_portgroup_name(self, std_portgroup_name: str) -> None:
        self.std_portgroup_name = std_portgroup_name
    
    def __str__(self) -> str:        
        return "Interface: %s Ip: %s Mac: %s" % (self.name, self.ip_address, self.mac_address)
    
class Node_Disk(object):
    def __init__(self, name: str, size) -> None:
        self.name = name
        self.size = size
    
    def __str__(self) -> str:
        return "Name: %s Size: %s" % (self.name, self.size)

class Node(object):
    """
    Represents a single node object such as a controller, server or sensor

    Attributes:
        hostname (str): The hostname of the node
        type (type): The tpye of the node controller, server or sensor        
        username (str): Username for login                               
        password (str): Password for login
        guestos (str): Th operating system used such as RHEL_7_64
        vm_to_clone (str): The name of the virtual machine to clone
        cloned_vm_name (str): The name of the virtual machine cloned from
        storage_datacenter (str)
        storage_cluster (str)
        storage_datastore (str)
        storage_folder (str)
        interfaces (list): List of Interface objects
        cpu_sockets (int)
        cores_per_socket (int)
        cpu_hot_add_enabled (bool)
        cpu_hot_remove_enabled (bool)
        memory_size (int)
        memory_hot_add_enabled (bool)
        disks (list): List of Node_Disk objects
        iso_file (str)
        boot_order (list)
    """
    
    def __init__(self, hostname: str, node_type: str) -> None:
        """
        Initializes a node object

        :param hostname (str): a The hostname of the node
        :param type (str): The tpye of the node controller, server or sensor
        :return:
        """
        self.hostname = hostname
        self.type = node_type

    def set_username(self, username: str) -> None:        
        self.username = username

    def set_password(self, password: str) -> None:
        self.password = password

    def set_guestos(self, guestos: str) -> None:
        self.guestos = guestos

    def set_vm_clone_options(self, vm_to_clone: str, cloned_vm_name: str) -> None:
        self.vm_to_clone = vm_to_clone
        self.cloned_vm_name = cloned_vm_name

    def set_storage_options(self, datacenter: str, cluster: str, datastore: str, folder: str) -> None:
        self.storage_datacenter = datacenter
        self.storage_cluster = cluster
        self.storage_datastore = datastore
        self.storage_folder = folder

    def set_interfaces(self, interfaces: List[Interface]) -> None:
        self.interfaces = interfaces

    def set_cpu_options(self, cpu_sockets: int, cores_per_socket: int, cpu_hot_add_enabled: bool, cpu_hot_remove_enabled: bool ) -> None:
        self.cpu_sockets = cpu_sockets    
        self.cores_per_socket = cores_per_socket    
        self.cpu_hot_add_enabled = cpu_hot_add_enabled
        self.cpu_hot_remove_enabled = cpu_hot_remove_enabled

    def set_memory_options(self, memory_size: int, memory_hot_add_enabled: bool) -> None:
        self.memory_size = memory_size
        self.memory_hot_add_enabled = memory_hot_add_enabled

    def set_disks(self, disks: List[Node_Disk]) -> None:
        self.disks = disks

    def set_iso_file(self, iso_file: str) -> None:
        self.iso_file = iso_file

    def set_boot_order(self, boot_order: list) -> None:
        self.boot_order = boot_order
    
    def __str__(self) -> str:
        p_interfaces = '\n'.join([str(x) for x in self.interfaces])
        p_disks = '\n'.join([str(x) for x in self.disks])
        return "Hostname: %s\nInterface List:\n%s\nCPU Cores: %s\nMemory GB: %.2f\nDisk List:\n%s\n" % (self.hostname, p_interfaces, self.cpu_sockets, self.memory_size, p_disks)
