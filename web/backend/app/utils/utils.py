"""
This module is for storing standard functions which can be reused anywhere within the application.

"""
import base64
import hashlib
import os
import re
import shutil
import signal
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Dict, Union
from uuid import uuid4

import psutil
import requests
from app.utils.collections import mongo_settings
from flask.ctx import AppContext

from .constants import DATE_FORMAT_STR, GENERAL_SETTINGS_ID


def invalid_string_checker(stdout: str, key_value: str) -> dict:
    if key_value in stdout:
        return { "stdout": None, "stderr": "Invalid key value discovered" }

    return { "stdout": stdout, "stderr": "" }

def get_domain() -> str:
    mongo_document = mongo_settings().find_one({"_id": GENERAL_SETTINGS_ID})
    if mongo_document and "domain" in mongo_document:
        return mongo_document["domain"]
    return None


def is_ipv4_address(s: str) -> bool:
    if s is None or len(s) == 0:
        return False

    pieces = s.split(".")
    if len(pieces) != 4:
        return False

    try:
        return all(0 <= int(p) < 256 for p in pieces)
    except ValueError:
        return False

def compute_hash(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def filter_ip(ipaddress: str) -> bool:
    """
    Filters IP addresses from NMAP functions commands.
    :return:
    """
    if not is_ipv4_address(ipaddress) or ipaddress.endswith(".0") or ipaddress == "":
        return True

    return False


def string_to_base64(password: str) -> str:
    """
    Encodes a password and garbles is up.

    :param password: The password we wish to encode
    """
    if password is None or len(password) == 0:
        return ""
    return base64.b64encode(bytes(password, "utf-8")).decode("utf-8")


def base64_to_string(password_enc: str) -> str:
    """
    Decodes a password.

    :param password_enc: The encoded password.
    """
    if password_enc is None or len(password_enc) == 0:
        return ""
    return base64.b64decode(bytes(password_enc, "utf-8")).decode("utf-8")


def hash_file(some_path: Union[str, Path], chunk_size=8192) -> Dict:
    path = None  # type: Path
    if isinstance(some_path, str):
        path = Path(some_path)
    elif isinstance(some_path, Path):
        path = some_path
    else:
        raise ValueError("Invalid type passed into hash_file function.")

    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()

    with open(str(path), "rb") as fp:
        while True:
            chunk = fp.read(chunk_size)
            if chunk:
                md5.update(chunk)
                sha1.update(chunk)
                sha256.update(chunk)
            else:
                break
    return {
        "md5": md5.hexdigest(),
        "sha1": sha1.hexdigest(),
        "sha256": sha256.hexdigest(),
    }


def hash_string(content: str) -> Dict:
    content = bytes(content, "utf-8")
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()

    md5.update(content)
    sha1.update(content)
    sha256.update(content)

    return {
        "md5": md5.hexdigest(),
        "sha1": sha1.hexdigest(),
        "sha256": sha256.hexdigest(),
    }


def tar_folder(folder_to_tar: str, path_of_archive: str):
    folder = Path(folder_to_tar)
    if folder.exists() and folder.is_dir():
        return shutil.make_archive(path_of_archive, "gztar", root_dir=folder_to_tar)

    return ValueError("%s does not exist or is not a directory" % folder_to_tar)


def zip_folder(folder_to_tar: str, path_of_archive: str):
    folder = Path(folder_to_tar)
    if folder.exists() and folder.is_dir():
        return shutil.make_archive(path_of_archive, "zip", root_dir=folder_to_tar)

    return ValueError("%s does not exist or is not a directory" % folder_to_tar)


def fix_hostname(dns_suffix: str, hostname_or_ip: str):
    """
    Ensures that a windows hostname is in the proper format based on what is passed in.

    :return fixed hostname:
    """
    if is_ipv4_address(hostname_or_ip):
        pass  # Exit if block and return the address.
    elif len(dns_suffix) > 0 and dns_suffix not in hostname_or_ip:
        return hostname_or_ip + "." + dns_suffix

    return hostname_or_ip


def sanitize_dictionary(payload: Dict):
    """
    Function will recursibley loop through a dictionary and remove all the spaces on all strings found.
    """
    for key in payload:
        if isinstance(payload[key], str):
            payload[key] = payload[key].strip()
        elif isinstance(payload[key], dict):
            sanitize_dictionary(payload[key])
        elif isinstance(payload[key], list):
            for index, item in enumerate(payload[key]):
                if isinstance(item, str):
                    payload[key][index] = payload[key][index].strip()
                elif isinstance(item, Dict):
                    sanitize_dictionary(item)


def get_json_from_url(url: str) -> Dict:
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()

    raise ValueError("Nothing")


def normalize_epoc_or_unixtimestamp(time: int) -> str:
    try:
        return datetime.utcfromtimestamp(time).strftime(DATE_FORMAT_STR)
    except ValueError:
        return datetime.utcfromtimestamp(time / 1000).strftime(DATE_FORMAT_STR)


def does_file_have_ext(some_path: str, extension: str) -> bool:
    pos = some_path.rfind(".")
    file_ext = some_path[pos:]
    return file_ext.lower() == extension


def zip_package(zip_save_path: str, package_dir: str, zip_root_dir="/tfplenum_agent"):
    zipf = zipfile.ZipFile(zip_save_path, "w", zipfile.ZIP_DEFLATED)
    try:
        for root, dirs, files in os.walk(package_dir):
            for fname in files:
                abs_path = os.path.join(root, fname)
                rel_path = abs_path.replace(package_dir, "")
                zipf.write(os.path.join(root, fname), zip_root_dir + rel_path)
    finally:
        zipf.close()


def kill_child_processes(parent_pid: int, sig=signal.SIGTERM):
    try:
        parent = psutil.Process(parent_pid)
    except psutil.NoSuchProcess:
        return
    children = parent.children(recursive=True)
    for process in children:
        try:
            process.send_signal(sig)
        except psutil.NoSuchProcess:
            pass


class TfplenumTempDir:
    def __init__(self, some_prefix: str = "tfplenum-"):
        self._some_path = "/root/" + some_prefix + str(uuid4())[0:6]
        self._created_path = Path(self._some_path)
        self._created_path.mkdir(exist_ok=True, parents=True)

    def __enter__(self) -> str:
        return str(self._created_path)

    def __exit__(self, *exc):
        if self._created_path:
            shutil.rmtree(str(self._created_path))

    @property
    def file_path(self) -> Path:
        return self._created_path

    @property
    def file_path_str(self) -> str:
        return str(self._created_path)


def get_app_context() -> AppContext:
    from app import create_app

    return create_app().app_context()


def camel_case_split(some_string: str) -> str:
    """Splits camel case into separate words. (EX: DeleteIndicies transforms ot Delete Indicies)

    Args:
        some_string (str): Any camel case string (EX: DeleteIndiciesNow)

    Returns:
        str: separate word with space in between each.
    """
    tokens = re.findall(r'[A-Z](?:[a-z]+|[A-Z]*(?=[A-Z]|$))', some_string)
    return ' '.join(tokens)

class PasswordValidator:
    """
    This class is used to validate a password based on certain criteria.

    Attributes:
        password (str): The password to be validated.
        validation_errors (list): A list to store any validation errors.

    Methods:
        validate(self, password_input: Optional[str] = None): Validates the password based on the defined criteria.
    """

    @staticmethod
    def validate(password: str):
        """
        Validates the given password based on several criteria.

        The password must:
        - Not be empty
        - Be at least 15 characters long
        - Contain at least one digit
        - Contain at least one lowercase letter
        - Contain at least one uppercase letter
        - Contain at least one special character
        - Contain at least 8 unique characters
        - Not contain any repeating characters
        - Not contain any of the following characters: ; & | < >

        Args:
            password (str): The password to validate.

        Returns:
            list[str] | None: list of error messages if the password is invalid, or None if the password is valid.
        """
        if not password:
            return (["Password cannot be empty."])

        validation_errors = []

        if len(password) < 15:
            validation_errors.append("Password must be at least 15 characters long.")
        if not re.search(r'\d', password):
            validation_errors.append("Password must contain at least one digit.")
        if not re.search(r'[a-z]', password):
            validation_errors.append("Password must contain at least one lowercase letter.")
        if not re.search(r'[A-Z]', password):
            validation_errors.append("Password must contain at least one uppercase letter.")
        if not re.search(r'\W', password):
            validation_errors.append("Password must contain at least one special character.")
        if len(set(password)) < 8:
            validation_errors.append("Password must contain at least 8 unique characters.")
        if re.search(r'(.)\1\1', password):
            validation_errors.append("Password must not contain any repeating characters.")

        return validation_errors
