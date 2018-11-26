#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import sys
import logging
import os

from argparse import ArgumentParser
from collections import OrderedDict
from vmware.vapi.vsphere.client import VsphereClient
from lib.vm_utilities import (create_vms, create_client, clone_vm,
                              delete_vm, change_network_port_group, change_ip_address)
from lib.util import get_controller, configure_deployer, test_vms_up_and_alive, build_tfplenum, transform, \
    get_interface_names, get_bootstrap, run_bootstrap
from lib.model.kit import Kit
from lib.model.node import Node, VirtualMachine
from lib.frontend_tester import run_kickstart_configuration, run_tfplenum_configuration
from typing import List
from lib.controller_modifier import ControllerModifier


def is_valid_file(path: str) -> bool:
    """
    Test to ensure the file in question being passed exists and is a file.

    :param path:
    :return:
    """
    if os.path.exists(path) and os.path.isfile(path):
        return True
    return False


def argparse() -> str:
    """
    Parses the arguments passed in by the user and
    returns the path to the file that is getting processed.
    
    If the file does not exist the program will terminate in this
    function.

    :return: The path to the yaml file on success
    """
    parser = ArgumentParser(description="Testy tester is the application where you can test your Kit Configuration.")
    parser.add_argument("-p", "--path", dest="filename", required=True,
                        help="Input yaml configuration file", metavar="FILE")
    args = parser.parse_args()
    if not is_valid_file(args.filename):
        parser.error("The file %s does not exist!" % args.filename)

    return args.filename


def main():
    config_path = argparse()
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

    with open(config_path, 'r') as kit_schema:
        try:
            configuration = yaml.load(kit_schema)
            di2e_username = configuration["DI2E"]["Username"]
            di2e_password = configuration["DI2E"]["Password"]

            # Returns a list of kit objects
            kits = transform(configuration["kits"])  # type: List[Kit]
        except yaml.YAMLError as exc:
            print(exc)

    vsphere_client = create_client(configuration)  # type: VsphereClient

    for kit in kits:
        controller_node = get_controller(kit)  # type: Node

        logging.info("Creating VMs...")
        vms = create_vms(kit, vsphere_client)  # , iso_folder_path)  # type: list

        logging.info("Grabbing management MAC addresses")
        for vm in vms:
            vm.power_on()

        for vm in vms:
            print(vm.get_node_instance().hostname)
            macs = vm.get_macs()  # type: OrderedDict
            macs_iter = iter(macs)  # type: iter
            management_mac = next(macs_iter)
            management_mac = macs[management_mac]  # type: str
            vm.get_node_instance().set_management_interface_mac(management_mac)
            for interface in vm.get_node_instance().interfaces:

                if interface.management_interface:
                    interface.set_mac_address(management_mac)

                if not interface.management_interface:
                    mac = next(macs_iter)
                    mac = macs[mac]  # type: str
                    interface.set_mac_address(mac)

            vm.power_off()

        logging.info("Deleting controller....")
        delete_vm(vsphere_client, controller_node.cloned_vm_name)

        logging.info("Cloning base rhel template for controller....")
        clone_vm(configuration, controller_node)

        change_network_port_group(configuration, controller_node)
        change_ip_address(configuration, controller_node)

        ctrl_vm = VirtualMachine(vsphere_client, controller_node, "/root/")
        ctrl_vm.power_on()

        vms_to_test = []  # type: List[Node]
        for node in kit.nodes:
            if node.type == "controller":
                vms_to_test.append(node)

        logging.info("Waiting for base rhel vm to boot...")
        test_vms_up_and_alive(kit, vms_to_test)



        logging.info("Downloading controller bootstrap...")
        get_bootstrap(controller_node, di2e_username, di2e_password)

        logging.info("Running controller bootstrap...")
        run_bootstrap(controller_node, di2e_username, di2e_password)

        ctrl_modifier = ControllerModifier(controller_node)
        ctrl_modifier.make_controller_changes()

        logging.info("Running frontend")
        logging.info("Configuring Kickstart")
        run_kickstart_configuration(kit.kickstart_configuration, kit.get_nodes(), controller_node.management_interface.ip_address)

        logging.info("Configuring deployer...")
        configure_deployer(kit, controller_node)

        logging.info("Powering VMs on...")
        for vm in vms:
            vm.power_on()

        vms_to_test = []  # type: List[Node]

        for node in kit.nodes:
            if node.type != "controller":
                vms_to_test.append(node)

        test_vms_up_and_alive(kit, vms_to_test)
        get_interface_names(kit)
        logging.info("Run TFPlenum configuration")
        run_tfplenum_configuration(kit, controller_node.management_interface.ip_address, "4200")
        #TODO we need logic here to wait for the cluter to come up or time out after a period of time.
        #We should also run the cluster integration tests from the system health page.


if __name__ == '__main__':
    main()
