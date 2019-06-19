"""
Python module for running the application in debug mode.
"""
from app import socketio, app
from flask_socketio import SocketIO

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True) # type: SocketIO
