import traceback

from app import celery
from app.service.socket_service import NotificationMessage, NotificationCode
from shared.connection_mngs import ElasticsearchManager
from time import sleep

_JOB_NAME = "tools"

@celery.task
def finish_repository_registration(service_ip: str):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.setStatus(status=NotificationCode.STARTED.name)
    notification.setMessage("Started repository registration routine.")
    notification.post_to_websocket_api()

    try:
        mng = ElasticsearchManager(service_ip)
        while not mng.is_cluster_green() and not mng.is_cluster_yellow():
            print("Sleeping because the Elasticsearch is not up yet.")
            sleep(5)

        ret_val = mng.register_repository()
        if ret_val['acknowledged']:
            notification.setStatus(status=NotificationCode.COMPLETED.name)
            notification.setMessage("Completed Elasticsearch repository registration.")
            notification.post_to_websocket_api()
        else:
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setMessage("Failed to register repository for an unknown reason.")
            notification.post_to_websocket_api()
    except Exception as e:
        traceback.print_exc()
        notification.setStatus(status=NotificationCode.ERROR.name)
        notification.setMessage(str(e))
        notification.post_to_websocket_api()
