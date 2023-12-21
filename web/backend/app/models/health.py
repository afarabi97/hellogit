from app.models import Model
from app.utils.namespaces import APP_NS, HEALTH_NS
from flask_restx import fields
from marshmallow import Schema
from marshmallow import fields as marsh_fields


class ValueMemorySchema(Schema):
    total: marsh_fields.Integer(required=True)
    available: marsh_fields.Integer(required=True)
    percent: marsh_fields.Float(required=True)
    used: marsh_fields.Integer(required=True)
    free: marsh_fields.Integer(required=True)
    active: marsh_fields.Integer(required=True)
    inactive: marsh_fields.Integer(required=True)
    buffers: marsh_fields.Integer(required=True)
    cached: marsh_fields.Integer(required=True)
    shared: marsh_fields.Integer(required=True)
    slab: marsh_fields.Integer(required=True)

class ValueMemoryModel(Model):
    schema = ValueMemorySchema()
    DTO = HEALTH_NS.model('ValueMemoryModel', {
        "total": fields.Integer(required=True, example=33422110720),
        "available": fields.Integer(required=True, example=22150635520),
        "percent": fields.Float(required=True, example=33.7),
        "used": fields.Integer(required=True, example=10768224256),
        "free": fields.Integer(required=True, example=18404401152),
        "active": fields.Integer(required=True, example=756977664),
        "inactive": fields.Integer(required=True, example=13281722368),
        "buffers": fields.Integer(required=True, example=3235840),
        "cached": fields.Integer(required=True, example=4246249472),
        "shared": fields.Integer(required=True, example=24104960),
        "slab": fields.Integer(required=True, example=655589376)
    })

    def __init__(self, total: int, available: int, percent: float, used: int, free: int, active: int, inactive: int, buffers: int, cached: int, shared: int, slab: int):
        self.DTO["total"] = total
        self.DTO["available"] = available
        self.DTO["percent"] = percent
        self.DTO["used"] = used
        self.DTO["free"] = free
        self.DTO["active"] = active
        self.DTO["inactive"] = inactive
        self.DTO["buffers"] = buffers
        self.DTO["cached"] = cached
        self.DTO["shared"] = shared
        self.DTO["slab"] = slab

class MetricsMemorySchema(Schema):
    name = marsh_fields.Str(required=True)
    value = marsh_fields.Nested(ValueMemorySchema)
    type = marsh_fields.Str(required=True)
    hostname = marsh_fields.Str(required=True)

class MetricsMemoryModel(Model):
    schema = MetricsMemorySchema()
    DTO = HEALTH_NS.model('MetricsMemoryModel', {
        "name": fields.String(required=True, example="memory"),
        "value": fields.Nested(ValueMemoryModel.DTO),
        "type": fields.String(required=True, example="psutil"),
        "hostname": fields.String(required=True, example="some-server2.lan")
    })

    def __init__(self, name: str, value: ValueMemoryModel, type: str, hostname: str):
        self.DTO["name"] = name
        self.DTO["value"] = value
        self.DTO["type"] = type
        self.DTO["hostname"] = hostname

class ValueSchema(Schema):
    total: marsh_fields.Integer(required=True)
    percent: marsh_fields.Float(required=True)
    used: marsh_fields.Integer(required=True)
    free: marsh_fields.Integer(required=True)

class ValueModel(Model):
    schema = ValueMemorySchema()
    DTO = HEALTH_NS.model('MemoryModel', {
        "total": fields.Integer(required=True, example=33422110720),
        "percent": fields.Float(required=True, example=32.9),
        "used": fields.Integer(required=True, example=10768224256),
        "free": fields.Integer(required=True, example=18404401152)
    })

    def __init__(self, total: int, percent: float, used: int, free: int):
        self.DTO["total"] = total
        self.DTO["percent"] = percent
        self.DTO["used"] = used
        self.DTO["free"] = free

