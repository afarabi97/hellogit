from collections import OrderedDict
from time import sleep
from lib.ssh import SSH_client
from fabric import Connection
from jinja2 import Environment, FileSystemLoader
import os.path
from lib.model.kit import Kit
from lib.model.kickstart_configuration import KickstartConfiguration
from lib.model.node import Node, Interface, NodeDisk
from urllib.parse import quote
from typing import List
import logging
from lib.connection_mngs import FabricConnectionWrapper
from datetime import datetime, timedelta
from functools import wraps
from lib.connection_mngs import MongoConnectionManager
from typing import Dict


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


def get_node(kit: Kit, node_type: str="controller") -> Node:
    """
    Searches a YAML kit_configuration for a Controller VM and returns the first found

    :param kit:  A kit object defining the schema of the kit
    :param node_type: The type of node we wish to pull out of the list. Defaults to controller.
    :return: The name of a controller for a kit
    """

    if node_type not in Node.valid_node_types:
        logging.error("The node type: %s you passed into this function is invalid." % node_type)
        exit(1)

    some_node = None  # type: Node
    for node in kit.nodes:
        if node.type == node_type:
            some_node = node

    return some_node


def get_bootstrap(controller: Node, di2e_username: str, kit: Kit, di2e_password: str) -> None:
    """
    Download bootstrap script from DI2E tfplenum-deployer git repository to target controller using curl.

    :param controller: A node with type of controller.
    :param di2e_username: Username to access DI2E systems.
    :param di2e_password: Password to access DI2E systems.
    :param branch_name: the name of the branch we want to pull bootstrap from.
    """
    if kit.branch_name == "fork" or kit.branch_name == "custom":
        deployer_branch = kit.deployer_branch_name
        repo_dir = "~" + di2e_username
    else:
        deployer_branch = kit.branch_name
        repo_dir = "THISISCVAH"

    with FabricConnectionWrapper(controller.username,
                                 controller.password,
                                 controller.management_interface.ip_address) as client:
        client.run(
            "curl -o /root/bootstrap.sh -u {username}:'{password}' "
            "https://bitbucket.di2e.net/projects/{repo_name}/repos/tfplenum-deployer"
            "/raw/bootstrap.sh?at=refs%2Fheads%2Ffeature/pull_tags".format(
                branch_name=deployer_branch,
                username=di2e_username,
                password=di2e_password,
                repo_name=repo_dir)
        )


def run_bootstrap(controller: Node, di2e_username: str, di2e_password: str, kit: Kit, is_repo_sync: bool) -> None:
    """
    Execute bootstrap script on controller node.  This will take 30 minutes to 1 hour to complete.

    :param controller: A node with type of controller.
    :param di2e_username: Username to access DI2E systems.
    :param di2e_password: Password to access DI2E systems.
    :param branch_name: The branch we will clone from when we run our bootstrap.
    """
    fork_var = "yes" if kit.branch_name == "fork" or kit.branch_name == "custom" else "no"
    with FabricConnectionWrapper(controller.username,
                                 controller.password,
                                 controller.management_interface.ip_address) as client:
        cmd_to_execute = ("export BRANCH_NAME='" + kit.branch_name + "' && \
            export TFPLENUM_LABREPO=true && \
            export TFPLENUM_SERVER_IP=" + controller.management_interface.ip_address + " && \
            export DIEUSERNAME='" + di2e_username + "' && \
            export GIT_USERNAME='" + di2e_username + "' && \
            export RUN_TYPE=full && \
            export RHEL_SOURCE_REPO=labrepo && \
            export TFPLENUM_OS_TYPE=rhel && \
            export labrepo_check=true && \
            export PASSWORD='" + di2e_password + "' && \
            export GIT_PASSWORD='" + di2e_password + "' && \
            export CLONE_REPOS='" + str(is_repo_sync).lower() + "' && \
            export TFPLENUM_BRANCH_NAME='" + kit.tfplenum_branch_name + "' && \
            export DEPLOYER_BRANCH_NAME='" + kit.deployer_branch_name + "' && \
            export FRONTEND_BRANCH_NAME='" + kit.frontend_branch_name + "' && \
            export USE_FORK='" + fork_var + "' && \
            bash /root/bootstrap.sh")
        client.run(cmd_to_execute, shell=True)


