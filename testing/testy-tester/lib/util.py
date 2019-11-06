import hashlib
import logging
import os.path

from collections import OrderedDict
from datetime import datetime, timedelta
from fabric import Connection
from functools import wraps
from invoke.exceptions import UnexpectedExit
from jinja2 import Environment, FileSystemLoader

from lib.connection_mngs import FabricConnectionWrapper, MongoConnectionManager
import pymongo

from lib.model.kit import Kit
from lib.model.kickstart_configuration import KickstartConfiguration
from lib.model.node import Node, Interface, NodeDisk
from lib.ssh import SSH_client
from pathlib import Path
from time import sleep
from typing import List, Dict, Union
from urllib.parse import quote

from invoke.exceptions import UnexpectedExit

#/opt/tfplenum/testing/playbooks/reports
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
REPORTS_DIR = SCRIPT_DIR + "/../../playbooks/reports"


def hash_file(some_path: Union[str, Path], chunk_size=8192) -> Dict:
    path = None #type: Path
    if isinstance(some_path, str):
        path = Path(some_path)
    elif isinstance(some_path, Path):
        path = some_path
    else:
        raise ValueError("Invalid type passed into hash_file function.")

    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()

    with open(str(path), 'rb') as fp:
        while True:
            chunk = fp.read(chunk_size)
            if chunk:
                md5.update(chunk)
                sha1.update(chunk)
                sha256.update(chunk)
            else:
                break
    return {"md5": md5.hexdigest(), "sha1": sha1.hexdigest(), "sha256": sha256.hexdigest() }


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

def get_nodes(kit: Kit, node_type: str="sensor") -> Node:
    """
    Searches a YAML kit_configuration for a Controller VM and returns the first found

    :param kit:  A kit object defining the schema of the kit
    :param node_type: The type of node we wish to pull out of the list. Defaults to controller.
    :return: A list of nodes
    """

    if node_type not in Node.valid_node_types:
        logging.error("The node type: %s you passed into this function is invalid." % node_type)
        exit(1)

    nodes = []  # type: list
    for node in kit.nodes:
        if node.type == node_type:
            nodes.append(node)

    return nodes


def get_bootstrap(controller: Node, di2e_username: str, kit: Kit, di2e_password: str) -> None:
    """
    Download bootstrap script from DI2E tfplenum-deployer git repository to target controller using curl.

    :param controller: A node with type of controller.
    :param di2e_username: Username to access DI2E systems.
    :param di2e_password: Password to access DI2E systems.
    :param branch_name: the name of the branch we want to pull bootstrap from.
    """
    curl_cmd = "curl -o /root/bootstrap.sh -u {username}:'{password}' " \
               "https://bitbucket.di2e.net/projects/THISISCVAH/repos/tfplenum" \
                "/raw/bootstrap.sh?at={branch_name}".format(branch_name=kit.branch_name,
                                                            username=di2e_username,
                                                            password=di2e_password)
    with FabricConnectionWrapper(controller.username,
                                 controller.password,
                                 controller.management_interface.ip_address) as client:
        client.run(curl_cmd, shell=True)


def run_bootstrap(controller: Node, di2e_username: str, di2e_password: str, kit: Kit) -> None:
    """
    Execute bootstrap script on controller node.  This will take 30 minutes to 1 hour to complete.

    :param controller: A node with type of controller.
    :param di2e_username: Username to access DI2E systems.
    :param di2e_password: Password to access DI2E systems.
    :param branch_name: The branch we will clone from when we run our bootstrap.
    """
    with FabricConnectionWrapper(controller.username,
                                 controller.password,
                                 controller.management_interface.ip_address) as client:
        cmd_to_execute = ("export BRANCH_NAME='" + kit.branch_name + "' && \
            export TFPLENUM_SERVER_IP=" + controller.management_interface.ip_address + " && \
            export DIEUSERNAME='" + di2e_username + "' && \
            export GIT_USERNAME='" + di2e_username + "' && \
            export RUN_TYPE=full && \
            export RHEL_SOURCE_REPO='" + kit.source_repo + "' && \
            export PASSWORD='" + di2e_password + "' && \
            export GIT_PASSWORD='" + di2e_password + "' && \
            export TFPLENUM_BRANCH_NAME='" + kit.branch_name + "' && \
            export USE_FORK='no' && \
            bash /root/bootstrap.sh 2>&1 | tee bootstrap.log")
        client.run(cmd_to_execute, shell=True)


