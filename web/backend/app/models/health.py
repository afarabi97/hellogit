from app import api
from app.models import Model
from flask_restx import fields

class DatastoreModel(Model):
    DTO = api.model('Datastore', {
        'capacity': fields.Integer(),
        'datastore': fields.String(),
        'free_space': fields.Integer(),
        'name': fields.String(),
        'type': fields.String()
    })
