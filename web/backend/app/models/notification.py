from typing import List

from app.models import Model
from app.models.catalog import ChartNodeModel
from app.utils.namespaces import NOTIFICATIONS_NS
from flask_restx import fields


class NotificationModel(Model):
    DTO = NOTIFICATIONS_NS.model('NotificationModel', {
        "action": fields.String(required=False, example="Installing",
                                description="Describes stage for catalog app"),
        "application": fields.String(required=False, example="Hive",
                                     description="Name of catalog app"),
        "exception": fields.String(required=True, example="[Errno 2] No such file",
                                   description="Way to transfer potential errors. Can be empty string"),
        "message": fields.String(required=True, example="Installing hive on server",
                                 description="Main message for notification to be displayed within application"),
        "role": fields.String(required=True, example="catalog",
                              description="Role is the type or classification for each notification"),
        "status": fields.String(required=True, example="ERROR",
                                description="Delivers a main status for the entire notification"),
        "timestamp": fields.String(required=True, example="2023-06-09T23:11:19.547612",
                                   description="Date timestamp of the notification"),
        "_id": fields.String(required=True, example="6483b1970d915a09d73252a8",
                             description="Id associated with enetering a notification into the database"),
        "data": fields.List(fields.Nested(ChartNodeModel.DTO))
    })

    def __init__(self, action: str, application: str, exception: str,
                 message: str, role: str, status: str, timestamp: str,
                 _id: str, data: List[ChartNodeModel]):
        self.action = None
        self.application = None
        self.exception = exception
        self.message = message
        self.role = role
        self.status = status
        self.timestamp = timestamp
        self._id = _id
        self.data = data

        if action is not None:
            self.action = action
        if application is not None:
            self.application = application
