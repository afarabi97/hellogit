from app.models import Model
from flask_restx import fields, Namespace

APP_NS = Namespace("app", path="/api/app", description="Health page related operations.")
HEALTH_NS = Namespace("health", path="/api/health", description="Health page related operations.")

class DatastoreModel(Model):
    DTO = HEALTH_NS.model('Datastore', {
        'capacity': fields.Integer(),
        'datastore': fields.String(),
        'free_space': fields.Integer(),
        'name': fields.String(),
        'type': fields.String()
    })
