from app.common import OK_RESPONSE, JSONEncoder
from app.middleware import controller_maintainer_required
from app.utils.db_mngs import conn_mng
from bson import ObjectId
from flask import Response
from flask_restx import Namespace, Resource

NOTIFICATIONS_NS = Namespace("notifications", path="/api/notifications", description="Notifications for CVAH UI.")

@NOTIFICATIONS_NS.route('')
class Notifications(Resource):

    @NOTIFICATIONS_NS.response(200, 'Notifications')
    def get(self) -> Response:
        """
        Gets all notifications from mongodb

        """
        notifications = list(conn_mng.mongo_notifications.find({}))
        return JSONEncoder().encode(notifications)

    @NOTIFICATIONS_NS.response(200, 'Deleted Notifications')
    @controller_maintainer_required
    def delete(self) -> Response:
        """
        Delete all notifications from mongodb

        """
        conn_mng.mongo_notifications.delete_many({})
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

        conn_mng.mongo_notifications.delete_one({"_id": ObjectId(notification_id)})
        return OK_RESPONSE

