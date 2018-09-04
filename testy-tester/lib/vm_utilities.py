
import urllib3
import requests
import time
import logging
from pyVmomi import vim
from pyVim.connect import SmartConnectNoSSL, Disconnect
from collections import OrderedDict
from vmware.vapi.vsphere.client import VsphereClient, create_vsphere_client
from lib.vsphere.vcenter.helper.vm_helper import get_vm
from com.vmware.vcenter.vm_client import (Hardware, Power)
from lib.model.kit import Kit
from lib.model.node import VirtualMachine
from lib.model.node import Node, Interface, Node_Disk

def _get_obj(content, vimtype, name):
    """
    Get the vsphere object associated with a given text name
    """
    obj = None
    container = content.viewManager.CreateContainerView(content.rootFolder, vimtype, True)
    for c in container.view:
        if c.name == name:
            obj = c
            break
    return obj

def _get_all_objs(content, vimtype):
    """
    Get all the vsphere objects associated with a given type
    """
    obj = {}
    container = content.viewManager.CreateContainerView(content.rootFolder, vimtype, True)
    for c in container.view:
        obj.update({c: c.name})
    return obj


def login_in_guest(username, password):
    return vim.vm.guest.NamePasswordAuthentication(username=username,password=password)

def start_process(si, vm, auth, program_path, args=None, env=None, cwd=None):
    cmdspec = vim.vm.guest.ProcessManager.ProgramSpec(arguments=args,
                                                      programPath=program_path,
                                                      envVariables=env,
                                                      workingDirectory=cwd)
    cmdpid = si.content.guestOperationsManager.processManager.StartProgramInGuest(vm=vm, auth=auth, spec=cmdspec)
    return cmdpid

def is_ready(vm):

    while True:
        system_ready = vm.guest.guestOperationsReady
        system_state = vm.guest.guestState
        system_uptime = vm.summary.quickStats.uptimeSeconds
        if system_ready and system_state == 'running' and system_uptime > 90:
            break
        time.sleep(10)

def get_vm_by_name(si, name):
    """
    Find a virtual machine by it's name and return it

    :param si (vim.ServiceInstance): An instance of a smart connector linked to a vCenter instance
    :param name (str): The name of the VM you want to get
    :return (?): TODO I still need to figure out what this ends up being
    """
    print(type(_get_obj(si.RetrieveContent(), [vim.VirtualMachine], name)))
    exit(0)
    return _get_obj(si.RetrieveContent(), [vim.VirtualMachine], name)

def get_folder(si, name):
    """
    Find a folder by it's name and return it
    """
    return _get_obj(si.RetrieveContent(), [vim.Folder], name)

def get_host_by_name(si, name):
    """
    Find a host by it's name and return it
    """
    return _get_obj(si.RetrieveContent(), [vim.HostSystem], name)

def get_resource_pool(si, name):
    """
    Find a resource pool by it's name and return it
    """
    return _get_obj(si.RetrieveContent(), [vim.ResourcePool], name)

def get_resource_pools(si):
    """
    Returns all resource pools
    """
    return _get_all_objs(si.RetrieveContent(), [vim.ResourcePool])

def get_cluster(si, name):
    """
    Find a cluster by it's name and return it
    """
    return _get_obj(si.RetrieveContent(), [vim.ComputeResource], name)

def get_clusters(si):
    """
    Returns all clusters
    """
    return _get_all_objs(si.RetrieveContent(), [vim.ComputeResource])

def get_datastores(si):
    """
    Returns all datastores
    """
    return _get_all_objs(si.RetrieveContent(), [vim.Datastore])

def get_hosts(si):
    """
    Returns all hosts
    """
    return _get_all_objs(si.RetrieveContent(), [vim.HostSystem])

def get_datacenters(si):
    """
    Returns all datacenters
    """
    return _get_all_objs(si.RetrieveContent(), [vim.Datacenter])

def get_registered_vms(si):
    """
    Returns all vms
    """
    return _get_all_objs(si.RetrieveContent(), [vim.VirtualMachine])


# TODO: I left the type out here in the definition. No idea why, but when you run type() you get
# pyVmomi.VmomiSupport.vim.Task. However, vim is not a package within VmomiSupport so it throws an error.
def wait_for_task(task) -> None:
    """
    Waits for a vCenter task to finish completion before continuing

    :param task (pyVmomi.VmomiSupport.vim.Task): An object which represents the task on which to wait
    :return:
    """
    task_done = False
    while not task_done:
        if task.info.state == 'success':
            return task.info.result

        if task.info.state == 'error':
            print("An error occurred in the task.")
            task_done = True

def create_client(configuration: OrderedDict) -> VsphereClient:
    """
    Creates a vSphere client from the given configuration

    :param configuration (OrderedDict): A YAML file defining the schema of the kit and vCenter
    :return (VsphereClient): A client object which allows you to connect to vCenter
    """

    session = requests.session()  # type: Session

    # Disable cert verification for demo purpose.
    # This is not recommended in a production environment.
    session.verify = False

    # Disable the secure connection warning for demo purpose.
    # This is not recommended in a production environment.
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # Connect to a vCenter Server using username and password

    return create_vsphere_client(
        server=configuration["host_configuration"]["vcenter"]["ip_address"],
        username=configuration["host_configuration"]["vcenter"]["username"],
        password=configuration["host_configuration"]["vcenter"]["password"],
        session=session)  # type: VsphereClient


