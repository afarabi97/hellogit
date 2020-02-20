pythonpath = "/opt/tfplenum/web/backend/"
bind = "127.0.0.1:5001"
worker_class = "eventlet"
workers = 5
loglevel = "error"
accesslog = "/var/log/tfplenum/gunicorn_access.log"
errorlog = "/var/log/tfplenum/gunicorn_error.log"
sendfile = True
