
from collections import OrderedDict
from time import sleep
from lib.ssh import SSH_client
from fabric import Connection
from jinja2 import DebugUndefined, Environment, FileSystemLoader, Template
import os.path
from lib.model.kit import Kit
from lib.model.node import Node, Interface, Node_Disk
from typing import List

def todict(obj: object, classkey=None) -> dict:
    if isinstance(obj, dict):
        data = {}
        for (k, v) in obj.items():
            data[k] = todict(v, classkey)
        return data
    elif hasattr(obj, "_ast"):
        return todict(obj._ast())
    elif hasattr(obj, "__iter__") and not isinstance(obj, str):
        return [todict(v, classkey) for v in obj]
    elif hasattr(obj, "__dict__"):
        data = dict([(key, todict(value, classkey)) 
            for key, value in obj.__dict__.items() 
            if not callable(value) and not key.startswith('_')])
        if classkey is not None and hasattr(obj, "__class__"):
            data[classkey] = obj.__class__.__name__
        return data
    else:
        return obj

def render(tpl_path: str, context: dict) -> str:
    path, filename = os.path.split(tpl_path)
    return Environment(
        loader=FileSystemLoader(path or './')
    ).get_template(filename).render(kit=context)

def get_controller(kit: Kit) -> Node:
    """
    Searches a YAML kit_configuration for a Controller VM and returns the first found

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :return (list): The name of a controller for a kit
    """

    for node in kit.nodes:
        if node.type == "controller":
            return node

    return ""


def configure_deployer(kit: Kit, controller: Node) -> None:
    """
    Configures the deployer for a build. This includes transferring the appropriate
    inventory file and running make.

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :param controller_name (list): A list of the controllers you would like to configure
    :return:
    """
    
    for interface in controller.interfaces:
        if interface.name == "management_nic":
            management_nic = interface


    client = Connection(
        host=management_nic.ip_address,
        connect_kwargs={"password": controller.password})  # type: Connection

    # Render deployer template
    template_name = '/tmp/' + kit.name + "_deployer_template.yml"
    with open(template_name, 'w') as fh:
        fh.write(render(kit.deployer_template, todict(kit) ))
    
    # Copy TFPlenum Deployer inventory
    client.put(template_name, '/opt/tfplenum-deployer/playbooks/inventory.yml')

    with client.cd("/opt/tfplenum-deployer/playbooks"):
        client.run('make')

    client.close()


def build_tfplenum(kit: Kit, controller: Node, custom_command=None) -> None:
    """
    Builds the TFPlenum subsystem by running make

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :param custom_command (str): Runs the build with a custom provided command instead
                                 of the standard Ansible command
    :return:
    """

    for interface in controller.interfaces:
        if interface.name == "management_nic":
            management_nic = interface

    client = Connection(
        host=management_nic.ip_address,
        connect_kwargs={"password": controller.password})  # type: Connection
    
    # Render tfplenum template
    template_name = '/tmp/' + kit.name + "_tfplenum_template.yml"
    with open(template_name, 'w') as fh:
        fh.write(render(kit.tfplenum_template, todict(kit) ))

    # Copy TFPlenum inventory
    client.put(template_name, '/opt/tfplenum/playbooks/inventory.yml')

    if custom_command is None:
        with client.cd("/opt/tfplenum/playbooks"):
            client.run('ansible-playbook site.yml -i inventory.yml -e ansible_ssh_pass=' + kit.password)
    else:
        with client.cd("/opt/tfplenum/playbooks"):
            client.run(custom_command)

    client.close()


