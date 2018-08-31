#!/usr/bin/env python

from lib.model.node import Node

class Kit(object):
    def __init__(self, name):
        self.name = name

    def set_username(self, username):   
        self.username = username
    
    def set_password(self, password):   
        self.password = password

    def set_nodes(self, nodes):   
        self.nodes = nodes

    def set_deployer_template(self, deployer_template):   
        self.deployer_template = deployer_template

    def set_tfplenum_template(self, tfplenum_template):   
        self.tfplenum_template = tfplenum_template
    
    def set_kubernetes_cidr(self, kubernetes_cidr):   
        self.kubernetes_cidr = kubernetes_cidr

    def set_dhcp_start(self, dhcp_start):
        self.dhcp_start = dhcp_start

    def set_dhcp_end(self, dhcp_end):
        self.dhcp_end = dhcp_end

    def set_gateway(self, gateway):
        self.gateway = gateway

    def set_netmask(self, netmask):
        self.netmask = netmask

    def __str__(self):
        p_nodes = '\n'.join([str(x) for x in self.nodes])
        return "Name: %s\nUsername: %s\nPassword: %s\nDeployer Template: %s\nTfplenum Template: %s\nK8s Cidr: %s\nDHCP Start: %s\nDHCP End: %s\nGateway: %s\nNetmask: %s\nNodes:%s\n" % (self.name, self.username, self.password, self.deployer_template, self.tfplenum_template,self.kubernetes_cidr, self.dhcp_start, self.dhcp_start, self.gateway, self.netmask, p_nodes) 