def perform_integration_tests(ctrl_node: Node, root_password: str) -> None:
    current_path=os.getcwd()
    reports_destination="reports/"
    if "jenkins" not in current_path:
        reports_destination=""
    reports_source = "/opt/tfplenum-integration-testing/playbooks/reports"
    cmd_to_list_reports = ("for i in " + reports_source + "/*; do echo $i; done")
    cmd_to_mkdir = ("mkdir -p reports")    
    cmd_to_execute = ("export JUNIT_OUTPUT_DIR='"+ reports_source +"' && \
        export JUNIT_FAIL_ON_CHANGE='true' && \
        ansible-playbook -i /opt/tfplenum/playbooks/inventory.yml -e ansible_ssh_pass='" +
            root_password + "' site.yml")
    print(ctrl_node.management_interface.ip_address)
    with FabricConnectionWrapper(ctrl_node.username,
                                 ctrl_node.password,
                                 ctrl_node.management_interface.ip_address) as ctrl_cmd:
        with ctrl_cmd.cd("/opt/tfplenum-integration-testing/playbooks"):
            ctrl_cmd.run(cmd_to_mkdir)
            ctrl_cmd.run(cmd_to_execute, shell=True)
            reports_string_ = ctrl_cmd.run(cmd_to_list_reports).stdout.strip()
            reports = reports_string_.replace("\r","").split("\n")
            for report in  reports:
                filename = report.replace(reports_source + "/", "")
                ctrl_cmd.get(report, reports_destination + filename)


def test_vms_up_and_alive(kit: Kit, vms_to_test: List[Node], minutes_timeout: int) -> None:
    """
    Checks to see if a list of VMs are up and alive by using SSH. Does not return
    until all VMs are up.

    :param kit: an instance of a Kit object
    :param vms_to_test: A list of Node objects you would like to test for liveness
    :param minutes_timeout: The amount of time in minutes we will wait for vms to become alive before failing.
    :return:
    """
    # Make a clone of the list so we do not delete the reference list by accident.
    vms_to_test = vms_to_test.copy()
    # Wait until all VMs are up and active
    future_time = datetime.utcnow() + timedelta(minutes=minutes_timeout)
    while True:
        if future_time <= datetime.utcnow():
            logging.error("The vms took too long to come up")
            exit(3)

        for vm in vms_to_test:
            logging.info("VMs remaining:")
            logging.info([node.hostname for node in vms_to_test])

            logging.info("Testing " + vm.hostname + " (" + vm.management_interface.ip_address + ")")
            result = SSH_client.test_connection(
                vm.management_interface.ip_address,
                kit.username,
                kit.password,
                timeout=5)
            if result:
                vms_to_test.remove(vm)

        if not vms_to_test:
            logging.info("All VMs up and active.")
            break

        sleep(5)


def get_interface_names_by_mac(kit: Kit) -> None:
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


def _transform_nodes(vms: Dict, kit: Kit) -> List[Node]:
    nodes = []  # type: List[Node]
    for v in vms:
        node = Node(v, vms[v]['type'])  # type: Node
        if node.type == "controller":
            node.set_vm_to_clone(vms[v]['vm_to_clone'])
            node.set_dns_list(vms[v]['dns'])
            node.set_gateway(vms[v]['gateway'])
            node.set_domain(vms[v]['domain'])

        node.set_username(kit.username)
        node.set_password(kit.password)

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
            try:
                interface.set_subnet_mask(nics[nic]['subnet_mask'])
            except KeyError:
                pass
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

        if node.type == "remote-sensor":
            node.set_pcap_drives(vms[v]['pcap_drives'])
        elif node.type == "server" or node.type == "master-server":
            node.set_ceph_drives(vms[v]['ceph_drives'])
        elif kit.use_ceph_for_pcap and node.type == "sensor":
            node.set_ceph_drives(vms[v]['ceph_drives'])
        elif not kit.use_ceph_for_pcap and node.type == "sensor":
            node.set_pcap_drives(vms[v]['pcap_drives'])

        if node.type == "sensor" or node.type == "remote-sensor":
            node.set_monitoring_ifaces(vms[v]['monitoring_ifaces'])

        # Add node to list of nodes
        nodes.append(node)
    return nodes