# TODO: I left the type out here in the definition. No idea why, but when you run type() you get
# pyVmomi.VmomiSupport.vim.ServiceInstance. However, vim is not a package within VmomiSupport so it throws an error.
def create_smart_connect_client(configuration: OrderedDict) -> vim.ServiceInstance:

    username = configuration["host_configuration"]["vcenter"]["username"]
    password = configuration["host_configuration"]["vcenter"]["password"]
    vcenter_ip = configuration["host_configuration"]["vcenter"]["ip_address"]

    # This will connect us to vCenter
    return SmartConnectNoSSL(host=vcenter_ip,
                          user=username,
                          pwd=password,
                          port=443)  # type: pyVmomi.VmomiSupport.vim.ServiceInstance

def change_network_address(configuration: OrderedDict, vm_name: str):

    s = create_smart_connect_client(configuration)  # type: vim.ServiceInstance
    vm = get_vm_by_name()


    state = client.vcenter.vm.Power.get(vm)
    if state == Power.Info(state=Power.State.POWERED_ON):
        s.vcenter.vm.Power.stop(vm)
    elif state == Power.Info(state=Power.State.SUSPENDED):
        s.vcenter.vm.Power.start(vm)
        s.vcenter.vm.Power.stop(vm)

def power_off_vm(vm):
    if vm.runtime.powerState == vim.VirtualMachinePowerState.poweredOn:
        # using time.sleep we just wait until the power off action
        # is complete. Nothing fancy here.
        print
        "powering off..."
        task = vm.PowerOff()
        while task.info.state not in [vim.TaskInfo.State.success,
                                      vim.TaskInfo.State.error]:
            time.sleep(1)

def delete_vm(client: VsphereClient, vm_name: str) -> None:
    """
    Deletes the VM from the server's inventory

    :param client (VsphereClient): A VsphereClient object representing a connection to vCenter
    :param vm_name (str): The name of the VM you would like to delete
    :return:
    """
    vm = get_vm(client, vm_name)
    if vm:
        state = client.vcenter.vm.Power.get(vm)
        if state == Power.Info(state=Power.State.POWERED_ON):
            client.vcenter.vm.Power.stop(vm)
        elif state == Power.Info(state=Power.State.SUSPENDED):
            client.vcenter.vm.Power.start(vm)
            client.vcenter.vm.Power.stop(vm)
        print("Deleting VM '{}' ({})".format(vm_name, vm))
        client.vcenter.VM.delete(vm)


def clone_vm(configuration: OrderedDict, vm_to_clone: str, cloned_vm_name: str, folder_name=None) -> None:
    """
    Clones a target VM by name

    :param configuration (OrderedDict): The schema which defines vCenter and all kits
    :param vm_to_clone (str): The name of the VM from which you want to clone
    :param cloned_vm_name (str): The name of the cloned VM
    :param folder_name (str): An optional folder name in which to place the cloned VM
    :return:
    """

    s = create_smart_connect_client(configuration)  # type: vim.ServiceInstance

    cluster_name = configuration["host_configuration"]["vcenter"]["cluster_name"]

    # With this we are searching for the MOID of the VM to clone from
    template_vm = get_vm_by_name(s, vm_to_clone)  # type: pyVmomi.VmomiSupport.vim.VirtualMachine

    # This will retrieve the Cluster MOID
    cluster = get_cluster(s, cluster_name)  # type: pyVmomi.VmomiSupport.vim.ClusterComputeResource

    # This constructs the reloacate spec needed in a later step by specifying the default resource pool (name=Resource)
    #  of the Cluster
    # Alternatively one can specify a custom resource pool inside of a Cluster
    relocate_spec = vim.vm.RelocateSpec(pool=cluster.resourcePool)  # type: pyVmomi.VmomiSupport.vim.vm.RelocateSpec

    # This constructs the clone specification and adds the customization spec and location spec to it
    cloneSpec = vim.vm.CloneSpec(powerOn=True,
                                 template=False,
                                 location=relocate_spec)  # type: pyVmomi.VmomiSupport.vim.vm.CloneSpec

    print("Cloning the VM... this could take a while. Depending on drive speed and VM size, 5-30 minutes")
    print("You can watch the progress bar in vCenter.")
    # Finally this is the clone operation with the relevant specs attached
    if folder_name is not None:
        wait_for_task(template_vm.Clone(name=cloned_vm_name, folder=get_folder(s, folder_name), spec=cloneSpec))
    else:
        # If the folder name is not provided it will put it in the same folder
        # as the parent
        wait_for_task(template_vm.Clone(name=cloned_vm_name, folder=template_vm.parent, spec=cloneSpec))

    Disconnect(s)


def create_vms(kit: Kit, client: VsphereClient, iso_folder_path=None) -> list:
    """
    Creates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param kit (Kit): A kit object defining the schema of the kit which you would like deployed
    :param client (VsphereClient): a vCenter server client
    :param iso_folder_path (str): Path to the ISO files folder
    :return (list): A list of all the VM objects created by the method
    """

    vms = []  # type: list
    for node in kit.nodes:
        if node.type != "controller":
            logging.info("Creating VM " + node.hostname + "...")
            vm_instance = VirtualMachine(client, node, iso_folder_path)
            vm_instance.cleanup()
            vm_instance.create()
            vm_instance.set_node_instance(node)
            vms.append(vm_instance)

    return vms
