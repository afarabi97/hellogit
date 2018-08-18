#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import requests
import urllib3
from vmware.vapi.vsphere.client import create_vsphere_client, VsphereClient
from VM import Virtual_Machine

def create_vms(configuration: dict, client: VsphereClient):
    """
    Creates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param configuration (dict): A YAML file defining the schema of the kit
    :param client (VsphereClient): a vCenter server client
    :return:
    """

    for vm in configuration["VMs"].keys():
        vm_instance = Virtual_Machine(client, configuration["VMs"][vm], vm)
        vm_instance.run()
        vm_instance.power_on()
        """
        create_deployer_vm.cleanup()
        create_deployer_vm.run()
        if create_deployer_vm.cleardata:
            create_deployer_vm.cleanup()
        create_deployer_vm.power_on()
        """

def main():

    with open("VMs.yml", 'r') as kit_schema:
        try:
            configuration = yaml.load(kit_schema) # type: dict
        except yaml.YAMLError as exc:
            print(exc)

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

    create_vms(configuration, vsphere_client)

    # List all VMs inside the vCenter Server
    #print(vsphere_client.vcenter.VM.list())
    """


    """

if __name__ == '__main__':
    main()
