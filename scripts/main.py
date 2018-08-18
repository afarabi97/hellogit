#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import requests
import urllib3
from vmware.vapi.vsphere.client import create_vsphere_client
from VM import Virtual_Machine

def create_vms(configuration: dict):
    """
    Creates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param configuration (dict): A YAML file defining the schema of the kit
    :return:
    """
    #print(yaml.dump(configuration))

    #for vm, attributes in configuration["VMs"]["test_controller"]:
    #    print("balls")

    for vm in configuration["VMs"].keys():
        print(configuration["VMs"][vm]["type"])

def main():

    with open("VMs.yml", 'r') as kit_schema:
        try:
            configuration = yaml.load(kit_schema)
        except yaml.YAMLError as exc:
            print(exc)

    session = requests.session()

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
    session=session)
    
    print(configuration["host_configuration"]["vcenter"]["ip_address"])

    print(type(vsphere_client))

    # List all VMs inside the vCenter Server
    #print(vsphere_client.vcenter.VM.list())
    """
    create_vms(configuration)

    create_deployer_vm = Deployer_VM(client=vsphere_client)
    create_deployer_vm.cleanup()
    create_deployer_vm.run()
    if create_deployer_vm.cleardata:
        create_deployer_vm.cleanup()
    create_deployer_vm.power_on()
    """

if __name__ == '__main__':
    main()
