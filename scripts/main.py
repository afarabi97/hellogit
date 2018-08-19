#!/usr/bin/env python

__author__ = 'Grant Curell'
__vcenter_version__ = '6.7c'

import yaml
import requests
import urllib3
from collections import OrderedDict
from vmware.vapi.vsphere.client import create_vsphere_client, VsphereClient
from VM import Virtual_Machine

def create_vms(configuration: OrderedDict, client: VsphereClient, iso_folder_path: str):
    """
    Creates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param configuration (OrderedDict): A YAML file defining the schema of the kit
    :param client (VsphereClient): a vCenter server client
    :param iso_folder_path (str): Path to the ISO files folder
    :return:
    """

    for vm in configuration["VMs"].keys():
        vm_instance = Virtual_Machine(client, configuration["VMs"][vm], vm, iso_folder_path)
        vm_instance.create()
        #vm_instance.power_on()

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

    create_vms(configuration, vsphere_client, iso_folder_path)

if __name__ == '__main__':
    main()
