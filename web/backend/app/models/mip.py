from marshmallow import Schema
from marshmallow import fields as marsh_fields


class MIPSchemaModel(Schema):
    hostname = marsh_fields.Str(required=True)
    ip_address = marsh_fields.IPv4(required=True)
    deployment_type = marsh_fields.Str(required=True)

    # if baremetal
    mac_address = marsh_fields.Str(required=False, allow_none=True) # required if baremetal

    # if virtual
    virtual_cpu = marsh_fields.Integer(required=False, allow_none=True)
    virtual_mem = marsh_fields.Integer(required=False, allow_none=True)
    virtual_os = marsh_fields.Integer(required=False, allow_none=True)
