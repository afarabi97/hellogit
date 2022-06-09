import os
import certifi
import urllib3
from minio import Minio
from typing import Dict, Tuple
from urllib3.exceptions import MaxRetryError
from minio.error import S3Error, InvalidResponseError
from app.models.settings.minio_settings import RepoSettingsModel
from app.utils.connection_mngs import FabricConnectionManager


class MinIOManager:

    def __init__(self, settings: RepoSettingsModel):
        self._settings = settings
        timeout = 5
        http_client = urllib3.PoolManager(
            timeout=urllib3.util.Timeout(connect=timeout, read=timeout),
            maxsize=10,
            cert_reqs='CERT_NONE',
            # cert_reqs='CERT_REQUIRED',
            # ca_certs=os.environ.get('SSL_CERT_FILE') or certifi.where(),
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

    def get_available_data_drive_space(self) -> int:
        """Grabs available data drive space of the MinIO server

        Raises:
            Exception: Throws exception if it fails to find the data partition

        Returns:
            int: data drive size in Kilobytes
        """
        # buckets = self._client.list_buckets()
        with FabricConnectionManager("root", self._settings.password, self._settings.ip_address) as shell:
            ret_val = shell.sudo("df")
            for line in ret_val.stdout.split("\n"):
                if "/data" in line:
                    return int(line.split()[3])

        raise Exception("Failed to find data drive space on MinIO server.")
