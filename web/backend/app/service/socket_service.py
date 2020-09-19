import datetime

from app import app, conn_mng, rq_logger, REDIS
from enum import Enum
from flask_socketio import SocketIO
from uuid import uuid4
from pymongo.results import InsertOneResult


socketio = SocketIO(message_queue=REDIS)

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
    def __init__(self, role: str, action: str=None, application: str=None, message_type: str=_DEFAULT_MESSAGE_TYPE):
        self.role = role
        self.message_type = message_type
        self.action = action
        self.application = application
        self.timestamp = datetime.datetime.utcnow().isoformat()
        self.exception = ""
        self.message = ""
        self.status = ""

    def set_message(self, message: str) -> None:
        self.message = message

    def set_status(self, status: str) -> None:
        valid_names = []
        for code_status in NotificationCode:
            valid_names.append(code_status.name)
            if code_status.name == status:
                self.status = status
                return
        raise ValueError("The %s passed is does not match on of %s." % (status, str(valid_names)) )

    def set_exception(self, exception: str) -> None:
        self.exception = exception

    def to_json(self):
        self.timestamp = datetime.datetime.utcnow().isoformat()
        return {"timestamp": self.timestamp, "role": self.role, "message": self.message, "action": self.action, "application": self.application,  "status": self.status, "exception": self.exception}

    def post_to_websocket_api(self) -> None:
        try:
            notification = self.to_json()
            result = conn_mng.mongo_notifications.insert_one(notification)
            if result and result.inserted_id:
                notification["_id"] = str(result.inserted_id)
            socketio.emit(self.message_type, notification, broadcast=True)
        except Exception as exc:
            rq_logger.exception(exc)

    def set_and_send(self, message: str=None, status: str=None) -> None:
        if message:
            self.message = message
        if status:
            self.status = status
        self.post_to_websocket_api()


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
    res = conn_mng.mongo_console.insert_one(log)


def notify_page_refresh():
    socketio.emit('refresh', 'doit', broadcast=True)


def notify_clock_refresh():
    socketio.emit('clockchange', 'doit', broadcast=True)


def notify_ruleset_refresh():
    socketio.emit('rulesetchange', 'doit', broadcast=True)
