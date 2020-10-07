from app import app, conn_mng
from app.common import JSONEncoder
from flask import Response
from bson import ObjectId
from app.common import OK_RESPONSE
from app.middleware import controller_maintainer_required


@app.route('/api/notifications', methods=['GET'])
def get_notifications() -> Response:
    """
    Gets all notifications from mongodb

    """
    notifications = list(conn_mng.mongo_notifications.find({}))
    return JSONEncoder().encode(notifications)


@app.route('/api/notifications', methods=['DELETE'])
@controller_maintainer_required
def delete_notifications() -> Response:
    """
    Delete all notifications from mongodb

    """

    conn_mng.mongo_notifications.delete_many({})
    return OK_RESPONSE

@app.route('/api/notifications/<notification_id>', methods=['DELETE'])
@controller_maintainer_required
def delete_notification(notification_id) -> Response:
    """
    Delete a notification using _id

    :param _id: notification id
    """

    conn_mng.mongo_notifications.delete_one({"_id": ObjectId(notification_id)})
    return OK_RESPONSE

