import ssl
from models.common import VCenterSettings
from pyVim.connect import SmartConnectNoSSL, Connect
from pyVmomi import vim
from typing import List


def print_vm_info(virtual_machine):
        """
        Print information for a particular virtual machine or recurse into a
        folder with depth protection
        """
        summary = virtual_machine.summary
        print("Name       : ", summary.config.name)
        print("Template   : ", summary.config.template)
        print("Path       : ", summary.config.vmPathName)
        print("Guest      : ", summary.config.guestFullName)
        print("Instance UUID : ", summary.config.instanceUuid)
        print("Bios UUID     : ", summary.config.uuid) # WARNING: Bios UUID is duplicated when VMs are cloned
        annotation = summary.config.annotation
        if annotation:
            print("Annotation : ", annotation)
        print("State      : ", summary.runtime.powerState)
        if summary.guest is not None:
            ip_address = summary.guest.ipAddress
            tools_version = summary.guest.toolsStatus
            if tools_version is not None:
                print("VMware-tools: ", tools_version)
            else:
                print("Vmware-tools: None")
            if ip_address:
                print("IP         : ", ip_address)
            else:
                print("IP         : None")
        if summary.runtime.question is not None:
            print("Question  : ", summary.runtime.question.text)
        print("")

def get_vm_uuid(ctrl_settings):
        si = SmartConnectNoSSL(host=ctrl_settings.vcenter.ipaddress, user=ctrl_settings.vcenter.username, pwd=ctrl_settings.vcenter.password)
        content = si.RetrieveContent()

        container = content.rootFolder
        viewType = [vim.VirtualMachine]
        recursive = True
        containerView = content.viewManager.CreateContainerView(
            container, viewType, recursive)

        children = containerView.view
        for child in children:
            summary = child.summary
            if(summary.config.name == ctrl_settings.node.hostname):
                # print_vm_info(child)
                return child.summary.config.instanceUuid


def get_vms_in_folder(folder_name: str, vcenter: VCenterSettings) -> List[str]:
    """
    Loops through all datacenters on a Vsphere cluster looking for specified folder then lists out all the vms contained within.
    """
    context = ssl._create_unverified_context()
    service_instance = Connect(host=vcenter.ipaddress,
            user=vcenter.username,
            pwd=vcenter.password,
            sslContext=context)
    content = service_instance.RetrieveContent()
    vms = []
    if content:
        dcs = [entity for entity in content.rootFolder.childEntity
            if hasattr(entity, 'vmFolder')] # type: List[vim.Datacenter]

        for dc in dcs:
            vm_folders = dc.vmFolder.childEntity
            for folder in  vm_folders:
                if isinstance(folder, vim.Folder):
                    if folder.name == folder_name:
                        for vm in folder.childEntity:
                            vms.append(vm.name)
    return vms
