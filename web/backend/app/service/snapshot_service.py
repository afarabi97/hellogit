import traceback

from app import celery, logger, conn_mng
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.socket_service import notify_snapshot_refresh
from shared.connection_mngs import ElasticsearchManager, FabricConnectionWrapper
from time import sleep

_JOB_NAME = "tools"

@celery.task
def check_snapshot_status(elk_service_ip: str, snapshot_name: str):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("Snapshot %s started." % snapshot_name)
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    try:
        notification.set_message("Snapshot {} in progress.".format(snapshot_name))
        notification.set_status(NotificationCode.IN_PROGRESS.name)
        notification.post_to_websocket_api()
        mng = ElasticsearchManager(elk_service_ip, conn_mng)
        while True:
            snapshot_status = mng.snapshot_status(snapshot_name)
            if snapshot_status == "SUCCESS":
                break
            sleep(5)

        notification.set_message("Snapshot {} completed successfully.".format(snapshot_name))
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
        notify_snapshot_refresh()
    except Exception as e:
        traceback.print_exc()
        msg = "Snapshot {} failed with error {}.".format(snapshot_name, str(e))
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