def perform_integration_tests(ctrl_node: Node, root_password: str) -> None:
    current_path=os.getcwd()
    reports_destination="reports/"
    if "jenkins" not in current_path and "workspace" not in current_path:
        reports_destination=""
    reports_source = "/opt/tfplenum/testing/playbooks/reports"
    cmd_to_list_reports = ("for i in " + reports_source + "/*; do echo $i; done")
    cmd_to_mkdir = ("mkdir -p reports")
    cmd_to_execute = ("export JUNIT_OUTPUT_DIR='"+ reports_source +"' && \
        export JUNIT_FAIL_ON_CHANGE='true' && \
        ansible-playbook -i /opt/tfplenum/core/playbooks/inventory.yml -e ansible_ssh_pass='" +
            root_password + "' site.yml")

    error = False
    with FabricConnectionWrapper(ctrl_node.username,
                                 ctrl_node.password,
                                 ctrl_node.management_interface.ip_address) as ctrl_cmd:
        with ctrl_cmd.cd("/opt/tfplenum/testing/playbooks"):
            ctrl_cmd.run(cmd_to_mkdir)
        with ctrl_cmd.cd("/opt/tfplenum/testing/playbooks"):
            try:
                ctrl_cmd.run(cmd_to_execute, shell=True)
            except UnexpectedExit as e:
                print(e)
                error = True

        reports_string_ = ctrl_cmd.run(cmd_to_list_reports).stdout.strip()
        reports = reports_string_.replace("\r","").split("\n")
        for report in reports:
            filename = report.replace(reports_source + "/", "")
            results = ctrl_cmd.get(report, reports_destination + filename)

    if error:
        raise Exception("Tests failed.")

    return True


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
            logging.error("The machines took too long to come up")
            exit(3)

        for vm in vms_to_test:
            logging.info("Machines remaining:")
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
            logging.info("All machines up and active.")
            break

        sleep(5)


def get_interface_name(kit: Kit) -> None:
    """
    Get the monitor interface name for each each sensor.
    :param node:  A node object
    :return:
    """
    for node in kit:
        for interface in node.interfaces:
            with FabricConnectionWrapper(node.username,
                        node.password,
                        node.management_interface.ip_address) as client:

                cmd = "ip link show | grep -B 1 " + interface.mac_address + " | tr '\n' ' ' | awk '{ print $2 }'"
                interface_name_result = client.run(cmd, shell=True)
                interface_name = interface_name_result.stdout.strip()  # type: str
                interface_name = interface_name.replace(':','')  # type: str
                logging.info("Found interface name " + interface_name + " for mac address " + interface.mac_address)
                interface.set_interface_name(interface_name)

def change_remote_sensor_ip(kit: Kit, node: Node) -> None:
    network_ip = kit.remote_sensor_network.split('.')
    curr_ip = node.management_interface.ip_address.split('.')
    new_management_ip = curr_ip[0] + '.' + curr_ip[1] + '.' + network_ip[2] + '.' + curr_ip[3]
    new_gateway_ip = curr_ip[0] + '.' + curr_ip[1] + '.' + network_ip[2] + '.' + '1'
    cmd = ("/bin/nmcli con mod 'System " + node.management_interface.name + "' ipv4.addresses " +
           new_management_ip + "/24 ipv4.gateway " + new_gateway_ip)
    # TODO: When we get pfsense setup on testing portgroup
    #update_openvpn = ("/usr/bin/sed -i '/remote/s/.*remote.*/remote '" + kit.pfsense_external_ip + "' 1194/' /etc/openvpn/client/client.conf")
    with FabricConnectionWrapper(node.username,
            node.password,
            node.management_interface.ip_address) as client:
        #client.run(update_openvpn)
        client.run(cmd)
        try:
            client.run("shutdown -h now")
        except UnexpectedExit:
            pass

    node.management_interface.ip_address = new_management_ip
    for interface in node.interfaces:
        if interface.management_interface:
            interface.ip_address = new_management_ip