def test_vms_up_and_alive(kit: Kit, vms_to_test: list) -> None:
    """
    Checks to see if a list of VMs are up and alive by using SSH. Does not return
    until all VMs are up.

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :param vms_to_test (list): A list of Node objects you would like to test for liveness
    :return:
    """

    # Wait until all VMs are up and active
    while True:

        for vm in vms_to_test:            
                
            print("VMs remaining:")
            print([node.hostname for node in vms_to_test])

            for interface in vm.interfaces:
                if interface.name == "management_nic":
                    management_nic = interface
            
            print("Testing " + vm.hostname + " (" + management_nic.ip_address + ")")
            result = SSH_client.test_connection(
                management_nic.ip_address,
                kit.username,
                kit.password,
                timeout=5)
            if result:
                vms_to_test.remove(vm)

        if not vms_to_test:
            print("All VMs up and active.")
            break

        sleep(5)

def transform(configuration: OrderedDict) -> List[Kit]:
    kits = []
    for kitconfig in configuration:            
        kit = Kit(kitconfig)
        kit.set_username(configuration[kitconfig]['username'])
        kit.set_password(configuration[kitconfig]['password'])
        kit.set_deployer_template(configuration[kitconfig]['deployer_template'])
        kit.set_tfplenum_template(configuration[kitconfig]['tfplenum_template'])
        kit.set_kubernetes_cidr(configuration[kitconfig]['kubernetes_cidr'])
        kit.set_dhcp_start(configuration[kitconfig]['dhcp_start'])
        kit.set_dhcp_end(configuration[kitconfig]['dhcp_end'])
        kit.set_gateway(configuration[kitconfig]['gateway'])
        kit.set_netmask(configuration[kitconfig]['netmask'])
        
        VMs = configuration[kitconfig]["VMs"]
        nodes = []
        for v in VMs:
            node = Node(v, VMs[v]['type'])            
            if node.type == "controller":
                node.set_username(VMs[v]['username'])
                node.set_password(VMs[v]['password'])
                node.set_vm_clone_options(VMs[v]['vm_to_clone'],VMs[v]['cloned_vm_name'])
            else:
                node.set_username(None)
                node.set_password(None)
                node.set_vm_clone_options(None,None)

            node.set_guestos(VMs[v]['vm_guestos'])               
            
            storage = VMs[v]['storage_options']
            node.set_storage_options(storage['datacenter'],storage['cluster'],storage['datastore'],storage['folder'])
            
            # Set networking specs
            nics =  VMs[v]['networking']['nics']
            interfaces = []
            for nic in nics:
                interface = Interface(nic, nics[nic]['type'], nics[nic]['ip_address'],nics[nic]['start_connected'])
                interface.set_mac_auto_generated(nics[nic]['mac_auto_generated'])
                interface.set_mac_address(nics[nic]['mac_address'])
                interface.set_dv_portgroup_name(nics[nic]['dv_portgroup_name'])
                interface.set_std_portgroup_name(nics[nic]['std_portgroup_name'])                    
                # Add interface to list of interfaces
                interfaces.append(interface)                
            # Set list of interfaces
            node.set_interfaces(interfaces)
            
            # Set cpu specs
            cpu_spec = VMs[v]['cpu_spec']
            node.set_cpu_options(cpu_spec['sockets'], cpu_spec['cores_per_socket'], cpu_spec['hot_add_enabled'], cpu_spec['hot_remove_enabled'])

            # Set memory specs
            memory_spec = VMs[v]['memory_spec'] 
            node.set_memory_options(memory_spec['size'], memory_spec['hot_add_enabled'])
            
            # Set disk info
            disk_spec = VMs[v]['disks']
            disks = []
            for d in disk_spec:
                disk = Node_Disk(d, disk_spec[d])
                disks.append(disk)
            node.set_disks(disks)

            # Set iso file path
            node.set_iso_file(VMs[v]['iso_file'])
            
            # Set boot order
            boot_order = []
            for o in VMs[v]['boot_order']:
                boot_order.append(o)
            node.set_boot_order(boot_order)

            # Add node to list of nodes
            nodes.append(node)

        # Add list of nodes to kit
        kit.set_nodes(nodes)

        # Add list of kits to kit
        kits.append(kit)
    return kits
