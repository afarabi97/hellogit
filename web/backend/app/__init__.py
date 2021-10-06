"""
Main __init__.py module that initializes the
REST interface for the frontend application.
"""
import eventlet

# WARNING: this monkey patch stuff needs to be the very first thing that happens before other imports.
# If you move it after the socketio and flask imports it will result in a very nasty SSL recurisve error with the kubernetes API.
eventlet.monkey_patch(all=False, os=True, select=False, socket=True, thread=False, time=True)
import os
import signal
from pathlib import Path

from app.middleware import AuthMiddleware
from app.utils.db_mngs import MongoConnectionManager
from flask import Flask, url_for
from flask_cors import CORS
from flask_restx import Api, Namespace
from flask_socketio import SocketIO
from redis import Redis
from rq import Queue
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

TOOLS_NS = Namespace('Tools',
                     path="/api",
                     description="Tools page related operations.")

DIAGNOSTICS_NS = Namespace("Diagnostics", path="/api", description="Run diagnostics to help service desk troubleshoot tickets.")

api.add_namespace(TOOLS_NS)
api.add_namespace(DIAGNOSTICS_NS)

# Load the REST API
from app import (console_controller,
                 scale_controller, task_controller, tools_controller,
                 version_controller, cold_log_controller)

from .controller import (agent_builder_controller, health_controller,
                         health_dashboard_controller, configmap_controller,
                         registry_controller, notification_controller,
                         ruleset_controller, pcap_controller,
                         alerts_controller, common_controller,
                         kit_tokens_controller, curator_controller,
                         catalog_controller, portal_controller,
                         kit_controller, mip_controller,
                         node_controller, settings_controller)

from .controller.notification_controller import NOTIFICATIONS_NS
from .controller.agent_builder_controller import AGENT_NS
from .models.ruleset import POLICY_NS
from .models.health import APP_NS, HEALTH_NS
from .models.kubernetes import KUBERNETES_NS
from .models.common import COMMON_NS
from .models.alerts import ALERTS_NS, HIVE_NS
from .controller.curator_controller import CURATOR_NS
from .models.kit_tokens import TOKEN_NS
from .models.settings.general_settings import SETINGS_NS
from .models.nodes import KIT_SETUP_NS

api.add_namespace(AGENT_NS)
api.add_namespace(POLICY_NS)
api.add_namespace(APP_NS)
api.add_namespace(KUBERNETES_NS)
api.add_namespace(HEALTH_NS)
api.add_namespace(NOTIFICATIONS_NS)
api.add_namespace(ALERTS_NS)
api.add_namespace(HIVE_NS)
api.add_namespace(COMMON_NS)
api.add_namespace(CURATOR_NS)
api.add_namespace(TOKEN_NS)
api.add_namespace(SETINGS_NS)
api.add_namespace(KIT_SETUP_NS)

#This is a hack needed to get coverage to work correctly within the python unittest framework.
def receive_signal(signal_number, frame):
    exit(1)

signal.signal(signal.SIGTERM, receive_signal)
