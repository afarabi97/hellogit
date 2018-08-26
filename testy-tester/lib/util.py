
from collections import OrderedDict
from time import sleep
from lib.ssh import SSH_client
from fabric import Connection


def get_controller(kit_configuration: OrderedDict) -> list:
    """
    Searches a YAML kit_configuration for a Controller VM and returns the first found

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :return (list): The name of a controller for a kit
    """

    for vm in kit_configuration["VMs"].keys():
        if kit_configuration["VMs"][vm]["type"] == "controller":
            return vm

    return ""


def configure_deployer(kit_configuration: OrderedDict, controller: str) -> None:
    """
    Configures the deployer for a build. This includes transferring the appropriate
    inventory file and running make.

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :param controller_name (list): A list of the controllers you would like to configure
    :return:
    """

    client = Connection(
        host=kit_configuration["VMs"][controller]["networking"]["nics"]["management_nic"]["ip_address"],
        connect_kwargs={"password": kit_configuration["VMs"][controller]["password"]})  # type: Connection

    # Copy TFPlenum Deployer inventory
    client.put(kit_configuration["deployer_inventory_file"], '/opt/tfplenum-deployer/playbooks/inventory.yml')

    with client.cd("/opt/tfplenum-deployer/playbooks"):
        client.run('make')

    client.close()


def build_tfplenum(kit_configuration: OrderedDict, controller: str, custom_command=None) -> None:
    """
    Builds the TFPlenum subsystem by running make

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :param custom_command (str): Runs the build with a custom provided command instead
                                 of the standard Ansible command
    :return:
    """

    client = Connection(
        host=kit_configuration["VMs"][controller]["networking"]["nics"]["management_nic"]["ip_address"],
        connect_kwargs={"password": kit_configuration["VMs"][controller]["password"]})  # type: Connection

    # Copy TFPlenum inventory
    client.put(kit_configuration["tfplenum_inventory_file"], '/opt/tfplenum/playbooks/inventory.yml')

    if custom_command is None:
        with client.cd("/opt/tfplenum/playbooks"):
            client.run('ansible-playbook site.yml -i inventory.yml -e ansible_ssh_pass=' + kit_configuration["password"])
    else:
        with client.cd("/opt/tfplenum/playbooks"):
            client.run(custom_command)

    client.close()


def test_vms_up_and_alive(kit_configuration: OrderedDict, vms_to_test: list) -> None:
    """
    Checks to see if a list of VMs are up and alive by using SSH. Does not return
    until all VMs are up.

    :param kit_configuration (OrderedDict): A YAML file defining the schema of the kit
    :param vms_to_test (list): A list of VMs you would like to test for liveness
    :return:
    """

    # Wait until all VMs are up and active
    while True:

        for vm in vms_to_test:
            print("VMs remaining: " + str(vms_to_test))
            current_host = vm
            print("Testing " + vm + " (" + kit_configuration["VMs"][vm]["networking"]["nics"]["management_nic"]["ip_address"] + ")")
            result = SSH_client.test_connection(
                kit_configuration["VMs"][vm]["networking"]["nics"]["management_nic"]["ip_address"],
                kit_configuration["username"],
                kit_configuration["password"],
                timeout=5)
            if result:
                vms_to_test.remove(vm)

        if not vms_to_test:
            print("All VMs up and active.")
            break

        sleep(5)
