from pyVim.connect import SmartConnectNoSSL
from pyVmomi import vim

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
