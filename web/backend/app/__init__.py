"""
Main __init__.py module that initializes the
REST interface for the frontend application.
"""
import eventlet

# WARNING: this monkey patch stuff needs to be the very first thing that happens before other
# imports. If you move it after the socketio and flask imports it will result in a very nasty SSL
# recurisve error with the kubernetes API.
eventlet.monkey_patch(
    all=False, os=False, select=False, socket=True, thread=False, time=True
)

from app.middleware import AuthMiddleware
from app.utils.collections import mongo
from app.utils.logging import init_loggers
from flask import Flask
from flask_cors import CORS

init_loggers()


def create_app(test_config=None) -> Flask:
    """
    This function generates a flask application.

    Args:
        test_config (config information in mapping format, optional): Used to setup non-production
        flask applications. Defaults to None.

    Returns:
        Flask: the flask application.
    """
    # Setup Flask
    flask_app = Flask(__name__)
    flask_app.config["MONGO_URI"] = "mongodb://localhost:27017/tfplenum_database"
    flask_app.config["SECRET_KEY"] = "secret!"
    # Max upload size for a single file is 200 MB
    flask_app.config["MAX_CONTENT_LENGTH"] = 1000 * 1000 * 200

    if test_config is not None:
        flask_app.config.from_mapping(test_config)

    # calling our middleware
    flask_app.wsgi_app = AuthMiddleware(flask_app.wsgi_app)

    CORS(flask_app)

    mongo.init_app(flask_app)

    from .controller import api_blueprint

    flask_app.register_blueprint(api_blueprint, url_prefix="/api")

    return flask_app
