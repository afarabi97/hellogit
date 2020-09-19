from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient


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
    def mongo_node(self) -> Collection:
        return self._tfplenum_database.nodes

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
