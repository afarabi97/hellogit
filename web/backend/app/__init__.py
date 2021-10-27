"""
Main __init__.py module that initializes the
REST interface for the frontend application.
"""
import eventlet

# WARNING: this monkey patch stuff needs to be the very first thing that happens before other imports.
# If you move it after the socketio and flask imports it will result in a very nasty SSL recurisve error with the kubernetes API.
eventlet.monkey_patch(all=False, os=False, select=False, socket=True, thread=False, time=True)

from app.middleware import AuthMiddleware
from flask import Flask
from flask_cors import CORS
from app.utils.logging import init_loggers
import app.utils.db_mngs

init_loggers()

def create_app() -> Flask:
    # Setup Flask
    flask_app = Flask(__name__)
    flask_app.config["MONGO_URI"] = "mongodb://localhost:27017/tfplenum_database"
    flask_app.config['SECRET_KEY'] = 'secret!'
    #Max upload size for a single file is 200 MB
    flask_app.config['MAX_CONTENT_LENGTH'] = 1000 * 1000 * 200

    # calling our middleware
    flask_app.wsgi_app = AuthMiddleware(flask_app.wsgi_app)

    CORS(flask_app)

    app.utils.db_mngs.mongo.init_app(flask_app)

    from .controller import api_blueprint
    flask_app.register_blueprint(api_blueprint, url_prefix='/api')

    return flask_app
