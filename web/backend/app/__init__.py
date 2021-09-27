"""
Main __init__.py module that initializes the
REST interface for the frontend application.
"""
import eventlet

# WARNING: this monkey patch stuff needs to be the very first thing that happens before other imports.
# If you move it after the socketio and flask imports it will result in a very nasty SSL recurisve error with the kubernetes API.
eventlet.monkey_patch(all=False, os=True, select=False, socket=True, thread=False, time=True)
import os
from redis import Redis
from rq import Queue
import signal

from app.utils.db_mngs import MongoConnectionManager
from flask_cors import CORS
from flask import Flask, url_for
from flask_restx import Api, Namespace
from flask_socketio import SocketIO

from pathlib import Path
from app.middleware import AuthMiddleware
from rq_scheduler import Scheduler
from .utils.logging import init_loggers

APP_DIR = Path(__file__).parent  # type: Path
TEMPLATE_DIR = APP_DIR / 'templates'  # type: Path

conn_mng = MongoConnectionManager()

os.environ['REQUESTS_CA_BUNDLE'] = "/etc/pki/tls/certs/ca-bundle.crt"

init_loggers()

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
#Max upload size for a single file is 200 MB
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1000 * 200

REDIS = 'redis://'

# calling our middleware
app.wsgi_app = AuthMiddleware(app.wsgi_app)

CORS(app)
socketio = SocketIO(app, message_queue=REDIS)

REDIS_CLIENT = Redis()
REDIS_QUEUE = Queue(connection=REDIS_CLIENT)
SCHEDULER = Scheduler(connection=REDIS_CLIENT)



# load_swagger_namespaces
KIT_SETUP_NS = Namespace('Kit Setup',
                         path="/api",
                         description="Kit setup related operations.")

TOOLS_NS = Namespace('Tools',
                     path="/api",
                     description="Tools page related operations.")

POLICY_NS = Namespace('Policy Management',
                      path="/api",
                      description="Policy management related operations for Suricata and Zeek.")

KUBERNETES_NS = Namespace('Kubernetes',
                          path="/api",
                          description="Kubernetes related operations.")

CATALOG_NS = Namespace("Catalog",
                       path="/api",
                       description="Catalog related operations used for installing HELM charts on the Kubernetes cluster.")

ALERTS_NS = Namespace("Alerts",
                       path="/api",
                       description="Alerts related operations that allow operators to display or Acknowledge or Escalate alert events that come in.")

KIT_TOKEN_NS = Namespace("Kit Token",
                    path="/api",
                    description="<description>")

HEALTH_NS = Namespace("Health",
                    path="/api",
                    description="Health page related operations.")

DIAGNOSTICS_NS = Namespace("Diagnostics", path="/api", description="Run diagnostics to help service desk troubleshoot tickets.")

api.add_namespace(ALERTS_NS)
api.add_namespace(CATALOG_NS)
api.add_namespace(KIT_SETUP_NS)
api.add_namespace(KUBERNETES_NS)
api.add_namespace(POLICY_NS)
api.add_namespace(TOOLS_NS)
api.add_namespace(KIT_TOKEN_NS)
api.add_namespace(HEALTH_NS)
api.add_namespace(DIAGNOSTICS_NS)

# Load the REST API
from app import (agent_builder_controller, catalog_controller, common_controller, configmap_controller,
                 console_controller, curator_controller, health_controller,
                 kit_controller, mip_controller,
                 node_controller, notification_controller, pcap_controller,
                 portal_controller, registry_controller, ruleset_controller,
                 scale_controller, task_controller, tools_controller,
                 version_controller, cold_log_controller, alerts_controller, settings_controller,
                 kit_tokens_controller, health_dashboard_controller, diagnostics_controller)


#This is a hack needed to get coverage to work correctly within the python unittest framework.
def receive_signal(signal_number, frame):
    exit(1)

signal.signal(signal.SIGTERM, receive_signal)
