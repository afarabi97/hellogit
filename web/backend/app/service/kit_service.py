from app import celery, logger, CORE_DIR, conn_mng
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from pathlib import Path

_JOB_NAME = "kit"

@celery.task
def perform_kit(command: str):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.setMessage("%s started." % _JOB_NAME.capitalize())
    notification.setStatus(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    cwd_dir = str(CORE_DIR / "playbooks")
    job = AsyncJob(_JOB_NAME.capitalize(), command, working_dir=cwd_dir)

    notification.setMessage("%s in progress." % _JOB_NAME.capitalize())
    notification.setStatus(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()

    ret_val = job.run_asycn_command()
    msg = "%s job successfully completed." % _JOB_NAME.capitalize()
    if ret_val != 0:
        msg = "%s job failed." % _JOB_NAME.capitalize()
        notification.setMessage(msg)
        notification.setStatus(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
    else:
        notification.setMessage(msg)
        notification.setStatus(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
    conn_mng.mongo_celery_tasks.delete_one({"_id": _JOB_NAME.capitalize()})
    return ret_val
