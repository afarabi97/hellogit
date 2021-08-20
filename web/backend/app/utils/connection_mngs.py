import os
from app.utils.logging import logger
from base64 import b64decode
from bson import ObjectId
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch
from elasticsearch.client import ClusterClient, SnapshotClient, IndicesClient
from elasticsearch.exceptions import ConflictError
from fabric import Connection, Config
from kubernetes import client, config
from kubernetes.client.models.v1_secret import V1Secret
from kubernetes.client.rest import ApiException
from pathlib import Path
from app.models.nodes import Node
from app.models.settings.kit_settings import KitSettingsForm
from app.utils.db_mngs import MongoConnectionManager
from app.utils.constants import KIT_ID, DATE_FORMAT_STR, NODE_TYPES
from time import sleep
from typing import Dict, List, Union
import paramiko
import socket
import sys
from paramiko import SSHException



KUBEDIR = "/root/.kube"
USERNAME = 'root'
CONNECTION_TIMEOUT = 20


class KitFormNotFound(Exception):
    pass


def objectify(some_dict: Dict) -> Dict:
    """
    Converts a given dictionary into a savable mongo object.
    It removes things that are set to None.

    :param some_dict:
    :return:
    """
    for key in list(some_dict):
        if some_dict[key] is None:
            del some_dict[key]
        elif isinstance(some_dict[key], datetime):
            some_dict[key] = some_dict[key].strftime(DATE_FORMAT_STR)
        elif isinstance(some_dict[key], list):
            for index, item in enumerate(some_dict[key]):
                if item is None:
                    some_dict[key].pop(index)
                elif isinstance(item, datetime):
                    some_dict[key][index] = item.strftime(DATE_FORMAT_STR)
                elif isinstance(item, dict):
                    objectify(item)
        elif isinstance(some_dict[key], ObjectId):
            some_dict[key] = str(some_dict[key])
        elif isinstance(some_dict[key], dict):
            objectify(some_dict[key])

    return some_dict


class FabricConnection():

    def __init__(self,
                 ip_address: str,
                 password: str = None,
                 username: str = USERNAME,
                 use_ssh_key: bool=False):
        self._connection = None  # type: Connection
        self._ip_address = ip_address
        self._password = password
        self._username = username
        self._use_ssh_key = use_ssh_key

    def _set_root_password(self) -> str:
        kit_settings = KitSettingsForm.load_from_db()
        self._password = kit_settings.password

    def _establish_fabric_connection(self) -> None:
        if self._use_ssh_key:
            self._connection = Connection(self._ip_address,
                                          user=self._username,
                                          connect_timeout=CONNECTION_TIMEOUT,
                                          connect_kwargs={'key_filename': ['/root/.ssh/id_rsa'],
                                                          'allow_agent': False,
                                                          'look_for_keys': False})
        else:
            self._connection = Connection(self._ip_address,
                                          user=self._username,
                                          connect_timeout=CONNECTION_TIMEOUT,
                                          connect_kwargs={'password': self._password,
                                                          'allow_agent': False,
                                                          'look_for_keys': False})

    def __enter__(self):
        if not self._password:
            self._set_root_password()

        self._establish_fabric_connection()
        return self._connection

    def __exit__(self, *exc):
        if self._connection:
            self._connection.close()


class KubernetesWrapper():

    def __init__(self, mongo_conn: MongoConnectionManager=None):
        """
        :param mongo_conn: The MongoConnection manager, if this is passed in, the wrapper will not close it.
                           if run the wrapper and dont set it the context manager will close it.
        """
        if mongo_conn is None:
            self._mongo_conn = MongoConnectionManager()
            self._is_close = True
        else:
            self._mongo_conn = mongo_conn
            self._is_close = False

        config.load_kube_config()
        self._kube_apiv1 = client.CoreV1Api()

    def close(self) -> None:
        """
        Closes the connections associated with this context wrapper.
        """
        if self._mongo_conn and self._is_close:
            self._mongo_conn.close()

    def __enter__(self) -> client.CoreV1Api():
        """
        Returns an instance of the kubernetes main API handler.  Documentation for this can be found here
        https://github.com/kubernetes-client/python/blob/master/kubernetes/README.md

        :return kubernetes api.
        """
        return self._kube_apiv1

    def __exit__(self, *exc) -> None:
        self.close()


class KubernetesWrapper2(KubernetesWrapper):

    def __init__(self, mongo_conn: MongoConnectionManager=None):
        """
        :param mongo_conn: The MongoConnection manager, if this is passed in, the wrapper will not close it.
                           if run the wrapper and dont set it the context manager will close it.
        """
        super().__init__(mongo_conn)
        self._apps_apiv1 = client.AppsV1Api()
        self._batch_apiv1 = client.BatchV1Api()

    @property
    def apps_V1_API(self) -> client.AppsV1Api():
        return self._apps_apiv1

    @property
    def core_V1_API(self) -> client.CoreV1Api():
        return self._kube_apiv1

    @property
    def batch_V1_API(self) -> client.BatchV1Api():
        return self._batch_apiv1

    def __enter__(self):
        return self


