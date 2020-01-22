#!/usr/bin/env python

__vcenter_version__ = '6.7c'

import logging
import os
import shlex
import subprocess

from collections import OrderedDict
from fabric import Connection
from invoke.exceptions import UnexpectedExit
from io import StringIO
from typing import List, Dict
from vmware.vapi.vsphere.client import VsphereClient
from com.vmware.vcenter.vm.hardware.boot_client import Device as BootDevice
from com.vmware.vcenter.vm.hardware_client import (Cpu, Memory, Disk, Ethernet, Cdrom, Boot)
from com.vmware.vcenter.vm_client import (Hardware, Power)
from com.vmware.vcenter_client import VM

from lib.vsphere.common.sample_util import pp
from lib.vsphere.vcenter.helper import network_helper
from lib.vsphere.vcenter.helper import vm_placement_helper
from lib.vsphere.vcenter.helper.vm_helper import get_vm
from lib.model.host_configuration import HostConfiguration
from lib.connection_mngs import FabricConnectionWrapper

from pathlib import Path


class Interface(object):
    """
        Represents a single node object such as a controller, master_server, server, sensor or remote_sensor
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
                 management_interface: bool, monitoring_interface: bool,
                 pxe_type: str = None) -> None:
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
        if interface_type == 'auto' or interface_type == 'manual' or interface_type == 'link-local':
            self.interface_type = interface_type
        else:
            logging.error("Interface type %s is not a valid type" % interface_type)
            exit(4)

        self.ip_address = ip_address
        self.start_connected = start_connected
        self.management_interface = management_interface
        self.monitoring_interface = monitoring_interface
        self.mac_auto_generated = None
        self.mac_address = None
        self.dv_portgroup_name = None
        self.std_portgroup_name = None
        self.interface_name = None
        self.subnet_mask = None
        self.boot_mode = 'BIOS'

    def set_subnet_mask(self, subnet_mask: str) -> None:
        """
        Sets subnet mask

        :param subnet_mask:
        :return:
        """
        self.subnet_mask = subnet_mask

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

    def set_boot_mode(self, boot_mode: str) -> None:
        """
        Set the boot mode for the Interface object

        :param boot_mode: Either BIOS or Uefi
        :return:
        """
        self.boot_mode = boot_mode

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

class CatalogSuricata(object):
    """
    Represents a suricata catalog object and all the variables inside it

    Attributes:
        affinity_hostname: Name of sensor
        cpu_request: CPU request sent to Kubernetes
        deployment_name: Name of the deployment set sent to Kubernetes
        external_net: External net for suricata alerts
        home_net: Home net for suricata alerts
        interfaces: Monitoring interface suricata uses
        pcapEnabled: Is PCAP enabled
        suricata_threads: Number of threads per interface
        node_hostname: Name of sensor
    """

    def __init__(self, yml_dict: Dict) -> None:
        """
        Initializes a NodeDisk object

        :param name: Name of the disk
        :param size: Size of the disk in GB
        :return:
        """
        self.affinity_hostname = yml_dict['affinity_hostname']
        self.cpu_request = yml_dict['cpu_request']
        self.deployment_name = yml_dict['deployment_name']
        self.external_net = yml_dict['external_net']
        self.home_net = yml_dict['home_net']
        self.interfaces = yml_dict['interfaces']
        self.pcapEnabled = yml_dict['pcapEnabled']
        self.suricata_threads = yml_dict['suricata_threads']
        self.node_hostname = yml_dict['node_hostname']

    def to_dict(self):
        return {
            'affinity_hostname': self.affinity_hostname,
            'cpu_request': self.cpu_request,
            'deployment_name': self.deployment_name,
            'external_net': self.external_net,
            'home_net': self.home_net,
            'interfaces': self.interfaces,
            'pcapEnabled': self.pcapEnabled,
            'suricata_threads': self.suricata_threads,
            'node_hostname': self.node_hostname
        }

    def __str__(self) -> str:
        return "affinity_hostname: %s cpu_request: %s deployment_name: %s external_net: %s home_net: %s interfaces: %s pcapEnabled: %s suricata_threads: %s node_hostname: %s" % (self.affinity_hostname, self.cpu_request, self.deployment_name, self.external_net, self.home_net, self.interfaces, self.suricata_threads, self.pcapEnabled, self.node_hostname)

class CatalogMolochViewer(object):
    """
    Represents a suricata catalog object and all the variables inside it

    Attributes:
        deployment_name: Name of the deployment set sent to Kubernetes
        node_hostname: Name of sensor
        password: password for moloch login
        username: username for moloch login
    """

    def __init__(self, yml_dict: Dict) -> None:
        """
        Initializes a NodeDisk object

        :param name: Name of the disk
        :param size: Size of the disk in GB
        :return:
        """
        self.deployment_name = yml_dict['deployment_name']
        self.node_hostname = yml_dict['node_hostname']
        self.password = yml_dict['pass']
        self.username = yml_dict['user']
    def to_dict(self):
        return {
            'deployment_name': self.deployment_name,
            'node_hostname': self.node_hostname,
            'pass': self.password,
            'user': self.username
        }

    def __str__(self) -> str:
        return "deployment_name: %s node_hostname: %s pass: %s user: %s" % (self.deployment_name, self.node_hostname, self.password, self.username)

class CatalogMolochCapture(object):
    """
    Represents a suricata catalog object and all the variables inside it

    Attributes:
        cpu_request: CPU request sent to Kubernetes
        pcapWriteMethod: Whether moloch writes or not
        affinity_hostname: Name of sensor
        node_hostname: Name of sensor
        bpf: Filter that write to PCAP
        dontSaveBPFs: Filter that dont write to PCAP
        freespaceG: Free space left
        maxFileSizeG: Max file size for each pcap file
        magicMode: Magic Mode
        interfaces: Monitoring interface Moloch uses
        deployment_name: Name of the deployment set sent to Kubernetes
    """

    def __init__(self, yml_dict: Dict) -> None:
        """
        Initializes a NodeDisk object

        :param name: Name of the disk
        :param size: Size of the disk in GB
        :return:
        """
        self.cpu_request = yml_dict['cpu_request']
        self.pcapWriteMethod = yml_dict['pcapWriteMethod']
        self.affinity_hostname = yml_dict['affinity_hostname']
        self.node_hostname = yml_dict['node_hostname']
        self.bpf = yml_dict['bpf']
        self.dontSaveBPFs = yml_dict['dontSaveBPFs']
        self.freespaceG = yml_dict['freespaceG']
        self.maxFileSizeG = yml_dict['maxFileSizeG']
        self.magicMode = yml_dict['magicMode']
        self.interfaces = yml_dict['interfaces']
        self.deployment_name = yml_dict['deployment_name']

    def to_dict(self):
        return {
            'cpu_request': self.cpu_request,
            'pcapWriteMethod': self.pcapWriteMethod,
            'affinity_hostname': self.affinity_hostname,
            'node_hostname': self.node_hostname,
            'bpf': self.bpf,
            'dontSaveBPFs': self.dontSaveBPFs,
            'freespaceG': self.freespaceG,
            'maxFileSizeG': self.maxFileSizeG,
            'magicMode': self.magicMode,
            'interfaces': self.interfaces,
            'deployment_name': self.deployment_name
        }

    def __str__(self) -> str:
        return "cpu_request: %s pcapWriteMethod: %s affinity_hostname: %s node_hostname: %s bpf: %s dontSaveBPFs: %s freespaceG: %s maxFileSizeG: %s magicMode: %s interfaces: %s deployment_name: %s" % (self.cpu_request, self.pcapWriteMethod, self.affinity_hostname, self.node_hostname, self.bpf, self.dontSaveBPFs, self.freespaceG, self.maxFileSizeG, self.magicMode, self.interfaces, self.deployment_name )


class CatalogZeek(object):
    """
    Represents a zeek catalog object and all the variables inside it

    Attributes:
        home_net: Home network
        interfaces: List of interfaces
        zeek_workers: Number of Zeek workers
        log_retention_hours: Number of hours to retain data
        affinity_hostname: Name of sensor
        node_hostname: Name of sensor
        deployment_name: Name of the deployment set sent to Kubernetes
    """

    def __init__(self, yml_dict: Dict) -> None:
        self.home_net = yml_dict['home_net']
        self.interfaces = yml_dict['interfaces']
        self.zeek_workers = yml_dict['zeek_workers']
        self.log_retention_hours = yml_dict['log_retention_hours']
        self.affinity_hostname = yml_dict['affinity_hostname']
        self.node_hostname = yml_dict['node_hostname']
        self.deployment_name = yml_dict['deployment_name']

    def to_dict(self):
        return {
            'home_net': self.home_net,
            'interfaces': self.interfaces,
            'zeek_workers': self.zeek_workers,
            'log_retention_hours': self.log_retention_hours,
            'affinity_hostname': self.affinity_hostname,
            'node_hostname': self.node_hostname,
            'deployment_name': self.deployment_name
        }

    def __str__(self) -> str:
        return "home_net: %s interfaces: %s zeek_workers: %s log_retention_hours: %s affinity_hostname: %s node_hostname: %s deployment_name: %s" % (self.home_net, self.interfaces, self.zeek_workers, self.log_retention_hours, self.affinity_hostname, self.node_hostname, self.deployment_name )

class CatalogLogstash(object):
    """
    Represents a Logstash catalog object and all the variables inside it

    Attributes:
        replicas: Number of replicas
        kafka_clusters: An array of Kafka cluster URLs (with ports)
        heap_size: Size of heap in GB
        node_hostname: Name of sensor
        deployment_name: Name of the deployment set sent to Kubernetes
    """

    def __init__(self, yml_dict: Dict) -> None:
        self.replicas = yml_dict['replicas']
        self.kafka_clusters = yml_dict['kafka_clusters']
        self.heap_size = yml_dict['heap_size']
        self.node_hostname = yml_dict['node_hostname']
        self.deployment_name = yml_dict['deployment_name']

    def to_dict(self):
        return {
            'replicas': self.replicas,
            'kafka_clusters': self.kafka_clusters,
            'heap_size': self.heap_size,
            'node_hostname': self.node_hostname,
            'deployment_name': self.deployment_name
        }

    def __str__(self) -> str:
        return "replicas: %s kafka_clusters: %s heap_size: %s node_hostname: %s deployment_name: %s" % (self.replicas, self.kafka_clusters, self.heap_size, self.node_hostname, self.deployment_name )

class Node(object):

    #A static list of valid node types that are allowed
    valid_node_types = ("master_server", "remote_sensor", "controller", "sensor", "server")
    valid_sensor_types = ("remote_sensor", "sensor")
    valid_server_types = ("master_server", "server")
    valid_node_types_no_ctrl = valid_sensor_types + valid_server_types


    """
    Represents a single node object such as a controller, server or sensor

    Attributes:
        hostname: The hostname of the node
        type: The type of the node controller, server or sensor
        username: Username for login
        password: Password for login
        vm_to_clone: The name of the virtual machine to clone
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
        es_drives (List): A list of drives that we wish to select for the configuration.
        pcap_drives (List): A list of drives that we wish to select during our kit configuration.
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

        if node_type in Node.valid_node_types:
            self.type = node_type
        else:
            print("Node type %s is invalid for run." % node_type)
            exit(1)

        self.username = None
        self.password = None
        self.vm_to_clone = None
        self.guestos = None
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
        self.gateway = None
        self.dns_list = None
        self.es_drives = None
        self.pcap_drives = None
        self.suricata_catalog = None

    def set_vm_to_clone(self, vm_to_clone: str) -> None:
        """
        Sets the vm to clone name.

        :param vm_to_clone:
        :return:
        """
        self.vm_to_clone = vm_to_clone

    def set_guestos(self, guestos: str) -> None:
        """
        Sets the guest os for the node

        :param guestos: Guest OS for node login
        :return:
        """
        self.guestos = guestos

    def set_gateway(self, gateway: str) -> None:
        """
        Sets the gateway for a given node.

        :param gateway:
        :return:
        """
        self.gateway = gateway

    def set_dns_list(self, dns: List):
        """
        Set the dns list to the appropriate values.
        :param dns:
        :return:
        """
        self.dns_list = dns

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

    def set_es_drives(self, es_drives: List[str]) -> None:
        """
        Sets the es_drives for the node in question.

        :param es_drives:
        :return:
        """
        self.es_drives = es_drives

    def set_pcap_drives(self, pcap_drives: List[str]) -> None:
        """
        Sets the pcap_drives for the node.

        :param pcap_drives:
        :return:
        """
        self.pcap_drives = pcap_drives

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

    def set_suricata_catalog(self, suricata_catalog: Dict) -> None:
        """
        Configures the suricata catalog configuration for the node object.

        :param suricata_catalog:
        :return:
        """
        self.suricata_catalog = CatalogSuricata(suricata_catalog)

    def set_moloch_viewer_catalog(self, moloch_viewer_catalog: Dict) -> None:
        """
        Configures the suricata catalog configuration for the node object.

        :param suricata_catalog:
        :return:
        """
        self.moloch_viewer_catalog = CatalogMolochViewer(moloch_viewer_catalog)

    def set_moloch_capture_catalog(self, moloch_capture_catalog: Dict) -> None:
        """
        Configures the suricata catalog configuration for the node object.

        :param suricata_catalog:
        :return:
        """
        self.moloch_capture_catalog = CatalogMolochCapture(moloch_capture_catalog)

    def set_zeek_catalog(self, zeek_catalog: Dict) -> None:
        """
        Configures the zeek catalog configuration for the node object.

        :param zeek_catalog:
        :return:
        """
        self.zeek_catalog = CatalogZeek(zeek_catalog)

    def set_logstash_catalog(self, logstash_catalog: Dict) -> None:
        """
        Configures the logstash catalog configuration for the node object.

        :param logstash_catalog:
        :return:
        """
        self.logstash_catalog = CatalogLogstash(logstash_catalog)

    def set_management_interface_boot_mode(self, boot_mode: str) -> None:
        """
        Sets the boot_mode of the management interface

        :param boot_mode: The boot_mode of the management interface
        :return:
        """
        self.management_interface.set_boot_mode(boot_mode)

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

    def __init__(self, client: VsphereClient, node: Node, host_configuration: HostConfiguration) -> None:
        """
        Initializes a virtual machine object

        :param client: a vCenter server client
        :param node: An instance of a node object
        :param host_configuration (HostConfiguration): host_configuration object from yaml config
        :return:
        """

        self.client = client
        self.node = node
        self.vm_info = None  # type: VM.info
        self.node_instance = None  # type: Node
        self.host_configuration = host_configuration

        if node.iso_file is not None:
            self.iso_path = str(self.host_configuration.iso_folder_path) + node.iso_file  # type: str
        else:
            self.iso_path = None

        # Get a placement spec
        self.placement_spec = vm_placement_helper.get_placement_spec(
            self.client,
            self.host_configuration.datacenter,
            self.host_configuration.storage_folder,
            self.host_configuration.cluster_name,
            self.host_configuration.storage_datastore,
            self.host_configuration.resource_pool)  # type: PlacementSpec

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
                            self.host_configuration.datacenter))))
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
                            self.host_configuration.datacenter))))

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

        self.set_vm_info(self.vm)
        logging.debug('vm.get({}) -> {}'.format(self.vm, pp(self.vm_info)))

        return self.vm

    def set_vm_info(self, vm):
        self.vm_info = self.client.vcenter.VM.get(vm)

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

    def deleteCDROMs(self) -> None:
        """
        Removes the CD roms from the VM.
        :return None:
        """
        for cdrom in self.client.vcenter.vm.hardware.Cdrom.list(self.vm):
            print("Deleting CDROM " + str(cdrom.cdrom))
            self.client.vcenter.vm.hardware.Cdrom.delete(self.vm, cdrom.cdrom)

    def _change_password(self, remote_shell: Connection) -> None:
        # To get hash for a new password run the following bash command and make sure you escape special characters.
        # perl -e "print crypt('<Your Password>', "Q9"),"
        change_root_pwd = "usermod --password Q9sIxtbggUGaw root"
        change_assessor_pwd = "usermod --password Q9sIxtbggUGaw assessor"
        try:
            remote_shell.sudo(change_root_pwd)
            remote_shell.sudo(change_assessor_pwd, warn=True)
        except UnexpectedExit:
            # For some strange reason, the password files can be
            # locked so we release those locks before changing the password
            remote_shell.sudo('rm -f /etc/passwd.lock')
            remote_shell.sudo('rm -f /etc/shadow.lock')
            remote_shell.sudo(change_root_pwd)
            remote_shell.sudo(change_assessor_pwd, warn=True)

    def deleteExtraNics(self) -> None:
        """
        Deletes all NIcs except for the first one in the list.

        :return:
        """
        for index, nic in enumerate(self.client.vcenter.vm.hardware.Ethernet.list(self.vm)):
            if index == 0:
                continue
            self.client.vcenter.vm.hardware.Ethernet.delete(self.vm, nic.nic)

    def setNICsToInternal(self):
        """
        Sets all NICs on the controller to Internal network.
        """
        for nic in self.client.vcenter.vm.hardware.Ethernet.list(self.vm):
            backing = Ethernet.BackingSpec(type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                                           network=network_helper.get_distributed_network_backing(
                                            self.client,
                                            "Internal",
                                            self.host_configuration.datacenter))
            spec = Ethernet.UpdateSpec(backing=backing)
            self.client.vcenter.vm.hardware.Ethernet.update(self.vm, nic.nic, spec)

    def _update_network_scripts(self, iface_name: str, remote_shell: Connection):
        iface = ("TYPE=Ethernet\n"
                 "PROXY_METHOD=none\n"
                 "BROWSER_ONLY=no\n"
                 "BOOTPROTO=dhcp\n"
                 "DEFROUTE=yes\n"
                 "IPV4_FAILURE_FATAL=no\n"
                 "IPV6INIT=no\n"
                 "IPV6_AUTOCONF=yes\n"
                 "IPV6_DEFROUTE=yes\n"
                 "IPV6_FAILURE_FATAL=no\n"
                 "IPV6_ADDR_GEN_MODE=stable-privacy\n"
                 "NAME={}\n"
                 "ONBOOT=yes".format(iface_name))

        new_iface_file = StringIO(iface)
        remote_shell.sudo('find /etc/sysconfig -name "ifcfg-*" -not -name "ifcfg-lo" -delete')
        remote_shell.put(new_iface_file, '/etc/sysconfig/network-scripts/ifcfg-{}'.format(iface_name))

    def _run_reclaim_disk_space(self, remote_shell: Connection):
        remote_shell.sudo('dd if=/dev/zero of=/root/zerofillfile bs=1M; rm -rf /root/zerofillfile;')

    def _clear_history(self, remote_shell: Connection):
        remote_shell.sudo('cat /dev/null > /root/.bash_history')
        remote_shell.sudo('cat /dev/null > /home/assessor/.bash_history', warn=True)

    def _remove_extra_files(self, remote_shell: Connection):
        remote_shell.sudo('rm -rf /root/.ssh/*')
        remote_shell.sudo('rm -f /opt/tfplenum/.editorconfig')

    def prepare_for_export(self,
                           username: str,
                           password: str,
                           ctrl_ip: str,
                           iface_name: str):
        with FabricConnectionWrapper(username, password, ctrl_ip) as remote_shell:
            self._update_network_scripts(iface_name, remote_shell)
            self._remove_extra_files(remote_shell)
            self._change_password(remote_shell)
            self._run_reclaim_disk_space(remote_shell)
            self._clear_history(remote_shell)

    def export(self, destination: str="/root/controller.ova") -> None:
        """
        Runs the ovftool command that is used to export our controller to an OVA file.

        EX: ovftool --noSSLVerify vi://david.navarro%40sil.local@172.16.20.106/SIL_Datacenter/vm/Navarro/dnavtest2-controller.lan ~/Desktop/controller.ova
        :param destination: The destination to output too.

        :return:
        """
        self.set_vm_info(self.vm)
        dest = Path(destination)
        if dest.exists() and dest.is_file():
            dest.unlink()

        username = self.host_configuration.username.replace("@", "%40")
        cmd = ("ovftool --noSSLVerify vi://{username}:'{password}'@{vsphere_ip}"
               "/DEV_Datacenter/vm/{folder}/{vm_name} {destination}"
               .format(username=username,
                       password=self.host_configuration.password,
                       vsphere_ip=self.host_configuration.ip_address,
                       folder=self.host_configuration.storage_folder,
                       vm_name=self.vm_info.name,
                       destination=str(dest))
              )
        logging.info("Exporting OVA file to %s. This can take a few hours before it completes." % destination)
        proc = subprocess.Popen(shlex.split(cmd), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        sout, serr = proc.communicate()
        logging.info(sout)
        os.chmod(str(dest), 0o644)
        if serr:
            logging.error(serr)

    def get_macs(self) -> OrderedDict:
        """
        Gets a dictionary of the names of interfaces and their MAC addresses. Keep in mind this will only be populated
        after the machine has been turned on once.

        :return (OrderedDict): A dictionary of the names of interfaces and their MAC addresses
        """
        macs = OrderedDict()  # type: OrderedDict

        # nics is a dict with key str (interface name) and value is com.vmware.vcenter.vm.hardware_client.Ethernet.info
        self.set_vm_info(self.vm)
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
