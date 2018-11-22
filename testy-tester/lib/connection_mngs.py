from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient
from fabric import Connection


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

    def _establish_fabric_connection(self) -> None:
        if not self._connection:
            self._connection = Connection(self._ipaddress,
                                          user=self._username,
                                          connect_timeout=20,
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
