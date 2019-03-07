from shared.connection_mngs import KubernetesWrapper
from kubernetes.client.apis.core_v1_api import CoreV1Api
from kubernetes.client.models.v1_pod import V1Pod
from kubernetes.client.models.v1_pod_list import V1PodList
from kubernetes.client.models.v1_node_list import V1NodeList
from pprint import pprint
from typing import Dict


def convert_GiB_to_MiB(GiB: float) -> float:
    return GiB * 1024


def convert_MiB_to_KiB(MiB: float) -> float:
    return MiB * 1024


def convert_GiB_to_KiB(GiB: float) -> float:
    val = convert_GiB_to_MiB(GiB)
    return convert_MiB_to_KiB(val)


def convert_MiB_to_GiB(MiB: float, round_places=3) -> float:
    ret_val = MiB / 1024
    if round_places > 0:
        return round(ret_val, round_places)
    return ret_val


def convert_KiB_to_GiB(KiB: float, round_places=3) -> float:
    ret_val = KiB / 1024 / 1024
    if round_places > 0:
        return round(ret_val, round_places)
    return ret_val


def convert_GB_to_KB(GB: float) -> float:
    return GB * 1000 * 1000


def print_pod_allocations(api_instance: KubernetesWrapper):
    api_response = api_instance.list_pod_for_all_namespaces() # type: V1PodList
    for pod in api_response.items:
        print("POD Name: " + pod.metadata.name)
        print("Namespace: " + pod.metadata.namespace)
        if pod.spec.node_name:
            print("Node name: " + pod.spec.node_name)
        else:
            print("Node name: Unassigned")

        for container in pod.spec.containers:
            # print("POD Name: " + pod.metadata.name)
            print("\tContainer Name: " + container.name)
            print("\tRequests: " + str(container.resources.requests))
            print("\tLimits  :" + str(container.resources.limits))
        print()


def print_node_capacity(api_instance: KubernetesWrapper):
    api_response = api_instance.list_node() # type: V1NodeList    
    for node in api_response.items:
        print("Node Name: " +  node.metadata.name)
        print("Capacity:    " + str(node.status.capacity))
        print("Allocatable: " + str(node.status.allocatable))
        print()

def _get_cpu_total(requests: Dict) -> int:
    try:
        cpu_str = str(requests['cpu'])
        pos = cpu_str.rfind('m')
        if pos == -1:
            cpu_milli = int(cpu_str) * 1000
        else:
            cpu_milli = int(cpu_str[:pos])
        return cpu_milli
    except KeyError:
        pass
    return 0

def _get_mem_total(requests: Dict) -> int:
    try:
        mem_str = str(requests['memory'])
        pos = mem_str.rfind('Mi')
        if pos == -1:
            pos = mem_str.rfind('Ki')
            if pos == -1:
                pos = mem_str.rfind('Gi')
                if pos == -1:
                    mem = int(mem_str[:pos]) * 1024
                else:
                    mem = convert_GiB_to_KiB(int(mem_str[:pos]))
            else:
                mem = int(mem_str[:pos])
        else:
            mem = convert_MiB_to_KiB(int(mem_str[:pos]))
        return mem
    except KeyError:
        pass
    return 0


class NodeTotals:
    def __init__(self, name: str):
        self.name = name
        self.cpu_total = 0
        self.mem_total = 0

    def __eq__(self, other):
        return self.name == other.name

    def __hash__(self):
        return hash(self.name)    


def print_totals(api_instance: KubernetesWrapper):
    api_response = api_instance.list_pod_for_all_namespaces() # type: V1PodList
    cpu_total = 0
    mem_total = 0
    node_names = {}
    node_names["Unallocated"] = {'cpu_total': 0, 'mem_total': 0}
    for pod in api_response.items:
        if pod.spec.node_name:
            if pod.spec.node_name not in node_names:
                node_names[pod.spec.node_name] = {'cpu_total': 0, 'mem_total': 0}
        
        for container in pod.spec.containers:
            if container.resources.requests:
                cpu = _get_cpu_total(container.resources.requests)
                cpu_total += cpu
                mem = _get_mem_total(container.resources.requests)
                mem_total += mem

                if pod.spec.node_name:
                    node_names[pod.spec.node_name]['cpu_total'] += cpu
                    node_names[pod.spec.node_name]['mem_total'] += mem
                else:
                    node_names["Unallocated"]['cpu_total'] += cpu
                    node_names["Unallocated"]['mem_total'] += mem
                
    print("Total milli CPUs requested:   " + str(cpu_total) + "m")
    print("Total milli Memory requested: " + str(convert_KiB_to_GiB(mem_total)) + "Gi")
    print()
    for key in node_names:
        print("Node Name: " + key)
        print("\tCPUs requested:   " + str(node_names[key]['cpu_total']) + "m")
        print("\tMemory requested: " + str(convert_KiB_to_GiB(node_names[key]['mem_total'])) + "Gi")
        print()

    api_response = api_instance.list_node() # type: V1NodeList
    for key in node_names:
        for node in api_response.items:
            if key == node.metadata.name:
                print("Node Name: " +  node.metadata.name)
                # print("Capacity:    " + str(node.status.capacity))
                cpu_milli = _get_cpu_total(node.status.allocatable)
                cpu_milli -= node_names[key]['cpu_total']

                mem = _get_mem_total(node.status.allocatable)
                mem -= node_names[key]['mem_total']
                print("Remaining Allocatable CPU: " + str(cpu_milli) + "m")
                print("Remaining Allocatable Mem: " + str(convert_KiB_to_GiB(mem)) + "Gi")
                print()


def print_pod_resources(api_instance: KubernetesWrapper):
    api_response = api_instance.read_namespaced_pod("es-master-statefulset-0", "default")
    for container in api_response.spec.containers:
        pprint(container.resources)
    api_response = api_instance.read_namespaced_pod("es-master-statefulset-1", "default")
    for container in api_response.spec.containers:
        pprint(container.resources)

def change_pod_resources(api_instance: KubernetesWrapper):
    api_response = api_instance.read_namespaced_pod("es-master-statefulset-0", "default")
    for container in api_response.spec.containers:
        container.resources.requests['cpu'] = '2' #{'cpu': '2', 'memory': '2Gi'}
    
    api_response.spec.restart_policy = "OnFailure"
    api_response = api_instance.patch_namespaced_pod("es-master-statefulset-0", "default", api_response.spec)
    pprint(api_response.spec.restart_policy)

def main():
    with KubernetesWrapper() as api_instance:
        print_pod_allocations(api_instance)
        print_node_capacity(api_instance)
        print_totals(api_instance)
        # change_pod_resources(api_instance)
        # print_pod_resources(api_instance)

if __name__ == '__main__':
    main()
                