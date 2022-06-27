import json
from typing import Tuple

from app.models import Model
from app.models.settings.minio_settings import RepoSettingsModel
from kubernetes import client
from tests.unit import TEST_SAMPLES_DIR


def mock_get_kubernetes_secret(name, namespace="default"):
    if name == RepoSettingsModel.KUBECTL_MINIO_BUCKET_NAME:
        return client.V1Secret(data = {'s3.client.default.bucket': 'dGZwbGVudW0='})
    elif name == RepoSettingsModel.KUBECTL_MINIO_USERNAME_SECRET_NAME:
        return client.V1Secret(data = {'s3.client.default.access_key': 'dGVzdHVzZXI='})
    elif name == RepoSettingsModel.KUBECTL_MINIO_PASSWORD_SECRET_NAME:
        return client.V1Secret(data =  {'s3.client.default.secret_key': 'cGFzc3dvcmQ='})


class MockWorker(Model):

    def __init__(self, name, hostname, pid, state, last_heart_beat,
                birth_date,successful_job_count,failed_job_count,total_working_time) -> None:
        self.name = name
        self.hostname = hostname
        self.pid = pid
        self.state = state
        self.last_heartbeat = last_heart_beat
        self.birth_date = birth_date
        self.successful_job_count = successful_job_count
        self.failed_job_count = failed_job_count
        self.total_working_time = total_working_time
        self.current_job = self.get_current_job()

    def get_current_job(self):
        return None


class MockJobID(Model):

    def __init__(self, job_id, redis_key) -> None:
        self.job_id = job_id
        self.redis_key = redis_key


class MockJobID2(Model):

    def __init__(self, unused_param):
        self.job_id = 'bd19eeb80-5499-4223-8685-a5103bcf47e8'
        self.redis_key = 'rq:job:bd19eeb80-5499-4223-8685-a5103bcf47e8'


class MockSnapshotClient:

    def get_repository(self, repository=None, params=None, headers=None):
        return {
            "tfplenum" : {
                "type" : "s3",
                "uuid" : "K8LmDYhtSxGEGCpqz4UyWA",
                "settings" : {
                "bucket" : "tfplenum",
                "client" : "default",
                "endpoint" : "10.40.12.20:9001",
                "protocol" : "http"
                }
            }
        }


class MockCatClient:

    def indices(self, index=None, params=None, headers=None):
        with open(TEST_SAMPLES_DIR + "/index_cat_data.json", "r") as fhandle:
            return json.loads(fhandle.read())


class MockIndicesClient:

    def get_alias(self, index=None, name=None, params=None, headers=None):
        with open(TEST_SAMPLES_DIR + "/index_alias_data.json", "r") as fhandle:
            return json.loads(fhandle.read())


class MockElasticsearch():

    def __init__(self):
        self.snapshot = MockSnapshotClient()
        self.cat = MockCatClient()
        self.indices = MockIndicesClient()


class MockMinIOManager:

    def __init__(self, settings: RepoSettingsModel):
        self._settings = settings

    def is_connected(self) -> Tuple[bool, str]:
        if self._settings.password == "invalid_password":
            return False, "Invalid Password"
        return True, ''

    def create_bucket(self, bucket_name: str):
        pass
