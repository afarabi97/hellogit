from app.models import Model
from typing import Dict, List, Optional
from flask_restx import fields
from marshmallow import Schema
from marshmallow import fields as marsh_fields
from app.utils.namespaces import POLICY_NS
from app.utils.constants import DATE_FORMAT_STR
import uuid

class PcapFileNotProvidedError(Exception):
    pass

class PcapFileInvalidError(Exception):
    pass

class Hashes(Model):
    DTO = POLICY_NS.model('Hashes', {
        'md5': fields.String(example="1234567890abcdef", required=True),
        'sha1': fields.String(example="1234567890abcdef", required=True),
        'sha256': fields.String(example="1234567890abcdef", required=True)
    })

    def __init__(self, md5: str, sha1: str, sha256: str):
        self.md5 = md5
        self.sha1 = sha1
        self.sha256 = sha256

class PcapSchema(Schema):
    _id = marsh_fields.Str()
    created_date = marsh_fields.DateTime(required=True, format=DATE_FORMAT_STR)
    first_packet_date = marsh_fields.DateTime(required=True, format=DATE_FORMAT_STR)
    sha256 = marsh_fields.Str(required=True)
    last_packet_date = marsh_fields.DateTime(required=True, format=DATE_FORMAT_STR)
    name = marsh_fields.Str(required=True)
    path = marsh_fields.Str(required=False)
    size = marsh_fields.Integer(required=True)

class PcapModel(Model):
    schema = PcapSchema()
    DTO = POLICY_NS.model('PcapModel', {
        '_id': fields.String(example="1234567890abcdef", required=True),
        'created_date': fields.String(example="2020-12-15 23:20:08", required=True),
        'first_packet_date': fields.String(example="2020-12-15 23:20:08", required=True),
        'sha256': fields.String(example="1234567890abcdef", required=True),
        'last_packet_date': fields.String(example="2020-12-15 23:20:08", required=True),
        'name': fields.String(example="test.pcap", required=True),
        'path': fields.String(example="/var/www/html/pcaps/test.pcap", required=False),
        'size': fields.Integer(example=1024, required=True)
    })

    def __init__(self, name: str, size: int, sha256: str, created_date: str, first_packet_date: str, last_packet_date: str, path: str, _id: Optional[str] = None):
        self._id = self._id = _id or uuid.uuid4().hex
        self.name = name
        self.size = size
        self.path = path
        self.sha256 = sha256
        self.created_date = created_date
        self.first_packet_date = first_packet_date
        self.last_packet_date = last_packet_date
        self.path = path

class ReplayPCAPModel(Model):
    DTO = POLICY_NS.model('PCAPReplay', {
        'pcap': fields.String(example="2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap", description="The name of the PCAP as saved on disk."),
        'sensor_ip': fields.String(example="10.40.12.67", description="The IP Address of the sensor we wish to replay our PCAP against."),
        'sensor_hostname': fields.String(example="sensor3.flash", description="The FQDN of the sensor we wish to replay our PCAP against."),
        'ifaces': fields.List(fields.String(description="The network interface to replay the traffic against.")),
        'preserve_timestamp': fields.Boolean(description="If set to true it will preserve the replayed PCAPs timestamp data.")
    })
    def __init__(self, data: Dict):
        self.pcap = data['pcap']
        self.sensor_ip = data['sensor_ip']
        self.preserve_timestamp = data['preserve_timestamp']
        self.ifaces = data['ifaces']
        self.sensor_hostname = data['sensor_hostname']

class ReplaySensorModel(Model):
    def __init__(self, hostname: str, ip: str, interfaces: List[str], apps: List[str], username: str, password: str):
        self.hostname = hostname
        self.name = hostname.split(".")[0] if len(hostname.split(".")) > 1 else hostname
        self.ip = ip
        self.interfaces = interfaces
        self.apps = apps
        self.username = username
        self._password = password if super().is_b64(password) else super().b64encode_string(password)

    @property
    def password(self):
        return super().b64decode_string(self._password)
