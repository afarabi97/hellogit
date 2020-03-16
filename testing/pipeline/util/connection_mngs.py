import os
from kubernetes import client, config
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient
from fabric import Connection, Config


USERNAME = 'root'
CONNECTION_TIMEOUT = 20


class MongoConnectionManager(object):
    """
    Managment class for handling mongo connections.
    """

    def __init__(self, webserver_ip: str='localhost'):
        self._client = MongoClient('mongodb://%s:27017/' % webserver_ip)
        self._tfplenum_database = self._client.tfplenum_database  # type: Database

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

    @property
    def mongo_portal(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.portal

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


class FabricConnectionWrapper:

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
        self._sudo_config = None # type: Config

    def _establish_fabric_connection(self) -> None:
        if not self._connection:
            self._sudo_config = Config(overrides={'sudo': {'password': self._password}})
            self._connection = Connection(self._ipaddress,
                                          user=self._username,
                                          connect_timeout=CONNECTION_TIMEOUT,
                                          config=self._sudo_config,
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


class KubernetesWrapper:

    def __init__(self, username: str,
                 password: str,
                 ip_address: str,
                 kubernetes_config_path: str="kubernetes_config"):
        """
        Initializes the Kubernetes connection for making API calls to Kubernetes.

        :param username: The username of the master server node
        :param password: The password of the master server node
        :param ip_address: The IP Address of the master server node
        :param kubernetes_config_path: The name and path where we want to save save the kubernetes configuation on the
                                       Integration runner (IE Jenkins server)
        """
        self._kubernetes_config_path = kubernetes_config_path
        self._username = username
        self._password = password
        self._ip_address = ip_address
        self._get_and_save_kubernetes_config()
        config.load_kube_config(self._kubernetes_config_path)
        self._kube_apiv1 = client.CoreV1Api()

    def _get_and_save_kubernetes_config(self) -> None:
        """
        Retrieves the kuberntes configuration file from the master server.
        """
        config_path = '/root/.kube/config'
        with FabricConnectionWrapper(self._username,
                                        self._password,
                                        self._ip_address) as fab_conn:
            fab_conn.get(config_path, self._kubernetes_config_path)

    def close(self) -> None:
        """
        Closes the connections associated with this context wrapper.
        """
        pass

    def __enter__(self) -> client.CoreV1Api():
        """
        Returns an instance of the kubernetes main API handler.  Documentation for this can be found here
        https://github.com/kubernetes-client/python/blob/master/kubernetes/README.md

        :return kubernetes api.
        """
        return self._kube_apiv1

    def __exit__(self, *exc) -> None:
        self.close()
