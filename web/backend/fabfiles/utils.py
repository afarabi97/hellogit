from fabfiles.connection_wrappers import KubernetesWrapper, MongoConnectionManager


def get_suricata_pod_name(ip_address: str, 
                          mongo_conn: MongoConnectionManager=None) -> str:                                                    
        with KubernetesWrapper(mongo_conn) as kube_apiv1:
            api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
            for pod in api_response.to_dict()['items']:
                if ip_address == pod['status']['host_ip']:
                    if 'suricata' in pod['metadata']['name']:
                        return pod['metadata']['name']

        raise ValueError("Failed to find Suricata pod name.")
