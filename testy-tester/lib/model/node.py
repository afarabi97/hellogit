#!/usr/bin/env python

__vcenter_version__ = '6.7c'

import logging

from collections import OrderedDict
from typing import List
from vmware.vapi.vsphere.client import VsphereClient
from com.vmware.vcenter.vm.hardware.boot_client import Device as BootDevice
from com.vmware.vcenter.vm.hardware_client import (Cpu, Memory, Disk, Ethernet, Cdrom, Boot)
from com.vmware.vcenter.vm_client import (Hardware, Power)
from com.vmware.vcenter_client import VM

from lib.vsphere.common.sample_util import pp
from lib.vsphere.vcenter.helper import network_helper
from lib.vsphere.vcenter.helper import vm_placement_helper
from lib.vsphere.vcenter.helper.vm_helper import get_vm


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
        storage_datacenter (str): The datacenter on which to store th VM
        storage_cluster (str): The cluster in which to store th VM
        storage_datastore (str): The specific datastore in which to store the VM
        storage_folder (str): The folder in which to store the VM
        interfaces (list): List of Interface objects
        cpu_sockets (int): The number of CPU sockets the VM has
        cores_per_socket (int): The number of cores per socket. TODO: This value does not currently work
        cpu_hot_add_enabled (bool): Whether to allow CPU hot addition
        cpu_hot_remove_enabled (bool): Whether to allow CPU hot remove
        memory_size (int): The total amount of memory the VM has
        memory_hot_add_enabled (bool): Whether to allow hot addition of memory
        disks (list): List of Node_Disk objects
        iso_file (str): The datapath of the ISO file for the VM
        boot_order (list): A list of boot devices from which the VM may boot
        management_interface (Interface): The Interface object for the management interface
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

    def set_interfaces(self, interfaces: list) -> None:
        """
        Configures the interfaces for the node object.

        :param interfaces (list): A list of interface objects to assign the node object
        :return:
        """
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

    def set_management_interface(self, interface: Interface) -> None:
        """
        Sets the management interface for the node

        :param interface (Interface): The interface object that represents the management interface
        :return:
        """

        self.management_interface = interface

    def set_management_interface_mac(self, management_mac: str) -> None:
        """
        Sets the MAC address of the management interface

        :param management_mac (str): The MAC address of the management interface
        :return:
        """
        self.management_interface.set_mac_address(management_mac)

    def __str__(self) -> str:
        p_interfaces = '\n'.join([str(x) for x in self.interfaces])
        p_disks = '\n'.join([str(x) for x in self.disks])
        return "Hostname: %s\nInterface List:\n%s\nCPU Cores: %s\nMemory GB: %.2f\nDisk List:\n%s\n" % (self.hostname, p_interfaces, self.cpu_sockets, self.memory_size, p_disks)


