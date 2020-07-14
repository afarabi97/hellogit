from app import celery
from app.curator_ext import ExtClose, ExtDeleteIndices
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from pathlib import Path
import curator
from elasticsearch import Elasticsearch
from flask import request, jsonify, Response
from app.service.scale_service import get_elastic_password, get_elastic_service_ip


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


@celery.task
def execute_curator(action, index_list, units, age):

    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s %s job started." % (_JOB_NAME.capitalize(), action))
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()
    password = get_elastic_password()
    service_ip, port = get_elastic_service_ip()
    client = Elasticsearch(service_ip, scheme="https", port=port, http_auth=('elastic', password), use_ssl=True, verify_certs=False)
    for index in index_list:
        ilo = curator.IndexList(client)
        ilo.filter_by_regex(kind='prefix', value=index)

        if not ilo.indices:
            msg = "%s %s - Index not found." % (_JOB_NAME.capitalize(), action)
            _empty_index(msg)
            return False

        if action == "DeleteIndices":
            ilo.filter_closed(exclude=False)
        else:
            ilo.filter_closed()
        indices = ilo.indices

        if action == "CloseIndices":
            msg_action = "closed"
        elif action == "DeleteIndices":
            msg_action = "deleted"

        if not indices:
            msg = "%s %s - Something went wrong verify %s index exists." % (_JOB_NAME.capitalize(), action, index)
            if action == "CloseIndices":
                msg = "%s %s - %s Index appears to already be closed or deleted." % (_JOB_NAME.capitalize(), action, index)
            elif action == "DeleteIndices":
                msg = "%s %s - %s Index appears to be open.  Close index before deleting." % (_JOB_NAME.capitalize(), action, index)
            _empty_index(msg)
            return False

        # Default to a failed message
        notification_msg = "%s failed to %s %s index" % (_JOB_NAME.capitalize(), msg_action, index)
        if indices:
            results = None
            if action == "DeleteIndices":
                delete_indices = ExtDeleteIndices(ilo=ilo)
                _notification_inprogress(action)
                results = delete_indices.do_action()
            elif action == "CloseIndices":
                close_indices = ExtClose(ilo=ilo)
                results = close_indices.do_action()

            if results:
                notification_msg = "%s successfully %s %s index." % (_JOB_NAME.capitalize(), msg_action, index)
                notification.set_message(notification_msg)
                notification.set_status(NotificationCode.IN_PROGRESS.name)
                notification.post_to_websocket_api()
            elif isinstance(results, Exception):
                notification.set_message(notification_msg)
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_exception(exception=str(results))
                notification.post_to_websocket_api()
        else:
            notification.set_message(notification_msg)
            notification.set_status(NotificationCode.ERROR.name)
            notification.post_to_websocket_api()
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s %s job completed." % (_JOB_NAME.capitalize(), action))
    notification.set_status(NotificationCode.COMPLETED.name)
    notification.post_to_websocket_api()
    return
