import traceback
import yaml

from datetime import datetime, timedelta
from time import sleep
from typing import Dict
from app.models.scale import read
from app.models.settings.minio_settings import RepoSettingsModel
from app.service.scale_service import check_scale_status
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import REDIS_CLIENT
from app.utils.elastic import ElasticWrapper
from app.utils.logging import logger, rq_logger
from app.utils.utils import get_app_context
from kubernetes import client, config
from rq.decorators import job

_JOB_NAME = "tools"
ELASTIC_OP_GROUP = "elasticsearch.k8s.elastic.co"
ELASTIC_OP_VERSION = "v1"
ELASTIC_OP_NAMESPACE = "default"
ELASTIC_OP_NAME = "tfplenum"
ELASTIC_OP_PLURAL = "elasticsearches"


def apply_es_deploy(run_check_scale_status: bool = True):
    notification = NotificationMessage(role=_JOB_NAME)
    try:
        deploy_config = read()
        deploy_config_yaml = yaml.dump(deploy_config)
        if not config.load_kube_config():
            config.load_kube_config()
        api = client.CustomObjectsApi()
        api.patch_namespaced_custom_object(
            group=ELASTIC_OP_GROUP,
            version=ELASTIC_OP_VERSION,
            plural=ELASTIC_OP_PLURAL,
            namespace=ELASTIC_OP_NAMESPACE,
            name=ELASTIC_OP_NAME,
            body=yaml.load(deploy_config_yaml, Loader=yaml.FullLoader),
        )
        if run_check_scale_status:
            check_scale_status.delay("Elastic")

        return True
    except Exception as e:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
    return False


@job("default", connection=REDIS_CLIENT, timeout="30m")
def setup_s3_repository(settings: RepoSettingsModel):
    """_summary_

    Args:
        settings (RepoSettingsModel): The MinIO repository object.
    """
    get_app_context().push()
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_and_send("Updating the Elastic S3 repository settings.",
                              NotificationCode.IN_PROGRESS.name)
    try:
        settings.save_to_kubernetes_and_elasticsearch()
        notification.set_and_send("Updated Elastic S3 repository settings.",
                                  NotificationCode.COMPLETED.name)
    except Exception as e:
        rq_logger.exception(e)
        message = str(e)
        if "repository_exception" in message:
            message = "Confirm bucket name is correct in Repository Settings page"
        notification.set_and_send(message, NotificationCode.ERROR.name)


def get_elasticsearch_license() -> Dict:
    client = ElasticWrapper()
    return client.license.get()


@job("default", connection=REDIS_CLIENT, timeout="30m")
def check_elastic_license(current_license: dict):
    get_app_context().push()
    future_time = datetime.utcnow() + timedelta(minutes=10)
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("Checking for Elastic license updates")
    notification.set_status(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()
    try:
        while True:
            sleep(10)
            new_license = get_elasticsearch_license()
            if new_license != current_license:
                lic = new_license["license"]
                notification = NotificationMessage(role=_JOB_NAME)
                notification.set_message(
                    "Elastic License Updated. Type: {type}, Status: {status}, Expiration: {exp}.".format(
                        type=lic["type"], status=lic["status"], exp=lic["expiry_date"]
                    )
                )
                notification.set_status(NotificationCode.COMPLETED.name)
                notification.post_to_websocket_api()
                return True
            elif future_time <= datetime.utcnow():
                notification = NotificationMessage(role=_JOB_NAME)
                notification.set_message(
                    "Elastic License hasn't changed for 10 minutes. See Elastic Operator and/or Elasticsearch logs."
                )
                notification.set_status(NotificationCode.ERROR.name)
                notification.post_to_websocket_api()
                logger.info("Possibly issue applying new Elastic License.")
                logger.info("Original license: " + current_license)
                logger.info("License Now: " + new_license)
                return False

    except Exception as e:
        rq_logger.debug(str(e))
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
