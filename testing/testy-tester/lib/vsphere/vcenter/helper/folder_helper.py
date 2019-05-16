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
from com.vmware.vcenter_client import Folder
from lib.vsphere.vcenter.helper import datacenter_helper


def get_folder(client, datacenter_name, folder_name):
    """
    Returns the identifier of a folder
    Note: The method assumes that there is only one folder and datacenter
    with the mentioned names.
    """
    datacenter = datacenter_helper.get_datacenter(client, datacenter_name)
    if not datacenter:
        logging.critical("Datacenter '{}' not found".format(datacenter_name))
        exit(0)

    filter_spec = Folder.FilterSpec(type=Folder.Type.VIRTUAL_MACHINE,
                                    names=set([folder_name]),
                                    datacenters=set([datacenter]))

    folder_summaries = client.vcenter.Folder.list(filter_spec)
    if len(folder_summaries) > 0:
        folder = folder_summaries[0].folder
        logging.info("Detected folder '{}' as {}".format(folder_name, folder))
        return folder
    else:
        logging.critical("Folder '{}' not found".format(folder_name))
        exit(0)
