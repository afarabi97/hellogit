from app.utils.connection_mngs import KubernetesWrapper


def _get_pod_name(ip_address: str, component: str) -> str:
    with KubernetesWrapper() as kube_apiv1:
        api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
        for pod in api_response.to_dict()["items"]:
            if ip_address == pod["status"]["host_ip"]:
                try:
                    if component == pod["metadata"]["labels"]["component"]:
                        return pod["metadata"]["name"]
                except KeyError:
                    pass

    raise ValueError("Failed to find %s pod name." % component)


def get_suricata_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "suricata")


def get_zeek_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "zeek")


def get_arkime_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "arkime")