def transform(configuration: OrderedDict) -> List[Kit]:
    """
    Transform the yaml configuration into a list of Kit objects

    :param configuration: A YAML file defining the schema of the kit
    :return: List[Kit]
    """
    kits = []  # type: List[Kit]
    for kitconfig in configuration:

        kit = Kit(kitconfig)

        kickstart_configuration = KickstartConfiguration()
        kickstart_configuration.set_dhcp_start(configuration[kitconfig]["kickstart_configuration"]['dhcp_start'])
        kickstart_configuration.set_dhcp_end(configuration[kitconfig]["kickstart_configuration"]['dhcp_end'])
        kickstart_configuration.set_gateway(configuration[kitconfig]["kickstart_configuration"]['gateway'])
        kickstart_configuration.set_netmask(configuration[kitconfig]["kickstart_configuration"]['netmask'])
        kit.set_kickstart_configuration(kickstart_configuration)

        kit.set_username("root")
        kit.set_password("we.are.tfplenum")
        kit.set_kubernetes_cidr(configuration[kitconfig]['kit_configuration']['kubernetes_cidr'])

        kit.set_use_ceph_for_pcap(configuration[kitconfig]["kit_configuration"]['use_ceph_for_pcap'])
        kit.set_branch_name(configuration[kitconfig]["kit_configuration"]['branch_name'])

        if not configuration[kitconfig]["kit_configuration"]['tfplenum_branch_name']:
            kit.set_tfplenum_branch_name("devel")
        else:
            kit.set_tfplenum_branch_name(configuration[kitconfig]["kit_configuration"]['tfplenum_branch_name'])

        if not configuration[kitconfig]["kit_configuration"]['deployer_branch_name']:
            kit.set_deployer_branch_name("devel")
        else:
            kit.set_deployer_branch_name(configuration[kitconfig]["kit_configuration"]['deployer_branch_name'])

        if not configuration[kitconfig]["kit_configuration"]['frontend_branch_name']:
            kit.set_frontend_branch_name("devel")
        else:
            kit.set_frontend_branch_name(configuration[kitconfig]["kit_configuration"]['frontend_branch_name'])

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
        # Add list of nodes to kit
        kit.set_nodes(_transform_nodes(vms, kit))

        try:
            vms = configuration[kitconfig]["VM_settings"]["ADD_NODE_VMs"]  # type: dict
            kit.set_add_nodes(_transform_nodes(vms, kit))
        except KeyError as e:
            logging.warning("Add node functionality will be skipped since there "
                            "is nothing under the ADD_NODE_VMs section")
            kit.set_add_nodes([])

        # Add list of kits to kit
        kits.append(kit)

    return kits


def retry(count=5, time_to_sleep_between_retries=2):
    """
    A function wrapper that can be used to auto retry the wrapped function if
    it fails.  To use this function

    @retry(count=10)
    def somefunction():
        pass

    :param count: The number of retries it will perform.
    :param time_to_sleep_between_retries: The time to sleep between retries.
    :return:
    """
    def decorator(func):
        @wraps(func)
        def result(*args, **kwargs):
            for i in range(count):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if (i + 1) == count:
                        raise
                    sleep(time_to_sleep_between_retries)
        return result
    return decorator


def zero_pad(num: int) -> str:
    """
    Zeros pads the numbers that are lower than 10.

    :return: string of the new number.
    """
    if num < 10:
        return "0" + str(num)
    return str(num)


def wait_for_mongo_job(job_name: str, mongo_ip: str, minutes_timeout: int):
    """
    Connects to a mongo database and waits for a specific job name to complete.

    Example record in mongo it is looking for:
    { "_id" : "Kickstart", "return_code" : 0, "date_completed" : "2018-11-27 22:24:07", "message" : "Successfully executed job." }

    :param job_name: The name of the job.
    :param mongo_ip: The IP Address of the mongo instance.
    :param timeout: The timeout in minutes.
    :return:
    """
    future_time = datetime.utcnow() + timedelta(minutes=minutes_timeout)
    with MongoConnectionManager(mongo_ip) as mongo_manager:
        while True:
            if future_time <= datetime.utcnow():
                logging.error("The {} took way too long.".format(job_name))
                exit(3)

            result = mongo_manager.mongo_last_jobs.find_one({"_id": job_name})
            if result:
                if result["return_code"] != 0:
                    logging.error(
                        "{name} failed with message: {message}".format(name=result["_id"], message=result["message"]))
                    exit(2)
                else:
                    logging.info("{name} Job completed successfully".format(name=job_name))
                break
            else:
                logging.info("Waiting for {} to complete sleeping 5 seconds then rechecking.".format(job_name))
                sleep(5)
