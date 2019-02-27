from shared.connection_mngs import KubernetesWrapper
from kubernetes.client.apis.core_v1_api import CoreV1Api
from kubernetes.client.models.v1_pod import V1Pod
from kubernetes.client.models.v1_pod_list import V1PodList
from kubernetes.client.models.v1_node_list import V1NodeList
from pprint import pprint


def print_pod_allocations(api_instance: KubernetesWrapper):
    api_response = api_instance.list_pod_for_all_namespaces() # type: V1PodList
    for pod in api_response.items:
        # pprint(pod)
        # break
        print("POD Name: " + pod.metadata.name)
        print("Namespace: " + pod.metadata.namespace)
        print("Node name: " + pod.spec.node_name)
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
        # change_pod_resources(api_instance)
        # print_pod_resources(api_instance)

if __name__ == '__main__':
    main()
                