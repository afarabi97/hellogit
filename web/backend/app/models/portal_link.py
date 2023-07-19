from app.models import Model
from app.utils.namespaces import PORTAL_NS
from flask_restx import fields


class PortalLinkModel(Model):
    DTO = PORTAL_NS.model('PortalLinkModel', {
        "dns": fields.String(required=True, example="https://x.x.x.x"),
        "ip": fields.String(required=True, example="https://url.lan"),
        "logins": fields.String(required=True, example="name/123abc456def")
    })

    def __init__(self, dns: str, ip: str, logins: str):
        self.dns = dns
        self.ip = ip
        self.logins = logins
