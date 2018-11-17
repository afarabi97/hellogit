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
    """
        Represents a single node object such as a controller, master-server, server, sensor or remote-sensor

        Attributes:
            name: Name of interface from yaml
            interface_type: Interface Type (manual)
            ip_address: IP Address of Interface
            start_connected: Connect interface when VM starts
            management_interface: Is this a management interface
            mac_auto_generated: Automatically generate mac address in VMWare
            mac_address: Interface mac address
            dv_portgroup_name: Distributed port group name
            std_portgroup_name: Standard port group name
            interface_name (str): Name of the interface from the virtual machine
        """

    def __init__(self, name: str, interface_type: str, ip_address: str, start_connected: str,
                 management_interface: bool) -> None:
        """
        Initializes an Interface object

        :param name: Name of the interface from the yaml config
        :param interface_type: Type of interface (manual)
        :param ip_address: IP Address of the interface
        :param start_connected: Connect interface when VM starts
        :param management_interface: Is this a management interface
        :return:
        """
        self.name = name
        self.interface_type = interface_type
        self.ip_address = ip_address
        self.start_connected = start_connected
        self.management_interface = management_interface
        self.mac_auto_generated = None
        self.mac_address = None
        self.dv_portgroup_name = None
        self.std_portgroup_name = None
        self.interface_name = None

    def set_mac_auto_generated(self, mac_auto_generated: bool) -> None:
        """
        Set the mac auto generate for the Interface object

        :param mac_auto_generated: Automatically generate mac address in VMWare
        :return:
        """
        self.mac_auto_generated = mac_auto_generated

    def set_mac_address(self, mac_address: str) -> None:
        """
        Set the mac address for the Interface object

        :param mac_address: Mac address of the interface
        :return:
        """
        self.mac_address = mac_address

    def set_dv_portgroup_name(self, dv_portgroup_name: str) -> None:
        """
        Set the distributed port group for the Interface object

        :param dv_portgroup_name:
        :return:
        """
        self.dv_portgroup_name = dv_portgroup_name

    def set_std_portgroup_name(self, std_portgroup_name: str) -> None:
        """
        Set the standard port group for the Interface object

        :param std_portgroup_name:
        :return:
        """
        self.std_portgroup_name = std_portgroup_name

    def set_interface_name(self, interface_name: str):
        """
        Set the interface name for the Interface object

        :param interface_name:
        :return:
        """
        self.interface_name = interface_name

    def __str__(self) -> str:
        return "Interface: %s Ip: %s Mac: %s" % (self.name, self.ip_address, self.mac_address)


class NodeDisk(object):
    """
    Represents a single node object such as a controller, server or sensor

    Attributes:
        name: Name of storage
        size: Size of storage in GB
    """

    def __init__(self, name: str, size: int) -> None:
        """
        Initializes a NodeDisk object

        :param name: Name of the disk
        :param size: Size of the disk in GB
        :return:
        """
        self.name = name
        self.size = size

    def __str__(self) -> str:
        return "Name: %s Size: %s" % (self.name, self.size)


