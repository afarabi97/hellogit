from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import REDIS_CLIENT
from app.utils.elastic import ElasticWrapper
from app.utils.logging import rq_logger
from app.utils.utils import get_app_context
from app.models.curator import CuratorProcessModel
from datetime import datetime
from elasticsearch.client import Elasticsearch
from rq.decorators import job
from typing import List, Tuple
from app.models.settings.minio_settings import RepoSettingsModel


_JOB_NAME = "curator"


def _remove_index_blocks(client, index) -> None:
    try:
        client.indices.put_settings(
            index=index, body={"index.blocks.read_only_allow_delete": None}
        )
    except Exception as e:
        rq_logger.exception(e)
    try:
        client.indices.put_settings(
            index=index, body={"index.blocks.write": None})
    except Exception as e:
        rq_logger.exception(e)
    try:
        client.indices.put_settings(
            index=index, body={"index.blocks.read": None})
    except Exception as e:
        rq_logger.exception(e)


def _run_forcemerged(client: Elasticsearch) -> None:
    try:
        client.indices.forcemerge(
            params={"only_expunge_deletes": "true",
                    "ignore_unavailable": "true"}
        )
    except Exception as e:
        rq_logger.exception(e)


def _rollover_and_close_action(client: Elasticsearch, index: str) -> bool:
    """
    First rolls and index over before subsequently closing it.
    """
    idx = client.indices.get(index=index)
    aliases = idx[index]["aliases"]
    if aliases:
        is_write_index = False
        alias_name = list(aliases.keys())[0]
        if "is_write_index" in aliases[alias_name]:
            is_write_index = aliases[alias_name]["is_write_index"]
        if is_write_index:
            client.indices.rollover(alias_name)
    results = client.indices.close(index=index)
    if results["acknowledged"]:
        return True
    return False


def _backup_indexes(client: Elasticsearch, indexes: List[str]) -> Tuple[bool, str, List[str]]:
    model = RepoSettingsModel.load_from_kubernetes_and_elasticsearch()
    indexes_str = ','.join(indexes)
    body = {
        "ignore_unavailable": True,
        "indices": indexes_str,
        "include_global_state": False,
        "metadata": {
            "taken_by": "tfplenum_ctrl",
            "taken_because": f"Backup of {indexes_str}",
        },
    }
    params = {"wait_for_completion": "true"}
    now = datetime.utcnow()
    snapshot_name = "tfplenum_backup_" + now.strftime("%Y-%m-%d_%H:%M:%S")
    result = client.snapshot.create(model.bucket, snapshot_name, body, params=params)
    return result["snapshot"]["state"] == "SUCCESS", snapshot_name, result["snapshot"]["failures"]


@job("default", connection=REDIS_CLIENT, timeout="30m")
def execute_curator(model: CuratorProcessModel):
    """Process the elasticsearch indicies based on supplied model. Possible actions include:
    1. CloseIndicies
    2. BackupIndicies
    3. DeleteIndicies

    Args:
        model (CuratorProcessModel): The model that contains an action and indicies to perform action on.

    """
    get_app_context().push()
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_and_send(f"{ _JOB_NAME.capitalize() } { model.action } job started.",
                              NotificationCode.STARTED.name)
    client = ElasticWrapper(timeout=120)
    is_successfully = False
    run_forcemerge = False
    for index in model.index_list:
        msg_action = "index management"
        if model.action == "CloseIndices" or model.action == "BackupIndices":
            msg_action = "closed"
        elif model.action == "DeleteIndices":
            msg_action = "deleted"

        results = None
        _remove_index_blocks(client, index)
        if model.action == "DeleteIndices":
            client.indices.put_settings(
                index=index, body={"index.blocks.read_only_allow_delete": True}
            )
            results = client.indices.delete(index=index)
            if results["acknowledged"]:
                run_forcemerge = True
                is_successfully = True
            notification.set_and_send(f"{ _JOB_NAME.capitalize() } { model.get_readable_action() } job in progress.", NotificationCode.IN_PROGRESS.name)
        elif model.action == "CloseIndices" or model.action == "BackupIndices":
            is_successfully = _rollover_and_close_action(client, index)

        if is_successfully:
            notification_msg = f"{ _JOB_NAME.capitalize() } successfully { msg_action } { index } index."
            notification.set_and_send(notification_msg, NotificationCode.IN_PROGRESS.name)
        elif not is_successfully:
            # Default to a failed message
            notification_msg = f"{ _JOB_NAME.capitalize() } failed to { msg_action } { index } index."
            notification.set_and_send(notification_msg, NotificationCode.ERROR.name)

    if model.action == "BackupIndices":
        is_backup_successful, snapshot_name, failures = _backup_indexes(client, model.index_list)
        if is_backup_successful:
            notification_msg = f"{ _JOB_NAME.capitalize() } successfully backed up { ','.join(model.index_list) }. to snapshot { snapshot_name }"
            notification.set_and_send(notification_msg, NotificationCode.IN_PROGRESS.name)
        else:
            notification_msg = f"{ _JOB_NAME.capitalize() } failed to back up { ','.join(model.index_list) }."
            notification.set_and_send(notification_msg, NotificationCode.FAILED.name)
            rq_logger.error(failures)

    notification.set_and_send(f"{ _JOB_NAME.capitalize() } { model.get_readable_action() } job completed.",
                              NotificationCode.COMPLETED.name)

    if run_forcemerge:
        _run_forcemerged(client)

