
__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

from vmware.vapi.vsphere.client import VsphereClient
from com.vmware.vcenter.vm.hardware.boot_client import Device as BootDevice
from com.vmware.vcenter.vm.hardware_client import (
    Cpu, Memory, Disk, Ethernet, Cdrom, Boot)
from com.vmware.vcenter.vm.hardware_client import ScsiAddressSpec
from com.vmware.vcenter.vm_client import (Hardware, Power)
from com.vmware.vcenter_client import VM

from vsphere.common.ssl_helper import get_unverified_session
from vsphere.common import sample_cli
from vsphere.common import sample_util
from vsphere.common.sample_util import pp
from vsphere.vcenter.helper import network_helper
from vsphere.vcenter.helper import vm_placement_helper
from vsphere.vcenter.helper.vm_helper import get_vm

class Virtual_Machine(object):

    def __init__(self, client: VsphereClient, vm_spec: dict, vm_name: str, iso_folder_path: str) -> None:
        """
        Initializes a virtual machine object

        :param client (VsphereClient): a vCenter server client
        :param vm_spec (dict): The schema of a virtual machine
        :param vm_name (str): The name of the virtual machine
        :param iso_folder_path (str): Path to the ISO files folder
        :return:
        """

        self.client = client # type: VsphereClient

        self.vm_spec = vm_spec # type: dict

        self.iso_path = iso_folder_path + self.vm_spec["iso_file"] # type: str

        # Get a placement spec
        self.placement_spec = vm_placement_helper.get_placement_spec_for_resource_pool(
            self.client,
            self.vm_spec["storage_options"]["datacenter"],
            self.vm_spec["storage_options"]["folder"],
            self.vm_spec["storage_options"]["datastore"]) # type: PlacementSpec

        # Get a standard network backing
        self.standard_network = network_helper.get_standard_network_backing(
            self.client,
            self.vm_spec["networking"]["std_portgroup_name"],
            self.vm_spec["storage_options"]["datacenter"]) # type: str

        # Get a distributed network backing
        self.distributed_network = network_helper.get_distributed_network_backing(
            self.client,
            self.vm_spec["networking"]["dv_portgroup_name"],
            self.vm_spec["storage_options"]["datacenter"]) # type: str

        self.vm_name = vm_name

    def create(self) -> str:
        """
        Create the VM

        :return: Returns a string with the schema of the VM
        """

        GiB = 1024 * 1024 * 1024 # type: int
        GiBMemory = 1024 # type: int

        # Create a list of the VM's disks
        disks = [] # type: list
        for disk_name, capacity in self.vm_spec["disks"].items():
            disks.append(Disk.CreateSpec(type=Disk.HostBusAdapterType.SCSI,
                scsi=ScsiAddressSpec(bus=0, unit=0),
                new_vmdk=Disk.VmdkCreateSpec(name=disk_name,
                                             capacity=capacity * GiB)),)

        # Create a list of the VM's NICs
        nics = [] # type: list
        for nic in self.vm_spec["networking"]["nics"].keys():
            if(self.vm_spec["networking"]["nics"][nic]["mac_auto_generated"]):
                nics.append(Ethernet.CreateSpec(
                    start_connected=self.vm_spec["networking"]["nics"][nic]["start_connected"],
                    mac_type=Ethernet.MacAddressType.GENERATED,
                    backing=Ethernet.BackingSpec(
                        type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                        network=self.distributed_network)))
            else:
                nics.append(Ethernet.CreateSpec(
                    start_connected=self.vm_spec["networking"]["nics"][nic]["start_connected"],
                    mac_type=Ethernet.MacAddressType.MANUAL,
                    mac_address=self.vm_spec["networking"]["nics"][nic]["mac_address"],
                    backing=Ethernet.BackingSpec(
                        type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                        network=self.distributed_network)))

        # Create the boot order for the VM
        boot_devices = [] # type: list
        for item in self.vm_spec["boot_order"]:
            if item == "CDROM":
                boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.CDROM))
            elif item == "DISK":
                boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.DISK))
            else:
                boot_devices.append(BootDevice.EntryCreateSpec(BootDevice.Type.ETHERNET))

        vm_create_spec = VM.CreateSpec(
            guest_os=self.vm_spec["vm_guestos"],
            name=self.vm_name,
            placement=self.placement_spec,
            hardware_version=Hardware.Version.VMX_11,
            cpu=Cpu.UpdateSpec(count=self.vm_spec["cpu_spec"]["sockets"],
                               cores_per_socket=self.vm_spec["cpu_spec"]["cores_per_socket"],
                               hot_add_enabled=self.vm_spec["cpu_spec"]["hot_add_enabled"],
                               hot_remove_enabled=self.vm_spec["cpu_spec"]["hot_remove_enabled"]),
            memory=Memory.UpdateSpec(size_mib=self.vm_spec["memory_spec"]["size"] * GiBMemory,
                                     hot_add_enabled=self.vm_spec["memory_spec"]["hot_add_enabled"]),
            disks=disks,
            nics=nics,
            cdroms=[
                Cdrom.CreateSpec(
                    start_connected=True,
                    backing=Cdrom.BackingSpec(type=Cdrom.BackingType.ISO_FILE,
                                              iso_file=self.iso_path)
                )
            ],
            boot=Boot.CreateSpec(type=Boot.Type.BIOS,
                                 delay=0,
                                 enter_setup_mode=False
                                 ),
            # TODO Should DISK be put before CDROM and ETHERNET?  Does the BIOS
            # automatically try the next device if the DISK is empty?
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
