#!/usr/bin/env python

__vcenter_version__ = '6.7c'

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

import logging
import os
import subprocess
import sys
import tempfile
import time
import traceback
import yaml

from argparse import ArgumentParser, Namespace
from collections import OrderedDict
from com.vmware.vapi.std.errors_client import AlreadyInDesiredState
from io import StringIO
from vmware.vapi.vsphere.client import VsphereClient
from lib.connection_mngs import FabricConnectionWrapper
from lib.docs_exporter import MyConfluenceExporter

# VCenter
from lib.vm_utilities import (destroy_vms, destroy_and_create_vms, create_client, clone_vm,
                              delete_vm, change_network_port_group, change_ip_address, get_vms, get_all_vms,
                              take_snapshot)

# ESXi
from lib.vm_utilities import (create_smart_connect_client, delete_esxi_vm,
                              upload_vm, copy_vm, resize_vm_disk,
                              get_vm_by_name, power_on_vm)
from lib import redfish_helper as redfish

from lib.util import (get_node, get_nodes, test_vms_up_and_alive,
                      transform, get_bootstrap,
                      run_bootstrap, perform_integration_tests,
                      get_interface_name, change_remote_sensor_ip,
                      hash_file)

from lib.model.kit import Kit
from lib.model.node import Node, VirtualMachine
from lib.model.node import Interface

from lib.model.host_configuration import HostConfiguration
from lib.frontend_tester import KickstartSeleniumRunner, KitSeleniumRunner
from lib.api_tester import APITester
from typing import List, Dict
from lib.controller_modifier import ControllerModifier
from lib.kubernetes_utilities import wait_for_pods_to_be_alive
from pathlib import Path


CONFLUENCE_URL = 'https://confluence.di2e.net'
TFPLENUM_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../'


