"""
This module is for storing standard functions which can be reused anywhere within the application.

"""
import base64
import hashlib
import os
import requests
import shutil
import tarfile
import zipfile

from datetime import datetime
from pathlib import Path
from typing import Union, Dict
from shared.constants import DATE_FORMAT_STR


def netmask_to_cidr(netmask: str) -> int:
    '''
    Converts a standards netmask to the associated CIDR notation.

    :param netmask: netmask ip addr (eg: 255.255.255.0)
    :return: equivalent cidr number to given netmask ip (eg: 24)
    '''
    return sum([bin(int(x)).count('1') for x in netmask.split('.')])


def is_ipv4_address(s: str) -> bool:
    if s is None or len(s) == 0:
        return False

    pieces = s.split('.')
    if len(pieces) != 4:
        return False

    try:
        return all(0<=int(p)<256 for p in pieces)
    except ValueError:
        return False



def filter_ip(ipaddress: str) -> bool:
    """
    Filters IP addresses from NMAP functions commands.
    :return:
    """
    if (not is_ipv4_address(ipaddress) or
            ipaddress.endswith('.0') or
            ipaddress == ''):
        return True

    return False


def encode_password(password: str) -> str:
    """
    Encodes a password and garbles is up.

    :param password: The password we wish to encode
    """
    if password is None or len(password) == 0:
        return ''
    return base64.b64encode(bytes(password, 'utf-8')).decode('utf-8')


def decode_password(password_enc: str) -> str:
    """
    Decodes a password.

    :param password_enc: The encoded password.
    """
    if password_enc is None or len(password_enc) == 0:
        return ''
    return base64.b64decode(bytes(password_enc, 'utf-8')).decode('utf-8')


def hash_file(some_path: Union[str, Path], chunk_size=8192) -> Dict:
    path = None #type: Path
    if isinstance(some_path, str):
        path = Path(some_path)
    elif isinstance(some_path, Path):
        path = some_path
    else:
        raise ValueError("Invalid type passed into hash_file function.")

    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()

    with open(str(path), 'rb') as fp:
        while True:
            chunk = fp.read(chunk_size)
            if chunk:
                md5.update(chunk)
                sha1.update(chunk)
                sha256.update(chunk)
            else:
                break
    return {"md5": md5.hexdigest(), "sha1": sha1.hexdigest(), "sha256": sha256.hexdigest() }


def tar_folder(folder_to_tar: str, path_of_archive: str):
    folder = Path(folder_to_tar)
    if folder.exists() and folder.is_dir():
        return shutil.make_archive(path_of_archive, "gztar", folder_to_tar)

    return ValueError("%s does not exist or is not a directory" % folder_to_tar)


def fix_hostname(dns_suffix: str, hostname_or_ip: str):
    """
    Ensures that a windows hostname is in the proper format based on what is passed in.

    :return fixed hostname:
    """
    if is_ipv4_address(hostname_or_ip):
        pass # Exit if block and return the address.
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


def zip_package(zip_save_path: str,
                package_dir: str,
                zip_root_dir="/tfplenum_agent"):
    zipf = zipfile.ZipFile(zip_save_path, 'w', zipfile.ZIP_DEFLATED)
    try:
        for root, dirs, files in os.walk(package_dir):
            for fname in files:
                abs_path = os.path.join(root, fname)
                rel_path = abs_path.replace(package_dir, '')
                zipf.write(os.path.join(root, fname), zip_root_dir + rel_path)
    finally:
        zipf.close()
