#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import sys
import argparse
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
    #print(args.config)

    # Python dicts do not preserve order so we must use an ordered dictionary
    # If using 3.7+ this is not an issue as it is the default behavior
    configuration = OrderedDict()  # type: OrderedDict
    kit_configuration = OrderedDict()  # type: OrderedDict

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
        controller_node = get_controller(kit)        

        #if args.build_controller:
        #    delete_vm(vsphere_client, kit_configuration["VMs"][controller_name]["cloned_vm_name"])
    #
    #        clone_vm(configuration,
    #                 kit_configuration["VMs"][controller_name]["vm_to_clone"],
    #                 kit_configuration["VMs"][controller_name]["cloned_vm_name"],
    #                 kit_configuration["VMs"][controller_name]["storage_options"]["folder"])

        vms = create_vms(kit, vsphere_client)#, iso_folder_path)  # type: list

        configure_deployer(kit, controller_node)

        for vm in vms:
            vm.power_on()

        vms_to_test = []  # type: list

        for node in kit.nodes:
            if node.type != "controller":
                vms_to_test.append(node)

        test_vms_up_and_alive(kit_configuration, vms_to_test)

        build_tfplenum(kit_configuration, controller_node.hostname)

if __name__ == '__main__':
    main()
