from ipaddress import IPv4Address
from typing import Dict

from app.models import Model
from app.utils.elastic import ElasticWrapper, wait_for_elastic_cluster_ready
from app.utils.kubernetes import (create_or_patch_kubernetes_secret,
                                  get_kubernetes_secret,
                                  patch_kubernetes_secret)
from app.utils.logging import rq_logger
from app.utils.namespaces import SETINGS_NS
from app.utils.utils import base64_to_string, string_to_base64
from elasticsearch.exceptions import ConnectionError, NotFoundError
from flask_restx import fields
from kubernetes.client.exceptions import ApiException
from kubernetes.config.config_exception import ConfigException
from marshmallow import Schema
from marshmallow import fields as marsh_fields
from marshmallow import post_load, validate


class RepoSettingsSchema(Schema):
    username = marsh_fields.Str(required=True)
    password = marsh_fields.Str(required=True)
    ip_address = marsh_fields.IPv4(required=True)
    port = marsh_fields.Integer(required=True)
    protocol = marsh_fields.Str(required=True, validate=validate.OneOf(["http", "https"]))
    bucket = marsh_fields.Str(required=True)

    @post_load
    def create_RepoSettings(self, data: Dict, many: bool, partial: bool):
        return RepoSettingsModel(**data)
class RepoSettingsModel(Model):
    DTO = SETINGS_NS.model('RepoSettings', {
        "username": fields.String(example="user",
                                  description="MinIO repository username"),
        "password": fields.String(example="password",
                                  description="MinIO repository password."),
        "ip_address": fields.String(example="10.10.10.10",
                                    description="Repo IP Address."),
        "port": fields.String(example="9001",
                              description="MinIO repository port."),
        "protocol": fields.String(example="http",
                                  description="Web protocol http or https."),
        "bucket": fields.String(example="tfplenum",
                                description="S3 bucket name and elasticsearch backup respository name."),

    })
    schema = RepoSettingsSchema()
    KUBECTL_MINIO_USERNAME_SECRET_NAME = "s3-access-key"
    KUBECTL_MINIO_USERNAME_DATA_KEY = "s3.client.default.access_key"

    KUBECTL_MINIO_BUCKET_NAME = "s3-bucket-name"
    KUBECTL_MINIO_BUCKET_KEY = "s3.client.default.bucket"

    KUBECTL_MINIO_PASSWORD_SECRET_NAME = "s3-secret-key"
    KUBECTL_MINIO_PASSWORD_DATA_KEY = "s3.client.default.secret_key"

    def __init__(self, username: str,
                       password: str,
                       ip_address: IPv4Address,
                       port: int,
                       protocol: str,
                       bucket: str):
        self.username = username
        self.password = password
        self.ip_address = str(ip_address)
        self.port = int(port)
        self.protocol = protocol
        self.bucket = bucket

    def _create_elastic_s3_repository_settings(self):
        return {
            "type": "s3",
            "settings": {
                "bucket": self.bucket,
                "client": "default",
                "endpoint": f"{self.ip_address}:{self.port}",
                "protocol": self.protocol,
            },
        }

    def save_to_kubernetes_and_elasticsearch(self):
        """
        Saves the model to both Kubernetes secrets as well as creates a repo in elasticsearch.
        """
        base64_s3_access_key = get_kubernetes_secret(RepoSettingsModel.KUBECTL_MINIO_USERNAME_SECRET_NAME).data[
            RepoSettingsModel.KUBECTL_MINIO_USERNAME_DATA_KEY
        ]
        base64_s3_secret_key = get_kubernetes_secret(RepoSettingsModel.KUBECTL_MINIO_PASSWORD_SECRET_NAME).data[
            RepoSettingsModel.KUBECTL_MINIO_PASSWORD_DATA_KEY
        ]

        secrets_changed = False
        if base64_s3_access_key != string_to_base64(self.username):
            body = {
                "data": {
                    RepoSettingsModel.KUBECTL_MINIO_USERNAME_DATA_KEY: string_to_base64(self.username)
                }
            }
            patch_kubernetes_secret(RepoSettingsModel.KUBECTL_MINIO_USERNAME_SECRET_NAME, body)
            secrets_changed = True

        if base64_s3_secret_key != string_to_base64(self.password):
            body = {
                "data": {
                    RepoSettingsModel.KUBECTL_MINIO_PASSWORD_DATA_KEY: string_to_base64(self.password)
                }
            }
            patch_kubernetes_secret(RepoSettingsModel.KUBECTL_MINIO_PASSWORD_SECRET_NAME, body)
            secrets_changed = True

        body = {
            self.KUBECTL_MINIO_BUCKET_KEY: string_to_base64(self.bucket)
        }
        create_or_patch_kubernetes_secret(self.KUBECTL_MINIO_BUCKET_NAME, body)

        if secrets_changed:
            rq_logger.debug("waiting for elastic to be ready")
            # We must wait for elasticsearch cluster to fully rotate / restart before we can create the repository.
            # If we do not wait the create_repository call will fail.
            wait_for_elastic_cluster_ready()

        elastic_client = ElasticWrapper()
        value = elastic_client.snapshot.create_repository(self.bucket,
                                                          self._create_elastic_s3_repository_settings())
        rq_logger.debug(value)

    @classmethod
    def load_repo_settings_from_request(cls, payload: Dict) -> 'RepoSettingsModel':
        """
        {'ip_address': '10.40.12.20', 'protocol': 'http', 'bucket': 'tfplenum',
        'username': 'assessor', 'password': 'AFtsa;lfkj', 'port': 9000}
        """
        return cls.schema.load(payload)  # type: ignore

    @classmethod
    def load_from_kubernetes_and_elasticsearch(cls) -> 'RepoSettingsModel':
        """
        {'tfplenum': {'type': 's3', 'uuid': 'K8LmDYhtSxGEGCpqz4UyWA', 'settings':
        {'bucket': 'tfplenum', 'client': 'default', 'endpoint': '10.40.12.20:9001', 'protocol': 'http'}}}
        """
        try:
            mng = ElasticWrapper()
            bucket = base64_to_string(get_kubernetes_secret(cls.KUBECTL_MINIO_BUCKET_NAME).data[cls.KUBECTL_MINIO_BUCKET_KEY])
            username = base64_to_string(get_kubernetes_secret(cls.KUBECTL_MINIO_USERNAME_SECRET_NAME).data[cls.KUBECTL_MINIO_USERNAME_DATA_KEY])
            password = base64_to_string(get_kubernetes_secret(cls.KUBECTL_MINIO_PASSWORD_SECRET_NAME).data[cls.KUBECTL_MINIO_PASSWORD_DATA_KEY])

            repo = mng.snapshot.get_repository(repository=bucket)
            pos = repo[bucket]["settings"]["endpoint"].rfind(":")
            ip_address = repo[bucket]["settings"]["endpoint"][0: pos]
            port = repo[bucket]["settings"]["endpoint"][pos + 1:]
            protocol = repo[bucket]["settings"]["protocol"]
            return RepoSettingsModel(username, password, ip_address, port, protocol, bucket)
        except (ConnectionError, ConfigException, ApiException, NotFoundError) as e:
            return RepoSettingsModel("", "", "", 9001, "http", "tfplenum")
