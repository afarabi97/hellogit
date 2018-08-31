#!/usr/bin/env python

class Storage_Options(object):
    def __init__(self, datacenter: str, cluster: str, datastore: str, folder: str):
        self.datacenter = datacenter
        self.cluster = cluster
        self.datastore = datastore
        self.folder = folder

class Interface(object):
    def __init__(self, name: str, interface_type: str, ip_address: str, start_connected: str):
        self.name = name
        self.interface_type = interface_type
        self.ip_address = ip_address
        self.start_connected = start_connected

    def set_mac_auto_generated(self, mac_auto_generated):
        self.mac_auto_generated = mac_auto_generated

    def set_mac_address(self, mac_address):
        self.mac_address = mac_address

    def set_dv_portgroup_name(self, dv_portgroup_name):
        self.dv_portgroup_name = dv_portgroup_name
    
    def set_std_portgroup_name(self, std_portgroup_name):
        self.std_portgroup_name = std_portgroup_name
    
    def __str__(self):        
        return "Interface: %s Ip: %s Mac: %s" % (self.name, self.ip_address, self.mac_address)

class Node_Disk(object):
    def __init__(self, name: str, size):
        self.name = name
        self.size = size
    
    def __str__(self):
        return "Name: %s Size: %s" % (self.name, self.size)


class Node(object):
    def __init__(self, hostname: str, node_type: str):
        self.hostname = hostname
        self.type = node_type

    def set_username(self, username):        
        self.username = username

    def set_password(self, password):
        self.password = password

    def set_guestos(self, guestos):
        self.guestos = guestos

    def set_vm_clone_options(self, vm_to_clone: str, cloned_vm_name: str):
        self.vm_to_clone = vm_to_clone
        self.cloned_vm_name = cloned_vm_name

    def set_storage_options(self, datacenter: str, cluster: str, datastore: str, folder: str):
        self.storage_datacenter = datacenter
        self.storage_cluster = cluster
        self.storage_datastore = datastore
        self.storage_folder = folder

    def set_interfaces(self, interfaces):
        self.interfaces = interfaces

    def set_cpu_options(self, cpu_sockets, cores_per_socket, cpu_hot_add_enabled, cpu_hot_remove_enabled):
        self.cpu_sockets = cpu_sockets    
        self.cores_per_socket = cores_per_socket    
        self.cpu_hot_add_enabled = cpu_hot_add_enabled
        self.cpu_hot_remove_enabled = cpu_hot_remove_enabled

    def set_memory_options(self, memory_size, memory_hot_add_enabled):
        self.memory_size = memory_size
        self.memory_hot_add_enabled = memory_hot_add_enabled

    def set_disks(self, disks):
        self.disks = disks

    def set_iso_file(self, iso_file):
        self.iso_file = iso_file

    def set_boot_order(self, boot_order):
        self.boot_order = boot_order
    
    def __str__(self):
        p_interfaces = '\n'.join([str(x) for x in self.interfaces])
        p_disks = '\n'.join([str(x) for x in self.disks])
        return "Hostname: %s\nInterface List:\n%s\nCPU Cores: %s\nMemory GB: %.2f\nDisk List:\n%s\n" % (self.hostname, p_interfaces, self.cpu_sockets, self.memory_size, p_disks)
