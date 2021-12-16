from elasticsearch.client import Elasticsearch
from app.service.socket_service import NotificationCode, NotificationMessage
from app.utils.connection_mngs import REDIS_CLIENT
from app.utils.elastic import ElasticWrapper
from app.utils.logging import rq_logger
from app.utils.utils import get_app_context
from rq.decorators import job

_JOB_NAME = "curator"

def _notification_inprogress(action):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s %s job in progress." % (_JOB_NAME.capitalize(), action))
    notification.set_status(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()


def _empty_index(msg: str) -> None:
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message(msg)
    notification.set_status(NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()

def _remove_index_blocks(client, index) -> None:
    try:
        client.indices.put_settings(index=index, body={"index.blocks.read_only_allow_delete": None})
    except Exception as e:
        rq_logger.exception(e)
    try:
        client.indices.put_settings(index=index, body={"index.blocks.write": None})
    except Exception as e:
        rq_logger.exception(e)
    try:
        client.indices.put_settings(index=index, body={"index.blocks.read": None})
    except Exception as e:
        rq_logger.exception(e)


def _run_forcemerged(client: Elasticsearch) -> None:
    try:
        client.indices.forcemerge(params={"only_expunge_deletes": "true", "ignore_unavailable": "true"})
    except Exception as e:
        rq_logger.exception(e)


@job('default', connection=REDIS_CLIENT, timeout="30m")
def execute_curator(action, index_list, units, age):
    get_app_context().push()
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s %s job started." % (_JOB_NAME.capitalize(), action))
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()
    client = ElasticWrapper(timeout=120)
    is_successfully = False
    run_forcemerge = False
    for index in index_list:
        msg_action = "index management"
        if action == "CloseIndices":
            msg_action = "closed"
        elif action == "DeleteIndices":
            msg_action = "deleted"
        elif action == "CleanUpOptimize":
            msg_action == "clean_optimize"

        # Default to a failed message
        notification_msg = "%s failed to %s %s index" % (_JOB_NAME.capitalize(), msg_action, index)

        results = None
        _remove_index_blocks(client, index)
        if action == "DeleteIndices":
            write_block_results = client.indices.put_settings(index=index, body={"index.blocks.read_only_allow_delete":True})
            results = client.indices.delete(index=index)
            if results['acknowledged']:
                run_forcemerge = True
                is_successfully = True
            _notification_inprogress(action)
        elif action == "CloseIndices":
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
            if results['acknowledged']:
                is_successfully = True

        if is_successfully:
            notification_msg = "%s successfully %s %s index." % (_JOB_NAME.capitalize(), msg_action, index)
            notification.set_message(notification_msg)
            notification.set_status(NotificationCode.IN_PROGRESS.name)
            notification.post_to_websocket_api()
        elif not is_successfully:
            notification.set_message(notification_msg)
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_exception(exception=str(results))
            notification.post_to_websocket_api()

    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s %s job completed." % (_JOB_NAME.capitalize(), action))
    notification.set_status(NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()

    if run_forcemerge:
        _run_forcemerged(client)

    return True