class VirtualMachine:
    """
    Represents a single virtual machine

    Attributes:
        client (VsphereClient): A client object which allows interaction with vCenter
        node (OrderedDict): A dictionary created from the yaml configuration file
                               containing the totality of the VM's configuration options
        iso_path (str): The path to the ISO file we will use for this VM on the server
        placement_spec (PlacementSpec): Defines the location in which vCenter will place the VM
        vm_name (str): The name of the virtual machine as it appears in vCenter
        node_instance (Node): The node instance to which this VM is assigned
    """

    def __init__(self, client: VsphereClient, node: Node, iso_folder_path=None) -> None:
        """
        Initializes a virtual machine object

        :param client (VsphereClient): a vCenter server client
        :param vm_spec (Node): The schema of a virtual machine
        :param vm_name (str): The name of the virtual machine
        :param iso_folder_path (str): Path to the ISO files folder
        :return:
        """

        self.client = client  # type: VsphereClient

        self.node = node  # type: Node

        self.vm = None  # type: VM

        self.vm_info = None  # type: VM.info

        if node.iso_file is not None:
            self.iso_path = iso_folder_path + node.iso_file  # type: str
        else:
            self.iso_path = None

        # Get a placement spec
        self.placement_spec = vm_placement_helper.get_placement_spec(
            self.client,
            node.storage_datacenter,
            node.storage_folder,
            node.storage_cluster,
            node.storage_datastore) # type: PlacementSpec

        # Get a standard network backing
        # TODO: Left it here just in case we swap to a non distributed switch
        # based network
        #self.standard_network = network_helper.get_standard_network_backing(
        #    self.client,
        #    self.vm_spec["networking"]["std_portgroup_name"],
        #    self.vm_spec["storage_options"]["datacenter"]) # type: str

        self.vm_name = node.hostname # type: str

    def create(self) -> VM:
        """
        Create the VM

        :return (VM): Returns a VM object
        """

        GiB = 1024 * 1024 * 1024  # type: int
        GiBMemory = 1024  # type: int

        cpu=Cpu.UpdateSpec(count=self.node.cpu_sockets,
                           cores_per_socket=self.node.cores_per_socket,
                           hot_add_enabled=self.node.cpu_hot_add_enabled,
                           hot_remove_enabled=self.node.cpu_hot_remove_enabled)

        memory=Memory.UpdateSpec(size_mib=self.node.memory_size * GiBMemory,
                                 hot_add_enabled=self.node.memory_hot_add_enabled)

        # Create a list of the VM's disks
        disks = []  # type: list
        for disk in self.node.disks:
            disks.append(Disk.CreateSpec(
                new_vmdk=Disk.VmdkCreateSpec(name=disk.name,
                                             capacity=disk.size * GiB)))

        # Create a list of the VM's NICs
        nics = []  # type: list
        for interface in self.node.interfaces:
            if interface.mac_auto_generated:
                nics.append(Ethernet.CreateSpec(
                    start_connected=interface.start_connected,
                    mac_type=Ethernet.MacAddressType.GENERATED,
                    backing=Ethernet.BackingSpec(
                        type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                        network=network_helper.get_distributed_network_backing(
                            self.client,
                            interface.dv_portgroup_name,
                            self.node.storage_datacenter))))
            else:
                nics.append(Ethernet.CreateSpec(
                    start_connected=interface.start_connected,
                    mac_type=Ethernet.MacAddressType.MANUAL,
                    mac_address=interface.mac_address,
                    backing=Ethernet.BackingSpec(
                        type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                        network=network_helper.get_distributed_network_backing(
                            self.client,
                            interface.dv_portgroup_name,
                            self.node.storage_datacenter))))

        # Only create a CDROM drive if the user put an iso as part of their
        # configuration
        if self.iso_path is not None:
            cdroms = [
                Cdrom.CreateSpec(
                    start_connected=True,
                    backing=Cdrom.BackingSpec(type=Cdrom.BackingType.ISO_FILE,
                                              iso_file=self.iso_path)
                )
            ]
        else:
            cdroms = None

        boot = Boot.CreateSpec(type=Boot.Type.BIOS, delay=0, enter_setup_mode=False)

        # Create the boot order for the VM
        boot_devices = [] # type: list
        for item in self.node.boot_order:
            if item == "CDROM":
                if self.iso_path is not None:
                    boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.CDROM))
            elif item == "DISK":
                boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.DISK))
            else:
                boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.ETHERNET))

        vm_create_spec = VM.CreateSpec(
            guest_os=self.node.guestos,
            name=self.vm_name,
            placement=self.placement_spec,
            hardware_version=Hardware.Version.VMX_11,
            cpu=cpu,
            memory=memory,
            disks=disks,
            nics=nics,
            cdroms=cdroms,
            boot=boot,
            boot_devices=boot_devices
        )

        logging.debug('Creating a VM using spec\n-----')
        logging.debug(pp(vm_create_spec))
        logging.debug('-----')

        self.vm = self.client.vcenter.VM.create(vm_create_spec)

        logging.debug("Create Deployer Test VM: Created VM '{}' ({})".format(self.vm_name, self.vm))

        self.vm_info = self.client.vcenter.VM.get(self.vm)
        logging.debug('vm.get({}) -> {}'.format(self.vm, pp(self.vm_info)))

        return self.vm

    def cleanup(self) -> None:
        """
        Deletes the VM from the server's inventory

        :return:
        """
        vm = get_vm(self.client, self.vm_name)
        if vm:
            state = self.client.vcenter.vm.Power.get(vm)
            if state == Power.Info(state=Power.State.POWERED_ON):
                self.client.vcenter.vm.Power.stop(vm)
            elif state == Power.Info(state=Power.State.SUSPENDED):
                self.client.vcenter.vm.Power.start(vm)
                self.client.vcenter.vm.Power.stop(vm)
            logging.info("Deleting VM '{}' ({})".format(self.vm_name, vm))
            self.client.vcenter.VM.delete(vm)

    def power_on(self):
        """
        Powers the VM on

        :return:
        """
        logging.info('Powering on ' + self.vm_name)
        self.client.vcenter.vm.Power.start(self.vm)
        logging.debug('vm.Power.start({})'.format(self.vm))

    def power_off(self):
        """
        Powers the VM off

        :return:
        """
        logging.info('Powering off ' + self.vm_name)
        self.client.vcenter.vm.Power.stop(self.vm)
        logging.debug('vm.Power.stop({})'.format(self.vm))

    def get_macs(self) -> OrderedDict:
        """
        Gets a dictionary of the names of interfaces and their MAC addresses. Keep in mind this will only be populated
        after the machine has been turned on once.

        :return (OrderedDict): A dictionary of the names of interfaces and their MAC addresses
        """
        macs = OrderedDict()  # type: OrderedDict

        # nics is a dict with key str (interface name) and value is com.vmware.vcenter.vm.hardware_client.Ethernet.info
        for interface, info in self.vm_info.nics.items():
            macs[info.label] = info.mac_address

        return macs

    def get_node_instance(self) -> Node:
        """
        Gets the node to which this VM instance is assigned

        :return (Node): The node instance to which this VM is assigned
        """

        return self.node

    def set_node_instance(self, node_instance: Node) -> None:
        """
        Assigns this VM to a node

        :param node_instance (Node): The node instance to which this VM is assigned
        :return:
        """
        self.node = node_instance
