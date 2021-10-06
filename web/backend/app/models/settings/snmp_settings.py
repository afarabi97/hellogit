import base64
import os
import socket
from typing import Dict, Optional

from app.models import DBModelNotFound, Model
from app.models.nodes import KIT_SETUP_NS
from app.utils.constants import CORE_DIR, SNMP_SETTINGS_ID, TEMPLATE_DIR
from app.utils.db_mngs import conn_mng
from flask_restx import fields
from jinja2 import Environment, FileSystemLoader, select_autoescape
from marshmallow import Schema
from marshmallow import fields as marsh_fields
from marshmallow import post_load, pre_dump

JINJA_ENV = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)), autoescape=select_autoescape(["html", "xml"]))

class SNMPSettingsSchema(Schema):
    security_name = marsh_fields.Str(required=True)
    auth_pass = marsh_fields.Str(required=True)
    priv_pass = marsh_fields.Str(required=True)

    @post_load
    def decode_fields(self, data, **kwargs):
        data["auth_pass"] = base64.b64decode(data["auth_pass"]).decode("utf-8")
        data["priv_pass"] = base64.b64decode(data["priv_pass"]).decode("utf-8")
        return data

    @pre_dump
    def encode_fields(self, data, **kwargs):
        data["auth_pass"] = base64.b64encode(data["auth_pass"].encode('utf-8')).decode("utf-8")
        data["priv_pass"] = base64.b64encode(data["priv_pass"].encode('utf-8')).decode("utf-8")
        return data


class SNMPSettingsForm(Model):
    schema = SNMPSettingsSchema()

    DTO = KIT_SETUP_NS.model("SNMPSettingsForm", {
        "security_name": fields.String(required=True, example="1qaz2wsx!QAZ@WSX", description="SNMPv3 security name or user name"),
        "auth_pass": fields.String(required=True, example="opennmsuser", description="SNMPv3 authentication passphrase or password."),
        "priv_pass": fields.String(required=True, example="1qaz2wsx!QAZ@WSX", description="SNMPv3 encryption password.")
    })

    def __init__(self, security_name: str, auth_pass: str, priv_pass: str):
        self.security_name = security_name
        self.auth_pass = auth_pass
        self.priv_pass = priv_pass

    @classmethod
    def load_from_db(cls) -> Optional["SNMPSettingsForm"]:
        document = conn_mng.mongo_settings.find_one({"_id": SNMP_SETTINGS_ID}, {"_id": False})

        if document:
            return cls(**cls.schema.load(document))

        raise DBModelNotFound("SNMP settings have not been saved yet.")

    @classmethod
    def load_from_request(cls, payload: Dict) -> "SNMPSettingsForm":
        return cls(**cls.schema.load(payload))

    def save_to_db(self):
        conn_mng.mongo_settings.find_one_and_replace({"_id": SNMP_SETTINGS_ID}, self.schema.dump(self.to_dict()), upsert=True)
        SNMPSettingsInventoryGenerator(self).generate()


class SNMPSettingsInventoryGenerator:
    def __init__(self, settings):
        self._template_ctx = settings.to_dict()
        self._template_ctx["x"] = socket.gethostbyname(socket.gethostname()).split('.')[1]
        with open("/root/myfile", "w") as myfile:
            myfile.write(str(self._template_ctx))

    def generate(self) -> None:
        template = JINJA_ENV.get_template('snmp.yml')
        inventory = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(CORE_DIR / 'playbooks/inventory')):
            os.makedirs(str(CORE_DIR / 'playbooks/inventory'))

        with open(str(CORE_DIR / 'playbooks/inventory/snmp.yml'), "w") as snmp_inventory_file:
            snmp_inventory_file.write(inventory)
