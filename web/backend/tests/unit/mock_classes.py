import json
from typing import Tuple

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
