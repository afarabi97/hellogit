import pymongo
from app.common import OK_RESPONSE, JSONEncoder
from app.middleware import controller_maintainer_required
from app.utils.collections import mongo_notifications
from bson import ObjectId
from flask import Response
from flask_restx import Namespace, Resource

NOTIFICATIONS_NS = Namespace("notifications", description="Notifications for CVAH UI.")
NUMBER_OF_NOTIFICATION_ITEMS = 30


@NOTIFICATIONS_NS.route('/<offset>/<role>')
class Notifications(Resource):

    @NOTIFICATIONS_NS.response(200, 'Notifications')
    def get(self, offset: str, role: str) -> Response:
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


@NOTIFICATIONS_NS.route('')
class NotificationsDel(Resource):

    @NOTIFICATIONS_NS.response(200, 'Deleted Notifications')
    @controller_maintainer_required
    def delete(self) -> Response:
        """
        Delete all notifications from mongodb

        """
        mongo_notifications().delete_many({})
        return OK_RESPONSE


@NOTIFICATIONS_NS.route('/<notification_id>')
class DeleteNotifications(Resource):

    @NOTIFICATIONS_NS.response(200, 'Deleted Notification')
    @controller_maintainer_required
    def delete(self, notification_id) -> Response:
        """
        Delete a notification using _id

        :param _id: notification id
        """

        mongo_notifications().delete_one({"_id": ObjectId(notification_id)})
        return OK_RESPONSE
