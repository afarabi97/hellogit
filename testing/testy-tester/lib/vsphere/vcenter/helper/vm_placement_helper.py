"""
* *******************************************************
* Copyright (c) VMware, Inc. 2016-2018. All Rights Reserved.
* SPDX-License-Identifier: MIT
* *******************************************************
*
* DISCLAIMER. THIS PROGRAM IS PROVIDED TO YOU "AS IS" WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, WHETHER ORAL OR WRITTEN,
* EXPRESS OR IMPLIED. THE AUTHOR SPECIFICALLY DISCLAIMS ANY IMPLIED
* WARRANTIES OR CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY,
* NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE.
"""

__author__ = 'VMware, Inc.'
__vcenter_version__ = '6.5+'

import logging

from com.vmware.vcenter_client import VM

from lib.vsphere.vcenter.helper import datastore_helper
from lib.vsphere.vcenter.helper import folder_helper
from lib.vsphere.vcenter.helper import resource_pool_helper
from lib.vsphere.vcenter.helper import cluster_helper


def get_placement_spec(client,
                       datacenter_name,
                       vm_folder_name,
                       cluster_name,
                       datastore_name,
                       resource_pool_name=None):
    """
    Returns a VM placement spec. Ensures that the vm folder and datastore are all in the same datacenter which is
    specified.


    """
    # TODO: We need to implement resource pools
    #resource_pool = resource_pool_helper.get_resource_pool(client,
    #                                                       datacenter_name)

    folder = folder_helper.get_folder(client, datacenter_name, vm_folder_name)

    cluster = cluster_helper.get_cluster(client, datacenter_name, cluster_name)

    datastore = datastore_helper.get_datastore(client, datacenter_name, datastore_name)

    # Create the vm placement spec with the datastore, resource pool and vm
    # folder
    if resource_pool_name is not None:

        resource_pool = resource_pool_helper.get_resource_pool(client, datacenter_name)

        placement_spec = VM.PlacementSpec(folder=folder,
                                          resource_pool=resource_pool,
                                          cluster=cluster,
                                          datastore=datastore)
    else:
        placement_spec = VM.PlacementSpec(folder=folder,
                                          datastore=datastore,
                                          cluster=cluster)

    logging.debug("get_placement_spec_for_resource_pool: Result is '{}'".format(placement_spec))
    return placement_spec


def get_placement_spec_for_resource_pool(client,
                                         datacenter_name,
                                         vm_folder_name,
                                         datastore_name):
    """
    Returns a VM placement spec for a resourcepool. Ensures that the
    vm folder and datastore are all in the same datacenter which is specified.
    """
    resource_pool = resource_pool_helper.get_resource_pool(client, datacenter_name)

    folder = folder_helper.get_folder(client, datacenter_name, vm_folder_name)

    datastore = datastore_helper.get_datastore(client, datacenter_name, datastore_name)

    # Create the vm placement spec with the datastore, resource pool and vm
    # folder
    placement_spec = VM.PlacementSpec(folder=folder,
                                      resource_pool=resource_pool,
                                      datastore=datastore)

    logging.debug("get_placement_spec_for_resource_pool: Result is '{}'".format(placement_spec))
    return placement_spec