#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import sys
import argparse
import logging
from collections import OrderedDict
from vmware.vapi.vsphere.client import VsphereClient
from lib.vm_utilities import create_vms, create_client, clone_vm, delete_vm
from lib.util import get_controller, configure_deployer, test_vms_up_and_alive, build_tfplenum, transform
from lib.ssh import SSH_client
from lib.model.kit import Kit
from lib.model.node import Node, Interface, Node_Disk

def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("config", help="The path to the configuration YAML file you want to load in")
    parser.add_argument("--controller", help="Specify this option if you want the controller built from a clone")
    args = parser.parse_args()

    kit_builder = logging.getLogger()
    kit_builder.setLevel(logging.INFO)
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    kit_builder.addHandler(ch)

    # Python dicts do not preserve order so we must use an ordered dictionary
    # If using 3.7+ this is not an issue as it is the default behavior
    configuration = OrderedDict()  # type: OrderedDict

    with open(sys.argv[1], 'r') as kit_schema:
        try:
            configuration = yaml.load(kit_schema)

            # Returns a list of kit objects
            kits = transform(configuration["kits"])

            #iso_folder_path = \
            #"[{}]".format(configuration["host_configuration"]["vcenter"]["iso_files"]["datastore"]) + \
            #'/' + configuration["host_configuration"]["vcenter"]["iso_files"]["folder"] + '/'  # type: str

        except yaml.YAMLError as exc:
            print(exc)

    vsphere_client = create_client(configuration)  # type: VsphereClient

    for kit in kits:

        controller_node = get_controller(kit)  # type: str

        if args.controller:
            delete_vm(vsphere_client, kit_configuration["VMs"][controller_node]["cloned_vm_name"])

            clone_vm(configuration,
                     kit_configuration["VMs"][controller_node]["vm_to_clone"],
                     kit_configuration["VMs"][controller_node]["cloned_vm_name"],
                     kit_configuration["VMs"][controller_node]["storage_options"]["folder"])

        logging.info("Creating VMs...")
        vms = create_vms(kit, vsphere_client)#, iso_folder_path)  # type: list

        logging.info("Grabbing management MAC addresses")
        for vm in vms:
            vm.power_on()

        management_mac = None  # type: str

        for vm in vms:

            # TODO: This just assumes the first interface is the management interface. We need to update this to be more
            # permanent
            macs = vm.get_macs()  # type: dict
            management_mac = next(iter(macs))
            management_mac = macs[management_mac]
            vm.power_off()
            logging.debug("Found management MAC address: " + management_mac)

            vm.get_node_instance().set_management_interface_mac(management_mac)

        logging.info("Configuring deployer...")
        configure_deployer(kit, controller_node)

        logging.info("Powering VMs on...")
        for vm in vms:
            vm.power_on()

        vms_to_test = []  # type: list

        for node in kit.nodes:
            if node.type != "controller":
                vms_to_test.append(node)

        test_vms_up_and_alive(kit, vms_to_test)

        build_tfplenum(kit, controller_node)

if __name__ == '__main__':
    main()
