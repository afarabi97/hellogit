import os
from kubernetes import client, config
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient
from fabric import Connection, Config


USERNAME = 'root'
CONNECTION_TIMEOUT = 60


class MongoConnectionManager(object):
    """
    Managment class for handling mongo connections.
    """

    def __init__(self, webserver_ip: str='localhost'):
        self._client = MongoClient('mongodb://%s:27017/' % webserver_ip)
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
    def mongo_settings(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.settings

    @property
    def mongo_kit_status(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kit_status

    @property
    def mongo_node(self) -> Collection:
        return self._tfplenum_database.nodes

    @property
    def mongo_jobs(self) -> Collection:
        return self._tfplenum_database.jobs

    @property
    def mongo_configurations(self) -> Collection:
        """
        Returns a mongo object that be used for storing misc configuration information.

        :return:
        """
        return self._tfplenum_database.configurations

    @property
    def mongo_add_node_wizard(self) -> Collection:
        return self._tfplenum_database.add_node_wizard

    @property
    def mongo_counters(self) -> Collection:
        return self._tfplenum_database.counters

    @property
    def mongo_kit(self) -> Collection:
        return self._tfplenum_database.kit

    @property
    def mongo_ruleset(self) -> Collection:
        return self._tfplenum_database.ruleset

    @property
    def mongo_rule(self) -> Collection:
        return self._tfplenum_database.rule

    @property
    def mongo_console(self) -> Collection:
        return self._tfplenum_database.console

    @property
    def mongo_notifications(self) -> Collection:
        return self._tfplenum_database.notifications

    @property
    def mongo_catalog_saved_values(self) -> Collection:
        return self._tfplenum_database.catalog_saved_values

    @property
    def mongo_elastic_deploy(self) -> Collection:
        return self._tfplenum_database.elastic_deploy

    @property
    def mongo_user_links(self) -> Collection:
        return self._tfplenum_database.user_links

    @property
    def mongo_windows_installer_configs(self) -> Collection:
        return self._tfplenum_database.windows_installer_configs

    @property
    def mongo_windows_target_lists(self) -> Collection:
        return self._tfplenum_database.windows_target_lists

    @property
    def mongo_metrics(self) -> Collection:
        return self._tfplenum_database.metrics

    @property
    def mongo_mip_config(self) -> Collection:
        return self._tfplenum_database.mip_config

    @property
    def mongo_spaces(self) -> Collection:
        return self._tfplenum_database.spaces

    @property
    def mongo_hive_settings(self) -> Collection:
        return self._tfplenum_database.hive_settings

    @property
    def mongo_kit_tokens(self) -> Collection:
        return self._tfplenum_database.kit_tokens

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
        :param username: The username of the node
        :param password: The password of the  node
        :param ip_address: The IP Address of the node
        :param kubernetes_config_path: The name and path where we want to save save the kubernetes configuation on the
                                       Integration runner (IE Jenkins server)
        """
        self._kubernetes_config_path = kubernetes_config_path
        self._username = username
        self._password = password
        self._ip_address = ip_address
        self._get_and_save_kubernetes_config()
        config.load_kube_config(self._kubernetes_config_path)
        self._core_apiv1 = client.CoreV1Api()
        self._apps_apiv1 = client.AppsV1Api()
        self._batch_apiv1 = client.BatchV1Api()
        self._open_port()

    def _open_port(self):
        with FabricConnectionWrapper(self._username,
                                     self._password,
                                     self._ip_address) as shell:
            shell.run("firewall-cmd --add-port=6443/tcp")

    def _get_and_save_kubernetes_config(self) -> None:
        """
        Retrieves the kuberntes configuration file from server.
        """
        config_path = '/root/.kube/config'
        with FabricConnectionWrapper(self._username,
                                     self._password,
                                     self._ip_address) as fab_conn:
            fab_conn.get(config_path, self._kubernetes_config_path)

    @property
    def apps_V1_API(self) -> client.AppsV1Api():
        return self._apps_apiv1

    @property
    def core_V1_API(self) -> client.CoreV1Api():
        return self._core_apiv1

    @property
    def batch_V1_API(self) -> client.BatchV1Api():
        return self._batch_apiv1

    def close(self) -> None:
        with FabricConnectionWrapper(self._username,
                                     self._password,
                                     self._ip_address) as shell:
            shell.run("firewall-cmd --remove-port=6443/tcp")


    def __enter__(self) -> client.CoreV1Api():
        """
        Returns an instance of the kubernetes main API handler.  Documentation for this can be found here
        https://github.com/kubernetes-client/python/blob/master/kubernetes/README.md
        :return kubernetes api.
        """
        return self
        # return self._kube_apiv1

    def __exit__(self, *exc) -> None:
        self.close()
