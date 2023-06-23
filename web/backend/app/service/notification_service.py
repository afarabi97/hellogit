from typing import List

import pymongo
from app.models.common import COMMON_SUCCESS_MESSAGE
from app.models.notification import NotificationModel
from app.utils.collections import mongo_notifications
from app.utils.constants import NUMBER_OF_NOTIFICATION_ITEMS
from bson import ObjectId


def get_notifications(offset: str, role: str) -> List[NotificationModel]:
    """
    Gets all notifications from mongodb
    """
    filter_obj = {}
    if role != "all":
        filter_obj = {"role": role}

    notifications = list(mongo_notifications().find(filter_obj)
                                              .sort("timestamp", pymongo.DESCENDING)
                                              .skip(int(offset))
                                              .limit(NUMBER_OF_NOTIFICATION_ITEMS))

    for notification in notifications:
        notification["_id"] = str(notification["_id"])
    return notifications


def delete_notifications_del() -> COMMON_SUCCESS_MESSAGE:
    """
    Delete all notifications from mongodb

    """
    mongo_notifications().delete_many({})
    return {"success_message": "Successfully deleted notifications"}


def delete_notification_id(notification_id) -> COMMON_SUCCESS_MESSAGE:
    """
    Delete a notification using _id

    :param _id: notification id
    """

    mongo_notifications().delete_one({"_id": ObjectId(notification_id)})
    return {"success_message": "Successfully deleted notification"}
