#!/usr/bin/env python

from typing import List
from lib.model.node import Node
from lib.model.kickstart_configuration import KickstartConfiguration

class Kit(object):

    """
    Represents the kit as a whole

    Attributes:
        name (str): UNKNOWN TODO FOR MICAH
        username (str): The username the code adds to the host machine
        password (str): The password for the above user
        nodes (list): A list of the VM nodes which are a part of the kit
        add_nodes (list): A list of the VM nodes which are a part of the kit
        kubernetes_cidr (str): See frontend help page
        branch_name (str): The name of the branch.
        source_repo (str): Name of yum repos labrepo or public
        external_nets (list): See frontend help page
        remote_sensor_portgroup (str): used for remote sensors vlan
        remote_sensor_network (str): network address for remote sensors
    """

    def __init__(self, name: str) -> None:
        self.name = name

    def set_username(self, username: str) -> None:
        self.username = username

    def set_password(self, password: str) -> None:
        self.password = password

    def set_nodes(self, nodes: List[Node]) -> None:
        self.nodes = nodes

    def set_add_nodes(self, nodes: List[Node]) -> None:
        self.add_nodes = nodes

    def set_kubernetes_cidr(self, kubernetes_cidr: str) -> None:
        self.kubernetes_cidr = kubernetes_cidr

    def set_kickstart_configuration(self, kickstart_configuration: KickstartConfiguration) -> None:
        self.kickstart_configuration = kickstart_configuration

    def set_branch_name(self, branch_name: str) -> None:
        self.branch_name = branch_name

    def set_source_repo(self, source_repo: str) -> None:
        self.source_repo = source_repo

    def set_home_nets(self, home_nets: List[str]) -> None:
        self.home_nets = home_nets

    def set_external_nets(self, external_nets: List[str]) -> None:
        self.external_nets = external_nets

    def set_remote_sensor_portgroup(self, remote_sensor_portgroup: str) -> None:
        self.remote_sensor_portgroup = remote_sensor_portgroup

    def set_remote_sensor_network(self, remote_sensor_network: str) -> None:
        self.remote_sensor_network = remote_sensor_network

    def get_nodes(self) -> List[Node]:
        """
        Returns a list of all nodes in the kit

        :return list: A list of all nodes in the kit
        """
        return self.nodes

    def get_controller(self) -> Node:
        for node in self.nodes:
            if node.type == Node.valid_node_types[2]:
                return node

        raise ValueError("Failed to find the controller node type in your yml config file.")

    def get_server_nodes(self) -> List[Node]:
        """
        Returns a list of just the sensor nodes.
        :return:
        """
        ret_val = []
        for node in self.nodes:
            if node.type in Node.valid_server_types:
                ret_val.append(node)
        return ret_val

    def get_sensor_nodes(self) -> List[Node]:
        """
        Returns a list of just the sensor nodes.
        :return:
        """
        ret_val = []
        for node in self.nodes:
            if node.type in Node.valid_sensor_types:
                ret_val.append(node)
        return ret_val

    def get_add_nodes(self) -> List[Node]:
        """
        Returns a list of all nodes that will be added to the Kit through the add node process.

        :return list: A list of all nodes in the kit
        """
        return self.add_nodes

    def __str__(self) -> str:
        p_nodes = '\n'.join([str(x) for x in self.nodes])
        return ("Name: %s\nUsername: %s\nPassword: %s\nDeployer Template: %s\nTfplenum Template: %s\n"
                "K8s Cidr: %s\nDHCP Start: %s\nDHCP End: %s\nGateway: %s\nNetmask: %s\nNodes:%s\n" %
                  (self.name, self.username, self.password, self.deployer_template,
                   self.tfplenum_template,self.kubernetes_cidr, self.dhcp_start,
                   self.dhcp_start, self.gateway, self.netmask, p_nodes)
               )
