from ipaddress import IPv4Address

from app.models import Model
from flask_restx import Namespace, fields

TOOLS_NS = Namespace("tools", description="Tools page related operations.")

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

class RepoSettingsModel(Model):
    DTO = TOOLS_NS.model('RepoSettings', {
        "access_key": fields.String(example="user",
                              description="Repo username"),
        "bucket": fields.String(example="s3-bucket",
                              description="S3 bucket name."),
        "endpoint": fields.String(example="10.10.10.10",
                              description="Repo IP Address."),
        "protocol": fields.String(example="http",
                              description="Web protocol http or https."),
        "secret_key": fields.String(example="password",
                              description="Repo password.")
    })

    def __init__(self, access_key: str, bucket: str, endpoint: IPv4Address, protocol: str, secret_key: str):
        self.access_key = access_key
        self.bucket = bucket
        self.endpoint = endpoint
        self.protocol = protocol
        self.secret_key = secret_key
