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
        kubernetes_cidr (str): See frontend help page
        use_ceph_for_pcap (bool): See frontend help page
        branch_name (str): The name of the branch.
        moloch_pcap_storage_percentage (int): See frontend help page
        elasticsearch_cpu_percentage (int): See frontend help page
        elasticsearch_ram_percentage (int): See frontend help page
        logstash_server_cpu_percentage (int): See frontend help page
        logstash_replicas (int): See frontend help page
        es_storage_space_percentage (int): See frontend help page
        external_nets (list): See frontend help page
        kafka_cpu_percentage (int): See frontend help page
        moloch_cpu_percentage (int): See frontend help page
        bro_cpu_percentage (int): See frontend help page
        suricata_cpu_percentage (int): See frontend help page
        zookeeper_cpu_percentage (int): See frontend help page
        ideal_es_cpus_per_instance (int): See frontend help page
        es_cpu_to_memory_ratio_default (int): See frontend help page
        es_cpu_to_memory_ratio_default (int): See frontend help page
    """

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

    def set_use_ceph_for_pcap(self, use_ceph_for_pcap: bool) -> None:
        self.use_ceph_for_pcap = use_ceph_for_pcap

    def set_branch_name(self, branch_name: str) -> None:
        self.branch_name = branch_name

    def set_moloch_pcap_storage_percentage(self, moloch_pcap_storage_percentage: int) -> None:
        self.moloch_pcap_storage_percentage = moloch_pcap_storage_percentage

    def set_elasticsearch_cpu_percentage(self, elasticsearch_cpu_percentage: int) -> None:
        self.elasticsearch_cpu_percentage = elasticsearch_cpu_percentage

    def set_elasticsearch_ram_percentage(self, elasticsearch_ram_percentage: int) -> None:
        self.elasticsearch_ram_percentage = elasticsearch_ram_percentage

    def set_logstash_server_cpu_percentage(self, logstash_server_cpu_percentage: int) -> None:
        self.logstash_server_cpu_percentage = logstash_server_cpu_percentage

    def set_logstash_replicas(self, logstash_replicas: int) -> None:
        self.logstash_replicas = logstash_replicas

    def set_es_storage_space_percentage(self, es_storage_space_percentage: int) -> None:
        self.es_storage_space_percentage = es_storage_space_percentage

    def set_home_nets(self, home_nets: list) -> None:
        self.home_nets = home_nets

    def set_external_nets(self, external_nets: list) -> None:
        self.external_nets = external_nets

    def set_kafka_cpu_percentage(self, kafka_cpu_percentage: int) -> None:
        self.kafka_cpu_percentage = kafka_cpu_percentage

    def set_moloch_cpu_percentage(self, moloch_cpu_percentage: int) -> None:
        self.moloch_cpu_percentage = moloch_cpu_percentage

    def set_bro_cpu_percentage(self, bro_cpu_percentage: int) -> None:
        self.bro_cpu_percentage = bro_cpu_percentage

    def set_suricata_cpu_percentage(self, suricata_cpu_percentage: int) -> None:
        self.suricata_cpu_percentage = suricata_cpu_percentage

    def set_zookeeper_cpu_percentage(self, zookeeper_cpu_percentage: int) -> None:
        self.zookeeper_cpu_percentage = zookeeper_cpu_percentage

    def set_ideal_es_cpus_per_instance(self, ideal_es_cpus_per_instance: int) -> None:
        self.ideal_es_cpus_per_instance = ideal_es_cpus_per_instance

    def set_es_cpu_to_memory_ratio_default(self, es_cpu_to_memory_ratio_default: int) -> None:
        self.es_cpu_to_memory_ratio_default = es_cpu_to_memory_ratio_default

    def get_nodes(self) -> list:
        """
        Returns a list of all nodes in the kit

        :return list: A list of all nodes in the kit
        """
        return self.nodes

    def __str__(self) -> str:
        p_nodes = '\n'.join([str(x) for x in self.nodes])
        return "Name: %s\nUsername: %s\nPassword: %s\nDeployer Template: %s\nTfplenum Template: %s\nK8s Cidr: %s\nDHCP Start: %s\nDHCP End: %s\nGateway: %s\nNetmask: %s\nNodes:%s\n" % (self.name, self.username, self.password, self.deployer_template, self.tfplenum_template,self.kubernetes_cidr, self.dhcp_start, self.dhcp_start, self.gateway, self.netmask, p_nodes)