class Node(object):
    """
    Represents a single node object such as a controller, server or sensor

    Attributes:
        hostname: The hostname of the node
        type: The type of the node controller, server or sensor
        username: Username for login
        password: Password for login
        guestos: Th operating system used such as RHEL_7_64
        vm_to_clone: The name of the virtual machine to clone
        cloned_vm_name: The name of the virtual machine cloned from
        storage_datacenter: The datacenter on which to store th VM
        storage_cluster: The cluster in which to store th VM
        storage_datastore: The specific datastore in which to store the VM
        storage_folder: The folder in which to store the VM
        interfaces: List of Interface objects
        cpu_sockets: The number of CPU sockets the VM has
        cores_per_socket: The number of cores per socket. TODO: This value does not currently work
        cpu_hot_add_enabled: Whether to allow CPU hot addition
        cpu_hot_remove_enabled: Whether to allow CPU hot remove
        memory_size: The total amount of memory the VM has
        memory_hot_add_enabled: Whether to allow hot addition of memory
        disks: List of NodeDisk objects
        iso_file: The datapath of the ISO file for the VM
        boot_order: A list of boot devices from which the VM may boot
        boot_drive (str): The name of the bootable disk
        management_interface: The Interface object for the management interface
    """

    def __init__(self, hostname: str, node_type: str) -> None:
        """
        Initializes a node object

        :param hostname: a The hostname of the node
        :param node_type: The type of the node controller, server or sensor
        :return:
        """
        self.hostname = hostname
        self.domain = None
        self.type = node_type
        self.username = None
        self.password = None
        self.guestos = None
        self.vm_to_clone = None
        self.cloned_vm_name = None
        self.storage_datacenter = None
        self.storage_cluster = None
        self.storage_datastore = None
        self.storage_folder = None
        self.cpu_sockets = None
        self.cores_per_socket = None
        self.cpu_hot_add_enabled = None
        self.cpu_hot_remove_enabled = None
        self.memory_size = None
        self.memory_hot_add_enabled = None
        self.disks = None
        self.iso_file = None
        self.boot_order = None
        self.management_interface = None
        self.interfaces = None

    def set_domain(self, domain: str) -> None:
        """
        Sets the domain for the node

        :param domain: domain for node
        :return:
        """
        self.domain = domain

    def set_username(self, username: str) -> None:
        """
        Sets the username for the node

        :param username: Username for node login
        :return:
        """
        self.username = username

    def set_password(self, password: str) -> None:
        """
        Sets the password for the node

        :param password: Password for node login
        :return:
        """
        self.password = password

    def set_guestos(self, guestos: str) -> None:
        """
        Sets the guest os for the node

        :param guestos: Guest OS for node login
        :return:
        """
        self.guestos = guestos

    def set_vm_clone_options(self, vm_to_clone: str, cloned_vm_name: str) -> None:
        """
        Sets the virtual machine options

        :param vm_to_clone: Name of Virtual Machine to clone
        :param cloned_vm_name: Name of cloned Virtual Machine
        :return:
        """
        self.vm_to_clone = vm_to_clone
        self.cloned_vm_name = cloned_vm_name

    def set_storage_options(self, datacenter: str, cluster: str, datastore: str, folder: str) -> None:
        """
        Sets the node storage options

        :param datacenter:
        :param cluster:
        :param datastore:
        :param folder:
        :return:
        """
        self.storage_datacenter = datacenter
        self.storage_cluster = cluster
        self.storage_datastore = datastore
        self.storage_folder = folder

    def set_interfaces(self, interfaces: List[Interface]) -> None:
        """
        Configures the interfaces for the node object.

        :param interfaces: A list of interface objects to assign the node object
        :return:
        """
        self.interfaces = interfaces

    def set_cpu_options(self, cpu_sockets: int, cores_per_socket: int, cpu_hot_add_enabled: bool,
                        cpu_hot_remove_enabled: bool) -> None:
        """
        Configures the cpu options for the node object.

        :param cpu_sockets:
        :param cores_per_socket:
        :param cpu_hot_add_enabled:
        :param cpu_hot_remove_enabled:
        :return:
        """
        self.cpu_sockets = cpu_sockets
        self.cores_per_socket = cores_per_socket
        self.cpu_hot_add_enabled = cpu_hot_add_enabled
        self.cpu_hot_remove_enabled = cpu_hot_remove_enabled

    def set_memory_options(self, memory_size: int, memory_hot_add_enabled: bool) -> None:
        """
        Configures the memory options for the node object.

        :param memory_size:
        :param memory_hot_add_enabled:
        :return:
        """
        self.memory_size = memory_size
        self.memory_hot_add_enabled = memory_hot_add_enabled

    def set_disks(self, disks: List[NodeDisk]) -> None:
        """
        Configures the disks for the node object.

        :param disks:
        :return:
        """
        self.disks = disks

    def set_iso_file(self, iso_file: str) -> None:
        """
        Configures the iso file for the node object.

        :param iso_file:
        :return:
        """
        self.iso_file = iso_file

    def set_boot_drive(self, boot_drive: str) -> None:
        """
        Sets the name of the bootable drive

        :param boot_drive (str): Name of the bootable drive
        :return:
        """
        self.boot_drive = boot_drive

    def set_boot_order(self, boot_order: list) -> None:
        """
        Configures the boot order for the node object.

        :param boot_order:
        :return:
        """
        self.boot_order = boot_order

    def set_management_interface(self, interface: Interface) -> None:
        """
        Sets the management interface for the node

        :param interface: The interface object that represents the management interface
        :return:
        """

        self.management_interface = interface

    def set_management_interface_mac(self, management_mac: str) -> None:
        """
        Sets the MAC address of the management interface

        :param management_mac: The MAC address of the management interface
        :return:
        """
        self.management_interface.set_mac_address(management_mac)

    def __str__(self) -> str:
        p_interfaces = '\n'.join([str(x) for x in self.interfaces])
        p_disks = '\n'.join([str(x) for x in self.disks])
        return ("Hostname: %s\nInterface List:\n%s\nCPU Cores: %s\nMemory GB: %.2f\nDisk List:\n%s\n" %
                (self.hostname, p_interfaces, self.cpu_sockets, self.memory_size, p_disks))


