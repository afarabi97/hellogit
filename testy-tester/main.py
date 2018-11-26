#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import sys
import logging
import os

from argparse import ArgumentParser, Namespace
from collections import OrderedDict
from vmware.vapi.vsphere.client import VsphereClient
from lib.vm_utilities import (create_vms, create_client, clone_vm,
                              delete_vm, change_network_port_group, change_ip_address)
from lib.util import (get_controller, test_vms_up_and_alive, transform,
    get_interface_names, get_bootstrap, run_bootstrap, perform_integration_tests)
from lib.model.kit import Kit
from lib.model.node import Node, VirtualMachine
from lib.frontend_tester import run_kickstart_configuration, run_tfplenum_configuration
from typing import List, Dict
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


class Runner:

    def __init__(self):
        self.args = None  # type: Namespace
        self.di2e_password = None  # type: str
        self.di2e_username = None  # type: str
        self.kits = None  # type: List[Kit]
        self.configuration = None  # type: Dict
        self.controller_node = None  # type: Node
        self.vsphere_client = None  # type: VsphereClient

    def _parse_args(self):
        """
        Parses the arguments passed in by the user and
        returns the path to the file that is getting processed.

        If the file does not exist the program will terminate in this
        function.

        :return: The path to the yaml file on success
        """
        parser = ArgumentParser(
            description="Testy tester is the application where you can test your Kit Configuration.")
        parser.add_argument("-p", "--path", dest="filename", required=True,
                            help="Input yaml configuration file", metavar="FILE")
        parser.add_argument('--run-all', dest='run_all', action='store_true')
        parser.add_argument('--setup-controller', dest='setup_controller', action='store_true')
        parser.add_argument('--run-kickstart', dest='run_kickstart', action='store_true')
        parser.add_argument('--run-kit', dest='run_kit', action='store_true')
        parser.add_argument('--run-integration-tests', dest='run_integration_tests', action='store_true')
        args = parser.parse_args()
        if not is_valid_file(args.filename):
            parser.error("The file %s does not exist!" % args.filename)
        self.args = args

    def _setup_logging(self):
        """
        Sets up the logger for this runner.

        :return:
        """
        kit_builder = logging.getLogger()
        kit_builder.setLevel(logging.INFO)
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        kit_builder.addHandler(ch)

    def _parse_config(self):
        """
        Parses the config file and sets up some class variables which
        are used in other private functions.

        :return:
        """
        # Python dicts do not preserve order so we must use an ordered dictionary
        # If using 3.7+ this is not an issue as it is the default behavior
        with open(self.args.filename, 'r') as kit_schema:
            try:
                self.configuration = yaml.load(kit_schema)
                self.di2e_username = self.configuration["DI2E"]["Username"]
                self.di2e_password = self.configuration["DI2E"]["Password"]

                # Returns a list of kit objects
                self.kits = transform(self.configuration["kits"])  # type: List[Kit]
            except yaml.YAMLError as exc:
                print(exc)

    def _perform_bootstrap(self, kit: Kit):
        """
        Executes the bootstrap logic needed to setup a fully functional controller.

        :param Kit:
        :return:
        """
        logging.info("Downloading controller bootstrap...")
        get_bootstrap(self.controller_node, self.di2e_username, self.di2e_password, kit.branch_name)

        logging.info("Running controller bootstrap...")
        run_bootstrap(self.controller_node, self.di2e_username, self.di2e_password, kit.branch_name)

        ctrl_modifier = ControllerModifier(self.controller_node)
        ctrl_modifier.make_controller_changes()

    def _setup_controller(self, kit: Kit):
        """
        Does everything that is needed to setup a fully functional controller.
        It deletes the controller if it already exists before cloning from a template.
        After which it configured networking based on the passed in yaml file.

        :param kit:
        :return:
        """
        if not self.args.setup_controller and not self.args.run_all:
            return

        logging.info("Deleting controller....")
        delete_vm(self.vsphere_client, self.controller_node.hostname)

        logging.info("Cloning base rhel template for controller....")
        clone_vm(self.configuration, self.controller_node)

        logging.info("Changing controller portgroup and IP Address...")
        change_network_port_group(self.configuration, self.controller_node)
        change_ip_address(self.configuration, self.controller_node)

        logging.info("Powering the controller")
        ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, "/root/")
        ctrl_vm.power_on()

        logging.info("Waiting for controller to become alive...")
        test_vms_up_and_alive(kit, [self.controller_node], 20)
        self._perform_bootstrap(kit)

    def _power_on_vms(self, vms: List[VirtualMachine]):
        """
        Powers on a list of passed in vms.

        :param vms:
        :return:
        """
        logging.info("Grabbing management MAC addresses")
        for vm in vms:
            vm.power_on()

    def _power_off_vms(self, vms: List[VirtualMachine]):
        """
        Powers off a list of passed in vms.

        :param vms:
        :return:
        """
        for vm in vms:
            vm.power_off()

    def _set_vm_macs(self, vms: List[VirtualMachine]):
        """
        Sets the mac addresses of a list of powered on vms.

        :param vms:
        :return:
        """
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

    def _run_kickstart(self, kit: Kit):
        """
        Performs the needed operations to Kickstart any and all vms mentions in
        the passed in kit.

        :param kit:
        :return:
        """
        if not self.args.run_kickstart and not self.args.run_all:
            return

        logging.info("Creating VMs...")
        vms = create_vms(kit, self.vsphere_client)  # , iso_folder_path)  # type: list
        self._power_on_vms(vms)
        self._set_vm_macs(vms)
        self._power_off_vms(vms)

        logging.info("Configuring Kickstart")
        run_kickstart_configuration(kit, self.controller_node.management_interface.ip_address)
        self._power_on_vms(vms)

        logging.info("Waiting for servers and sensors to become alive...")
        test_vms_up_and_alive(kit, kit.nodes, 30)

    def _run_kit(self, kit: Kit):
        """
        Performs the needed operations to run a kit assuming kickstart has already run, etc.

        :param kit:
        :return:
        """
        if not self.args.run_kit and not self.args.run_all:
            return

        logging.info("Waiting for servers and sensors to start up.")
        test_vms_up_and_alive(kit, kit.nodes, 30)
        get_interface_names(kit)
        logging.info("Run TFPlenum configuration")
        run_tfplenum_configuration(kit, self.controller_node.management_interface.ip_address, "4200")

    def _run_integration(self, kit: Kit):
        """
        Runs the integration tests.

        :param kit:
        :return:
        """
        if not self.args.run_integration_tests and not self.args.run_all:
            return

        perform_integration_tests(self.controller_node, kit.password)

    def execute(self):
        """
        Does the full or partial execution of cluster setup, and integration tests.

        :return:
        """
        self._parse_args()
        self._setup_logging()
        self._parse_config()
        self.vsphere_client = create_client(self.configuration)  # type: VsphereClient

        for kit in self.kits:
            self.controller_node = get_controller(kit)  # type: Node
            self._setup_controller(kit)
            self._run_kickstart(kit)
            self._run_kit(kit)
            self._run_integration(kit)


def main():
    runner = Runner()
    runner.execute()


if __name__ == '__main__':
    main()
