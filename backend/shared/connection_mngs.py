import os

from datetime import datetime
from fabric import Connection, Config
from kubernetes import client, config
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient
from shared.constants import KIT_ID, DATE_FORMAT_STR, KICKSTART_ID
from shared.utils import decode_password
from typing import Dict, Tuple

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
        elif isinstance(some_dict[key], dict):
            objectify(some_dict[key])

    return some_dict


class MongoConnectionManager(object):
    """
    Managment class for handling mongo connections.
    """

    def __init__(self):
        self._client = MongoClient('mongodb://localhost:27017/')
        self._tfplenum_database = self._client.tfplenum_database  # type: Database

    @property
    def mongo_client(self) -> MongoClient:
        """
        Returns the mongo client.

        :return:
        """
        return self._client

    @property
    def mongo_database(self) -> Database:
        """
        Returns the mongo database management object so that we can create dynamic collections.

        :return:
        """
        return self._tfplenum_database

    @property
    def mongo_kickstart(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kickstart

    @property
    def mongo_kit(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kit

    @property
    def mongo_kit_archive(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kit_archive

    @property
    def mongo_kickstart_archive(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kickstart_archive

    @property
    def mongo_console(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.console

    @property
    def mongo_last_jobs(self) -> Collection:
        """
        Returns a mongo object that can do manipulate the last jobs completed by the system.
        """
        return self._tfplenum_database.last_jobs

    def close(self):
        """
        Closes the clients mongo collection gracefully.
        """
        if self._client:
            self._client.close()

    def __enter__(self):
        """
        Function executes within a given contenxt  (IE: with MongoConnectionManager() as mng:)

        :return:
        """        
        return self

    def __exit__(self, *exc) -> None:
        """
        Executes after completion

        :param *exc
        """
        self.close()


def get_master_node_ip_and_password(kit_form: Dict) -> str:
    """
    Returns a the IP address and root password of the master node from the kit form passed in.

    :param kit_form:
    :return:
    """
    for server in kit_form["servers"]:
        try:
            if server["is_master_server"]:
                return server["host_server"]
        except KeyError:
            pass

    return None, None


class FabricConnectionWrapper():

    def __init__(self, conn_mongo: MongoConnectionManager=None):
        self._connection = None  # type: Connection
        self._conn_mongo = conn_mongo

    def _establish_fabric_connection(self, conn_mongo: MongoConnectionManager) -> None:
        kit_form = conn_mongo.mongo_kit.find_one({"_id": KIT_ID})
        kickstart_form = conn_mongo.mongo_kickstart.find_one({"_id": KICKSTART_ID})
        if kit_form and kickstart_form:
            master_ip = get_master_node_ip_and_password(kit_form['form'])
            password = decode_password(kickstart_form['form']['root_password'])
            self._connection = Connection(master_ip, 
                                          user=USERNAME, 
                                          connect_timeout=CONNECTION_TIMEOUT,
                                          connect_kwargs={'password': password, 
                                                          'allow_agent': False, 
                                                          'look_for_keys': False})
        else:
            raise KitFormNotFound()

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
