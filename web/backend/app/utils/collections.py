from .db_mngs import mongo
from pymongo.collection import Collection


def mongo_settings() -> Collection:
    """
    Returns a mongo object that can do database manipulations.

    :return:
    """
    return mongo.db.settings


def mongo_node() -> Collection:
    return mongo.db.nodes


def mongo_jobs() -> Collection:
    return mongo.db.jobs


def mongo_configurations() -> Collection:
    """
    Returns a mongo object that be used for storing misc configuration information.

    :return:
    """
    return mongo.db.configurations


def mongo_ruleset() -> Collection:
    return mongo.db.ruleset


def mongo_rule() -> Collection:
    return mongo.db.rule


def mongo_console() -> Collection:
    return mongo.db.console


def mongo_notifications() -> Collection:
    return mongo.db.notifications


def mongo_catalog_saved_values() -> Collection:
    return mongo.db.catalog_saved_values


def mongo_elastic_deploy() -> Collection:
    return mongo.db.elastic_deploy


def mongo_user_links() -> Collection:
    return mongo.db.user_links


def mongo_windows_installer_configs() -> Collection:
    return mongo.db.windows_installer_configs


def mongo_windows_target_lists() -> Collection:
    return mongo.db.windows_target_lists

def mongo_metrics() -> Collection:
    return mongo.db.metrics

def mongo_hive_settings() -> Collection:
    return mongo.db.hive_settings


def mongo_kit_tokens() -> Collection:
    return mongo.db.kit_tokens

