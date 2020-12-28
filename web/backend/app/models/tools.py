from app import api
from app.models import Model
from flask_restplus import fields


COMMON_TOOLS_RETURNS = api.model('Spaces', {
    "spaces": fields.List(fields.String(example="THISISCVAH"),
                        example=["THISISCVAH", "TACTICS"],
                        description="The confluence space names or an arbitrary name.")
})


class NewPasswordModel(Model):
    DTO = api.model('NewPassword', {
        "root_password": fields.String(required=True, example="Password!123456",
                                       description="The new password of the Kit.")
    })

    def __init__(self, password: str):
        self.root_password = password


class NetworkDeviceStateModel(Model):
    DTO = api.model('NetworkDeviceState', {
        "node": fields.String(example="sensor1.lan",
                              description="The FQDN or hostname of the node."),
        "device": fields.String(example="ens192",
                               description="The name of the network interface card (NIC)."),
        "state": fields.String(example="up",
                               description="The state the NIC is in.  It can be in an up or down state."),
    })

    def __init__(self, node: str, device: str, state: str):
        self.node = node
        self.device = device
        self.state = state


class NetworkInterfaceModel(Model):
    DTO = api.model('NetworkInterface', {
        "name": fields.String(example="ens192",
                              description="The name of the network interface card (NIC)."),
        "state": fields.String(example="up",
                               description="The state the NIC is in.  It can be in an up or down state.")
    })

    def __init__(self, device: str, state: str=None):
        self.name = device
        self.state = state


class InitalDeviceStatesModel(Model):
    DTO = api.model('InitalDeviceStates', {
        "node": fields.String(example="sensor1.lan",
                              description="The FQDN or hostname of the node."),
        "interfaces": fields.List(fields.Nested(NetworkInterfaceModel.DTO))
    })

    def __init__(self, hostname: str):
        self.node = hostname
        self.interfaces = []

    def add_interface(self, item: NetworkInterfaceModel):
        self.interfaces.append(item)
