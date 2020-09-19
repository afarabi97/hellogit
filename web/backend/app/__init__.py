"""
Main __init__.py module that initializes the
REST interface for the frontend application.
"""
import eventlet

# WARNING: this monkey patch stuff needs to be the very first thing that happens before other imports.
# If you move it after the socketio and flask imports it will result in a very nasty SSL recurisve error with the kubernetes API.
eventlet.monkey_patch(all=False, os=True, select=False, socket=True, thread=False, time=True)
import logging
import os
from redis import Redis
from rq import Queue
import signal

from app.utils.db_mngs import MongoConnectionManager
from app.utils.constants import (CORE_DIR, PLAYBOOK_DIR, DEPLOYER_DIR, WEB_DIR, TESTING_DIR, UPGRADES_DIR,
                                 AGENT_PKGS_DIR, MIP_KICK_DIR, MIP_CONFIG_DIR, STIGS_DIR)
from flask_cors import CORS
from flask import Flask, url_for
from flask_restplus import Api, Namespace
from flask_socketio import SocketIO
from logging.handlers import RotatingFileHandler
from logging import Logger
from pathlib import Path
from random import randint
from app.middleware import AuthMiddleware, Auth
import pymongo


APP_DIR = Path(__file__).parent  # type: Path
TEMPLATE_DIR = APP_DIR / 'templates'  # type: Path

conn_mng = MongoConnectionManager()
TFPLENUM_LOG_FILENAME = "/var/log/tfplenum/tfplenum.log"
REDIS_QUEUE_LOG_FILENAME = "/var/log/tfplenum/rq.log"
logger = logging.getLogger('tfplenum_logger')
rq_logger = logging.getLogger('rq.worker')
SEQUENCE_ID_COUNTERS = ["rulesetid", "ruleid"]

os.environ['REQUESTS_CA_BUNDLE'] = "/etc/pki/tls/certs/ca-bundle.crt"


def _setup_logger(log_handle: Logger, log_file_name: str, max_bytes: int=10000000, backup_count: int=10):
    """
    Sets up logging for the REST interface.

    :param log_handle:
    :param log_file_name:
    :param log_path:
    :param max_bytes:
    :param backup_count:
    :return:
    """
    handler = RotatingFileHandler(log_file_name, maxBytes=max_bytes, backupCount=backup_count)
    log_handle.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(levelname)7s:%(asctime)s:%(filename)20s:%(funcName)20s():%(lineno)5s:%(message)s')
    handler.setFormatter(formatter)
    log_handle.addHandler(handler)


def _initalize_counters():
    try:
        for counter in SEQUENCE_ID_COUNTERS:
            dbrecord = conn_mng.mongo_counters.find_one({"_id": counter})
            if dbrecord == None:
                data = {"_id": counter, "seq": randint(100, 100000)}
                conn_mng.mongo_counters.insert_one(data)
    except pymongo.errors.DuplicateKeyError:
        # race condition of multiple api workers coming online will produce
        # dupcliate key error
        pass


def get_next_sequence(key: str):
    if key not in SEQUENCE_ID_COUNTERS:
        raise ValueError("Invalid must be one of these values: " + str(SEQUENCE_ID_COUNTERS))
    ret = conn_mng.mongo_counters.find_one_and_update({"_id": key}, {'$inc': {'seq': 3}})
    return ret['seq']


_initalize_counters()
_setup_logger(logger, TFPLENUM_LOG_FILENAME)
_setup_logger(rq_logger, REDIS_QUEUE_LOG_FILENAME)

# Setup Flask
app = Flask(__name__)


class MonkeyPatchedApi(Api):
    """
    Monkey patches flask restplus APIs for https as well as http
    depending on whether or not we are running in debug mode or not.
    """
    @property
    def specs_url(self):
        """Monkey patch for HTTPS"""
        try:
            if os.environ['IS_DEBUG_SERVER'] == "yes":
                return url_for(self.endpoint('specs'), _external=True, _scheme='http')
        except KeyError:
            pass
        return url_for(self.endpoint('specs'), _external=True, _scheme='https')

api = MonkeyPatchedApi(app, version='1.0', title='TFPlenum Backend API',
    description='TFPlenums API documentation', doc="/api/docs"
)

app.config['SECRET_KEY'] = 'secret!'
#Max upload size for a single file is 100 MB
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1000 * 100

REDIS = 'redis://'

# calling our middleware
app.wsgi_app = AuthMiddleware(app.wsgi_app)

CORS(app)
socketio = SocketIO(app, message_queue=REDIS)

REDIS_CLIENT = Redis()
REDIS_QUEUE = Queue(connection=REDIS_CLIENT)

# load_swagger_namespaces
KIT_SETUP_NS = Namespace('Kit Setup',
                         path="/api",
                         description="Kit setup related operations.")
api.add_namespace(KIT_SETUP_NS)


# Load the REST API
from app import (agent_builder_controller, catalog_controller, common_controller, configmap_controller,
                 console_controller, curator_controller, health_controller,
                 kickstart_controller, kit_controller, mip_config_controller,
                 node_controller, notification_controller, pcap_controller,
                 portal_controller, registry_controller, ruleset_controller,
                 scale_controller, task_controller, tools_controller,
                 version_controller, cold_log_controller)

#This is a hack needed to get coverage to work correctly within the python unittest framework.
def receive_signal(signal_number, frame):
    exit(1)

signal.signal(signal.SIGTERM, receive_signal)