CLONE_FROM_NIGHTLY_BUILD = "clone_from_nightly"
BUILD_FROM_SCRATCH = "build_from_scratch"


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
        self.baremetal = False
        self._vm_to_clone = "Test Template"

    def _validate_export_location(self):
        if os.path.exists(self.args.export_location) and os.path.isdir(self.args.export_location):
            return
        raise ValueError("The export path: {} passed in does not exist \
                          or is not a directory.".format(self.args.export_location))

    def _parse_args(self):
        """
        Parses the arguments passed in by the user and
        returns the path to the file that is getting processed.

        If the file does not exist the program will terminate in this
        function.

        :return: The path to the yaml file on success
        """
        parser = ArgumentParser(description="Testy tester is the application used in TFPlenum's CI pipeline. \
                                             It can setup Kits, export docs, export controller OVA and does \
                                             other various actions.")

        parser.add_argument("-p", "--path", dest="filename", required=True,
                            help="Input yaml configuration file", metavar="FILE")

        parser.add_argument('--setup-controller', dest='setup_controller', metavar="<clone_from_nightly|build_from_scratch>")
        parser.add_argument('--run-kickstart', dest='run_kickstart', action='store_true')
        parser.add_argument('--run-kit', dest='run_kit', action='store_true')
        parser.add_argument('--run-catalog', dest='run_catalog', action='store_true')
        parser.add_argument('--run-add-node', dest='run_add_node', action='store_true')
        parser.add_argument('--run-integration-tests', dest='run_integration_tests', action='store_true')
        parser.add_argument('--simulate-powerfailure', dest='simulate_powerfailure', action='store_true')

        parser.add_argument('--add-docs-to-controller', dest='add_docs_to_controller', metavar="<confluence page title>")
        parser.add_argument('--set-perms', dest='set_perms', metavar="<confluence page title>",
                            help="Sets restricted permissions on all pages recursively. You must pass in the parent page title.")
        parser.add_argument('--unset-perms', dest='unset_perms', metavar="<confluence page title>",
                            help="Sets unrestricted permissions on all pages recursively. You must pass in the parent page title.")

        parser.add_argument('--export-controller', dest='export_controller', action='store_true')
        parser.add_argument('--export-offline-docs', dest='export_offline_docs', metavar="<confluence page title>",
                            help="Exported offline documents to the --export-location or /root if not specified. \
                                  You must pass in a conflunence page title with this argument.")
        parser.add_argument('--export-location', dest='export_location', metavar="<path>", default="/root",
                            help="A relative or absolute path to a folder.")
        parser.add_argument('--export-version', dest='export_version',
                            metavar="", default="RC",
                            help="The version of your export. Defaults to RC (Release Candidate). \
                                  When exporting, use values like v3.2 or v3.3.1 etc.")

        parser.add_argument('--generate-hash-file-for-exports', dest='hash_files', action='store_true', help="Hashes all files in the <--export-location>/<--export-version> path.")

        parser.add_argument('--cleanup', dest='cleanup_kit', action='store_true')
        parser.add_argument('--headless', dest='is_headless', action='store_true')
        parser.add_argument('--tfplenum-commit-hash', dest='tfplenum_commit_hash')
        parser.add_argument("-vu", "--vcenter-username", dest="vcenter_username",
                            help="A username to the vcenter hosted on our local network.")
        parser.add_argument("-vp", "--vcenter-password", dest="vcenter_password",
                            help="A password to the vcenter hosted on our local network.")
        parser.add_argument("-eu", "--esxi-username", dest="esxi_username",
                            help="A username to the ESXi host.")
        parser.add_argument("-ep", "--esxi-password", dest="esxi_password",
                            help="A password to the ESXi host.")
        parser.add_argument("-du", "--di2e-username", dest="di2e_username",
                            help="A username to the DI2E git repo.")
        parser.add_argument("-dp", "--di2e-password", dest="di2e_password",
                            help="A password to the DI2E git repo.")
        parser.add_argument("--publish-to-labrepo", dest='publish_to_labrepo', nargs=3, metavar="<ip or hostnam> <username> <password>")
        parser.add_argument('--vmware-datastore', dest='vmware_datastore')

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

    def _set_vm_to_clone(self):
        self.baremetal = self.host_configuration.install_type == "baremetal"
        if self.baremetal:
            self._vm_to_clone = "redhat"
        elif self.args.setup_controller and self.args.setup_controller == CLONE_FROM_NIGHTLY_BUILD:
            self._vm_to_clone = "nightly-test-controller.lan"

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

                host_config = self.configuration["host_configuration"]
                storage = host_config.get("storage") or {}
                iso_folder_path = host_config.get("iso_folder_path")
                image_folder_path = os.getenv('IMAGE_PATH') or host_config.get("image_folder_path")

                vcenter = host_config.get("vcenter") or {}
                esxi = host_config.get("esxi")
                if vcenter:
                    host = vcenter
                    username = self.args.vcenter_username
                    password = self.args.vcenter_password
                elif esxi:
                    host = esxi
                    username = self.args.esxi_username
                    password = self.args.esxi_password
                else:
                    raise Exception("Need either a vcenter or ESXi host in config.")

                self.host_configuration = HostConfiguration(
                    host.get("ip_address"),
                    vcenter.get("cluster_name"),
                    vcenter.get("datacenter"),
                    username,
                    password,
                    iso_folder_path,
                    vcenter=(True if vcenter else False),
                    install_type=host_config.get("install_type"),
                    image_folder_path=image_folder_path,
                    resource_pool=vcenter.get("resource_pool")
                )
                if self.args.vmware_datastore is not None:
                    self.host_configuration.set_storage_options(
                        self.args.vmware_datastore,
                        storage.get("folder")
                    )
                else:
                    self.host_configuration.set_storage_options(
                        storage.get("datastore"),
                        storage.get("folder")
                    )

                self._set_vm_to_clone()
                # Returns a list of kit objects
                self.kit = transform(self.configuration["kit"], self._vm_to_clone)  # type: Kit
                for node in self.kit.nodes:
                    if node.suricata_catalog:
                        print(str(node.suricata_catalog))

                if self.args.tfplenum_commit_hash is not None:
                    self.kit.set_branch_name(self.args.tfplenum_commit_hash)

            except yaml.YAMLError as exc:
                print(exc)

    def _create_export_path(self) -> Path:
        path_to_export = Path(self.args.export_location + '/' + self.args.export_version)
        path_to_export.mkdir(parents=True, exist_ok=True)
        return path_to_export

    def _perform_bootstrap(self):
        """
        Executes the bootstrap logic needed to setup a fully functional controller.

        :return:
        """
        logging.info("Downloading controller bootstrap...")
        get_bootstrap(self.controller_node, self.di2e_username, self.kit, self.di2e_password)

        logging.info("Running controller bootstrap...")
        run_bootstrap(self.controller_node, self.di2e_username, self.di2e_password, self.kit)

    def _power_on_ctrl_and_wait_for_bootup(self) -> VirtualMachine:
        logging.info("Powering on the controller")
        ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, self.host_configuration)
        try:
            ctrl_vm.power_on()
        except AlreadyInDesiredState:
            logging.info("Controller %s is already in desired state skipping this step" % ctrl_vm.vm_name)
        test_vms_up_and_alive(self.kit, [self.controller_node], 10)
        return ctrl_vm

    def _add_docs_to_controller(self) -> None:
        if not self.args.add_docs_to_controller:
            return

        page_title = self.args.add_docs_to_controller
        self._power_on_ctrl_and_wait_for_bootup()
        confluence = MyConfluenceExporter(url=CONFLUENCE_URL,
                                          username=self.di2e_username,
                                          password=self.di2e_password)
        with tempfile.TemporaryDirectory() as export_path:
            confluence.export_page_w_children(export_path, self.args.export_version, "HTML", page_title)
            file_to_push = "{}/DIP_{}_HTML_Manual.zip".format(export_path, self.args.export_version)
            with FabricConnectionWrapper(self.kit.username,
                                         self.kit.password,
                                         self.controller_node.management_interface.ip_address) as remote_shell:
                export_loc = '/var/www/html'
                remote_shell.put(file_to_push, export_loc + '/thisiscvah.zip')
                with remote_shell.cd(export_loc):
                    remote_shell.run('rm -rf THISISCVAH/')
                    remote_shell.run('unzip thisiscvah.zip -d THISISCVAH/')

    def _set_perms_restricted_on_page(self):
        if not self.args.set_perms:
            return

        page_title = self.args.set_perms
        confluence = MyConfluenceExporter(url=CONFLUENCE_URL,
                                          username=self.di2e_username,
                                          password=self.di2e_password)
        confluence.set_permissions(page_title)

    def _set_perms_unrestricted_on_page(self):
        if not self.args.unset_perms:
            return
        page_title = self.args.unset_perms
        confluence = MyConfluenceExporter(url=CONFLUENCE_URL,
                                          username=self.di2e_username,
                                          password=self.di2e_password)
        confluence.set_permissions(page_title, is_restricted=False)

    def _build_controller(self):
        """
        Does everything that is needed to setup a fully functional controller.
        It deletes the controller if it already exists before cloning from a template.
        After which it configured networking based on the passed in yaml file.

        :return:
        """
        if not self.args.setup_controller:
            return

        if self.args.setup_controller != BUILD_FROM_SCRATCH:
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

        time.sleep(60)

        logging.info("Waiting for controller to become alive...")
        test_vms_up_and_alive(self.kit, [self.controller_node], 20)

        ctrl_modifier = ControllerModifier(self.controller_node)
        ctrl_modifier.change_hostname()
        self._perform_bootstrap()

        try:
            ctrl_vm.power_off()
            take_snapshot(self.controller_node.hostname, self.host_configuration)
        except Exception as e:
            traceback.print_exc()

        self._clone_and_configure_nightly_controller()


    def _setup_esxi_controller(self):
        if not self.args.setup_controller:
            return

        logging.info("Deleting controller....")
        delete_esxi_vm(self.host_configuration, self.controller_node.hostname)

        logging.info("Uploading RHEL base image")
        upload_vm(self.host_configuration, self.controller_node)

        logging.info("Copying and configuring base VM")
        copy_vm(self.host_configuration, self.controller_node)

        logging.info("Waiting for controller to become alive...")
        test_vms_up_and_alive(self.kit, [self.controller_node], 20)

        ctrl_modifier = ControllerModifier(self.controller_node)
        ctrl_modifier.change_hostname()

        self._perform_bootstrap()

        ctrl_modifier.make_controller_changes()

    def _clone_and_configure_nightly_controller(self):
        if not self.args.setup_controller:
            return

        if self.args.setup_controller != CLONE_FROM_NIGHTLY_BUILD:
            return

        logging.info("Deleting controller....")
        delete_vm(self.vsphere_client, self.controller_node.hostname)

        logging.info("Cloning nightly controller build....")
        clone_vm(self.host_configuration, self.controller_node, use_baseline_snapshot=True)

        logging.info("Changing controller portgroup and IP Address...")
        change_network_port_group(self.host_configuration, self.controller_node)
        change_ip_address(self.host_configuration, self.controller_node)

        logging.info("Powering the controller")
        ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, self.host_configuration)
        ctrl_vm.power_on()

        logging.info("Waiting for controller to become alive...")
        test_vms_up_and_alive(self.kit, [self.controller_node], 20)

        ctrl_modifier = ControllerModifier(self.controller_node)
        ctrl_modifier.update_cloned_nightly_build(self.di2e_username, self.di2e_password, self.args.tfplenum_commit_hash)

    def _export_controller(self):
        if not self.args.export_controller:
            return

        logging.info("Exporting the controller to OVA.")
        self._validate_export_location()
        path_to_export = self._create_export_path()
        ctrl_vm = self._power_on_ctrl_and_wait_for_bootup()
        ctrl_vm.prepare_for_export(self.kit.username,
                                   self.kit.password,
                                   self.controller_node.management_interface.ip_address,
                                   self.controller_node.management_interface.name)
        try:
            ctrl_vm.power_off()
        except AlreadyInDesiredState:
            logging.info("Controller %s is already in desired state skipping this step" % ctrl_vm.vm_name)

        destination_path = "{}/DIP_{}_Controller.ova".format(str(path_to_export), self.args.export_version)
        ctrl_vm.deleteCDROMs()
        ctrl_vm.deleteExtraNics()
        ctrl_vm.setNICsToInternal()
        ctrl_vm.export(destination_path)

    def _export_offline_docs(self):
        if not self.args.export_offline_docs:
            return

        page_title = self.args.export_offline_docs
        self._validate_export_location()
        path_to_export = self._create_export_path()
        confluence = MyConfluenceExporter(url=CONFLUENCE_URL,
                                          username=self.di2e_username,
                                          password=self.di2e_password)
        confluence.export_page_w_children(str(path_to_export), self.args.export_version, ["PDF", "HTML"], page_title)

    def _publish_to_labrepo(self):
        if not self.args.publish_to_labrepo:
            return

        self._validate_export_location()
        path_to_export = self._create_export_path()
        hostname, username, password = self.args.publish_to_labrepo
        with FabricConnectionWrapper(username, password, hostname) as remote_shell:
            remote_dir_loc = '/repos/releases/{}'.format(self.args.export_version)
            remote_shell.run('rm -rf {}'.format(remote_dir_loc))
            remote_shell.run('mkdir -p {}'.format(remote_dir_loc))
            for path in path_to_export.glob("**/*"):
                remote_shell.put(str(path), remote_dir_loc)
            remote_shell.local('rm -rf {}'.format(str(path_to_export)))
        logging.info("Completed the publishing of release deliverables to {}:{}".format(hostname, remote_dir_loc))

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
            try:
                vm.power_off()
            except AlreadyInDesiredState:
                print("Already powered off skipping this step for {}".format(vm.vm_name))

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
        logging.info("Modifying {}".format(self.controller_node.hostname))
        if self.vsphere_client:
            ctrl_vm = VirtualMachine(self.vsphere_client, self.controller_node, self.host_configuration)
            try:
                ctrl_vm.power_on()
            except:
                pass
            self.controller_modifier()
        elif self.esxi_client:
            vm = get_vm_by_name(self.esxi_client, self.controller_node.hostname)
            power_on_vm(vm)

    def _update_remote_sensors(self):
        """
        Change the portgroup for remote sensor

        :return:
        """
        remote_sensors = get_nodes(self.kit, "remote_sensor")  # type: list
        for node in remote_sensors:
            logging.info("Updating remote sensor " + node.hostname + " networking")
            vm = VirtualMachine(self.vsphere_client, node, self.host_configuration)
            change_remote_sensor_ip(self.kit, node)
            time.sleep(60)
            change_network_port_group(self.host_configuration, node, self.kit.remote_sensor_portgroup)
            vm.power_on()

        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)

    def _run_physical_kickstart(self):
        if not self.args.run_kickstart:
            return

        self._setup_vmware_clients()
        # Power on controller
        self.power_on_controller()
        # get idracs
        redfish_config = self.configuration['redfish']
        password = os.getenv('REDFISH_PASSWORD') or os.getenv('REDFISH_PSW')
        redfish_config['password'] = password

        counts = {
            'sensor': 0,
            'server': 0
        }
        # Set boot order ipmi
        node_lookup = {x.hostname: x for x in self.kit.get_nodes()}
        for t in ['servers', 'sensors']:
            for ip in redfish_config[t]:
                type_name = t[0:-1]
                counts[type_name] += 1
                hostname = type_name + str(counts[type_name])
                node = node_lookup.get(hostname)
                if not node:
                    logging.info("Could not find node {}".format(hostname))
                    sys.exit(1)

                logging.info("Trying redfish for {}".format(ip))
                token = redfish.get_token(ip, redfish_config['user'], redfish_config['password'])
                # Obtaining MAC addresses
                pxe_mac = redfish.get_pxe_mac(ip, token)
                logging.info("Found mac for {} - {}".format(ip, pxe_mac))
                boot_mode = redfish.set_pxe_boot(ip, token)

                node.set_management_interface_mac(pxe_mac)
                node.set_management_interface_boot_mode(boot_mode)
                redfish.logout(token)

        logging.info("Configuring Kickstart")
        # runner = KickstartSeleniumRunner(self.args.is_headless, self.controller_node.management_interface.ip_address)
        # runner.run_kickstart_configuration(kit)
        runner = APITester(self.controller_node.management_interface.ip_address, self.kit)
        runner.run_kickstart_api_call()

        # restart via redfish
        for t in ['servers', 'sensors']:
            for ip in redfish_config[t]:
                token = redfish.get_token(ip, redfish_config['user'], redfish_config['password'])
                result = redfish.restart_server(ip, token)
                redfish.logout(token)

        logging.info("Waiting for servers and sensors to become alive...")
        test_vms_up_and_alive(self.kit, self.kit.nodes, 60)

        return 0


    def _run_virtual_kickstart(self):
        """
        Performs the needed operations to Kickstart any and all vms mentions in
        the kit.

        :return:
        """
        if not self.args.run_kickstart:
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

    def _setup_virtual_kit(self):
        self.power_on_controller()
        vms = get_vms(self.kit, self.vsphere_client, self.host_configuration)
        all_vms = get_all_vms(self.kit, self.vsphere_client, self.host_configuration)
        self._power_on_vms(vms)
        logging.info("Waiting for servers and sensors to start up.")
        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)
        self._set_vm_macs(all_vms)
        self._get_interface_name()

    def _run_kit(self):
        """
        Performs the needed operations to run a kit assuming kickstart has already run, etc.
        :return:
        """
        if not self.args.run_kit:
            return

        if not self.baremetal:
            self._setup_virtual_kit()

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
            self._update_remote_sensors()

    def _run_catalog(self):
        """
        Performs the needed operations to run a kit assuming kickstart has already run, etc.
        :return:
        """
        if not self.args.run_catalog:
            return

        logging.info("Waiting for servers and sensors to start up.")
        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)
        logging.info("Run CVAH Catalog")
        runner = APITester(self.controller_node.management_interface.ip_address, self.kit)
        runner.run_catalog_api_call()


    def _run_add_node(self):
        """
        Runs the add node functionality.

        :return:
        """
        if not self.args.run_add_node:
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
        if not self.args.run_integration_tests:
            return

        master_node = get_node(self.kit, "master_server")
        wait_for_pods_to_be_alive(master_node, 30)
        perform_integration_tests(self.controller_node, self.kit.password)

    def _simulate_virtual_powerfailure(self):
        """
        Simulates a power failure on a given cluster.

        :return:
        """
        if not self.args.simulate_powerfailure:
            return

        vms = get_vms(self.kit, self.vsphere_client, self.host_configuration)
        self._power_off_vms(vms)
        self._power_on_vms(vms)
        test_vms_up_and_alive(self.kit, self.kit.nodes, 30)
        master_node = get_node(self.kit, "master_server")
        wait_for_pods_to_be_alive(master_node, 30)

    def _simulate_physical_powerfailure(self):
        if not self.args.simulate_powerfailure:
            return

        redfish_config = self.configuration['redfish']
        password = os.getenv('REDFISH_PASSWORD') or os.getenv('REDFISH_PSW')
        redfish_config['password'] = password

        for t in ['servers', 'sensors']:
            for ip in redfish_config[t]:
                token = redfish.get_token(ip, redfish_config['user'], redfish_config['password'])
                result = redfish.restart_server(ip, token)
                redfish.logout(token)

        logging.info("Waiting for servers and sensors to become alive...")
        test_vms_up_and_alive(self.kit, self.kit.nodes, 60)

        master_node = get_node(self.kit, "master_server")
        wait_for_pods_to_be_alive(master_node, 30)

    def _generate_hash_file_for_export(self):
        if not self.args.hash_files:
            return

        self._validate_export_location()
        path_to_export = self._create_export_path()
        hashes_content = StringIO()
        proc = subprocess.Popen('git rev-parse HEAD', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=TFPLENUM_DIR)
        git_commit_hash, _ = proc.communicate()

        hashes_content.write("TFPlenum Version: {}\n".format(self.args.export_version))
        hashes_content.write("GIT Commit Hash: {}\n\n".format(git_commit_hash.decode('utf-8')))
        for path in path_to_export.glob("**/*"):
            # Increased chunk size to 30MB so this wont take an ICE age to hash.
            hashes = hash_file(path, chunk_size=30000000)
            hashes_content.write("{}\t\tmd5: {}\n\t\t\tsha1: {}\n\t\t\tsha256: {}\n\n"
                .format(str(path.name), hashes["md5"], hashes["sha1"], hashes["sha256"]))

        with open(str(path_to_export) + '/versions.txt', 'w') as fa:
            fa.write(hashes_content.getvalue())

    def _cleanup(self):
        """
        Power off and delete VMs

        :return:
        """
        if not self.args.cleanup_kit:
            return

        logging.info("Deleting VMs....")
        destroy_vms(self.kit.get_nodes(), self.vsphere_client, self.host_configuration)

    def _setup_vmware_clients(self):
        # vcenter or esxi host
        # TODO: query for vcenter without erroring out on login
        if self.host_configuration.vcenter:
            try:
                self.vsphere_client = create_client(self.host_configuration)  # type: VsphereClient
            except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError) as e:
                print("Error creating vsphere client. Must not be connecting to vcenter.")
                sys.exit(1)
        else:
            service_instance = create_smart_connect_client(self.host_configuration)
            self.esxi_client = service_instance

    def execute(self):
        """
        Does the full or partial execution of cluster setup, and integration tests.

        :return:
        """
        self._parse_args()
        self._setup_logging()
        self._parse_config()

        if (self.args.setup_controller or self.args.run_kickstart or self.args.run_kit or
            self.args.cleanup_kit or self.args.run_add_node or self.args.run_integration_tests or self.args.simulate_powerfailure or
            self.args.add_docs_to_controller or self.args.export_controller):

            self._setup_vmware_clients()

        self.controller_node = get_node(self.kit, "controller")  # type: Node

        # setup baremetal vs virtual functions
        setup_controller = None
        self.baremetal = self.host_configuration.install_type == "baremetal"
        if self.baremetal:
            setup_controller = self._setup_esxi_controller
            run_kickstart = self._run_physical_kickstart
            simulate_powerfailure = self._simulate_physical_powerfailure
        else:
            if self.args.setup_controller == CLONE_FROM_NIGHTLY_BUILD:
                setup_controller = self._clone_and_configure_nightly_controller
            else:
                setup_controller = self._build_controller
            run_kickstart = self._run_virtual_kickstart
            simulate_powerfailure = self._simulate_virtual_powerfailure

        setup_controller()
        self._set_perms_restricted_on_page()
        self._set_perms_unrestricted_on_page()
        self._add_docs_to_controller()
        self._export_controller()
        self._export_offline_docs()
        self._publish_to_labrepo()
        self._generate_hash_file_for_export()
        run_kickstart()

        self._run_kit()
        self._run_catalog()

        #TODO this functionality is currently being worked on, it needs to be brought back at a later point.
        # self._run_add_node()

        self._run_integration()
        simulate_powerfailure()
        self._cleanup()



def main():
    runner = Runner()
    runner.execute()


if __name__ == '__main__':
    main()
