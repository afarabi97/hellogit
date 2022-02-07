"""
Python module for running the application in wsgi
"""
import argparse
import os

from app import create_app
from app.utils.constants import CA_BUNDLE, REDIS
from flask_socketio import SocketIO

os.environ['REQUESTS_CA_BUNDLE'] = CA_BUNDLE

parser = argparse.ArgumentParser()
parser.add_argument("--debug", help="Enable debug server", action="store_true")
args, unknown = parser.parse_known_args()

app = create_app()

socketio = SocketIO(app, message_queue=REDIS)
debug = False
if args and args.debug:
    debug = True
    os.environ['IS_DEBUG_SERVER'] = "yes"
    socketio.run(app, host='0.0.0.0', port=5001, debug=debug) # type: SocketIO

@socketio.on('connect')
def connect():
    print('Client connected')

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')
