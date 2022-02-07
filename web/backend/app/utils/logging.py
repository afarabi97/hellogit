
import logging
from logging import Logger
from logging.handlers import RotatingFileHandler

from app.utils.constants import REDIS_QUEUE_LOG_FILENAME, TFPLENUM_LOG_FILENAME

logger = logging.getLogger('tfplenum_logger')
rq_logger = logging.getLogger('rq.worker')

def _setup_logger(log_handle: Logger, log_file_name: str, max_bytes: int=10000000, backup_count: int=10):
    """
    Sets up logging for the REST interface.

    :param log_handle:
    :param log_file_name:
    :param log_path:
    :param max_bytes:
    :param backup_count:
    :return:
    """
    handler = RotatingFileHandler(log_file_name, maxBytes=max_bytes, backupCount=backup_count)
    log_handle.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(levelname)7s:%(asctime)s:%(filename)20s:%(funcName)20s():%(lineno)5s:%(message)s')
    handler.setFormatter(formatter)
    log_handle.addHandler(handler)

def init_loggers():
    try:
        _setup_logger(logger, TFPLENUM_LOG_FILENAME)
        _setup_logger(rq_logger, REDIS_QUEUE_LOG_FILENAME)
    except Exception as exc:
        pass
