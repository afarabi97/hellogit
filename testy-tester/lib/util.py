from collections import OrderedDict
from time import sleep
from lib.ssh import SSH_client
from fabric import Connection
from jinja2 import DebugUndefined, Environment, FileSystemLoader, Template
import os.path
from lib.model.kit import Kit
from lib.model.kickstart_configuration import KickstartConfiguration
from lib.model.node import Node, Interface, NodeDisk
from typing import List
import logging


def todict(obj: object, classkey=None) -> dict:
    """
    Converts nested objects into a dict

    :param obj:
    :param classkey:
    :return: dict
    """
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
    """
    Renders a template using Jinja2

    :param tpl_path:
    :param context:
    :return: str
    """
    path, filename = os.path.split(tpl_path)
    return Environment(
        loader=FileSystemLoader(path or './')
    ).get_template(filename).render(kit=context)


def get_controller(kit: Kit) -> Node:
    """
    Searches a YAML kit_configuration for a Controller VM and returns the first found

    :param kit:  A kit object defining the schema of the kit
    :return: The name of a controller for a kit
    """

    controller = None  # type: Node

    for node in kit.nodes:
        if node.type == "controller":
            controller = node

    return controller


def configure_deployer(kit: Kit, controller: Node) -> None:
    """
    Configures the deployer for a build. This includes transferring the appropriate inventory file and running make.

    :param kit: A kit object defining the schema of the kit which you would like deployed
    :param controller: A node object linked to the controller for the kit
    :return:
    """

    client = Connection(
        host=controller.management_interface.ip_address,
        connect_kwargs={"password": controller.password})  # type: Connection

    with client.cd("/opt/tfplenum-deployer/playbooks"):
        client.run('make')

    client.close()


def build_tfplenum(kit: Kit, controller: Node, custom_command: str=None) -> None:
    """
    Builds the TFPlenum subsystem by running make

    :param kit: an instance of a Kit object
    :param controller: the node instance for a controller
    :param custom_command: Runs the build with a custom provided command instead of the standard Ansible command
    :return:
    """

    client = Connection(
        host=controller.management_interface.ip_address,
        connect_kwargs={"password": controller.password})  # type: Connection

    # Render tfplenum template
    template_name = '/tmp/' + kit.name + "_tfplenum_template.yml"  # type: str
    with open(template_name, 'w') as fh:
        fh.write(render(kit.tfplenum_template, todict(kit)))

    # Copy TFPlenum inventory
    client.put(template_name, '/opt/tfplenum/playbooks/inventory.yml')

    if custom_command is None:
        with client.cd("/opt/tfplenum/playbooks"):
            client.run('ansible-playbook site.yml -i inventory.yml -e ansible_ssh_pass=' + kit.password)
    else:
        with client.cd("/opt/tfplenum/playbooks"):
            client.run(custom_command)

    client.close()


def test_vms_up_and_alive(kit: Kit, vms_to_test: List[Node]) -> None:
    """
    Checks to see if a list of VMs are up and alive by using SSH. Does not return
    until all VMs are up.

    :param kit: an instance of a Kit object
    :param vms_to_test: A list of Node objects you would like to test for liveness
    :return:
    """

    # Wait until all VMs are up and active
    while True:

        for vm in vms_to_test:

            print("VMs remaining:")
            print([node.hostname for node in vms_to_test])

            print("Testing " + vm.hostname + " (" + vm.management_interface.ip_address + ")")
            result = SSH_client.test_connection(
                vm.management_interface.ip_address,
                kit.username,
                kit.password,
                timeout=5)
            if result:
                vms_to_test.remove(vm)

        if not vms_to_test:
            print("All VMs up and active.")
            break

        sleep(5)


def get_interface_names(kit: Kit) -> None:
    """
    Get the interface names from each node.

    :param kit: A YAML file defining the schema of the kit
    :return:
    """

    for node in kit.nodes:

        if node.type == 'sensor' or node.type == 'remote-sensor':

            client = Connection(
                host=node.management_interface.ip_address,
                connect_kwargs={"password": kit.password})  # type: Connection

            for interface in node.interfaces:

                interface_name_result = client.run("ip link show | grep -B 1 " + interface.mac_address +
                                                   " | tr '\n' ' ' | awk '{ print $2 }'")  # type: Result
                interface_name = interface_name_result.stdout.strip()  # type: str
                interface_name = interface_name.replace(':','')  # type: str
                logging.info("Found interface name " + interface_name + " for mac address " + interface.mac_address)
                interface.set_interface_name(interface_name)

            client.close()