class VirtualMachine:
    """
    Represents a single virtual machine

    Attributes:
        client: A client object which allows interaction with vCenter
        node: A dictionary created from the yaml configuration file
                               containing the totality of the VM's configuration options
        iso_path: The path to the ISO file we will use for this VM on the server
        placement_spec: Defines the location in which vCenter will place the VM
        vm_name: The name of the virtual machine as it appears in vCenter
        node_instance: The node instance to which this VM is assigned
    """

    def __init__(self, client: VsphereClient, node: Node, iso_folder_path: str=None) -> None:
        """
        Initializes a virtual machine object

        :param client: a vCenter server client
        :param node: An instance of a node object
        :param iso_folder_path: Path to the ISO files folder
        :return:
        """

        self.client = client
        self.node = node
        self.vm_info = None  # type: VM.info
        self.node_instance = None  # type: Node

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
            node.storage_datastore)  # type: PlacementSpec

        # Get a standard network backing
        # TODO: Left it here just in case we swap to a non distributed switch
        # based network
        # self.standard_network = network_helper.get_standard_network_backing(
        #    self.client,
        #    self.vm_spec["networking"]["std_portgroup_name"],
        #    self.vm_spec["storage_options"]["datacenter"]) # type: str

        self.vm_name = node.hostname  # type: str
        self.vm = get_vm(self.client, self.vm_name)  # type: VM

    def create(self) -> VM:
        """
        Create the VM

        :return (VM): Returns a VM object
        """

        gigabyte = 1024 * 1024 * 1024  # type: int
        gigabyte_memory = 1024  # type: int

        cpu = Cpu.UpdateSpec(count=self.node.cpu_sockets,
                             cores_per_socket=self.node.cores_per_socket,
                             hot_add_enabled=self.node.cpu_hot_add_enabled,
                             hot_remove_enabled=self.node.cpu_hot_remove_enabled)

        memory = Memory.UpdateSpec(size_mib=self.node.memory_size * gigabyte_memory,
                                   hot_add_enabled=self.node.memory_hot_add_enabled)

        # Create a list of the VM's disks
        disks = []  # type: list
        for disk in self.node.disks:
            disks.append(Disk.CreateSpec(
                new_vmdk=Disk.VmdkCreateSpec(name=disk.name,
                                             capacity=disk.size * gigabyte)))

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
        boot_devices = []  # type: list
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

        :param node_instance: The node instance to which this VM is assigned
        :return:
        """
        self.node = node_instance
