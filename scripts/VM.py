
__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

from vmware.vapi.vsphere.client import create_vsphere_client
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
from vsphere.vcenter.setup import testbed

class Virtual_Machine(object):

    def __init__(self, client, placement_spec=None,
                 standard_network=None, distributed_network=None):
        self.client = client
        self.placement_spec = placement_spec
        self.standard_network = standard_network
        self.distributed_network = distributed_network
        self.vm_name = testbed.config['VM_NAME_EXHAUSTIVE']
        self.cleardata = None

    def run(self):
        # Get a placement spec
        datacenter_name = testbed.config['VM_DATACENTER_NAME']
        vm_folder_name = testbed.config['VM_FOLDER1_NAME']
        datastore_name = testbed.config['VM_DATASTORE_NAME']
        std_portgroup_name = testbed.config['STDPORTGROUP_NAME']
        dv_portgroup_name = testbed.config['VDPORTGROUP1_NAME']

        if not self.placement_spec:
            self.placement_spec = vm_placement_helper.get_placement_spec_for_resource_pool(
                self.client,
                datacenter_name,
                vm_folder_name,
                datastore_name)

        # Get a standard network backing
        if not self.standard_network:
            self.standard_network = network_helper.get_standard_network_backing(
                self.client,
                std_portgroup_name,
                datacenter_name)

        # Get a distributed network backing
        if not self.distributed_network:
            self.distributed_network = network_helper.get_distributed_network_backing(
                self.client,
                dv_portgroup_name,
                datacenter_name)

        guest_os = testbed.config['VM_GUESTOS']
        iso_datastore_path = testbed.config['ISO_DATASTORE_PATH']
        serial_port_network_location = \
            testbed.config['SERIAL_PORT_NETWORK_SERVER_LOCATION']

        GiB = 1024 * 1024 * 1024
        GiBMemory = 1024

        vm_create_spec = VM.CreateSpec(
            guest_os=guest_os,
            name=self.vm_name,
            placement=self.placement_spec,
            hardware_version=Hardware.Version.VMX_11,
            cpu=Cpu.UpdateSpec(count=2,
                               cores_per_socket=1,
                               hot_add_enabled=False,
                               hot_remove_enabled=False),
            memory=Memory.UpdateSpec(size_mib=4 * GiBMemory,
                                     hot_add_enabled=False),
            disks=[
                Disk.CreateSpec(type=Disk.HostBusAdapterType.SCSI,
                                scsi=ScsiAddressSpec(bus=0, unit=0),
                                new_vmdk=Disk.VmdkCreateSpec(name='boot',
                                                             capacity=20 * GiB)),
                Disk.CreateSpec(new_vmdk=Disk.VmdkCreateSpec(name='data1',
                                                             capacity=20 * GiB)),
            ],
            nics=[
                Ethernet.CreateSpec(
                    start_connected=True,
                    mac_type=Ethernet.MacAddressType.GENERATED,
                    backing=Ethernet.BackingSpec(
                        type=Ethernet.BackingType.DISTRIBUTED_PORTGROUP,
                        network=self.distributed_network)),
            ],
            cdroms=[
                Cdrom.CreateSpec(
                    start_connected=True,
                    backing=Cdrom.BackingSpec(type=Cdrom.BackingType.ISO_FILE,
                                              iso_file=iso_datastore_path)
                )
            ],
            boot=Boot.CreateSpec(type=Boot.Type.BIOS,
                                 delay=0,
                                 enter_setup_mode=False
                                 ),
            # TODO Should DISK be put before CDROM and ETHERNET?  Does the BIOS
            # automatically try the next device if the DISK is empty?
            boot_devices=[
                BootDevice.EntryCreateSpec(BootDevice.Type.CDROM),
                BootDevice.EntryCreateSpec(BootDevice.Type.DISK),
                BootDevice.EntryCreateSpec(BootDevice.Type.ETHERNET)
            ]
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

    def cleanup(self):
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
        vm = get_vm(self.client, self.vm_name)
        if vm:
            print('Powering on the Deployer Test VM')
            self.client.vcenter.vm.Power.start(vm)
            print('vm.Power.start({})'.format(vm))