def transform(configuration: OrderedDict) -> List[Kit]:
    """
    Transform the yaml configuration into a list of Kit objects

    :param configuration: A YAML file defining the schema of the kit
    :return: List[Kit]
    """
    kits = []  # type: List[Kit]
    for kitconfig in configuration:

        print(configuration[kitconfig])

        kit = Kit(kitconfig)

        kickstart_configuration = KickstartConfiguration()
        kickstart_configuration.set_dhcp_start(configuration[kitconfig]["kickstart_configuration"]['dhcp_start'])
        kickstart_configuration.set_dhcp_end(configuration[kitconfig]["kickstart_configuration"]['dhcp_end'])
        kickstart_configuration.set_gateway(configuration[kitconfig]["kickstart_configuration"]['gateway'])
        kickstart_configuration.set_netmask(configuration[kitconfig]["kickstart_configuration"]['netmask'])
        kickstart_configuration.set_root_password(configuration[kitconfig]["kickstart_configuration"]['root_password'])

        kit.set_kickstart_configuration(kickstart_configuration)

        kit.set_username(configuration[kitconfig]["VM_settings"]['username'])
        kit.set_password(configuration[kitconfig]["VM_settings"]['password'])
        kit.set_kubernetes_cidr(configuration[kitconfig]['kubernetes_cidr'])

        kit.set_use_ceph_for_pcap(configuration[kitconfig]["kit_configuration"]['use_ceph_for_pcap'])

        if not configuration[kitconfig]["kit_configuration"]['moloch_pcap_storage_percentage']:
            kit.set_moloch_pcap_storage_percentage(None)
        else:
            kit.set_moloch_pcap_storage_percentage(configuration[kitconfig]["kit_configuration"]['moloch_pcap_storage_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['elasticsearch_cpu_percentage']:
            kit.set_elasticsearch_cpu_percentage(None)
        else:
            kit.set_elasticsearch_cpu_percentage(configuration[kitconfig]["kit_configuration"]['elasticsearch_cpu_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['elasticsearch_ram_percentage']:
            kit.set_elasticsearch_ram_percentage(None)
        else:
            kit.set_elasticsearch_ram_percentage(configuration[kitconfig]["kit_configuration"]['elasticsearch_ram_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['logstash_server_cpu_percentage']:
            kit.set_logstash_server_cpu_percentage(None)
        else:
            kit.set_logstash_server_cpu_percentage(configuration[kitconfig]["kit_configuration"]['logstash_server_cpu_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['logstash_replicas']:
            kit.set_logstash_replicas(None)
        else:
            kit.set_logstash_replicas(configuration[kitconfig]["kit_configuration"]['logstash_replicas'])

        if not configuration[kitconfig]["kit_configuration"]['es_storage_space_percentage']:
            kit.set_es_storage_space_percentage(None)
        else:
            kit.set_es_storage_space_percentage(configuration[kitconfig]["kit_configuration"]['es_storage_space_percentage'])

        kit.set_home_nets(configuration[kitconfig]["kit_configuration"]['home_nets'])

        if not configuration[kitconfig]["kit_configuration"]['external_nets']:
            kit.set_external_nets(None)
        else:
            kit.set_external_nets(configuration[kitconfig]["kit_configuration"]['external_nets'])

        if not configuration[kitconfig]["kit_configuration"]['kafka_cpu_percentage']:
            kit.set_kafka_cpu_percentage(None)
        else:
            kit.set_kafka_cpu_percentage(configuration[kitconfig]["kit_configuration"]['kafka_cpu_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['moloch_cpu_percentage']:
            kit.set_moloch_cpu_percentage(None)
        else:
            kit.set_moloch_cpu_percentage(configuration[kitconfig]["kit_configuration"]['moloch_cpu_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['bro_cpu_percentage']:
            kit.set_bro_cpu_percentage(None)
        else:
            kit.set_bro_cpu_percentage(configuration[kitconfig]["kit_configuration"]['bro_cpu_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['suricata_cpu_percentage']:
            kit.set_suricata_cpu_percentage(None)
        else:
            kit.set_suricata_cpu_percentage(configuration[kitconfig]["kit_configuration"]['suricata_cpu_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['zookeeper_cpu_percentage']:
            kit.set_zookeeper_cpu_percentage(None)
        else:
            kit.set_zookeeper_cpu_percentage(configuration[kitconfig]["kit_configuration"]['zookeeper_cpu_percentage'])

        if not configuration[kitconfig]["kit_configuration"]['ideal_es_cpus_per_instance']:
            kit.set_ideal_es_cpus_per_instance(None)
        else:
            kit.set_ideal_es_cpus_per_instance(configuration[kitconfig]["kit_configuration"]['ideal_es_cpus_per_instance'])

        if not configuration[kitconfig]["kit_configuration"]['es_cpu_to_memory_ratio_default']:
            kit.set_es_cpu_to_memory_ratio_default(None)
        else:
            kit.set_es_cpu_to_memory_ratio_default(configuration[kitconfig]["kit_configuration"]['es_cpu_to_memory_ratio_default'])

        vms = configuration[kitconfig]["VM_settings"]["VMs"]  # type: dict
        nodes = []  # type: List[Node]
        for v in vms:
            node = Node(v, vms[v]['type'])  # type: Node
            if node.type == "controller":
                node.set_username(vms[v]['username'])
                node.set_password(vms[v]['password'])
                node.set_vm_clone_options(vms[v]['vm_to_clone'], vms[v]['cloned_vm_name'])

            node.set_guestos(vms[v]['vm_guestos'])
            storage = vms[v]['storage_options']  # type: dict
            node.set_storage_options(storage['datacenter'], storage['cluster'], storage['datastore'], storage['folder'])

            # Set networking specs
            nics = vms[v]['networking']['nics']  # type: dict
            interfaces = []  # type: List[Interface]
            for nic in nics:
                interface = Interface(nic, nics[nic]['type'], nics[nic]['ip_address'], nics[nic]['start_connected'],
                                      nics[nic]['management_interface'])  # type: Interface
                interface.set_mac_auto_generated(nics[nic]['mac_auto_generated'])
                interface.set_mac_address(nics[nic]['mac_address'])
                interface.set_dv_portgroup_name(nics[nic]['dv_portgroup_name'])
                interface.set_std_portgroup_name(nics[nic]['std_portgroup_name'])

                if interface.management_interface:
                    node.set_management_interface(interface)

                # Add interface to list of interfaces
                interfaces.append(interface)
            # Set list of interfaces
            node.set_interfaces(interfaces)

            # Set cpu specs
            cpu_spec = vms[v]['cpu_spec']  # type: dict
            node.set_cpu_options(cpu_spec['sockets'], cpu_spec['cores_per_socket'], cpu_spec['hot_add_enabled'],
                                 cpu_spec['hot_remove_enabled'])

            # Set memory specs
            memory_spec = vms[v]['memory_spec']  # type: dict
            node.set_memory_options(memory_spec['size'], memory_spec['hot_add_enabled'])

            # Set disk info
            disk_spec = vms[v]['disks']  # type: dict
            disks = []  # type: List[NodeDisk]
            for d in disk_spec:
                disk = NodeDisk(d, disk_spec[d])  # type: NodeDisk
                disks.append(disk)
            node.set_disks(disks)

            # Set iso file path
            node.set_iso_file(vms[v]['iso_file'])

            # Set boot order
            boot_order = []  # type: list
            for o in vms[v]['boot_order']:
                boot_order.append(o)
            node.set_boot_order(boot_order)

            if node.type != "controller":
                node.set_boot_drive(vms[v]['boot_drive_name'])

            # Add node to list of nodes
            nodes.append(node)

        # Add list of nodes to kit
        kit.set_nodes(nodes)

        # Add list of kits to kit
        kits.append(kit)

    return kits
