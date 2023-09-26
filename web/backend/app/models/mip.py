from app.models import Model
from app.utils.namespaces import KIT_SETUP_NS
from flask_restx import fields
from marshmallow import Schema
from marshmallow import fields as marsh_fields


class MIPSchema(Schema):
    hostname = marsh_fields.Str(required=True, example="miper")
    ip_address = marsh_fields.IPv4(required=True, example="10.40.20.4")
    deployment_type = marsh_fields.Str(required=True, example="Virtual")

    # if baremetal
    mac_address = marsh_fields.Str(required=False, allow_none=True) # required if baremetal

    # if virtual
    virtual_cpu = marsh_fields.Integer(required=False, allow_none=True, example= 8)
    virtual_mem = marsh_fields.Integer(required=False, allow_none=True, example = 8)
    virtual_os = marsh_fields.Integer(required=False, allow_none=True, example = 500)

class MIPModel(Model):
    schema = MIPSchema()
    DTO = KIT_SETUP_NS.model('MIPModel', {
        "hostname": fields.String(required=True, example="server1", description="The hostname of the mip."),
        "ip_address": fields.String(required=True, example="10.40.12.146", description="The static IP Address of the mip."),
        "deployment_type": fields.String(required=True, example="Baremetal or Virtual"),
        "mac_address": fields.String(required=False, example="00:0a:29:6e:7f:ff", description="The MAC Address of the mip. Use only if deployment_type=Baremetal, remove virtual_cpu, virtual_mem and virtual_os."),
        "virtual_cpu": fields.Integer(description="The number of virtual CPU cores. Use only if deployment_type=Virtual, remove mac_address."),
        "virtual_mem": fields.Integer(description="The amount of system ram in GB. Use only if deployment_type=Virtual, remove mac_address."),
        "virtual_os": fields.Integer(description="The size of the OS drive in GB. Use only if deployment_type=Virtual, remove mac_address.")
    })

    def __init__(self, hostname: str, ip_address: str, deployment_type: str,
                 mac_address: str, virtual_cpu: int, virtual_mem: int, virtual_os: int):
        self.hostname = hostname
        self.ip_address = ip_address
        self.deployment_type = deployment_type
        self.mac_address = mac_address
        self.virtual_cpu = virtual_cpu
        self.virtual_mem = virtual_mem
        self.virtual_os = virtual_os
