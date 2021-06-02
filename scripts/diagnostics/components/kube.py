import os
from kubernetes.client.rest import ApiException
from kubernetes import client, config, utils
from diagnostic_util import add_spinner, tree_to_string, run_command, log_write, log_append
from constants import KUBE_CONFIG_LOCATION, MAX_POD_RESTART, LOG_PATH


class Kubernetes():
    def __init__(self):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
        self.core_v1_api = client.CoreV1Api()
        self.pods = None
        self.nodes = None
        self.connected = False

    def get_events(self, kind, name):
        output = ""
        try:
            events = self.core_v1_api.list_event_for_all_namespaces(field_selector="involvedObject.kind={},involvedObject.name={}".format(kind, name))
            for event in events.items:
                output = output + "{} -- {}\n".format(event.reason, event.message)
        except ApiException as exc:
            output = str(exc)
            log_write("{}/{}-events.log".format(LOG_PATH, name), output)

    def get_container_logs(self, pod, container_name):
        output = ""
        try:
            output = self.core_v1_api.read_namespaced_pod_log(name=pod.metadata.name,
                namespace=pod.metadata.namespace, container=container_name)
        except ApiException as exc:
            output = str(exc)
        except Exception as exc:
            output = str(exc)
            log_write("{}/{}.{}.log".format(LOG_PATH, pod.metadata.name, container_name), output)

    def gather_container_logs(self, pod):
        try:
            for container in pod.status.container_statuses:
                if not container.ready:
                    self.get_container_logs(pod, container.name)
        except:
            pass

    def check_pod_status(self, pod):
        flag = True
        return_dict = {"name": "{}/{}".format(pod.metadata.namespace, pod.metadata.name)}
        new_conditions = []
        for condition in pod.status.conditions:
            if (condition.type == "Ready" or condition.type == "PodScheduled") and condition.status != "True":
                message = condition.message
                if not condition.message:
                    message = "containers with unready status"
                new_conditions.append({"name": "Warning: Has {}".format(message)})
                flag = False
        if not flag:
            self.gather_container_logs(pod)
            self.get_events(kind="Pod", name=pod.metadata.name)

        if pod.status.container_statuses:
            for container in pod.status.container_statuses:
                if container.restart_count >= MAX_POD_RESTART:
                    self.get_container_logs(pod, container.name)
                    message = "{} or more than restarts.".format(MAX_POD_RESTART)
                    new_conditions.append({"name": "Warning: {} has {}".format(container.name, message)})
        if len(new_conditions) > 0:
            return_dict["children"] = [dict(t) for t in {tuple(d.items()) for d in new_conditions}]
        return flag, return_dict

    @add_spinner
    def check_kubernetes_connection(self):
        try:
            stdout, rtn_code = run_command("kubectl get --raw='/readyz?verbose'")
            if rtn_code == 0 and "readyz check passed" in stdout:
                self.connected = True
                return (True, 'Readyz check passed')
            else:
                log_append("{}/kubernetes-exception.log".format(LOG_PATH), stdout)
                return (False, 'Readyz check Failed.')
        except Exception as exc:
            log_append("{}/kubernetes-exception.log".format(LOG_PATH), stdout)
            return (False, "Error checking kubernetes connection")

    def parse_node_condition(self, node):
        return_flag = True
        node_status = self.core_v1_api.read_node_status(node.metadata.name)
        return_dict = {"name": node.metadata.name}
        new_conditions = []
        for condition in node_status.status.conditions:
            if condition.type != "Ready":
                if condition.status != "False":
                    new_conditions.append({"name": "Warning: {}".format(condition.message)})
                    return_flag = False
            elif condition.type == "Ready" and condition.status != "True":
                new_conditions.append({ "name": "Warning: {}".format(condition.message)})
                return_flag = False
        if not return_flag:
            self.get_events(kind="Node", name=node.metadata.name)
            return_dict["children"] = [dict(t) for t in {tuple(d.items()) for d in new_conditions}]
        return return_flag, return_dict

    @add_spinner
    def check_kubernetes_nodes(self):
        return_flag = True
        return_text = ""
        try:
            if not self.connected:
                return (False, 'Unable to connect to api server.')
            data = {"name": ""}
            new_nodes = []
            self.nodes = self.core_v1_api.list_node().items
            for node in self.nodes:
                flag, rtn_dict = self.parse_node_condition(node)
                if not flag:
                    return_flag = flag
                    new_nodes.append(rtn_dict)
            if return_flag:
                return_text = "All nodes are ready"
            else:
                data["children"] = new_nodes
                return_text = tree_to_string(data)
            return (return_flag, return_text)
        except Exception as exc:
            log_append("{}/kubernetes-exception.log".format(LOG_PATH), str(exc))
            return (False, "Error checking kubernetes nodes.")

    @add_spinner
    def check_kubernetes_pods(self):
        return_flag = True
        return_text = "All pods are ready"
        data = {"name": ""}
        new_pods = []
        try:
            if not self.connected:
                return (False, 'Unable to connect to api server.')
            pod_list = []
            for ns in self.core_v1_api.list_namespace().items:
                pod_list = pod_list + self.core_v1_api.list_namespaced_pod(ns.metadata.name).items
            self.pods = pod_list
            for pod in self.pods:
                flag, rtn_dict = self.check_pod_status(pod=pod)
                if not flag:
                    return_flag = flag
                    new_pods.append(rtn_dict)
            if len(new_pods) > 0:
                data["children"] = new_pods
                return_text = tree_to_string(data)
            return (return_flag, return_text)
        except Exception as exc:
           log_append("{}/kubernetes-exception.log".format(LOG_PATH), str(exc))
           return (False, "Error checking kubernetes pods.")

@add_spinner
def check_kubernetes_config():
    try:
        st = os.stat(KUBE_CONFIG_LOCATION)
    except FileNotFoundError as exc:
        log_append("{}/kubernetes-exception.log".format(LOG_PATH), str(exc))
        return (False, 'Kubernetes Config - File not found')
    return (True, 'Valid')

def check_kubernetes() -> Kubernetes:
    config = check_kubernetes_config()
    if config:
        kube = Kubernetes()
        kube.check_kubernetes_connection()
        kube.check_kubernetes_nodes()
        kube.check_kubernetes_pods()
        return kube
    return None
