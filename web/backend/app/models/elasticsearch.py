from app.models import Model
from app.utils.namespaces import APP_NS
from flask_restx import fields


class ElasticSearchRejectModel(Model):
    DTO = APP_NS.model('MetricsDataUsageModel', {
        "node_name": fields.String(required=True, example="tfplenum-es-data-1"),
        "name": fields.String(required=True, example="write"),
        "active": fields.String(required=True, example="0"),
        "queue": fields.String(required=True, example="0"),
        "rejected": fields.String(required=True, example="0")
    })

    def __init__(self, node_name: str, name: str, active: str, queue: str, rejected: str):
        self.DTO["node_name"] = node_name
        self.DTO["name"] = name
        self.DTO["active"] = active
        self.DTO["queue"] = queue
        self.DTO["rejected"] = rejected