class MetricsRootUsageSchema(Schema):
    name = marsh_fields.Str(required=True)
    value = marsh_fields.Nested(ValueSchema)
    type = marsh_fields.Str(required=True)
    hostname = marsh_fields.Str(required=True)
    disk_pressure_warning = marsh_fields.Bool(required=True)

class MetricsRootUsageModel(Model):
    schema = MetricsRootUsageSchema()
    DTO = HEALTH_NS.model('MetricsRootUsageModel', {
        "name": fields.String(required=True, example="root_usage"),
        "value": fields.Nested(ValueModel.DTO),
        "type": fields.String(required=True, example="psutil"),
        "hostname": fields.String(required=True, example="some-server2.lan"),
        "disk_pressure_warning": fields.Boolean(required=False),
        "disk_pressure_critical": fields.Boolean(required=False)
    })

    def __init__(self, name: str, value: ValueModel, type: str, hostname: str, disk_pressure_warning: bool, disk_pressure_critical: bool):
        self.DTO["name"] = name
        self.DTO["value"] = value
        self.DTO["type"] = type
        self.DTO["hostname"] = hostname
        self.DTO["disk_pressure_warning"] = disk_pressure_warning
        self.DTO["disk_pressure_critical"] = disk_pressure_critical

class MetricsDataUsageSchema(Schema):
    name = marsh_fields.Str(required=True)
    value = marsh_fields.Nested(ValueSchema)
    type = marsh_fields.Str(required=True)
    hostname = marsh_fields.Str(required=True)
    disk_pressure_warning = marsh_fields.Bool(required=True)

class MetricsDataUsageModel(Model):
    schema = MetricsDataUsageSchema()
    DTO = HEALTH_NS.model('MetricsDataUsageModel', {
        "name": fields.String(required=True, example="data_usage"),
        "value": fields.Nested(ValueModel.DTO),
        "type": fields.String(required=True, example="psutil"),
        "hostname": fields.String(required=True, example="some-server2.lan"),
        "disk_pressure_warning": fields.Boolean(required=False),
        "disk_pressure_critical": fields.Boolean(required=False)
    })

    def __init__(self, name: str, value: ValueModel, type: str, hostname: str, disk_pressure_warning: bool, disk_pressure_critical: bool):
        self.DTO["name"] = name
        self.DTO["value"] = value
        self.DTO["type"] = type
        self.DTO["hostname"] = hostname
        self.DTO["disk_pressure_warning"] = disk_pressure_warning
        self.DTO["disk_pressure_critical"] = disk_pressure_critical

class MetricsCPUPercentSchema(Schema):
    name = marsh_fields.Str(required=True)
    value = marsh_fields.Float(required=True)
    type = marsh_fields.Str(required=True)
    hostname = marsh_fields.Str(required=True)

class MetricsCPUPercentModel(Model):
    schema = MetricsCPUPercentSchema()
    DTO = HEALTH_NS.model('MetricsCPUPercentModel', {
        "name": fields.String(required=True, example="cpu_percentage"),
        "value": fields.Float(required=True, example=3.9),
        "type": fields.String(required=True, example="psutil"),
        "hostname": fields.String(required=True, example="some-server2.lan")
    })

    def __init__(self, name: str, value: float, type: str, hostname: str):
        self.DTO["name"] = name
        self.DTO["value"] = value
        self.DTO["type"] = type
        self.DTO["hostname"] = hostname


class DatastoreModel(Model):
    DTO = HEALTH_NS.model('DatastoreModel', {
        'capacity': fields.Integer(),
        'datastore': fields.String(),
        'free_space': fields.Integer(),
        'name': fields.String(),
        'type': fields.String()
    })

class PacketsModel(Model):
    DTO = APP_NS.model('PacketsModel',{
        'app': fields.String(),
        'node_name': fields.String(),
        "packets_received": fields.Integer(),
        "packets_dropped": fields.Integer()
    })

