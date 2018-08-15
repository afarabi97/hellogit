#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

"""
from com.vmware.vcenter.vm.hardware.boot_client import Device as BootDevice
from com.vmware.vcenter.vm.hardware_client import (
    Cpu, Memory, Disk, Ethernet, Cdrom, Serial, Parallel, Floppy, Boot)
from com.vmware.vcenter.vm.hardware_client import ScsiAddressSpec
from com.vmware.vcenter.vm_client import (Hardware, Power)
from com.vmware.vcenter_client import VM
"""

import requests
import urllib3
from vmware.vapi.vsphere.client import create_vsphere_client

from VM import Deployer_VM

def main():

    session = requests.session()

    # Disable cert verification for demo purpose.
    # This is not recommended in a production environment.
    session.verify = False

    # Disable the secure connection warning for demo purpose.
    # This is not recommended in a production environment.
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # Connect to a vCenter Server using username and password
    vsphere_client = create_vsphere_client(server='172.16.70.5',
    username='administrator@vcenter.lan', password='', session=session)

    # List all VMs inside the vCenter Server
    #print(vsphere_client.vcenter.VM.list())

    create_deployer_vm = Deployer_VM(client=vsphere_client)
    create_deployer_vm.cleanup()
    create_deployer_vm.run()
    if create_deployer_vm.cleardata:
        create_deployer_vm.cleanup()
    create_deployer_vm.power_on()


if __name__ == '__main__':
    main()
