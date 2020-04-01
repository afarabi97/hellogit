from app import celery, logger, DEPLOYER_DIR, conn_mng, MIP_KICK_DIR
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from pathlib import Path

_JOB_NAME = "kickstart"

@celery.task
def perform_kickstart(command: str, platform='DIP'):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s started." % _JOB_NAME.capitalize())
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    if(platform == 'DIP'):
      cwd_dir = str(DEPLOYER_DIR / "playbooks")

    if(platform == 'MIP'):
      cwd_dir = str(MIP_KICK_DIR)

    job = AsyncJob(_JOB_NAME.capitalize(), command, working_dir=cwd_dir)

    notification.set_message("%s in progress." % _JOB_NAME.capitalize())
    notification.set_status(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()

    ret_val = job.run_asycn_command()
    msg = "%s job successfully completed." % _JOB_NAME.capitalize()
    if ret_val != 0:
        msg = "%s job failed." % _JOB_NAME.capitalize()
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
    else:
        notification.set_message(msg)
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
    conn_mng.mongo_celery_tasks.delete_one({"_id": _JOB_NAME.capitalize()})
    return ret_val
