"""
* *******************************************************
* Copyright (c) VMware, Inc. 2016-2018. All Rights Reserved.
* SPDX-License-Identifier: MIT
* *******************************************************
*
* DISCLAIMER. THIS PROGRAM IS PROVIDED TO YOU "AS IS" WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, WHETHER ORAL OR WRITTEN,
* EXPRESS OR IMPLIED. THE AUTHOR SPECIFICALLY DISCLAIMS ANY IMPLIED
* WARRANTIES OR CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY,
* NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE.
"""

__author__ = 'VMware, Inc.'
__vcenter_version__ = '6.5+'

import lib.vsphere.vcenter.vm.hardware.adapter.sata
import lib.vsphere.vcenter.vm.hardware.adapter.scsi
import lib.vsphere.vcenter.vm.hardware.boot
import lib.vsphere.vcenter.vm.hardware.boot_device
import lib.vsphere.vcenter.vm.hardware.cdrom
import lib.vsphere.vcenter.vm.hardware.cpu
import lib.vsphere.vcenter.vm.hardware.disk
import lib.vsphere.vcenter.vm.hardware.ethernet
import lib.vsphere.vcenter.vm.hardware.floppy
import lib.vsphere.vcenter.vm.hardware.memory
import lib.vsphere.vcenter.vm.hardware.parallel
import lib.vsphere.vcenter.vm.hardware.serial
from lib.vsphere.vcenter.setup import testbed

from lib.vsphere.vcenter.helper.vm_helper import get_vm


def setup(context):
    print('Setup vcenter.vm.hardware Samples Started')
    lib.vsphere.vcenter.vm.hardware.cpu.setup(context)
    lib.vsphere.vcenter.vm.hardware.memory.setup(context)
    lib.vsphere.vcenter.vm.hardware.disk.setup(context)
    lib.vsphere.vcenter.vm.hardware.adapter.sata.setup(context)
    lib.vsphere.vcenter.vm.hardware.adapter.scsi.setup(context)
    lib.vsphere.vcenter.vm.hardware.boot.setup(context)
    lib.vsphere.vcenter.vm.hardware.boot_device.setup(context)
    lib.vsphere.vcenter.vm.hardware.cdrom.setup(context)
    lib.vsphere.vcenter.vm.hardware.ethernet.setup(context)
    lib.vsphere.vcenter.vm.hardware.floppy.setup(context)
    lib.vsphere.vcenter.vm.hardware.serial.setup(context)
    lib.vsphere.vcenter.vm.hardware.parallel.setup(context)
    print('Setup vcenter.vm.hardware Samples Complete\n')


def cleanup():
    print('Cleanup vcenter.vm.hardware Samples Started')
    lib.vsphere.vcenter.vm.hardware.cpu.cleanup()
    lib.vsphere.vcenter.vm.hardware.memory.cleanup()
    lib.vsphere.vcenter.vm.hardware.disk.cleanup()
    lib.vsphere.vcenter.vm.hardware.adapter.sata.cleanup()
    lib.vsphere.vcenter.vm.hardware.adapter.scsi.cleanup()
    lib.vsphere.vcenter.vm.hardware.boot.cleanup()
    lib.vsphere.vcenter.vm.hardware.boot_device.cleanup()
    lib.vsphere.vcenter.vm.hardware.cdrom.cleanup()
    lib.vsphere.vcenter.vm.hardware.ethernet.cleanup()
    lib.vsphere.vcenter.vm.hardware.floppy.cleanup()
    lib.vsphere.vcenter.vm.hardware.serial.cleanup()
    lib.vsphere.vcenter.vm.hardware.parallel.cleanup()
    print('Cleanup vcenter.vm.hardware Samples Complete\n')


def validate(context):
    print('Validating and Detecting Resources in vcenter.vm.hardware Samples')
    names = set([testbed.config['VM_NAME_DEFAULT'],
                 testbed.config['VM_NAME_BASIC'],
                 testbed.config['VM_NAME_EXHAUSTIVE']])
    valid = True
    for name in names:
        if not get_vm(context.client, name):
            valid = False
    if not valid:
        raise Exception('==> Samples Setup validation failed: '
                        'Missing VMs required to run hardware samples')
    print('==> Samples Setup validated')


def run():
    ###########################################################################
    # Incremental device CRUDE + connect/disconnect samples
    #
    # Choose any combination of the following incremental hardware examples.
    # Each one will return the VM to its original configuration.
    #
    # * CPU update sample
    # * Memory update sample
    # * Disk CRUD sample
    # * Ethernet CRUD sample
    # * CDROM CRUD sample
    # * SCSI adapter sample
    # * SATA adapter sample
    # * Serial Port CRUD sample
    # * Parallel Port CRUD sample
    # * Floppy CRUD sample
    # * Boot configuration sample
    # * Boot Device configuration sample
    ###########################################################################
    print('#' * 79)
    print('# vcenter.vm.hardware Samples')
    print('#' * 79)
    lib.vsphere.vcenter.vm.hardware.cpu.run()
    lib.vsphere.vcenter.vm.hardware.memory.run()
    lib.vsphere.vcenter.vm.hardware.disk.run()
    lib.vsphere.vcenter.vm.hardware.adapter.sata.run()
    lib.vsphere.vcenter.vm.hardware.adapter.scsi.run()
    lib.vsphere.vcenter.vm.hardware.boot.run()
    lib.vsphere.vcenter.vm.hardware.boot_device.run()
    lib.vsphere.vcenter.vm.hardware.cdrom.run()
    lib.vsphere.vcenter.vm.hardware.ethernet.run()
    lib.vsphere.vcenter.vm.hardware.floppy.run()
    lib.vsphere.vcenter.vm.hardware.serial.run()
    lib.vsphere.vcenter.vm.hardware.parallel.run()

    ###########################################################################
    # Virtual Hardware Upgrade Sample
    #
    # TODO Not implemented
    ###########################################################################

    ###########################################################################
    # Hot Add Samples
    # * Hot add disk
    # * Hot add cdrom
    # * ...
    # TODO Not implemented
    ###########################################################################
