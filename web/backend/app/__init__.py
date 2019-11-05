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

from shared.connection_mngs import MongoConnectionManager
from shared.constants import CORE_DIR, PLAYBOOK_DIR, DEPLOYER_DIR, WEB_DIR, TESTING_DIR, UPGRADES_DIR, AGENT_PKGS_DIR
from flask_cors import CORS
from flask import Flask
from flask_socketio import SocketIO
from logging.handlers import RotatingFileHandler
from logging import Logger
from pathlib import Path
from random import randint
from celery import Celery

import pymongo

APP_DIR = Path(__file__).parent  # type: Path
TEMPLATE_DIR = APP_DIR / 'templates'  # type: Path

conn_mng = MongoConnectionManager()
LOG_FILENAME = "/var/log/tfplenum/tfplenum.log"
logger = logging.getLogger('tfplenum_logger')
SEQUENCE_ID_COUNTERS = ["rulesetid", "ruleid"]


def _setup_logger(log_handle: Logger, max_bytes: int=10000000, backup_count: int=10):
    """
    Sets up logging for the REST interface.

    :param log_handle:
    :param log_path:
    :param max_bytes:
    :param backup_count:
    :return:
    """
    handler = RotatingFileHandler(LOG_FILENAME, maxBytes=max_bytes, backupCount=backup_count)
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
                print(data)
                ret_val  = conn_mng.mongo_counters.insert_one(data)
    except pymongo.errors.DuplicateKeyError as e:
        # race condition of multiple api workers coming online will produce
        # dupcliate key error
        pass


def get_next_sequence(key: str):
    if key not in SEQUENCE_ID_COUNTERS:
        raise ValueError("Invalid must be one of these values: " + str(SEQUENCE_ID_COUNTERS))
    ret = conn_mng.mongo_counters.find_one_and_update({"_id": key}, {'$inc': {'seq': 3}})
    return ret['seq']


_initalize_counters()
_setup_logger(logger)

# Setup Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
#Max upload size for a single file is 100 MB
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1000 * 100

REDIS = 'redis://'

# Celery configuration
app.config['CELERY_BROKER_URL'] = REDIS
app.config['CELERY_RESULT_BACKEND'] = REDIS

CORS(app)
socketio = SocketIO(app, message_queue=app.config['CELERY_BROKER_URL'])

# Initialize Celery
celery = Celery(app.name,
    broker=app.config['CELERY_BROKER_URL'],
    backend=app.config['CELERY_RESULT_BACKEND'])
celery.conf.update(app.config)

# Load the REST API
from app import common_controller
from app import console_controller
from app import kickstart_controller
from app import kit_controller
from app import portal_controller
from app import health_controller
from app import configmap_controller
from app import archive_controller
from app import registry_controller
from app import agent_builder_controller
from app import ruleset_controller
from app import pcap_controller
from app import catalog_controller
from app import notification_controller
from app import task_controller
from app import version_controller
from app import upgrade_controller
from app import tools_controller
