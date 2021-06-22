import os
from elasticsearch import Elasticsearch
from app import REDIS_CLIENT
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from rq.decorators import job
from app.utils.elastic import ElasticWrapper


_JOB_NAME = "curator"
_NUMBER_OF_SHARDS = 3
_NUMBER_OF_REPLICAS = 1
_MAX_NUM_SEGMENTS = 1

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


@job('default', connection=REDIS_CLIENT, timeout="30m")
def execute_curator(action, index_list, units, age):

    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s %s job started." % (_JOB_NAME.capitalize(), action))
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()
    client = ElasticWrapper()
    for index in index_list:
        if action == "CloseIndices":
            msg_action = "closed"
        elif action == "DeleteIndices":
            msg_action = "deleted"

        # Default to a failed message
        notification_msg = "%s failed to %s %s index" % (_JOB_NAME.capitalize(), msg_action, index)

        results = None
        if action == "DeleteIndices":
            results = client.indices.delete(index=index)
            _notification_inprogress(action)
        elif action == "CloseIndices":
            results = client.indices.close(index=index)

        if results['acknowledged']:
            notification_msg = "%s successfully %s %s index." % (_JOB_NAME.capitalize(), msg_action, index)
            notification.set_message(notification_msg)
            notification.set_status(NotificationCode.IN_PROGRESS.name)
            notification.post_to_websocket_api()
        elif isinstance(results, Exception):
            notification.set_message(notification_msg)
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_exception(exception=str(results))
            notification.post_to_websocket_api()

    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s %s job completed." % (_JOB_NAME.capitalize(), action))
    notification.set_status(NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return True