def _transform_nodes(vms: Dict, kit: Kit, vm_to_clone: str) -> List[Node]:
    nodes = []  # type: List[Node]
    for v in vms:
        node = Node(v, vms[v]['type'])  # type: Node
        if node.type == "controller":
            node.set_vm_to_clone(vm_to_clone)
            node.set_dns_list(vms[v]['dns'])
            node.set_gateway(vms[v]['gateway'])
            node.set_domain(vms[v]['domain'])

        node.set_username(kit.username)
        node.set_password(kit.password)

        node.set_guestos(vms[v].get('vm_guestos'))
        #storage = vms[v]['storage_options']  # type: dict
        #node.set_storage_options(storage['datacenter'], storage['cluster'], storage['datastore'], storage['folder'])

        # Set networking specs
        nics = vms[v]['networking']['nics']  # type: dict
        interfaces = []  # type: List[Interface]
        for nic in nics:
            interface = Interface(nic, nics[nic]['type'], nics[nic]['ip_address'], nics[nic]['start_connected'],
                                  nics[nic]['management_interface'], nics[nic]['monitoring_interface'])  # type: Interface
            interface.set_mac_auto_generated(nics[nic]['mac_auto_generated'])
            interface.set_mac_address(nics[nic]['mac_address'])
            try:
                interface.set_subnet_mask(nics[nic]['subnet_mask'])
            except KeyError:
                pass
            interface.set_dv_portgroup_name(nics[nic].get('dv_portgroup_name'))
            interface.set_std_portgroup_name(nics[nic].get('std_portgroup_name'))

            if interface.management_interface:
                node.set_management_interface(interface)

            # Add interface to list of interfaces
            interfaces.append(interface)
        # Set list of interfaces
        node.set_interfaces(interfaces)

        # Set cpu specs
        cpu_spec = vms[v].get('cpu_spec') or {}  # type: dict
        node.set_cpu_options(
            cpu_spec.get('sockets'),
            cpu_spec.get('cores_per_socket'),
            cpu_spec.get('hot_add_enabled'),
            cpu_spec.get('hot_remove_enabled')
        )

        # Set memory specs
        memory_spec = vms[v].get('memory_spec') or {}  # type: dict
        node.set_memory_options(
            memory_spec.get('size'),
            memory_spec.get('hot_add_enabled')
        )

        # Set disk info
        disk_spec = vms[v].get('disks') or {}  # type: dict
        disks = []  # type: List[NodeDisk]
        for d in disk_spec:
            disk = NodeDisk(d, disk_spec[d])  # type: NodeDisk
            disks.append(disk)
        node.set_disks(disks)

        # Set iso file path
        node.set_iso_file(vms[v].get('iso_file'))

        # Set boot order
        boot_order = []  # type: list
        for o in vms[v].get('boot_order') or []:
            boot_order.append(o)
        node.set_boot_order(boot_order)

        if node.type != "controller":
            node.set_boot_drive(vms[v].get('boot_drive_name'))

        if node.type == "remote_sensor":
            node.set_pcap_drives(vms[v].get('pcap_drives'))
        elif node.type == "server" or node.type == "master_server":
            node.set_es_drives(vms[v].get('es_drives'))
        elif node.type == "sensor":
            node.set_pcap_drives(vms[v].get('pcap_drives'))

        # set catalog info
        catalog = vms[v].get('catalog') or {}
        if node.type == "sensor":
            suricata_spec = catalog.get('suricata')
            node.set_suricata_catalog(suricata_spec)
            moloch_capture_spec = catalog.get('moloch-capture')
            node.set_moloch_capture_catalog(moloch_capture_spec)
            zeek_spec = vms[v]['catalog']['zeek']
            node.set_zeek_catalog(zeek_spec)

        if node.type == "master_server":
            moloch_viewer_spec = catalog.get('moloch-viewer')
            node.set_moloch_viewer_catalog(moloch_viewer_spec)
            #endgame2elastic_spec = vms[v]['catalog']['endgame2elastic']
            #node.set_endgame2elastic_catalog(endgame2elastic_spec)
            logstash_spec = catalog.get('logstash')
            node.set_logstash_catalog(logstash_spec)

        # Add node to list of nodes
        nodes.append(node)
    return nodes


