from app.models import Model
from app.utils.namespaces import PORTAL_NS
from flask_restx import fields
from marshmallow import Schema
from marshmallow import fields as marsh_fields


class UserPortalLinkSchema(Schema):
    _id = marsh_fields.Str(required=False)
    name = marsh_fields.Str(required=False)
    url = marsh_fields.Str(required=False)
    description = marsh_fields.Str(required=False)

class UserPortalLinkModel(Model):
    schema = UserPortalLinkSchema()
    DTO = PORTAL_NS.model('UserPortalLinkModel', {
        "_id": fields.String(required=True, example="123abc456def"),
        "name": fields.String(required=True, example="Test"),
        "url": fields.String(required=True, example="https://test.com"),
        "description": fields.String(required=True, example="This is a test.")
    })

    def __init__(self, _id: str, name: str, url: str, description: str):
        self._id = _id
        self.name = name
        self.url= url
        self.description = description
