import json
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch
from elasticsearch.client import SnapshotClient
from elasticsearch.exceptions import RequestError
from time import sleep
from typing import Dict, List


class ElasticsearchManager:
    default_repo = "tfplenum"
    managed_indicies = "logstash-*,endgame-*,filebeat-*,winlogbeat-*"

    def __init__(self, elastic_ip: str):
        self._elastic_ip = elastic_ip
        self._es = Elasticsearch([self._elastic_ip])
        self._snapper = SnapshotClient(self._es)

    def register_repository(self, repo_name: str=default_repo) -> Dict:
        """
        Registers the repository so snapshots can be made.

        :return: {'acknowledged': True}
        """
        snap_body = {
            "type": "fs",
            "settings": {
                "location": "/mnt/elastic_snapshots",
                "compress": True
            }
        }
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
            "indices": self.managed_indicies,
            "ignore_unavailable": True,
            "include_global_state": False,
            "metadata": {
                "taken_by": "tfplenum_ctrl",
                "taken_because": "Backup of all related tfplenum indices which includes logstash-*,endgame-*,filebeat-*, and winlogbeat-*."
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
        print(json.dumps(snapshot, indent=4, sort_keys=True))
        return snapshot["state"]
        # future_time = datetime.utcnow() + timedelta(seconds=timeout_seconds)
        # while snapshot["state"] != "SUCCESS":
        #     sleep(5)
        #     if future_time <= datetime.utcnow():

    def restore_snapshot(self, snap_name: str, repo_name: str=default_repo):
        body = {
            "rename_pattern": "filebeat-(.+)",
            "rename_replacement": "restored-filebeat-$1"
        }

        ret_val = self._snapper.restore(repo_name, snap_name, body)
        print(ret_val)
        print(type(ret_val))

    def get_snapshots(self, repo_name: str=default_repo) -> List[Dict]:
        ret_val = self._snapper.get(repo_name, "_all")
        return ret_val["snapshots"]

# {
#   "indices": [
#     "filebeat-suricata-2019.11.06-000001"
#   ],
#   "rename_pattern": "filebeat-(.+)",
#   "rename_replacement": "restored-filebeat-$1"
# }
if __name__ == '__main__':
    mng = ElasticsearchManager("172.16.77.210")
    # mng.take_snapshot("snapshot_1")
    # mng.verify_repository()
    # print(mng.register_repository())
    print(mng.verify_repository())
    # mng.get_repository()
    # mng.get_repository()
    #mng.take_snapshot("snapshot_3")

    # mng.restore_snapshot("snapshot_1")
    # mng.get_snapshots()
    # print(mng.snapshot_status("snapshot_3"))
