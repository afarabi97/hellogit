import logging
from logging import Logger
from logging.handlers import RotatingFileHandler

import configparser

import socket

from tfplenum import TFPlenum
from psutilMetrics import PsutilMetrics
from elasticsearchMetrics import ElasticsearchMetrics

logfile = '/var/log/metrics.log'
logger = logging.getLogger('metrics-logger')

def setupLogger(log_handle: Logger, max_bytes: int=1000000, backup_count: int=2):
    formatter = logging.Formatter('%(levelname)7s:%(asctime)s:%(filename)20s:%(funcName)20s():%(lineno)5s:%(message)s')

    handler = RotatingFileHandler(logfile, maxBytes=max_bytes, backupCount=backup_count)
    handler.setFormatter(formatter)

    log_handle.addHandler(handler)
    log_handle.setLevel(logging.INFO)

def main():
    setupLogger(logger)

    settings = configparser.ConfigParser()
    settings.read('metrics.ini')
    controllerHostname = settings['update-metrics']['controller']
    elasticsearchHostname = settings['update-metrics']['elasticsearch']
    nodeType = settings['update-metrics']['node_type']

    tfplenum = TFPlenum(controllerHostname, elasticsearchHostname)

    data = []

    if (nodeType in ['sensor', 'server']):
        node = socket.gethostname()
        psutilMetrics = PsutilMetrics(node)
        data.extend(psutilMetrics.getMetrics())

    if (nodeType in ["sensor"]):
        node = socket.gethostname()
        hostname = socket.gethostname()
        shortHostname = socket.gethostname().split('.', 1)[0]
        elasticsearch = tfplenum.getElasticsearch()
        elasticsearchMetrics = ElasticsearchMetrics(node, hostname, shortHostname, elasticsearch)
        data.extend(elasticsearchMetrics.getMetrics())

    tfplenum.updateMetrics(data)


if __name__ == "__main__":
    main()
