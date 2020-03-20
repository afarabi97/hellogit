from fabfiles.connection_wrappers import KubernetesWrapper, MongoConnectionManager


def _get_pod_name(ip_address: str,
                  component: str,
                  mongo_conn: MongoConnectionManager=None) -> str:
    with KubernetesWrapper(mongo_conn) as kube_apiv1:
        api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
        for pod in api_response.to_dict()['items']:
            if ip_address == pod['status']['host_ip']:
                try:
                    if component == pod['metadata']['labels']['component']:
                        return pod['metadata']['name']
                except KeyError:
                    pass

    raise ValueError("Failed to find %s pod name." % component)


def get_suricata_pod_name(ip_address: str,
                          mongo_conn: MongoConnectionManager=None) -> str:
    return _get_pod_name(ip_address, 'suricata', mongo_conn)


def get_bro_pod_name(ip_address: str,
                     mongo_conn: MongoConnectionManager=None) -> str:
    return _get_pod_name(ip_address, 'zeek', mongo_conn)
