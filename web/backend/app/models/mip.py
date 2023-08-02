from marshmallow import Schema
from marshmallow import fields as marsh_fields


class MIPSchemaModel(Schema):
    hostname = marsh_fields.Str(required=True, example="miper")
    ip_address = marsh_fields.IPv4(required=True, example="10.40.20.4")
    deployment_type = marsh_fields.Str(required=True, example="Virtual")

    # if baremetal
    mac_address = marsh_fields.Str(required=False, allow_none=True) # required if baremetal

    # if virtual
    virtual_cpu = marsh_fields.Integer(required=False, allow_none=True, example= 8)
    virtual_mem = marsh_fields.Integer(required=False, allow_none=True, example = 8)
    virtual_os = marsh_fields.Integer(required=False, allow_none=True, example = 500)
