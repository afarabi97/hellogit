
import configparser
import socket
from datetime import datetime

from app.utils.constants import PROJECT_ROOT_DIR

try:
    from git import Repo
    from git.exc import InvalidGitRepositoryError
    def get_commit_hash() -> str:
        try:
            repo = Repo(str(PROJECT_ROOT_DIR))
            sha = repo.head.commit.hexsha
            return repo.git.rev_parse(sha, short=8)
        except InvalidGitRepositoryError:
            pass
        return "None"
except ImportError:
    def get_commit_hash() -> str:
        return "RPM Build"


INI = "/etc/tfplenum/tfplenum.ini"

def get_version() -> dict:
    config = configparser.ConfigParser()
    config.read(INI)
    try:
        return config['tfplenum']['version']
    except KeyError:
        return None

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
        return "controller.lan"

def get_auth_base() -> str:
    base_template = "https://{hostname}/auth/realms/CVAH-SSO"
    try:
        hostname = get_hostname()
        return base_template.format(hostname=hostname)
    except Exception:
        return base_template.format(hostname="controller.lan")
