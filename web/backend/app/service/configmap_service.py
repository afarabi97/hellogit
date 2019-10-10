import traceback

from app import celery
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import run_command2
from typing import List


@celery.task
def bounce_pods(associatedPods: List):
    notification = NotificationMessage(role="kit")
    for pod in associatedPods:
        notification.setStatus(status=NotificationCode.STARTED.name)
        notification.setMessage("Started pod bounce for {}.".format(pod["podName"]))
        notification.post_to_websocket_api()
        stdout, ret_code = run_command2("kubectl delete pod {} -n {}".format(pod["podName"], pod["namespace"]))

        try:
            if ret_code != 0:
                notification.setStatus(status=NotificationCode.ERROR.name)
                notification.setMessage("Failed to bounce pod {} with ret_val: {} and error: {}.".format(pod["podName"], ret_code, stdout))
                notification.post_to_websocket_api()
            else:
                notification.setStatus(status=NotificationCode.COMPLETED.name)
                notification.setMessage("Completed pod bounce for {}.".format(pod["podName"]))
                notification.post_to_websocket_api()

        except Exception as e:
            traceback.print_exc()
            notification.setStatus(status=NotificationCode.ERROR.name)
            notification.setMessage(str(e))
            notification.post_to_websocket_api()
