#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import requests
import urllib3
from collections import OrderedDict
from time import sleep
from vmware.vapi.vsphere.client import create_vsphere_client, VsphereClient
from lib.VM import Virtual_Machine
from fabric import Connection
#from lib.ssh import SSH_client

def create_vms(configuration: OrderedDict, client: VsphereClient, iso_folder_path: str, create_deployer=False) -> list:
    """
    Creates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param configuration (OrderedDict): A YAML file defining the schema of the kit
    :param client (VsphereClient): a vCenter server client
    :param iso_folder_path (str): Path to the ISO files folder
    :param create_deployer (bool): Whether the controller should be built or not
    :return (list): A list of all the VM objects created by the method
    """

    vms = [] # type: list
    for vm in configuration["VMs"].keys():
        if configuration["VMs"][vm]["type"] != "controller":
            vm_instance = Virtual_Machine(client, configuration["VMs"][vm], vm, iso_folder_path)
            vm_instance.cleanup()
            vm_instance.create()
            vms.append(vm_instance)

    return vms

def main():

    # Python dicts do not preserve order so we must use an ordered dictionary
    # If using 3.7+ this is not an issue as it is the default behavior
    configuration = OrderedDict() # type: OrderedDict

    with open("VMs.yml", 'r') as kit_schema:
        try:
            configuration = yaml.load(kit_schema)
            iso_folder_path = \
            "[{}]".format(configuration["host_configuration"]["vcenter"]["iso_files"]["datastore"]) + \
            '/' + configuration["host_configuration"]["vcenter"]["iso_files"]["folder"] + '/' # type: str

        except yaml.YAMLError as exc:
            print(exc)

    controller_name = None # type: str

    for vm in configuration["VMs"].keys():
        if configuration["VMs"][vm]["type"] == "controller":
            controller_name = vm
            print("Controller detected as: " + vm)
            break

    session = requests.session() # type: requests.sessions.Session

    # Disable cert verification for demo purpose.
    # This is not recommended in a production environment.
    session.verify = False

    # Disable the secure connection warning for demo purpose.
    # This is not recommended in a production environment.
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # Connect to a vCenter Server using username and password

    vsphere_client = create_vsphere_client(
    server=configuration["host_configuration"]["vcenter"]["ip_address"],
    username=configuration["host_configuration"]["vcenter"]["username"],
    password=configuration["host_configuration"]["vcenter"]["password"],
    session=session) # type: vmware.vapi.vsphere.client.VsphereClient

    vms = create_vms(configuration, vsphere_client, iso_folder_path) # type: list

    #ssh = SSH_client(configuration["VMs"][controller_name]["networking"]["nics"]["nic1"]["ip_address"],
    #                configuration["VMs"][controller_name]["username"],
    #                configuration["VMs"][controller_name]["password"])

    print("Running 'make generate-profiles' from tfplenum-deployer on controller.")
    print(ssh.run_command("make generate-profiles", "/opt/tfplenum-deployer/playbooks")[0])

    for vm in vms:
        vm.power_on()

    current_host = None # type: str

    vms_to_test = [] # type: list

    for vm in configuration["VMs"].keys():
        if configuration["VMs"][vm]["type"] != "controller":
            vms_to_test.append(vm)

    # Wait until all VMs are up and active
    while True:

        for vm in vms_to_test:
            print("VMs remaining: " + str(vms_to_test))
            current_host = vm
            print("Testing " + vm + " (" + configuration["VMs"][vm]["networking"]["nics"]["nic1"]["ip_address"] + ")")
            result = SSH_client.test_connection(
                            configuration["VMs"][vm]["networking"]["nics"]["nic1"]["ip_address"],
                            configuration["tfplenum_kit_configuration"]["username"],
                            configuration["tfplenum_kit_configuration"]["password"],
                            timeout=5)
            if result:
                vms_to_test.remove(vm)

        if not vms_to_test:
            print("All VMs up and active.")
            break

        sleep(5)

    ssh.scp('/opt/tfplenum-integration-testing/tfplenum-testy-tester/inventory.yml', '/opt/tfplenum/playbooks/inventory.yml')

    print("Running 'make' from tfplenum on controller.")
    print(ssh.run_command("make", "/opt/tfplenum/playbooks")[0])


if __name__ == '__main__':
    main()
