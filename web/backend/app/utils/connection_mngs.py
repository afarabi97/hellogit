import os

from app import rq_logger
from base64 import b64decode
from bson import ObjectId
from datetime import datetime
from elasticsearch import Elasticsearch
from elasticsearch.client import ClusterClient, SnapshotClient, IndicesClient
from elasticsearch.exceptions import ConflictError
from fabric import Connection, Config
from kubernetes import client, config
from kubernetes.client.models.v1_secret import V1Secret
from kubernetes.client.rest import ApiException
from pathlib import Path
from app.models.kit_setup import DIPKickstartForm, DIPKitForm
from app.utils.db_mngs import MongoConnectionManager
from app.utils.constants import KIT_ID, DATE_FORMAT_STR, KICKSTART_ID, NODE_TYPES
from time import sleep
from typing import Dict, List


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


def get_master_node_ip(kit_form) -> str:
    """
    Returns a the IP address and root password of the master node from the kit form passed in.

    :param kit_form:
    :return:
    """
    for node in kit_form.nodes:
        try:
            if node.node_type == NODE_TYPES[0] and node.is_master_server:
                return str(node.ip_address)
        except KeyError:
            pass

    return None


class FabricConnectionWrapper():

    def __init__(self, conn_mongo: MongoConnectionManager=None):
        self._connection = None  # type: Connection
        self._conn_mongo = conn_mongo

    def _establish_fabric_connection(self, conn_mongo: MongoConnectionManager) -> None:
        kickstart_form = DIPKickstartForm.load_from_db()
        kit_form = DIPKitForm.load_from_db()

        master_ip = get_master_node_ip(kit_form)
        password = kickstart_form.root_password
        self._connection = Connection(master_ip,
                                      user=USERNAME,
                                      connect_timeout=CONNECTION_TIMEOUT,
                                      connect_kwargs={'password': password,
                                                      'allow_agent': False,
                                                      'look_for_keys': False})

    def __enter__(self):
        if self._conn_mongo:
            self._establish_fabric_connection(self._conn_mongo)
        else:
            with MongoConnectionManager() as conn_mng:
                self._establish_fabric_connection(conn_mng)
        return self._connection

    def __exit__(self, *exc):
        if self._connection:
            self._connection.close()


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
        kickstart_form = DIPKickstartForm.load_from_db()
        self._password = kickstart_form.root_password

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

        self._get_and_save_kubernetes_config()
        config.load_kube_config()
        self._kube_apiv1 = client.CoreV1Api()

    def _get_and_save_kubernetes_config(self) -> None:
        """
        Retrieves the kuberntes configuration file from the master server.
        """
        if not os.path.exists(KUBEDIR):
            os.makedirs(KUBEDIR)

        config_path = KUBEDIR + '/config'
        if not os.path.exists(config_path) or not os.path.isfile(config_path):
            with FabricConnectionWrapper(self._mongo_conn) as fab_conn:
                fab_conn.get(config_path, config_path)

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


def get_kubernetes_secret_v2(conn_mng: MongoConnectionManager,
                          secret_name: str,
                          namespace: str="default",
                          retries:int=3) -> V1Secret:
    while retries != 0:
        try:
            with KubernetesWrapper2(conn_mng) as api:
                v1 = api.core_V1_API
                return v1.read_namespaced_secret(secret_name, namespace)
        except ApiException as e:
            if retries == 0:
                raise e
            sleep(10)

        retries -= 1
