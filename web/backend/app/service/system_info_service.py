
import os
import configparser

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
        return None
