import urllib3
import requests
import sys
import time
import logging
from pyVmomi import vim
from pyVim.connect import SmartConnectNoSSL, Disconnect
from collections import OrderedDict
from vmware.vapi.vsphere.client import VsphereClient, create_vsphere_client
from lib.vsphere.vcenter.helper.vm_helper import get_vm
from com.vmware.vcenter.vm_client import Power
from lib.model.kit import Kit
from lib.model.node import VirtualMachine
from lib.model.node import Node
from lib.model.host_configuration import HostConfiguration
from typing import List
from lib.util import retry

from pyVmomi import vmodl

from pyVim import connect
import atexit
import os
import re

logger = logging.getLogger(__name__)

def _get_obj(content: vim.ServiceInstanceContent, vimtype: List[str], name: str):
    """
    Get the vsphere object associated with a given text name

    :param content:
    :param vimtype:
    :param name:
    :return:
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
    #logger.info(type(_get_obj(si.RetrieveContent(), [vim.VirtualMachine], name)))
    #exit(0)
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
            logger.info("An error occurred in the task.")
            task_done = True


@retry(count=10, time_to_sleep_between_retries=15)
def create_client(host_configuration: HostConfiguration) -> VsphereClient:
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
        server=host_configuration.ip_address,
        username=host_configuration.username,
        password=host_configuration.password,
        session=session)  # type: VsphereClient


# TODO: I left the type out here in the definition. No idea why, but when you run type() you get
# pyVmomi.VmomiSupport.vim.ServiceInstance. However, vim is not a package within VmomiSupport so it throws an error.
def create_smart_connect_client(host_configuration: HostConfiguration) -> vim.ServiceInstance:

    # This will connect us to vCenter
    return SmartConnectNoSSL(host=host_configuration.ip_address,
                          user=host_configuration.username,
                          pwd=host_configuration.password,
                          port=443)  # type: pyVmomi.VmomiSupport.vim.ServiceInstance


def change_network_address(host_configuration: HostConfiguration, vm_name: str):

    s = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    vm = get_vm_by_name()

    state = client.vcenter.vm.Power.get(vm)
    if state == Power.Info(state=Power.State.POWERED_ON):
        s.vcenter.vm.Power.stop(vm)
    elif state == Power.Info(state=Power.State.SUSPENDED):
        s.vcenter.vm.Power.start(vm)
        s.vcenter.vm.Power.stop(vm)

def power_on_vm(vm):
    # power on vm and answer any questions
    if vm.runtime.powerState == 'poweredOff':
        power_on_task = vm.PowerOn()
        time.sleep(1)
        if vm.runtime.question is not None:
            answers = {}
            question_id = vm.runtime.question.id
            if question_id not in answers.keys():
                choices = vm.runtime.question.choice.choiceInfo
                default_option = None
                if vm.runtime.question.choice.defaultIndex is not None:
                    ii = vm.runtime.question.choice.defaultIndex
                    default_option = choices[ii]
                    answers[question_id] = default_option.key
                    task = vm.AnswerVM(question_id, answers[question_id])
        wait_for_task(power_on_task)
        logger.info(vm.runtime.powerState)

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
        logger.info("Deleting VM '{}' ({})".format(vm_name, vm))
        client.vcenter.VM.delete(vm)


def change_ip_address(host_configuration: HostConfiguration, node: Node):
    service_instance = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    vm = get_vm_by_name(service_instance, node.hostname)

    if vm.runtime.powerState != 'poweredOff':
        logger.info("WARNING:: Power off your VM before reconfigure")
        sys.exit()

    nicSettingMap = []
    globalip = vim.vm.customization.GlobalIPSettings()

    """Static IP Configuration"""
    for iface in node.interfaces:
        adaptermap = vim.vm.customization.AdapterMapping()
        adaptermap.adapter = vim.vm.customization.IPSettings()
        adaptermap.adapter.ip = vim.vm.customization.FixedIp()
        adaptermap.adapter.ip.ipAddress = iface.ip_address
        adaptermap.adapter.subnetMask = iface.subnet_mask
        if iface.interface_type != "link-local":
            adaptermap.adapter.gateway = [node.gateway]
            adaptermap.adapter.dnsDomain = node.domain

        nicSettingMap.append(adaptermap)

    globalip.dnsServerList = node.dns_list

    # For Linux . For windows follow sysprep
    ident = vim.vm.customization.LinuxPrep(domain=node.domain,
                                           hostName=vim.vm.customization.FixedName(name='controller'))

    # For only one adapter
    customspec = vim.vm.customization.Specification()
    customspec.identity = ident
    customspec.nicSettingMap = nicSettingMap
    customspec.globalIPSettings = globalip

    logger.info("Reconfiguring VM Networks . . .")
    task = vm.Customize(spec=customspec)
    wait_for_task(task)
    Disconnect(service_instance)


def change_network_port_group(host_configuration: HostConfiguration, node: Node, remote_sensor_portgroup: str=None, is_vds: bool=True):
    """
    The VM in question must be powered off before you can change the network port group.

    :param host_configuration (HostConfiguration): host_configuration object from yaml config
    :param is_vds: set to true by default which means we are using a distributed standard switch, if you mark vds true,
           it will assume a distributed switch.
    :return:
    """
    service_instance = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    content = service_instance.RetrieveContent()
    vm = get_vm_by_name(service_instance, node.hostname)  # type: pyVmomi.VmomiSupport.vim.VirtualMachine

    if vm.runtime.powerState != 'poweredOff':
        logger.info("WARNING:: Power off your VM before reconfigure")
        sys.exit()

    # This code is for changing only one Interface. For multiple Interface
    # Iterate through a loop of network names.
    device_change = []
    if remote_sensor_portgroup is not None:
        network_name = remote_sensor_portgroup
    else:
        network_name = host_configuration.port_group
    for device in vm.config.hardware.device:
        if isinstance(device, vim.vm.device.VirtualEthernetCard):
            # device.macAddress
            nicspec = vim.vm.device.VirtualDeviceSpec()
            nicspec.operation = \
                vim.vm.device.VirtualDeviceSpec.Operation.edit
            nicspec.device = device
            nicspec.device.wakeOnLanEnabled = True

            if not is_vds:
                nicspec.device.backing = \
                    vim.vm.device.VirtualEthernetCard.NetworkBackingInfo()
                nicspec.device.backing.network = \
                    _get_obj(content, [vim.Network], network_name)
                nicspec.device.backing.deviceName = network_name
            else:
                network = _get_obj(content,
                                   [vim.dvs.DistributedVirtualPortgroup],
                                   network_name)
                dvs_port_connection = vim.dvs.PortConnection()
                dvs_port_connection.portgroupKey = network.key
                dvs_port_connection.switchUuid = \
                    network.config.distributedVirtualSwitch.uuid
                nicspec.device.backing = \
                    vim.vm.device.VirtualEthernetCard. \
                    DistributedVirtualPortBackingInfo()
                nicspec.device.backing.port = dvs_port_connection

            nicspec.device.connectable = \
                vim.vm.device.VirtualDevice.ConnectInfo()
            nicspec.device.connectable.startConnected = True
            nicspec.device.connectable.allowGuestControl = True
            device_change.append(nicspec)
            break

    config_spec = vim.vm.ConfigSpec(deviceChange=device_change)
    task = vm.ReconfigVM_Task(config_spec)
    # tasks.wait_for_tasks(service_instance, [task])
    wait_for_task(task)
    Disconnect(service_instance)
    logger.info("Successfully changed network")


def clone_vm(host_configuration: HostConfiguration, controller: Node, use_baseline_snapshot=False) -> None:
    """
    Clones a target VM by name

    :param configuration (OrderedDict): The schema which defines vCenter and all kits
    :param controller (Node): The controller node we wish to clone
    :return:
    """
    s = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    content = s.RetrieveContent()

    # With this we are searching for the MOID of the VM to clone from
    template_vm = get_vm_by_name(s, controller.vm_to_clone)  # type: pyVmomi.VmomiSupport.vim.VirtualMachine

    # This will retrieve the Cluster MOID
    cluster = get_cluster(s, host_configuration.cluster_name)  # type: pyVmomi.VmomiSupport.vim.ClusterComputeResource
    if host_configuration.resource_pool:
        resource_pool = get_resource_pool(s, host_configuration.resource_pool)
    else:
        resource_pool = cluster.resourcePool

    # This constructs the reloacate spec needed in a later step by specifying the default resource pool (name=Resource)
    #  of the Cluster
    # Alternatively one can specify a custom resource pool inside of a Cluster
#    relocate_spec = vim.vm.RelocateSpec(pool=cluster.resourcePool)  # type: pyVmomi.VmomiSupport.vim.vm.RelocateSpec
    datastore = _get_obj(content, [vim.Datastore], host_configuration.storage_datastore)
    relocate_spec = vim.vm.RelocateSpec(pool=resource_pool,
                                        datastore=datastore)  # type: pyVmomi.VmomiSupport.vim.vm.RelocateSpec

    # This constructs the clone specification and adds the customization spec and location spec to it
    if use_baseline_snapshot:
        clone_spec = vim.vm.CloneSpec(powerOn=False,
                                      template=False,
                                      location=relocate_spec,
                                      snapshot=template_vm.snapshot.rootSnapshotList[0].snapshot)  # type: pyVmomi.VmomiSupport.vim.vm.CloneSpec
    else:
        clone_spec = vim.vm.CloneSpec(powerOn=False,
                                      template=False,
                                      location=relocate_spec)  # type: pyVmomi.VmomiSupport.vim.vm.CloneSpec

    logger.info("Cloning the VM... this could take a while. Depending on drive speed and VM size, 5-30 minutes")
    logger.info("You can watch the progress bar in vCenter.")

    # Finally this is the clone operation with the relevant specs attached
    if host_configuration.storage_folder is not None:
        wait_for_task(
            template_vm.Clone(
                name=controller.hostname,
                folder=get_folder(s, host_configuration.storage_folder),
                spec=clone_spec))
    else:
        # If the folder name is not provided it will put it in the same folder
        # as the parent
        wait_for_task(
            template_vm.Clone(
                name=controller.hostname,
                folder=template_vm.parent,
                spec=clone_spec))
    Disconnect(s)

def take_snapshot(vm_name: str, host_configuration: HostConfiguration):
    s = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    content = s.RetrieveContent()
    vm = _get_obj(content, [vim.VirtualMachine], vm_name)
    if len(vm.rootSnapshot) < 1:
        task = vm.CreateSnapshot_Task(name='baseline',
                                      memory=False,
                                      quiesce=False)
        wait_for_task(task)
        logging.info("Successfully taken snapshot of '{}'".format(vm.name))
        Disconnect(s)

@retry(count=10, time_to_sleep_between_retries=15)
def destroy_and_create_vms(nodes: List[Node], client: VsphereClient, host_configuration: HostConfiguration) -> List[VirtualMachine]:
    """
    Destroys and ceates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param nodes (List[Node]): A list of nodes we want to create in vsphere.
    :param client (VsphereClient): a vCenter server client
    :param host_configuration (HostConfiguration): host_configuration object from yaml config
    :return (list): A list of all the VM objects created by the method
    """
    vms = []  # type: list
    for node in nodes:
        if node.type != "controller":
            logger.info("Creating VM " + node.hostname + "...")
            vm_instance = VirtualMachine(client, node, host_configuration)
            vm_instance.cleanup()
            vm_instance.create()
            vm_instance.set_node_instance(node)
            vms.append(vm_instance)
    return vms

def destroy_vms(nodes: List[Node], client: VsphereClient, host_configuration: HostConfiguration) -> None:
    """
    Destroys the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param nodes (List[Node]): A list of nodes we want to create in vsphere.
    :param client (VsphereClient): a vCenter server client
    :param host_configuration (HostConfiguration): host_configuration object from yaml config
    :return:
    """

    for node in nodes:
        logger.info("Cleaning up VM " + node.hostname + "...")
        vm_instance = VirtualMachine(client, node, host_configuration)
        vm_instance.cleanup()


def get_vms(kit: Kit, client: VsphereClient, host_configuration: HostConfiguration) -> List[VirtualMachine]:
    """
    Creates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param kit (Kit): A kit object defining the schema of the kit which you would like deployed
    :param client (VsphereClient): a vCenter server client
    :param host_configuration (HostConfiguration): host_configuration object from yaml config
    :return (list): A list of all the VM objects created by the method
    """

    vms = []  # type: list
    for node in kit.nodes:
        if node.type != "controller":
            logger.info("Getting VM " + node.hostname + "...")
            vm_instance = VirtualMachine(client, node, host_configuration)
            vm_instance.get_node_instance()
            vms.append(vm_instance)

    return vms

def get_all_vms(kit: Kit, client: VsphereClient, host_configuration: HostConfiguration) -> List[VirtualMachine]:
    """
    Creates the VMs specified in the VMs.yml file on the chosen target VMWare devices

    :param kit (Kit): A kit object defining the schema of the kit which you would like deployed
    :param client (VsphereClient): a vCenter server client
    :param host_configuration (HostConfiguration): host_configuration object from yaml config
    :return (list): A list of all the VM objects created by the method
    """

    vms = []  # type: list
    for node in kit.nodes:
        logger.info("Getting VM " + node.hostname + "...")
        vm_instance = VirtualMachine(client, node, host_configuration)
        vm_instance.get_node_instance()
        vms.append(vm_instance)

    return vms

# ESXi functions
#

def esxi_requests(content, client_cookie):
    # Break apart the cookie into it's component parts - This is more than
    # is needed, but a good example of how to break apart the cookie
    # anyways. The verbosity makes it clear what is happening.
    cookie_name = client_cookie.split("=", 1)[0]
    cookie_value = client_cookie.split("=", 1)[1].split(";", 1)[0]
    cookie_path = client_cookie.split("=", 1)[1].split(";", 1)[1].split(
        ";", 1)[0].lstrip()
    cookie_text = cookie_value + "; $" + cookie_path
    # Make a cookie
    cookie = dict()
    cookie[cookie_name] = cookie_text

    ds = _get_obj(content, [vim.Datastore], 'datastore1')
    dc = _get_obj(content, [vim.Datacenter], 'ha-datacenter')

    headers = {'Content-Type': 'application/octet-stream'}
    params = {
        "dsName": ds.name,
        "dcPath": dc.name
    }
    session = requests.Session()
    session.cookies = requests.cookies.cookiejar_from_dict(cookie)
    session.headers.update(headers)
    session.params.update(params)
    session.verify = False
    return session


def delete_esxi_vm(host_configuration: HostConfiguration, vm_name: str) -> None:
    """
    Deletes the VM from the server's inventory

    :param client (VsphereClient): A VsphereClient object representing a connection to vCenter
    :param vm_name (str): The name of the VM you would like to delete
    :return:
    """
    service_instance = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    vm = get_vm_by_name(service_instance, vm_name)

    if vm:
        if vm.runtime.powerState == 'poweredOn':
            TASK = vm.PowerOffVM_Task()
            #tasks.wait_for_tasks(service_instance, [TASK])
            wait_for_task(TASK)
            logger.info("{0} State: {1}".format(vm.name, TASK.info.state))

        logger.info("Deleting VM '{}' ({})".format(vm.name, vm))
        TASK = vm.Destroy_Task()
        #tasks.wait_for_tasks(service_instance, [TASK])
        wait_for_task(TASK)

    Disconnect(service_instance)


def upload_vm(host_configuration: HostConfiguration, controller: Node) -> None:
    """
    Clones a target VM by name

    :param configuration (OrderedDict): The schema which defines vCenter and all kits
    :param controller (Node): The controller node we wish to clone
    :return:
    """

    # TODO:
    # upload from vcenter host instead of local vmdk files

    s = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    # Ensure that we cleanly disconnect in case our code dies
    atexit.register(connect.Disconnect, s)
    content = s.RetrieveContent()

    ds = _get_obj(content, [vim.Datastore], 'datastore1')
    dc = _get_obj(content, [vim.Datacenter], 'ha-datacenter')

    esxi_request = esxi_requests(content, s._stub.cookie)
    base_url = "https://" + host_configuration.ip_address + ":443"

    RHEL_BASE_FOLDER = host_configuration.rhel_base_image_dir
    req_folders = [RHEL_BASE_FOLDER]
    for folder_name in req_folders:
        path = "[{ds}] {f}".format(ds=ds.name, f=folder_name)
        try:
            resp = content.fileManager.MakeDirectory(path, dc, False)
            logger.info("Created folder {}.".format(folder_name))
        except vim.fault.FileAlreadyExists:
            #logger.info("Folder {} already exists.".format(folder_name))
            #return 0
            pass

    # upload missing files
    rhel_directory = host_configuration.image_folder_path
    if not rhel_directory:
        raise Exception("iso_folder_path not set in config under host_configuration.")
    logger.info(rhel_directory)
    files = os.listdir(rhel_directory)
    logger.info(files)
    try:
        for rhel_file in files:
            file_loc = rhel_directory + rhel_file
            logger.info("Checking {}".format(file_loc))
            # Build the url to put the file - https://hostname:port/resource?params
            resource = "/folder/{base}/{file}".format(base=RHEL_BASE_FOLDER, file=rhel_file)
            http_url = base_url + resource
            resp = esxi_request.head(http_url)
            file_exists = resp.status_code == 200
            logger.info("File {} exists: {}".format(rhel_file, file_exists))
            if not file_exists:
                logger.info("Uploading {}".format(rhel_file))
                with open(file_loc, "rb") as f:
                    # Connect and upload the file
                    data = f
                    resp = esxi_request.put(http_url, data=data)
                    if resp.status_code > 202:
                        raise Exception("Error uploading file")

    except vmodl.MethodFault as e:
        logger.info("Caught vmodl fault : " + e.msg)
        raise SystemExit(-1)

    Disconnect(s)


def copy_vm(host_configuration: HostConfiguration, controller: Node) -> None:
    s = create_smart_connect_client(host_configuration)  # type: vim.ServiceInstance
    # Ensure that we cleanly disconnect in case our code dies
    atexit.register(connect.Disconnect, s)
    content = s.RetrieveContent()
    ds = _get_obj(content, [vim.Datastore], 'datastore1')
    dc = _get_obj(content, [vim.Datacenter], 'ha-datacenter')

    logger.info("Copying base rhel image to {}".format(controller.hostname))

    esxi_request = esxi_requests(content, s._stub.cookie)
    base_url = "https://" + host_configuration.ip_address + ":443"
    # Build the url to put the file - https://hostname:port/resource?params
    resource = "/folder/{base}/{file}".format(base=controller.hostname, file='rhel.vmx')
    http_url = base_url + resource
    resp = esxi_request.head(http_url)
    # TODO : delete files if host_configuration.fresh = True
    vm_files = resp.status_code == 200
    if not vm_files:
        base = host_configuration.rhel_base_image_dir
        src = "[{ds}] {f}".format(ds=ds.name, f=base)
        dest = "[{ds}] {f}".format(ds=ds.name, f=controller.hostname)
        # Copy rhel_base image directory
        task = content.fileManager.CopyFile(src, dc, dest, dc, False)
        wait_for_task(task)
        if task.info.state == 'error':
            logger.info(task)
            raise Exception("Task error.")

    vm = get_vm_by_name(s, controller.hostname)
    if not vm:
        # Register vm
        pool = get_resource_pool(s, 'Resources')
        folder = get_folder(s, 'vm')
        vm_path = "[{}] {}/rhel.vmx".format(ds.name, controller.hostname)

        logger.info("Registering VM")
        task = folder.RegisterVm(vm_path, name=controller.hostname, asTemplate=False, pool=pool)
        wait_for_task(task)
        logger.info(task.info)

    vm = get_vm_by_name(s, controller.hostname)
    power_off_vm(vm)

    disk_size = 50
    root_disk = [x for x in controller.disks if x.name == 'root']
    if len(root_disk) > 0:
        try:
            disk_size = int(root_disk[0].size)
        except:
            logger.warning("Ignoring non-integer disk size {}".format(root_disk[0].size))

    logger.info("Resizing disk to {} GB".format(disk_size))
    vm = get_vm_by_name(s, controller.hostname)
    resize_vm_disk(vm, 1, disk_size)

    logger.info("Changing controller portgroup")
    change_network_port_group(host_configuration, controller, is_vds=False)

    logger.info("Powering on VM")
    power_on_vm(vm)
    logger.info(vm.runtime.powerState)

    # expand filesystem
    logger.info("Expanding the filesystem")
    creds = vim.vm.guest.NamePasswordAuthentication(
        username=host_configuration.username, password=host_configuration.password
    )
    expand_filesystem(s, host_configuration, creds, vm)

    logger.info("Changing IP Address")
    change_ip_address_in_vm(s, vm, creds, host_configuration, controller)

    logger.info("Registering RHEL")
    register_rhel_vm(s, vm, creds, host_configuration, controller)

    logging.info("Downloading RHEL iso")
    download_rhel_iso(s, vm, creds, host_configuration, controller)

    # change root password
    logger.info("Changing root password.")
    change_root_password(s, vm, creds, 'root', controller.password)

    Disconnect(s)
    return 0

def resize_vm_disk(vm_obj, disk_number, disk_size, disk_prefix_label="Hard disk "):

    disk_size_kb = int(disk_size) * 1024 * 1024
    disk_label = disk_prefix_label + str(disk_number)
    virtual_disk_device = None

    # Find the disk device
    for dev in vm_obj.config.hardware.device:
        if isinstance(dev, vim.vm.device.VirtualDisk):
            logger.info(dev.deviceInfo.label)

        if isinstance(dev, vim.vm.device.VirtualDisk) \
                and dev.deviceInfo.label == disk_label:
            virtual_disk_device = dev
    if not virtual_disk_device:
        raise RuntimeError('Virtual {} could not be found.'.format(disk_label))

    virtual_disk_spec = vim.vm.device.VirtualDeviceSpec()
    virtual_disk_spec.operation = \
        vim.vm.device.VirtualDeviceSpec.Operation.edit
    virtual_disk_spec.device = virtual_disk_device
    virtual_disk_spec.device.capacityInKB = disk_size_kb
    #virtual_disk_spec.device.backing.diskMode = mode
    dev_changes = []
    dev_changes.append(virtual_disk_spec)
    spec = vim.vm.ConfigSpec()
    spec.deviceChange = dev_changes
    task = vm_obj.ReconfigVM_Task(spec=spec)
    wait_for_task(task)
    if not task.info.state == 'success':
        raise Exception("Error adding disk to vm.")
    return True

def add_disk_to_vm(vm, disk_size, share=False, disk_type="thin", unit_number=1, mode="append"):
    spec = vim.vm.ConfigSpec()
    # get all disks on a VM, set unit_number to the next available
    unit_number = 0

    for dev in vm.config.hardware.device:
        if hasattr(dev.backing, 'fileName'):
            unit_number = int(dev.unitNumber) + 1
        if isinstance(dev, vim.vm.device.VirtualSCSIController):
            controller = dev

    # add disk here
    dev_changes = []
    new_disk_kb = int(disk_size) * 1024 * 1024
    disk_spec = vim.vm.device.VirtualDeviceSpec()
    disk_spec.fileOperation = "create"
    disk_spec.operation = vim.vm.device.VirtualDeviceSpec.Operation.add
    disk_spec.device = vim.vm.device.VirtualDisk()
    disk_spec.device.backing = \
        vim.vm.device.VirtualDisk.FlatVer2BackingInfo()
    if disk_type == 'thin':
        disk_spec.device.backing.thinProvisioned = True
    disk_spec.device.unitNumber = unit_number
    disk_spec.device.capacityInKB = new_disk_kb
    disk_spec.device.controllerKey = controller.key

    if share:
        '''
        {
            "operation": "add",
            "fileOperation": "create",
            "device": {
                "@xsi:type": "VirtualDisk",
                "key": "-1000000",
                "backing": {
                    "@xsi:type": "VirtualDiskFlatVer2BackingInfo",
                    "fileName": "[datastore1] share/",
                    "diskMode": "persistent",
                    "thinProvisioned": "false",
                    "eagerlyScrub": "true",
                    "sharing": "sharingMultiWriter"
                },
                "controllerKey": "1000",
                "unitNumber": "1",
                "capacityInKB": "104857600",
                "capacityInBytes": "107374182400",
                "storageIOAllocation": {
                    "limit": "-1",
                    "shares": {
                        "shares": "1000",
                        "level": "normal"
                    }
                }
            }
        }
        '''
        disk_spec.device.backing.fileName = "[datastore1] share/share_1.vmdk"
        disk_spec.device.backing.diskMode = 'independent_persistent'
        # modes:
        # 'independent_persistent', 'persistent',
        # 'independent_nonpersistent', 'nonpersistent',
        # 'undoable', 'append'
        disk_spec.device.backing.sharing  = 'sharingMultiWriter'
        disk_spec.device.backing.thinProvisioned = False
        disk_spec.device.backing.eagerlyScrub = True

    logger.info(disk_spec)
    dev_changes.append(disk_spec)
    spec.deviceChange = dev_changes
    task = vm.ReconfigVM_Task(spec=spec)
    wait_for_task(task)

    if not task.info.state == 'success':
        raise Exception("Error adding disk to vm.")

    return 1

def change_root_password(service_instance, vm, creds, user, password):
    content = service_instance.RetrieveContent()
    execute = {
        'programPath': '/bin/echo',
        'arguments': '"{password}" | passwd --stdin root'.format(password=password),
    }
    pm = content.guestOperationsManager.processManager
    ps = vim.vm.guest.ProcessManager.ProgramSpec(**execute)
    res = pm.StartProgramInGuest(vm, creds, ps)
    # TODO :
    # wait for new creds to work before returning
    time.sleep(7)
    #creds = vim.vm.guest.NamePasswordAuthentication(username=user, password=password)
    return 0

def run_vm_process(vm, creds, content, programPath, arguments):

    try:
        pm = content.guestOperationsManager.processManager
        ps = vim.vm.guest.ProcessManager.ProgramSpec(
            programPath=programPath,
            arguments=arguments
        )
        res = pm.StartProgramInGuest(vm, creds, ps)
        time.sleep(1)

        if res > 0:
            logger.info("Program submitted, PID is %d" % res)

            processes = pm.ListProcessesInGuest(vm, creds, [res])
            retries = 0
            if not processes and retries < 10:
                time.sleep(3)
                retries += 1
                processes = pm.ListProcessesInGuest(vm, creds, [res])

            process = pm.ListProcessesInGuest(vm, creds, [res]).pop()
            pid_exitcode = process.exitCode
            logger.info("exit code: {}".format(pid_exitcode))

            max_loops = 50
            loops = 0
            while not process.endTime and loops < max_loops:
                logger.info("Waiting for process to end.")
                time.sleep(loops)
                loops += 1
                process = pm.ListProcessesInGuest(vm, creds, [res]).pop()
                pid_exitcode = process.exitCode

            # If its not a numeric result code, it says None on submit
            while (re.match('^[0-9]+', str(pid_exitcode))):
                logger.info("Program running, PID is %d" % res)
                pid_exitcode = pm.ListProcessesInGuest(vm, creds,
                                                       [res]).pop().\
                    exitCode
                logger.info("exit code: {}".format(pid_exitcode))
                if (pid_exitcode == 0):
                    logger.info("Program %d completed with success" % res)
                    return pid_exitcode
                    break
                # Look for non-zero code to fail
                elif (re.match('[1-9]+', str(pid_exitcode))):
                    logger.info("ERROR: Program %d completed with Failure" % res)
                    logger.info("ERROR: More info on process")
                    logger.info(pm.ListProcessesInGuest(vm, creds, [res]))
                    time.sleep(3)
                    sys.exit(1)
                    # return pid_exitcode
                    # break
                time.sleep(1)
            logger.info(pm.ListProcessesInGuest(vm, creds, [res]).pop())

        return pm.ListProcessesInGuest(vm, creds, [res]).pop().exitCode

    except IOError as e:
        logger.info(e)

def wait_for_vm_tools(vm, max_retries=None):
    max_retries = max_retries or 10
    check_count = 0
    while vm.guest.toolsStatus == "toolsNotRunning" and check_count < max_retries:
        logger.info(vm.guest.toolsStatus)
        time.sleep(check_count)
        check_count += 1
    time.sleep(5)
    logger.info(vm.guest.toolsStatus)
    return vm.guest.toolsStatus

def upload_file_to_vm(esxi_host, service_instance, vm, creds, vm_path, file_contents):
    #upload script to vm
    content = service_instance.RetrieveContent()
    esxi_request = esxi_requests(content, service_instance._stub.cookie)

    try:
        file_attribute = vim.vm.guest.FileManager.FileAttributes()
        url = content.guestOperationsManager.fileManager. \
            InitiateFileTransferToGuest(vm, creds, vm_path,
                                        file_attribute,
                                        len(file_contents), True)
        # When : host argument becomes https://*:443/guestFile?
        # Ref: https://github.com/vmware/pyvmomi/blob/master/docs/ \
        #            vim/vm/guest/FileManager.rst
        # Script fails in that case, saying URL has an invalid label.
        # By having hostname in place will take take care of this.
        url = re.sub(r"^https://\*:", "https://"+str(esxi_host)+":", url)
        logger.info(url)
        logger.info(file_contents)
        resp = esxi_request.put(url, data=file_contents, verify=False)
        if not resp.status_code == 200:
            logger.info("Error while uploading file")
            sys.exit(1)
            return False
        else:
            logger.info(resp.text)
            logger.info("Successfully uploaded file")
            return True
    except IOError as e:
        logger.info(e)
        sys.exit(1)

def expand_filesystem(service_instance, host_configuration, creds, vm):
    wait_for_vm_tools(vm)

    content = service_instance.RetrieveContent()
    ds = vm.datastore[0]
    dc = vm.parent.parent

    fdisk_cmd = (
        "/bin/sed -e 's/\s*\([\+0-9a-zA-Z]*\).*/\\1/' << EOF | /sbin/fdisk /dev/sda \n"
        "p # print partition table\n"
        "d # delete\n"
        "2 # /dev/sda2\n"
        "n # recreate partition 2\n"
        "p # primary partition\n"
        "2 # partition number\n"
        "# default first sector\n"
        "# default last sector\n"
        "p # print the in-memory partition table\n"
        "w # write the partition table\n"
    "EOF\n"
    "/sbin/partprobe -s\n"
    "/sbin/xfs_growfs /dev/sda2"
    )
    logger.info(fdisk_cmd)

    cmd_path = '/root/expand_fs.sh'
    upload_file_to_vm(
        host_configuration.ip_address,
        service_instance,
        vm, creds,
        vm_path = cmd_path,
        file_contents=fdisk_cmd,
    )

    # run script
    programPath = "/bin/bash"
    arguments   =  cmd_path + " > expand_fs.log"
    exit_code = run_vm_process(vm, creds, content, programPath, arguments)
    return exit_code

def change_ip_address_in_vm(service_instance, vm, creds, host_configuration, node):
    if not creds:
        creds = vim.vm.guest.NamePasswordAuthentication(
            username='root', password=node.password
        )
    content = service_instance.RetrieveContent()

    if vm.runtime.powerState != 'poweredOn':
        task = vm.PowerOn()
        wait_for_task(task)
        logger.info(vm.runtime.powerState)

    wait_for_vm_tools(vm)

    dns = ['DNS{i}={dns}'.format(i=i, dns=dns)
            for i, dns in enumerate(node.dns_list, 1)]
    dns = '\n'.join(dns)
    network_config = (
        "DEVICE=ens192\n"
        "ONBOOT=yes\n"
        "BOOTPROTO=static\n"
        "IPADDR={addr}\n"
        "NETMASK={mask}\n"
        "GATEWAY={gateway}\n"
        "{dns}"
    ).format(
        addr=node.interfaces[0].ip_address,
        mask=node.interfaces[0].subnet_mask,
        gateway=node.gateway,
        dns=dns
    )

    upload_file_to_vm(
        host_configuration.ip_address,
        service_instance,
        vm, creds,
        vm_path = '/etc/sysconfig/network-scripts/ifcfg-ens192',
        file_contents=network_config,
    )

    programPath = "/bin/systemctl"
    arguments = "restart network"
    run_vm_process(vm, creds, content, programPath, arguments)

def register_rhel_vm(service_instance, vm, creds, host_configuration, node):
    content = service_instance.RetrieveContent()

    org = os.getenv('RHEL_ORG')
    key = os.getenv('RHEL_KEY')

    if not org or not key:
        raise Exception("Need to set environment variables RHEL_ORG and RHEL_KEY")

    subscribe_script = (
        'hostnamectl set-hostname {hostname} \n'
        'subscription-manager clean \n'
        'subscription-manager register --activationkey={key} --org={org} \n'
        'subscription-manager list \n'
        'subscription-manager attach --auto \n'
        'subscription-manager list \n'
        'subscription-manager repos --enable=rhel-7-server-optional-rpms \n'
        'subscription-manager repos --enable=rhel-7-server-extras-rpms \n'
    ).format(key=key, org=org, hostname='controller.lan')

    upload_file_to_vm(
        host_configuration.ip_address,
        service_instance,
        vm, creds,
        vm_path = '/root/subscribe.sh',
        file_contents=subscribe_script,
    )

    programPath = '/bin/bash'
    arguments = '-c "chmod +x /root/subscribe.sh"'
    exit_code = run_vm_process(vm, creds, content, programPath, arguments)

    programPath = '/root/subscribe.sh'
    arguments = ' >> subscription.log'
    exit_code = run_vm_process(vm, creds, content, programPath, arguments)

    return exit_code

def download_rhel_iso(service_instance, vm, creds, host_configuration, node):
    url = os.getenv('RHEL_ISO')
    if not url:
        raise Exception("Need to set RHEL_ISO environment variable to url of RHEL_ISO")
    content = service_instance.RetrieveContent()
    programPath = '/bin/curl'
    arguments = '-O {url}'.format(url=url)
    exit_code = run_vm_process(vm, creds, content, programPath, arguments)
    return exit_code

def add_nic(vm, network):
    spec = vim.vm.ConfigSpec()

    # add Switch here
    dev_changes = []
    switch_spec                = vim.vm.device.VirtualDeviceSpec()
    switch_spec.operation      = vim.vm.device.VirtualDeviceSpec.Operation.add
    switch_spec.device         = vim.vm.device.VirtualVmxnet3()

    switch_spec.device.backing = vim.vm.device.VirtualEthernetCard.NetworkBackingInfo()
    switch_spec.device.backing.useAutoDetect = False
    switch_spec.device.backing.deviceName = network.name
    switch_spec.device.backing.network = network
    switch_spec.device.connectable = vim.vm.device.VirtualDevice.ConnectInfo()
    switch_spec.device.connectable.startConnected = True
    switch_spec.device.connectable.connected = True

    dev_changes.append(switch_spec)

    spec.deviceChange = dev_changes
    task = vm.ReconfigVM_Task(spec=spec)
    wait_for_task(task)
