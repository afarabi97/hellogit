from app.models import Model
from flask_restx import Namespace, fields

APP_NS = Namespace("app", description="Health page related operations.")
HEALTH_NS = Namespace("health", description="Health page related operations.")


class DatastoreModel(Model):
    DTO = HEALTH_NS.model('Datastore', {
        'capacity': fields.Integer(),
        'datastore': fields.String(),
        'free_space': fields.Integer(),
        'name': fields.String(),
        'type': fields.String()
    })
