from app import rq_logger, DEPLOYER_DIR, conn_mng, MIP_KICK_DIR, REDIS_CLIENT
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from rq.decorators import job
from pathlib import Path

_JOB_NAME = "kickstart"


@job('default', connection=REDIS_CLIENT, timeout="30m")
def perform_kickstart(command: str, platform='DIP'):
    rq_logger.info("Kickstart job started with command {}".format(command))
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
        rq_logger.error("Kickstart job failed.")
    else:
        notification.set_message(msg)
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
        rq_logger.info("Kickstart job completed successfully.")

    return ret_val
