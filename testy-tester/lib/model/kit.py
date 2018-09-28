#!/usr/bin/env python

from typing import List
from lib.model.node import Node
from lib.kickstart_configuration import KickstartConfiguration

class Kit(object):
    def __init__(self, name: str) -> None:
        self.name = name

    def set_username(self, username: str) -> None:
        self.username = username

    def set_password(self, password: str) -> None:
        self.password = password

    def set_nodes(self, nodes: List[Node]) -> None:
        self.nodes = nodes

    def set_kubernetes_cidr(self, kubernetes_cidr: str) -> None:
        self.kubernetes_cidr = kubernetes_cidr

    def set_kickstart_configuration(self, kickstart_configuration: KickstartConfiguration) -> None:
        self.kickstart_configuration = kickstart_configuration

    def get_nodes(self) -> list:
        """
        Returns a list of all nodes in the kit

        :return list: A list of all nodes in the kit
        """
        return self.nodes

    def __str__(self) -> str:
        p_nodes = '\n'.join([str(x) for x in self.nodes])
        return "Name: %s\nUsername: %s\nPassword: %s\nDeployer Template: %s\nTfplenum Template: %s\nK8s Cidr: %s\nDHCP Start: %s\nDHCP End: %s\nGateway: %s\nNetmask: %s\nNodes:%s\n" % (self.name, self.username, self.password, self.deployer_template, self.tfplenum_template,self.kubernetes_cidr, self.dhcp_start, self.dhcp_start, self.gateway, self.netmask, p_nodes)
