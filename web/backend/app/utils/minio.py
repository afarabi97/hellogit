import os
import certifi
import urllib3
from minio import Minio
from typing import Dict, Tuple
from urllib3.exceptions import MaxRetryError
from minio.error import S3Error, InvalidResponseError
from app.models.settings.minio_settings import RepoSettingsModel


class MinIOManager:

    def __init__(self, settings: RepoSettingsModel):
        timeout = 5
        http_client = urllib3.PoolManager(
            timeout=urllib3.util.Timeout(connect=timeout, read=timeout),
            maxsize=10,
            cert_reqs='CERT_REQUIRED',
            ca_certs=os.environ.get('SSL_CERT_FILE') or certifi.where(),
            retries=urllib3.Retry(
                total=1,
                backoff_factor=0.2,
                status_forcelist=[500, 502, 503, 504]
            )
        )
        is_secure = settings.protocol == "https"
        self._client = Minio(
            f"{settings.ip_address}:{settings.port}",
            access_key=f"{settings.username}",
            secret_key=f"{settings.password}",
            secure=is_secure,
            http_client=http_client
        )

    def is_connected(self) -> Tuple[bool, str]:
        try:
            self._client.list_buckets()
            return True, ''
        except MaxRetryError:
            return False, "Connection to MinIO timed out."
        except InvalidResponseError as e:
            msg = str(e)
            start_tag = "<Message>"
            pos1 = msg.find(start_tag)
            pos2 = msg.find("</Message>")
            message = msg[pos1 + len(start_tag): pos2]
            return False, message
        except S3Error as e:
            return False, e.message
        except Exception as e:
            return False, str(e)

    def create_bucket(self, bucket_name: str):
        if not self._client.bucket_exists(bucket_name):
            self._client.make_bucket(bucket_name)
