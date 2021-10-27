from base64 import b64decode
from typing import Dict, List

from app.utils.utils import get_domain
from elasticsearch import Elasticsearch
from elasticsearch.client import ClusterClient, IndicesClient, SnapshotClient
from elasticsearch.exceptions import ConflictError
from kubernetes import client, config, utils
from kubernetes.client.rest import ApiException

from .constants import CA_BUNDLE

ELASTIC_OP_GROUP = "elasticsearch.k8s.elastic.co"
ELASTIC_OP_VERSION = "v1"
ELASTIC_OP_NAMESPACE = "default"
ELASTIC_OP_NAME = "tfplenum"
ELASTIC_OP_PLURAL = "elasticsearches"
KUBE_CONFIG_LOCATION = "/root/.kube/config"


def get_elastic_password(name='tfplenum-es-elastic-user', namespace='default'):
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_secret(name, namespace)
    password = b64decode(response.data['elastic']).decode('utf-8')
    return password

def get_elastic_service_ip(name='elasticsearch', namespace='default'):
    ip_address = None
    port= None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    # Try to get the external ip
    ip_address = response.spec.external_i_ps
    if ip_address is None:
        ip_address = response.spec.load_balancer_ip
    if ip_address is None:
        ip_address = response.status.load_balancer.ingress[0].ip

    # Get the port
    port = response.spec.ports[0].port

    return ip_address, port

def get_kibana_fqdn(name='kibana', namespace='default'):
    fqdn = None
    port= None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    fqdn =  "{name}.{domain}".format(name=name,domain=get_domain())
    # Get the port
    port = response.spec.ports[0].port

    return fqdn, port

def get_elastic_fqdn(name='elasticsearch', namespace='default'):
    fqdn = None
    port= None
    if not config.load_kube_config(config_file=KUBE_CONFIG_LOCATION):
        config.load_kube_config(config_file=KUBE_CONFIG_LOCATION)
    core_v1_api = client.CoreV1Api()
    response = core_v1_api.read_namespaced_service(name, namespace)

    fqdn =  "{name}.{domain}".format(name=name,domain=get_domain())
    # Get the port
    port = response.spec.ports[0].port

    return fqdn, port

def ElasticWrapper() -> Elasticsearch:
    password = get_elastic_password()
    elastic_fqdn, port = get_elastic_fqdn()
    return Elasticsearch(elastic_fqdn, scheme="https",
                           port=port, http_auth=('elastic', password),
                           use_ssl=True, verify_certs=True,
                           ca_certs=CA_BUNDLE)


class ElasticsearchManager:
    default_repo = "tfplenum"
    managed_indicies = "logstash-*,endgame-*,filebeat-zeek-*,filebeat-suricata-*,winlogbeat-*,sessions2-*"

    def __init__(self, elastic_ip: str):
        self._elastic_ip = elastic_ip
        password = get_elastic_password()
        self._es = Elasticsearch([self._elastic_ip],
                                 use_ssl=True,
                                 verify_certs=False,
                                 http_auth=('elastic', password),
                                 scheme="https")

        self._snapper = SnapshotClient(self._es)
        self._cluster_client = ClusterClient(self._es)
        self._indicies_client = IndicesClient(self._es)

    def register_repository(self, snap_body: Dict, repo_name: str=default_repo) -> Dict:
        """
        Registers the repository so snapshots can be made.

        :return: {'acknowledged': True}
        """
        ret_val = self._snapper.create_repository(repository=repo_name, body=snap_body)
        return ret_val

    def get_repository(self, repo_name: str=default_repo) -> Dict:
        """
        Gets existing repository information.

        :return: {'tfplenum': {'type': 'fs', 'settings': {'location': '/mnt/elastic_snapshots/'}}}
        """
        ret_val = self._snapper.get_repository(repository=repo_name)
        return ret_val

    def take_snapshot(self, snapshot_name: str, repo_name: str=default_repo) -> Dict:
        """
        Take a snapshot of the data. This can be a very long operations.

        :return: {'accepted': True}
        """
        body = {
            "ignore_unavailable": True,
            "indices": self.managed_indicies,
            "include_global_state": False,
            "metadata": {
                "taken_by": "tfplenum_ctrl",
                "taken_because": "Backup of all related tfplenum indices which includes ecs-zeek-*,logstash-*,endgame-*,filebeat-*, and winlogbeat-*."
            }
        }
        ret_val = self._snapper.create(repo_name,
                                       snapshot_name,
                                       body)
        return ret_val

    def verify_repository(self, repo_name: str=default_repo) -> Dict:
        """
        :return: {'nodes': {'SkxeVXeGSJO04_umeOJsdg': {'name': 'elasticsearch-master-0'},
                  'n5_OWziJTS6TJI55jfqp0Q': {'name': 'elasticsearch-master-1'},
                  'MpsJ0M3vSVmA_cUw_PkSSA': {'name': 'elasticsearch-master-2'}}}
        """
        ret_val = self._snapper.verify_repository(repo_name)
        return ret_val

    def snapshot_status(self, snap_name: str, repo_name: str=default_repo) -> str:
        ret_val = self._snapper.status(repo_name, snap_name)
        snapshot = ret_val["snapshots"][0]
        return snapshot["state"]

    def get_snapshots(self, repo_name: str=default_repo) -> List[Dict]:
        ret_val = self._snapper.get(repo_name, "_all")
        return ret_val["snapshots"]

    def prep_for_restart(self):
        # follows https://www.elastic.co/guide/en/elasticsearch/reference/7.0/restart-upgrade.html
        body = {
            "persistent": {
                "cluster.routing.allocation.enable": "primaries"
            }
        }
        ret_val = self._cluster_client.put_settings(body)
        if ret_val["acknowledged"]:
            try:
                ret_val = self._indicies_client.flush_synced()
            except ConflictError as e:
                print(str(e))
        else:
            raise Exception("Failed to set routing allocation.")

    def reenable_allocation(self) -> bool:
        # follows https://www.elastic.co/guide/en/elasticsearch/reference/7.0/restart-upgrade.html
        body = {
            "persistent": {
                "cluster.routing.allocation.enable": None
            }
        }
        ret_val = self._cluster_client.put_settings(body)
        return ret_val["acknowledged"]

    def is_cluster_green(self) -> bool:
        try:
            ret_val = self._cluster_client.health()
            return ret_val['status'].lower() == 'green'
        except Exception:
            pass
        return False

    def is_cluster_yellow(self) -> bool:
        try:
            ret_val = self._cluster_client.health()
            return ret_val['status'].lower() == 'yellow'
        except Exception:
            pass
        return False
