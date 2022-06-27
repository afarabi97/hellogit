from app.models import Model
from app.utils.namespaces import HEALTH_NS
from flask_restx import fields


class DatastoreModel(Model):
    DTO = HEALTH_NS.model('Datastore', {
        'capacity': fields.Integer(),
        'datastore': fields.String(),
        'free_space': fields.Integer(),
        'name': fields.String(),
        'type': fields.String()
    })
