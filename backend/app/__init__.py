"""
Main __init__.py module that initializes the
REST interface for the frontend application.
"""
import logging
import os
# Monkey patching is required otherwise we get nasty recursion errors when we use 
# the Kubernetes API.
try:
    os.environ["DEBUG_SRV"]
except KeyError:    
    # Libraries only get imported for production servers.
    import gevent.monkey
    gevent.monkey.patch_all()
    from requests.packages.urllib3.util.ssl_ import create_urllib3_context
    create_urllib3_context()

from shared.connection_mngs import MongoConnectionManager
from flask_cors import CORS
from flask import Flask
from flask_socketio import SocketIO
from logging.handlers import RotatingFileHandler
from logging import Logger
from pathlib import Path


APP_DIR = Path(__file__).parent  # type: Path
TEMPLATE_DIR = APP_DIR / 'templates'  # type: Path

conn_mng = MongoConnectionManager()
LOG_FILENAME = "/var/log/tfplenum/tfplenum.log"
logger = logging.getLogger('tfplenum_logger')


def setup_logger(log_handle: Logger, max_bytes: int=10000000, backup_count: int=10):
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


setup_logger(logger)

# Setup Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app)
# Start the job manager
from app.job_manager import start_job_manager
start_job_manager()

# Load the REST API
from app import common_controller
from app import console_controller
from app import kickstart_controller
from app import kit_controller
from app import confluence_controller
from app import portal_controller
from app import health_controller
from app import configmap_controller
from app import archive_controller
from app import registry_controller
from app import agent_builder_controller
