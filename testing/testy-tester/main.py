#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import sys
import logging
import os

from argparse import ArgumentParser, Namespace
from collections import OrderedDict
from com.vmware.vapi.std.errors_client import AlreadyInDesiredState
from vmware.vapi.vsphere.client import VsphereClient
from lib.vm_utilities import (destroy_vms, destroy_and_create_vms, create_client, clone_vm,
                              delete_vm, change_network_port_group, change_ip_address, get_vms, get_all_vms)
from lib.util import (get_node, get_nodes, test_vms_up_and_alive, transform, get_bootstrap,
                      run_bootstrap, perform_integration_tests, get_interface_name, change_remote_sensor_ip)
from lib.model.kit import Kit
from lib.model.node import Node, VirtualMachine
from lib.model.host_configuration import HostConfiguration
from lib.frontend_tester import KickstartSeleniumRunner, KitSeleniumRunner
from lib.api_tester import APITester
from typing import List, Dict
from lib.controller_modifier import ControllerModifier
from lib.kubernetes_utilities import wait_for_pods_to_be_alive


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
        self.kit = None  # type: Kit
        self.configuration = None  # type: Dict
        self.controller_node = None  # type: Node
        self.vsphere_client = None  # type: VsphereClient
        self.host_configuration = None  # type: HostConfiguration

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
        parser.add_argument('--export-controller', dest='export_controller', action='store_true')
        parser.add_argument('--run-kickstart', dest='run_kickstart', action='store_true')
        parser.add_argument('--run-kit', dest='run_kit', action='store_true')
        parser.add_argument('--run-add-node', dest='run_add_node', action='store_true')
        parser.add_argument('--run-integration-tests', dest='run_integration_tests', action='store_true')
        parser.add_argument('--simulate-powerfailure', dest='simulate_powerfailure', action='store_true')
        parser.add_argument('--cleanup', dest='cleanup_kit', action='store_true')
        parser.add_argument('--headless', dest='is_headless', action='store_true')
        parser.add_argument('--tfplenum-commit-hash', dest='tfplenum_commit_hash')
        parser.add_argument("-vu", "--vcenter-username", dest="vcenter_username", required=True,
                            help="A username to the vcenter hosted on our local network.")
        parser.add_argument("-vp", "--vcenter-password", dest="vcenter_password", required=True,
                            help="A password to the vcenter hosted on our local network.")
        parser.add_argument("-du", "--di2e-username", dest="di2e_username", required=True,
                            help="A username to the DI2E git repo.")
        parser.add_argument("-dp", "--di2e-password", dest="di2e_password", required=True,
                            help="A password to the DI2E git repo.")

        args = parser.parse_args()
        if not is_valid_file(args.filename):
            parser.error("The file %s does not exist!" % args.filename)
        self.args = args
        self.di2e_username = self.args.di2e_username
        self.di2e_password = self.args.di2e_password

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
                self.host_configuration = HostConfiguration(self.configuration["host_configuration"]["vcenter"]["ip_address"],
                self.configuration["host_configuration"]["vcenter"]["cluster_name"],
                self.configuration["host_configuration"]["vcenter"]["datacenter"],
                self.args.vcenter_username,
                self.args.vcenter_password,
                self.configuration["host_configuration"]["iso_folder_path"])  # type: HostConfiguration

                self.host_configuration.set_storage_options(self.configuration["host_configuration"]["storage"]["datastore"],
                self.configuration["host_configuration"]["storage"]["folder"])

                # Returns a list of kit objects
                self.kit = transform(self.configuration["kit"])  # type: Kit

                if self.args.tfplenum_commit_hash is not None:
                    self.kit.set_branch_name(self.args.tfplenum_commit_hash)

            except yaml.YAMLError as exc:
                print(exc)

    def _perform_bootstrap(self):
        """
        Executes the bootstrap logic needed to setup a fully functional controller.
        
        :return:
        """
        logging.info("Downloading controller bootstrap...")
        get_bootstrap(self.controller_node, self.di2e_username, self.kit, self.di2e_password)

        logging.info("Running controller bootstrap...")
        run_bootstrap(self.controller_node, self.di2e_username, self.di2e_password, self.kit)

    def _setup_controller(self):
        """
        Does everything that is needed to setup a fully functional controller.
        It deletes the controller if it already exists before cloning from a template.
        After which it configured networking based on the passed in yaml file.
        
        :return:
        """
        if not self.args.setup_controller and not self.args.run_all:
            return

        logging.info("Deleting controller....")
        delete_vm(self.vsphere_client, self.controller_node.hostname)

        logging.info("Cloning base rhel template for controller....")
        clone_vm(self.host_configuration, self.controller_node)

        logging.info("Changing controller portgroup and IP Address...")
        change_network_port_group(self.host_configuration, self.controller_node)
        change_ip_address(self.host_configuration, self.controller_node)

        logging.info("Powering the controller")
        ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, self.host_configuration)
        ctrl_vm.power_on()

        logging.info("Waiting for controller to become alive...")
        test_vms_up_and_alive(self.kit, [self.controller_node], 20)

        ctrl_modifier = ControllerModifier(self.controller_node)
        ctrl_modifier.change_hostname()
        self._perform_bootstrap()

    def _export_controller(self):
        logging.info("Exporting the controller to OVA.")
        if not self.args.export_controller and not self.args.run_all:
            return

        logging.info("Powering on the controller")
        ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, self.host_configuration)
        try:
            ctrl_vm.power_on()
        except AlreadyInDesiredState:
            logging.info("Controller %s is already in desired state skipping this step" % ctrl_vm.vm_name)

        test_vms_up_and_alive(self.kit, [self.controller_node], 10)
        ctrl_vm.change_password(self.kit.username, 
                                self.kit.password, 
                                self.controller_node.management_interface.ip_address)

        ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, self.host_configuration)
        try:
            ctrl_vm.power_off()
        except AlreadyInDesiredState:
            logging.info("Controller %s is already in desired state skipping this step" % ctrl_vm.vm_name)

        ctrl_vm.deleteCDROMs()
        ctrl_vm.deleteExtraNics()
        ctrl_vm.setNICsToInternal()
        ctrl_vm.export()

    def _power_on_vms(self, vms: List[VirtualMachine]):
        """
        Powers on a list of passed in vms.

        # :param vms:#
        :return:
        """
        logging.info("Grabbing management MAC addresses")
        for vm in vms:
            try:
                vm.power_on()
            except:
                pass

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

    def _get_interface_name(self):
        logging.info("Get monitor interface name")
        get_interface_name(self.kit.get_nodes())

    def controller_modifier(self):
        ctrl_modifier = ControllerModifier(self.controller_node)
        ctrl_modifier.make_controller_changes()

    def power_on_controller(self):
        """
        Powers on teh controller node.

        :return:
        """
        logging.info("Modifying Controller")
        ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, self.host_configuration)
        try:
            ctrl_vm.power_on()
        except:
            pass
        self.controller_modifier()

    def _update_remote_sensors(self):
        """
        Change the portgroup for remote sensor

        :return:        
        """
        remote_sensors = get_nodes(self.kit, "remote_sensor")  # type: list
        for node in remote_sensors:
            logging.info("Updating " + node.hostname + " networking")
            change_remote_sensor_ip(self.kit, node)
            vm = VirtualMachine(self.vsphere_client, node, self.host_configuration)
            vm.power_off()
            change_network_port_group(self.host_configuration, node, self.kit.remote_sensor_portgroup)
            vm.power_on()

        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)

    def _run_kickstart(self):
        """
        Performs the needed operations to Kickstart any and all vms mentions in
        the kit.
        
        :return:
        """
        if not self.args.run_kickstart and not self.args.run_all:
            return

        self.power_on_controller()
        logging.info("Creating VMs...")
        vms = destroy_and_create_vms(self.kit.get_nodes(), self.vsphere_client, self.host_configuration)  # type: list
        self._power_on_vms(vms)
        self._set_vm_macs(vms)
        self._power_off_vms(vms)

        logging.info("Configuring Kickstart")
        # runner = KickstartSeleniumRunner(self.args.is_headless, self.controller_node.management_interface.ip_address)
        # runner.run_kickstart_configuration(kit)
        runner = APITester(self.controller_node.management_interface.ip_address, self.kit)
        runner.run_kickstart_api_call()
        self._power_on_vms(vms)
        logging.info("Waiting for servers and sensors to become alive...")
        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)

    def _run_kit(self):
        """
        Performs the needed operations to run a kit assuming kickstart has already run, etc.        
        :return:
        """
        if not self.args.run_kit and not self.args.run_all:
            return

        self.power_on_controller()
        vms = get_vms(self.kit, self.vsphere_client, self.host_configuration)
        all_vms = get_all_vms(self.kit, self.vsphere_client, self.host_configuration)
        self._power_on_vms(vms)
        logging.info("Waiting for servers and sensors to start up.")
        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)
        self._set_vm_macs(all_vms)
        self._get_interface_name()
        logging.info("Run TFPlenum configuration")
        # runner = KitSeleniumRunner(self.args.is_headless, self.controller_node.management_interface.ip_address)
        # runner.run_tfplenum_configuration(kit)
        runner = APITester(self.controller_node.management_interface.ip_address, self.kit)
        runner.run_kit_api_call()

        remote_sensor_node = False
        for node in self.kit.get_nodes():
            if node.type == 'remote_sensor':
                remote_sensor_node = True

        if remote_sensor_node:
            logging.info("Changing portgroup for remote sensors.")
            self._update_remote_sensors(self.kit)

    def _run_add_node(self):
        """
        Runs the add node functionality.
        
        :return:
        """
        if not self.args.run_add_node and not self.args.run_all:
            return

        add_nodes = self.kit.get_add_nodes()
        if len(add_nodes) == 0:
            logging.info("Add node skipped as there is nothing defined in the configuration file.")
            return

        vms = destroy_and_create_vms(add_nodes, self.vsphere_client, self.host_configuration)
        self._power_on_vms(vms)
        self._set_vm_macs(vms)
        self._power_off_vms(vms)
        runner = KickstartSeleniumRunner(self.args.is_headless, self.controller_node.management_interface.ip_address)
        runner.run_kickstart_add_node(self.kit)
        self._power_on_vms(vms)
        test_vms_up_and_alive(self.kit, self.kit.add_nodes, 30)
        kit_runner = KitSeleniumRunner(self.args.is_headless, self.controller_node.management_interface.ip_address)
        kit_runner.run_kit_add_node(self.kit)

    def _run_integration(self):
        """
        Runs the integration tests.
        
        :return:
        """
        if not self.args.run_integration_tests and not self.args.run_all:
            return

        master_node = get_node(self.kit, "master_server")
        wait_for_pods_to_be_alive(master_node, 30)
        perform_integration_tests(self.controller_node, self.kit.password)

    def _simulate_powerfailure(self):
        """
        Simulates a power failure on a given cluster.

        :return:
        """
        if not self.args.simulate_powerfailure and not self.args.run_all:
            return

        vms = get_vms(self.kit, self.vsphere_client, self.host_configuration)
        self._power_off_vms(vms)
        self._power_on_vms(vms)
        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)
        master_node = get_node(self.kit, "master_server")
        wait_for_pods_to_be_alive(master_node, 30)

        if self.args.run_all:
            self._run_integration(self.kit)
            
    def _cleanup(self):
        """
        Power off and delete VMs

        :return:
        """
        if not self.args.cleanup_kit:
            return

        logging.info("Deleting VMs....")
        destroy_vms(self.kit.get_nodes(), self.vsphere_client, self.host_configuration)

    def execute(self):
        """
        Does the full or partial execution of cluster setup, and integration tests.

        :return:
        """
        self._parse_args()
        self._setup_logging()
        self._parse_config()
        self.vsphere_client = create_client(self.host_configuration)  # type: VsphereClient
        self.controller_node = get_node(self.kit, "controller")  # type: Node
        self._setup_controller()
        self._export_controller()
        self._run_kickstart()
        self._run_kit()
        #TODO this functionality is currently being worked on, it needs to be brought back at a later point.
        # self._run_add_node()
        self._run_integration()
        self._simulate_powerfailure()
        self._cleanup()


def main():
    runner = Runner()
    runner.execute()


if __name__ == '__main__':
    main()
