
from datetime import datetime
import configparser
import socket

INI = "/etc/tfplenum.ini"

def get_version() -> dict:
    config = configparser.ConfigParser()
    config.read(INI)
    try:
        return config['tfplenum']['version']
    except KeyError:
        return None

def get_system_name() -> str:
    config = configparser.ConfigParser()
    config.read(INI)
    try:
        return config['tfplenum']['system_name']
    except KeyError:
        return "dip"

def get_build_date() -> dict:
    config = configparser.ConfigParser()
    config.read(INI)
    try:
        date = datetime.strptime(config['tfplenum']['build_date'], "%Y-%m-%dT%H:%M:%S%z")
        return date.strftime("%B %d, %Y")
    except KeyError:
        return None

def get_hostname() -> str:
    try:
        return socket.gethostname()
    except Exception:
        return "dip-controller.lan"

def get_auth_base() -> str:
    base_template = "https://{hostname}/auth/realms/CVAH-SSO"
    try:
        hostname = get_hostname()
        return base_template.format(hostname=hostname)
    except Exception:
        return base_template.format(hostname="dip-controller.lan")
