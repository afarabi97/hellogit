"""
Python module for running the application in debug mode.
"""
import os

os.environ['IS_DEBUG_SERVER'] = "yes"

from app import socketio, app


def main():
    socketio.run(app, host='0.0.0.0', port=5001, debug=True) # type: SocketIO


if __name__ == '__main__':
    main()
