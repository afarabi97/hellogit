"""Use this module to access the mongo object and the mongo collections."""
from enum import Enum

from flask_pymongo import PyMongo
from pymongo.collection import Collection

mongo = PyMongo()


class Collections(Enum):
    """This class containes a list of possible mongo collections to get."""

    SETTINGS = "settings"
    NODES = "nodes"
    JOBS = "jobs"
    CONFIGURATIONS = "configurations"
    RULESET = "ruleset"
    RULE = "rule"
    CONSOLE = "console"
    NOTIFICATIONS = "notifications"
    CATALOG_SAVED_VALUES = "catalog_saved_values"
    ELASTIC_DEPLOY = "elastic_deploy"
    USER_LINKS = "user_links"
    WINDOWS_INSTALLER_CONFIGS = "windows_installer_configs"
    WINDOWS_TARGET_LISTS = "windows_target_lists"
    METRICS = "metrics"
    HIVE_SETTINGS = "hive_settings"
    KIT_TOKENS = "kit_tokens"


def get_collection(collection: Collections) -> Collection:
    """
    This function gets a mongo pymongo collection object and replaces all mongo_<collection>()
    functions.

    Args:
        collection (Collections): requires a value from Collections enum.

    Raises:
        ValueError: will raise value error when arguement is not form Collections enum.

    Returns:
        Collection: a pymongo Collection object that represent a mongo collection
    """
    if collection not in Collections:
        raise ValueError("Arguement must be in the Collections class.")
    else:
        return mongo.db[collection.value]


def mongo_settings() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.settings


def mongo_node() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.nodes


def mongo_jobs() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.jobs


def mongo_configurations() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.configurations


def mongo_ruleset() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.ruleset


def mongo_rule() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.rule


def mongo_console() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.console


def mongo_notifications() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.notifications


def mongo_catalog_saved_values() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.catalog_saved_values


def mongo_elastic_deploy() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.elastic_deploy


def mongo_user_links() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.user_links


def mongo_windows_installer_configs() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.windows_installer_configs


def mongo_windows_target_lists() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.windows_target_lists


def mongo_metrics() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.metrics


def mongo_hive_settings() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.hive_settings


def mongo_kit_tokens() -> Collection:
    """Deprication warning. Please use collections.get_colletion()"""
    return mongo.db.kit_tokens