class FabricConnectionManager:

    def __init__(self, username: str, password: str, ipaddress: str):
        """
        Initializes the fabric connection manager.

        :param username: The username of the box we wish to connect too
        :param password: The password of the user account
        :param ipaddress: The Ip we are trying to gain access too.
        """
        self._connection = None  # type: Connection
        self._username = username
        self._password = password
        self._ipaddress = ipaddress
        self._establish_fabric_connection()

    def _establish_fabric_connection(self) -> None:
        if not self._connection:
            config = Config(overrides={'sudo': {'password': self._password}})
            self._connection = Connection(self._ipaddress,
                                          config=config,
                                          user=self._username,
                                          connect_timeout=CONNECTION_TIMEOUT,
                                          connect_kwargs={'password': self._password,
                                                          'allow_agent': False,
                                                          'look_for_keys': False})

    @property
    def connection(self):
        return self._connection

    def close(self):
        if self._connection:
            self._connection.close()

    def __enter__(self):
        self._establish_fabric_connection()
        return self._connection

    def __exit__(self, *exc):
        self.close()


class KubernetesSecret:

    def __init__(self, response: V1Secret):
        self.ca_certificate = b64decode(response.data['ca.crt']).decode('utf-8')
        self.tls_certificate = b64decode(response.data['tls.crt']).decode('utf-8')
        self.tls_key = b64decode(response.data['tls.key']).decode('utf-8')

    def __str__(self):
        ret_val = self.ca_certificate
        ret_val += self.tls_certificate
        ret_val += self.tls_key
        return ret_val

    def write_to_file(self, some_path: str):
        if not Path(some_path).is_dir():
            print("Not a valid directory")
            return

        ca_crt = Path(some_path + "/ca.crt")
        ca_crt.write_text(self.ca_certificate)

        tls_crt = Path(some_path + "/tls.crt")
        tls_crt.write_text(self.tls_certificate)

        tls_key = Path(some_path + "/tls.key")
        tls_key.write_text(self.tls_key)


def get_kubernetes_secret(conn_mng: MongoConnectionManager,
                          secret_name: str,
                          namespace: str="default",
                          retries:int=3) -> KubernetesSecret:
    while retries != 0:
        try:
            with KubernetesWrapper2(conn_mng) as api:
                v1 = api.core_V1_API
                response = v1.read_namespaced_secret(secret_name, namespace)
                return KubernetesSecret(response)
        except ApiException as e:
            if retries == 0:
                raise e
            sleep(10)

        retries -= 1



class SSHFailure(Exception):
    """Base class for exceptions in this module."""
    pass

class SSHClient():
    """
    Represents an SSH connection to a remote server

    Attributes:
        client (SSHClient): An SSHClient object on which you can run commands
    """

    client = None  # type: SSHClient

    def __init__(self, hostname: str, username: str=None, password: str=None, port=22) -> None:
        """
        Initializes a new SSH connection

        :param hostname (str): The hostname of the server you want to connect to
        :param username (str): The username of the server you want to connect to
        :param password (str): The password of the server you want to connect to
        :param port (int): The port number SSH is running on. Defaults to 22
        :return:
        """
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            save_stderr = sys.stdout
            if username and password:
                self.client.connect(hostname, port=port, username=username, password=password)
            else:
                self.client.connect(hostname, port=port)
            sys.stderr = save_stderr

        except Exception as e:
            logger.error('Connection Failed')
            logger.error(e)
            self.client.close()

    def run_command(self, command: str, working_directory=None) -> tuple:
        """
        Runs a command on the SSH client

        :param command (str): The command you want to run on the host
        :param working_directory (str): The directory in which you want to run the command
        :returns: A tuple containing stdout and stderr from the command run
        """

        # Change into the working directory if it is specified
        if working_directory is not None:
            stdin, stdout, stderr = self.client.exec_command("cd " + working_directory + ";" + command)
        else:
            stdin, stdout, stderr = self.client.exec_command(command)

        return (stdout.read(), stderr.read())

    @staticmethod
    def test_connection(hostname: str, username: str=None, password: str=None, port=22, timeout=5) -> bool:
        """
        Tests whether a server is responding to SSH connections

        :param hostname (str): The hostname of the server you want to connect to
        :param username (str): The username of the server you want to connect to
        :param password (str): The password of the server you want to connect to
        :param port (int): The port number SSH is running on. Defaults to 22
        :param timeout (int): The length of time before the target is considered failed
        :return (bool): Returns true if the connection succeeded and false otherwise
        """

        try:
            logger.info("I AM HERE")
            client = paramiko.SSHClient() # type: SSHClient
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            save_stderr = sys.stdout
            if username and password:
                client.connect(hostname=hostname, username=username, password=password, port=port, timeout=timeout)
            else:
                client.connect(hostname=hostname, port=port, timeout=timeout)
            sys.stderr = save_stderr
            client.close()
            return True
        except (SSHException, socket.error) as e:
            logger.exception("{} received error: ".format(hostname))
            logger.exception(str(e))
            return False
