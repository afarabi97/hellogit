from app import conn_mng, MIP_CONFIG_DIR, REDIS_CLIENT
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from rq.decorators import job

_JOB_NAME = "mipconfig"

@job('default', connection=REDIS_CLIENT, timeout="300m")
def perform_mip_config(command: str):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.set_message("%s started." % _JOB_NAME.capitalize())
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    cwd_dir = str(MIP_CONFIG_DIR)
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
        raise Exception("A command failed.")
    else:
        notification.set_message(msg)
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()

    return ret_val