def transform(configuration: OrderedDict, vm_to_clone: str) -> List[Kit]:
    """
    Transform the yaml configuration into a list of Kit objects

    :param configuration: A YAML file defining the schema of the kit
    :return: Kit
    """

    kit = Kit(configuration)  # type: Kit

    kickstart_configuration = KickstartConfiguration()
    kickstart_configuration.set_gateway(configuration["kickstart_configuration"]['gateway'])
    kickstart_configuration.set_netmask(configuration["kickstart_configuration"]['netmask'])
    kickstart_configuration.set_dhcp_range(configuration["kickstart_configuration"]['dhcp_range'])
    kit.set_kickstart_configuration(kickstart_configuration)

    kit.set_username("root")
    kit.set_password("we.are.tfplenum")
    kit.set_kubernetes_cidr(configuration['kit_configuration']['kubernetes_cidr'])
    kit.set_branch_name(configuration["kit_configuration"]['branch_name'])

    if 'source_repo' not in configuration["kit_configuration"]:
        kit.set_source_repo("labrepo")
    else:
        kit.set_source_repo(configuration["kit_configuration"]['source_repo'])

    if 'remote_sensor_portgroup' not in configuration:
        kit.set_remote_sensor_portgroup(None)
    else:
        kit.set_remote_sensor_portgroup(configuration["remote_sensor_portgroup"])

    if 'remote_sensor_network' not in configuration:
        kit.set_remote_sensor_network(None)
    else:
        kit.set_remote_sensor_network(configuration["remote_sensor_network"])

    kit.set_home_nets(configuration["kit_configuration"]['home_nets'])

    if 'external_nets' not in configuration["kit_configuration"]:
        kit.set_external_nets(None)
    else:
        kit.set_external_nets(configuration["kit_configuration"]['external_nets'])

    machines = configuration["VMs"]  # type: dict
    metal = configuration.get('metal') or {}
    machines.update(metal)

    # Add list of nodes to kit
    kit.set_nodes(_transform_nodes(machines, kit, vm_to_clone))

    try:
        vms = configuration["VMs"]["ADD_NODE_VMs"]  # type: dict
        kit.set_add_nodes(_transform_nodes(vms, kit, vm_to_clone))
    except KeyError as e:
        logging.warning("Add node functionality will be skipped since there "
                        "is nothing under the ADD_NODE_VMs section")
        kit.set_add_nodes([])

    return kit


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

                    # get console logs for latest run
                    console = mongo_manager.mongo_console
                    latest_console = console.find_one(
                        {'jobName': job_name},
                        sort=[('_id', pymongo.DESCENDING)]
                    )
                    latest_job_id = latest_console['jobid']
                    logs = console.find({'jobid': latest_job_id, 'jobName': job_name})
                    for line in logs:
                        print(line['log'], end="")

                    exit(2)
                else:
                    logging.info("{name} Job completed successfully".format(name=job_name))
                break
            else:
                logging.info("Waiting for {} to complete sleeping 5 seconds then rechecking.".format(job_name))
                sleep(5)
