"""
Module used for creating and manipulating virtual machines
"""

__vcenter_version__ = '6.7c'

from collections import OrderedDict

from vmware.vapi.vsphere.client import VsphereClient
from com.vmware.vcenter.vm.hardware.boot_client import Device as BootDevice
from com.vmware.vcenter.vm.hardware_client import (
    Cpu, Memory, Disk, Ethernet, Cdrom, Boot)
from com.vmware.vcenter.vm_client import (Hardware, Power)
from com.vmware.vcenter_client import VM

from lib.vsphere.common.sample_util import pp
from lib.vsphere.vcenter.helper import network_helper
from lib.vsphere.vcenter.helper import vm_placement_helper
from lib.vsphere.vcenter.helper.vm_helper import get_vm
from lib.model.kit import Kit
from lib.model.node import Node, Interface, Node_Disk


class VirtualMachine:
    """
    Represents a single virtual machine

    Attributes:
        client (VsphereClient): A client object which allows interaction with vCenter
        vm_spec (OrderedDict): A dictionary created from the yaml configuration file
                               containing the totality of the VM's configuration options
        iso_path (str): The path to the ISO file we will use for this VM on the server
        placement_spec (PlacementSpec): Defines the location in which vCenter will
                                        place the VM
        vm_name (str): The name of the virtual machine as it appears in vCenter
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

        self.client = client # type: VsphereClient

        self.vm_spec = node # type: Node

        if node.iso_file is not None:
            self.iso_path = iso_folder_path + node.iso_file # type: str
        else:
            self.iso_path = None

        # Get a placement spec
        self.placement_spec = vm_placement_helper.get_placement_spec_for_resource_pool(
            self.client,
            node.storage_datacenter,
            node.storage_folder,
            node.storage_datastore) # type: PlacementSpec

        # Get a standard network backing
        # TODO: Left it here just in case we swap to a non distributed switch
        # based network
        #self.standard_network = network_helper.get_standard_network_backing(
        #    self.client,
        #    self.vm_spec["networking"]["std_portgroup_name"],
        #    self.vm_spec["storage_options"]["datacenter"]) # type: str

        self.vm_name = node.hostname # type: str

    def create(self) -> str:
        """
        Create the VM

        :return: Returns a string with the schema of the VM
        """

        GiB = 1024 * 1024 * 1024 # type: int
        GiBMemory = 1024 # type: int

        cpu=Cpu.UpdateSpec(count=self.vm_spec.cpu_sockets,
                           cores_per_socket=self.vm_spec.cores_per_socket,
                           hot_add_enabled=self.vm_spec.cpu_hot_add_enabled,
                           hot_remove_enabled=self.vm_spec.cpu_hot_remove_enabled)

        memory=Memory.UpdateSpec(size_mib=self.vm_spec.memory_size * GiBMemory,
                                 hot_add_enabled=self.vm_spec.memory_hot_add_enabled)

        # Create a list of the VM's disks
        disks = []  # type: list
        for disk in self.vm_spec.disks:
            disks.append(Disk.CreateSpec(
                new_vmdk=Disk.VmdkCreateSpec(name=disk.name,
                                             capacity=disk.size * GiB)))

        # Create a list of the VM's NICs
        nics = []  # type: list
        for interface in self.vm_spec.interfaces:        
            if interface.mac_auto_generated:
                nics.append(Ethernet.CreateSpec(
                    start_connected=interface.start_connected,
                    mac_type=Ethernet.MacAddressType.GENERATED,
                    backing=Ethernet.BackingSpec(
                        type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                        network=interface.dv_portgroup_name)))
            else:
                nics.append(Ethernet.CreateSpec(
                    start_connected=interface.start_connected,
                    mac_type=Ethernet.MacAddressType.MANUAL,
                    mac_address=interface.mac_address,
                    backing=Ethernet.BackingSpec(
                        type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                        network=interface.dv_portgroup_name)))

        # Only create a CDROM drive if the user put an iso as part of their
        # configuration
        if self.iso_path is not None:
            cdroms=[
                Cdrom.CreateSpec(
                    start_connected=True,
                    backing=Cdrom.BackingSpec(type=Cdrom.BackingType.ISO_FILE,
                                              iso_file=self.iso_path)
                )
            ]
        else:
            cdroms = None

        boot=Boot.CreateSpec(type=Boot.Type.BIOS, delay=0, enter_setup_mode=False)

        # Create the boot order for the VM
        boot_devices = [] # type: list
        for item in self.vm_spec.boot_order:
            if item == "CDROM":
                if self.iso_path is not None:
                    boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.CDROM))
            elif item == "DISK":
                boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.DISK))
            else:
                boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.ETHERNET))

        vm_create_spec = VM.CreateSpec(
            guest_os=self.vm_spec.guestos,
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

        print('Creating a VM using spec\n-----')
        print(pp(vm_create_spec))
        print('-----')

        vm = self.client.vcenter.VM.create(vm_create_spec)

        print("Create Deployer Test VM: Created VM '{}' ({})".format(self.vm_name,
                                                                  vm))

        vm_info = self.client.vcenter.VM.get(vm)
        print('vm.get({}) -> {}'.format(vm, pp(vm_info)))

        return vm

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
            print("Deleting VM '{}' ({})".format(self.vm_name, vm))
            self.client.vcenter.VM.delete(vm)

    def power_on(self):
        """
        Powers the VM on

        :return:
        """
        vm = get_vm(self.client, self.vm_name)
        if vm:
            print('Powering on ' + self.vm_name)
            self.client.vcenter.vm.Power.start(vm)
            print('vm.Power.start({})'.format(vm))
