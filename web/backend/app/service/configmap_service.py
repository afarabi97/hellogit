import traceback

from app import REDIS_CLIENT
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import run_command2
from rq.decorators import job
from typing import List

_JOB_NAME = "tools"


@job('default', connection=REDIS_CLIENT, timeout="30m")
def bounce_pods(associated_pods: List):
    notification = NotificationMessage(role=_JOB_NAME)
    for pod in associated_pods:
        notification.set_status(status=NotificationCode.STARTED.name)
        notification.set_message("Started pod bounce for {}.".format(pod["podName"]))
        notification.post_to_websocket_api()
        stdout, ret_code = run_command2("kubectl delete pod {} -n {}".format(pod["podName"], pod["namespace"]))

        try:
            if ret_code != 0:
                notification.set_status(status=NotificationCode.ERROR.name)
                notification.set_message("Failed to bounce pod {} with ret_val: {} and error: {}.".format(pod["podName"], ret_code, stdout))
                notification.post_to_websocket_api()
            else:
                notification.set_status(status=NotificationCode.COMPLETED.name)
                notification.set_message("Completed pod bounce for {}.".format(pod["podName"]))
                notification.post_to_websocket_api()

        except Exception as e:
            traceback.print_exc()
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message(str(e))
            notification.post_to_websocket_api()
