import logging
from logging import Logger
from logging.handlers import RotatingFileHandler

import configparser

import socket

from tfplenum import TFPlenum
from psutilMetrics import PsutilMetrics

log_file = '/var/log/metrics.log'
logger = logging.getLogger('metrics-logger')

def setupLogger(log_handle: Logger, max_bytes: int=1000000, backup_count: int=2):
    formatter = logging.Formatter('%(levelname)7s:%(asctime)s:%(filename)20s:%(funcName)20s():%(lineno)5s:%(message)s')

    handler = RotatingFileHandler(log_file, maxBytes=max_bytes, backupCount=backup_count)
    handler.setFormatter(formatter)

    log_handle.addHandler(handler)
    log_handle.setLevel(logging.INFO)

def main():
    setupLogger(logger)

    settings = configparser.ConfigParser()
    settings.read('metrics.ini')

    controller_hostname = settings['update-metrics']['controller']
    node_type = settings['update-metrics'].get('node_type')
    tfplenum = TFPlenum(controller_hostname)
    hostname = socket.gethostname()
    psutil_metrics = PsutilMetrics(hostname)

    data = []

    if (node_type in ['Sensor', 'Server', 'Control-Plane', 'Service']):
        data.extend(psutil_metrics.get_metrics())

    tfplenum.update_metrics(data)


if __name__ == "__main__":
    main()
