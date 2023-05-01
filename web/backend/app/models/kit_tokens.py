from app.models import Model
from app.utils.constants import IP_ADDRESS_PATTERN
from app.utils.namespaces import KIT_TOKEN_NS
from flask_restx import fields
from marshmallow import Schema
from marshmallow import fields as marsh_fields


class KitTokenSchemaModel(Schema):
    ipaddress = marsh_fields.IPv4(required=True)
    kit_token_id = marsh_fields.Str(required=False)

class KitTokenModel(Model):
    schema = KitTokenSchemaModel()
    DTO = KIT_TOKEN_NS.model('KitTokenModel', {
        "ipaddress": fields.String(required=True, pattern=IP_ADDRESS_PATTERN, example="10.40.12.146", description="The static IP Address of the kit token."),
        "kit_token_id": fields.String(required=False)
    })

    def __init__(self, ipaddress: str, kit_token_id: str):
        self.DTO["ipaddress"] = ipaddress
        self.DTO["kit_token_id"] = kit_token_id
