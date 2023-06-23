from app.middleware import controller_maintainer_required, handle_errors
from app.models.common import COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.models.notification import NotificationModel
from app.service.notification_service import (delete_notification_id,
                                              delete_notifications,
                                              get_notifications)
from app.utils.namespaces import NOTIFICATIONS_NS
from flask import Response
from flask_restx import Resource


@NOTIFICATIONS_NS.route('/<offset>/<role>')
@NOTIFICATIONS_NS.doc(params={"offset": "Amount of offset needed to get next batch of notifications"})
@NOTIFICATIONS_NS.doc(params={"role": "Role used to signify notification classification values can be all, catalog, settings, nodes, rulesync, scale, agent, pcap, process_logs, tools, curator"})
class NotificationsCtrlApi(Resource):

    @NOTIFICATIONS_NS.doc(description="Gets all notifications from mongodb.")
    @NOTIFICATIONS_NS.response(200, 'List NotificationModel', [NotificationModel.DTO])
    @NOTIFICATIONS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, offset: str, role: str) -> Response:
        return get_notifications(offset, role)


@NOTIFICATIONS_NS.route('')
class NotificationsDelCtrlApi(Resource):

    @NOTIFICATIONS_NS.doc(description="Delete all notifications from mongodb.")
    @NOTIFICATIONS_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @NOTIFICATIONS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    @handle_errors
    def delete(self) -> Response:
        return delete_notifications()


@NOTIFICATIONS_NS.route('/<notification_id>')
@NOTIFICATIONS_NS.doc(params={"notification_id": "Id associated with a notification database entry notifications"})
class DeleteNotificationsCtrlApi(Resource):

    @NOTIFICATIONS_NS.doc(description="Delete a notification using _id.")
    @NOTIFICATIONS_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @NOTIFICATIONS_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    @handle_errors
    def delete(self, notification_id: str) -> Response:
        return delete_notification_id(notification_id)
