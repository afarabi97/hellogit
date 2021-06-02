import os
from kubernetes.client.rest import ApiException
from kubernetes import client, config, utils
from diagnostic_util import add_spinner, MongoConn, tree_to_string, log_append, log_write
from constants import KUBE_CONFIG_LOCATION, LOG_PATH
from components.kube import Kubernetes

class Metrics():

    def  __init__(self, kube:Kubernetes):
        self.kube = kube
        self.metrics = mongo_client = MongoConn().mongo_metrics()
        self.nodes = self.get_nodes()
        self.node_metrics = self.get_metrics()

    def get_nodes(self):
        try:
            nodes = []
            node_info = self.kube.core_v1_api.list_node().items
            for node in node_info:
                nodes.append(node.metadata.name)

            return nodes

        except Exception as exc:
            log_append("{}/metrics-exception.log".format(LOG_PATH), str(exc))

    def get_metrics(self):
        try:
            node_metrics = []
            for node in self.nodes:
                node_metrics.append(list(self.metrics.find({"node": node })))

            return node_metrics

        except Exception as exc:
            log_append("{}/metrics-exception.log".format(LOG_PATH), str(exc))

    def check_threshold(self, metric, metric_type):
        text = None

        if metric >= 90:
            text = {'name': "CRITICAL-{} Usage : {}".format(metric_type, metric)}

        elif metric >= 70:
            text = {'name': "WARNING-{} Usage : {}".format(metric_type, metric)}

        return text

    def metrics_returned(self, node, memory, root_disk, data_disk, cpu):
        metrics = []
        data = {"name": node}

        if memory:
             metrics.append(memory)

        if root_disk:
             metrics.append(root_disk)

        if data_disk:
            metrics.append(data_disk)

        if cpu:
            metrics.append(cpu)

        data['children'] = metrics

        return data

    def check_nodes_exist(self, new_nodes):
        nodes = []

        for node in new_nodes:
            if node['children']:
                nodes.append(node)

        return nodes

    @add_spinner
    def check_system_resources(self):
        try:
            new_nodes = []
            data = {"name": ""}
            return_text = ""

            for metric in self.node_metrics:
                memory = self.check_threshold(metric[0]['value']['percent'], "Memory")
                root_disk = self.check_threshold(metric[1]['value']['percent'], "Root Disk")
                data_disk = self.check_threshold(metric[2]['value']['percent'], "Data Disk")
                cpu = self.check_threshold(metric[3]['value'], "CPU")

                new_nodes.append(self.metrics_returned(node=metric[0]['node'],
                                                       memory=memory,
                                                       root_disk=root_disk,
                                                       data_disk=data_disk,
                                                       cpu=cpu))

            if len(self.check_nodes_exist(new_nodes)) > 0:
                data['children'] = new_nodes
                return_text = tree_to_string(data)
                log_write("{}/metrics.log".format(LOG_PATH), return_text)
                return (False, return_text)
            else:
                return_text = "All Nodes are GREEN"
                return (True, return_text)
        except Exception as exc:
            log_append("{}/metrics-exception.log".format(LOG_PATH), str(exc))
            return (False, "Unable to gather node metrics")

def check_node_metrics(kube: Kubernetes):
    metrics = Metrics(kube)
    metrics.check_system_resources()





