from app import celery, logger, CORE_DIR, conn_mng
from app.inventory_generator import KitInventoryGenerator, KickstartInventoryGenerator
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from pathlib import Path
from shared.constants import KICKSTART_ID, KIT_ID


_JOB_NAME_NOTIFICATION = "kit"


@celery.task
def perform_kit(command: str, cwd_dir: str, job_name: str="Kit"):
    notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION)
    notification.set_message("%s started." % _JOB_NAME_NOTIFICATION.capitalize())
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    job = AsyncJob(job_name, command, working_dir=cwd_dir, use_shell=True)

    notification.set_message("%s in progress." % _JOB_NAME_NOTIFICATION.capitalize())
    notification.set_status(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()

    ret_val = job.run_asycn_command()
    msg = "%s job successfully completed." % _JOB_NAME_NOTIFICATION.capitalize()
    if ret_val != 0:
        msg = "%s job failed." % _JOB_NAME_NOTIFICATION.capitalize()
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
    else:
        notification.set_message(msg)
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
        conn_mng.mongo_kit.update_one({"_id": KIT_ID}, {"$set": {"form.complete": True}})
    conn_mng.mongo_celery_tasks.delete_one({"_id": job_name})
    return ret_val
