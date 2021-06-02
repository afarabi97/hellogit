import json
from diagnostic_util import MongoConn, parse_systemctl_show, run_command, add_spinner, remove_file, log_append, session, log_write
from kubernetes.client.rest import ApiException
from kubernetes import client, config, utils
from elasticsearch import Elasticsearch
from elasticsearch.client import ClusterClient, SnapshotClient, IndicesClient
from elasticsearch.exceptions import ConflictError
from base64 import b64decode
from constants import KUBE_CONFIG_LOCATION, GENERAL_SETTINGS_FORM, LOG_PATH, CERT
from components.kube import Kubernetes
import urllib3

class ElasticHealth():

    def __init__(self, kube: Kubernetes):
        self.kube = kube
        self.elastic_password = self.get_elastic_password()
        self.domain = self.get_domain()
        self.elastic = self.ElasticWrapper()
        self.session = session("elastic", self.elastic_password)

    def ElasticWrapper(self) -> Elasticsearch:
        try:
            return Elasticsearch("elasticsearch.{}".format(self.domain),
                                use_ssl=True,
                                verify_certs=True,
                                http_auth=('elastic', self.elastic_password),
                                port=9200,
                                scheme="https",
                                ca_certs=CERT )
        except Exception as exc:
            log_append("{}/elastic-exception.log".format(LOG_PATH), str(exc))

    def get_domain(self):
        try:
            mongo_client = MongoConn().mongo_settings()
            result = mongo_client.find_one({"_id": GENERAL_SETTINGS_FORM})
            return result['domain']
        except:
            return None

    def get_elastic_password(self, name='tfplenum-es-elastic-user', namespace='default'):
        try:
            if not self.kube.connected:
                return None
            response = self.kube.core_v1_api.read_namespaced_secret(name, namespace)
            password = b64decode(response.data['elastic']).decode('utf-8')
            return password
        except Exception as exc:
            log_append("{}/elastic-exception.log".format(LOG_PATH), str(exc))

    def get_shards(self):
        log_path = "{}/shards.log".format(LOG_PATH)
        shards = self.elastic.cat.shards(format="json")

        with open(log_path, 'w') as log:
            json.dump(shards, log, indent=4)

        return shards

    def get_unassgined_shards(self):
        unassigned_shards = []
        shards = self.get_shards()
        for shard in shards:
            if shard['state'] == "UNASSIGNED":
                unassigned_shards.append(shard)

        return unassigned_shards

    def get_allocation_explained(self, unassigned_shards):
        log_path = "{}/allocation_explained.log".format(LOG_PATH)
        payload = []

        remove_file(log_path)

        for shard in unassigned_shards:
            if shard['prirep'] == "r":
                shard_type = False
            else:
                shard_type = True

            payload.append({"index": shard['index'], "shard": shard['shard'], "primary": shard_type })

        for body in payload:
            allocation_explained = self.elastic.cluster.allocation_explain(body=body)
            with open(log_path, 'a') as log:
                json.dump(allocation_explained, log, indent=4)

    @add_spinner()
    def check_kibana(self):
        try:
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            log_path = "{}/kibana.log".format(LOG_PATH)
            request = self.session.get("https://kibana.{}/api/status".format(self.domain), verify=False)
            http_code = request.status_code
            kibana_status = request.json()['status']['overall']['state']
            if http_code == 200 and kibana_status == "green":
                return(True, "Kibana is GREEN")
            else:
                with open(log_path, 'w') as log:
                    json.dump(request.json(), log, indent=4)
                return(False, "Kibana is {}".format(kibana_status.upper()))
        except Exception as exc:
            log_write("{}/kibana-exception.log".format(LOG_PATH), str(exc))
            return(False, "Kibana appears to be down")

    @add_spinner()
    def check_elastic_health(self):
        try:
            es_cluster_health = self.elastic.cluster.health()
            if es_cluster_health["status"] == "green":
                return (True, es_cluster_health["status"].upper())

            return (False, "Elastic is in {} state and cluster percentage is at {}".format(es_cluster_health["status"].upper(),
                es_cluster_health["active_shards_percent_as_number"]))
        except Exception as exc:
            log_append("{}/elastic-exception.log".format(LOG_PATH), str(exc))
            return (False, "Unable to get elastic cluster health.")


    @add_spinner()
    def check_elastic_unassgined_shards(self):
        try:
            es_cluster_health = self.elastic.cluster.health()

            if es_cluster_health["unassigned_shards"] > 0:
                unassigned_shards = self.get_unassgined_shards()
                self.get_allocation_explained(unassigned_shards)

                return (False, "Number of unassigned Elastic shards: {}".format(str(es_cluster_health["unassigned_shards"])))

            return (True, str(es_cluster_health["unassigned_shards"]))

        except Exception as exc:
            log_append("{}/elastic-exception.log".format(LOG_PATH), str(exc))
            return (False, "Unable to get elastic shards.")

    @add_spinner()
    def check_elastic_indices(self):
        try:
            log_path = "{}/indices.log".format(LOG_PATH)
            check_index = []
            indices = self.elastic.cat.indices().splitlines()

            remove_file(log_path)

            for index in indices:
                if index[:5] != "green":
                    check_index.append(index)
                    log_append(log_path, index)

            if len(check_index) == 0:
                return (True, "All Elastic indices are GREEN")

            return (False, "Number of Elastic indices that returned YELLOW or RED status: {}". format(len(check_index)))
        except Exception as exc:
            log_append("{}/elastic-exception.log".format(LOG_PATH), str(exc))
            return (False, "Unable to get elastic indices.")

def check_elastic(kube: Kubernetes):
    elastic = ElasticHealth(kube)
    elastic.check_kibana()
    elastic.check_elastic_health()
    elastic.check_elastic_unassgined_shards()
    elastic.check_elastic_indices()
