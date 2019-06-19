import datetime

from app import app, conn_mng, logger
from enum import Enum
from flask_socketio import SocketIO
from uuid import uuid4


socketio = SocketIO(message_queue=app.config['CELERY_BROKER_URL'])

_DEFAULT_MESSAGE_TYPE = "broadcast"


class NotificationCode(Enum):
    # Status_UNKNOWN indicates that a release is in an uncertain state.
    UNKNOWN = 0
    # Status_DEPLOYED indicates that the release has been pushed to Kubernetes.
    DEPLOYED = 1
    # Status_DELETED indicates that a release has been deleted from Kubernetes.
    DELETED = 2
    # Status_SUPERSEDED indicates that this release object is outdated and a newer one exists.
    SUPERSEDED = 3
    # Status_FAILED indicates that the release was not successfully deployed.
    FAILED = 4
    # Status_DELETING indicates that a delete operation is underway.
    DELETING = 5
    # Status_PENDING_INSTALL indicates that an install operation is underway.
    PENDING_INSTALL = 6
    # Status_PENDING_UPGRADE indicates that an upgrade operation is underway.
    PENDING_UPGRADE = 7
    # Status_PENDING_ROLLBACK indicates that an rollback operation is underway.
    PENDING_ROLLBACK = 8
    # A node is up and ready
    GREEN = 100
    # A node is unresponsive or down
    RED = 101
    #
    STARTED = 102
    IN_PROGRESS = 103
    COMPLETED = 104
    ERROR = 105
    INSTALLING = 106
    CANCELLED = 107


class NotificationMessage(object):
    def __init__(self, role: str, action: str=None, application: str=None, messageType: str=_DEFAULT_MESSAGE_TYPE):
        self.role = role
        self.messageType = messageType
        self.action = action
        self.application = application
        self.timestamp = datetime.datetime.utcnow().isoformat()
        self.exception = ""

    def setMessage(self, message: str) -> None:
        self.message = message

    def setStatus(self, status: str) -> None:
        valid_names = []
        for code_status in NotificationCode:
            valid_names.append(code_status.name)
            if code_status.name == status:
                self.status = status
                return
        raise ValueError("The %s passed is does not match on of %s." % (status, str(valid_names)) )

    def setException(self, exception: str) -> None:
        self.exception = exception

    def toJson(self):
        return { "timestamp": self.timestamp, "role": self.role, "message": self.message, "action": self.action, "application": self.application,  "status": self.status, "exception": self.exception }

    def post_to_websocket_api(self) -> None:
        try:
            notification = self.toJson()
            socketio.emit(self.messageType, notification, broadcast=True)
            conn_mng.mongo_notifications.insert_one(notification)
        except Exception as exc:
            logger.error(exc)


def log_to_console(job_name: str, jobid: str, text: str, color: str=None) -> None:
    """
    Callback function that logs to console.

    :param job_name: The name of the job
    :param jobid: The jobid
    :param text: The console output string
    color: yellow
    :return:
    """
    log = {'jobName': job_name, 'jobid': jobid, 'log': text}
    if text.startswith('fatal'):
        log['color'] = 'red'
    elif text.startswith('skipping'):
        log['color'] = 'lightgreen'
    elif text.startswith('ok'):
        log['color'] = 'lightgreen'
    elif text.startswith('changed'):
        log['color'] = 'orange'
    else:
        log['color'] = 'white'

    if color:
        log['color'] = color

    socketio.emit('message', log, broadcast=True)
    conn_mng.mongo_console.insert_one(log)
