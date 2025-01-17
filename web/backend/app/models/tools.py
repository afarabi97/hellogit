from app.models import Model
from app.utils.namespaces import TOOLS_NS
from flask_restx import fields

COMMON_TOOLS_RETURNS = TOOLS_NS.model('Spaces', {
    "spaces": fields.List(fields.String(example="THISISCVAH"),
                          example=["THISISCVAH", "TACTICS"],
                          description="The confluence space names or an arbitrary name.")
})


class NewPasswordModel(Model):
    DTO = TOOLS_NS.model('NewPassword', {
        "root_password": fields.String(required=True, example="Password!123456",
                                       description="The new password of the Kit.")
    })

    def __init__(self, password: str):
        self.root_password = password


class NetworkDeviceStateModel(Model):
    DTO = TOOLS_NS.model('NetworkDeviceState', {
        "node": fields.String(example="sensor1.lan",
                              description="The FQDN or hostname of the node."),
        "device": fields.String(example="ens192",
                                description="The name of the network interface card (NIC)."),
        "state": fields.String(example="up",
                               description="The state the NIC is in.  It can be in an up or down state."),
        "link_up": fields.Boolean(example="True if link is up",
                                  description="The link state the NIC is in.  The value determines whether or not the interface is actually plugged in.")
    })

    def __init__(self, node: str, device: str, state: str, link_up: bool):
        self.node = node
        self.device = device
        self.state = state
        self.link_up = link_up


class NetworkInterfaceModel(Model):
    DTO = TOOLS_NS.model('NetworkInterface', {
        "name": fields.String(example="ens192",
                              description="The name of the network interface card (NIC)."),
        "state": fields.String(example="up",
                               description="The state the NIC is in.  It can be in an up or down state."),
        "link_up": fields.Boolean(example="True if iface is actually plugged in.",
                                  description="The link state the NIC is in.  The value determines whether or not the interface is actually plugged in.")
    })

    def __init__(self, device: str, state: str = None, link_up: bool = False):
        self.name = device
        self.state = state
        self.link_up = link_up


class InitialDeviceStatesModel(Model):
    DTO = TOOLS_NS.model('InitialDeviceStates', {
        "node": fields.String(example="sensor1.lan",
                              description="The FQDN or hostname of the node."),
        "interfaces": fields.List(fields.Nested(NetworkInterfaceModel.DTO))
    })

    def __init__(self, hostname: str):
        self.node = hostname
        self.interfaces = []

    def add_interface(self, item: NetworkInterfaceModel):
        self.interfaces.append(item)


class CurrentTimeModel(Model):
    DTO = TOOLS_NS.model('CurrentTimeModel', {
        "timezone": fields.String(required=True, example="UTC",
                                  description="The timezone the controller is configured to use. Defaults to UTC."),
        "datetime": fields.String(required=True, example="12-28-2020 17:18:16",
                                  description="The actual key that is stored in Redis database queue.")
    })

    def __init__(self, timezone: str, datetime: str):
        self.timezone = timezone
        self.datetime = datetime
