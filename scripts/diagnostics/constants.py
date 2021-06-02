from enum import Enum
import os

os.environ['CERT'] = '/var/www/html/webCA.crt'

CERT = os.getenv('CERT')
KUBE_CONFIG_LOCATION = "/root/.kube/config"
MAX_POD_RESTART = 3
GENERAL_SETTINGS_FORM = "general_settings_form"
LOG_PATH = "/var/log/tfplenum"
