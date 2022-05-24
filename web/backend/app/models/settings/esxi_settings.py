"""
https://flask-restplus.readthedocs.io/en/0.9.2/example.html

"""

# imports for inventory generation
import os
from ipaddress import IPv4Address
from typing import Dict

from app.models import Model
from app.models.settings.general_settings import SETINGS_NS
from app.models.settings.settings_base import SettingsBase
from app.utils.collections import mongo_settings
from app.utils.constants import CORE_DIR, ESXI_SETTINGS_ID, TEMPLATE_DIR
from app.utils.utils import base64_to_string, string_to_base64
from flask_restx import fields
from jinja2 import Environment, FileSystemLoader, select_autoescape
from marshmallow import Schema
from marshmallow import fields as marsh_fields
from marshmallow import post_load

JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def _generate_esxi_inventory():
    esxi_settings = EsxiSettingsForm.load_from_db()  # type: EsxiSettingsForm
    esxi_settings_generator = EsxiSettingsInventoryGenerator(esxi_settings)
    esxi_settings_generator.generate()


class EsxiSettingsSchema(Schema):
    _id = marsh_fields.Str()
    ip_address = marsh_fields.IPv4(required=True)
    username = marsh_fields.Str(required=True)
    password = marsh_fields.Str(required=True)
    datastore = marsh_fields.Str(required=False, allow_none=True)
    folder = marsh_fields.Str(required=False, allow_none=True)
    datacenter = marsh_fields.Str(required=False, allow_none=True)
    portgroup = marsh_fields.Str(required=False, allow_none=True)
    cluster = marsh_fields.Str(required=False, allow_none=True)
    vcenter = marsh_fields.Bool(required=False, allow_none=True)

    @post_load
    def create_esxi(self, data: Dict, many: bool, partial: bool):
        return EsxiSettingsForm(**data)


class EsxiSettingsForm(SettingsBase):
    schema = EsxiSettingsSchema()
    DTO = SETINGS_NS.model(
        "EsxiSettingsForm",
        {
            "ip_address": fields.String(
                example="10.40.12.145",
                required=True,
                description="The IP Address of the Esxi Server.",
            ),
            "username": fields.String(
                example="root",
                required=True,
                description="The username for the esxi login.",
                default="root",
            ),
            "password": fields.String(
                required=True,
                example="mypassword1!Afoobar",
                description="The password for the esxi login.",
            ),
            "datastore": fields.String(
                required=False,
                example="datastore1",
                description="The datastore for the esxi server.",
                default="datastore1",
            ),
            "folder": fields.String(
                required=False,
                example="Folder",
                description="The folder name for the vm when using vcenter.",
                default=None,
            ),
            "vcenter": fields.Boolean(
                required=False,
                description="If True settings display VCenter block.",
                default=False,
            ),
            "datacenter": fields.String(
                required=False,
                example="Datacenter",
                description="The vcenter datacenter name.",
                default=None,
            ),
            "portgroup": fields.String(
                required=False,
                example="Internal",
                description="The domain of the kit.",
                default="Internal",
            ),
            "cluster": fields.String(
                required=False,
                example="Cluster",
                description="The vcenter cluster name.",
                default=None,
            ),
        },
    )

    def __init__(
        self,
        ip_address: IPv4Address,
        username: str,
        password: str,
        datastore: str = "datastore1",
        portgroup: str = "Internal",
        datacenter: str = None,
        folder: str = None,
        _id: str = None,
        cluster: str = None,
        vcenter: bool = False,
    ):
        self._id = _id or ESXI_SETTINGS_ID
        self.ip_address = ip_address
        self.username = username
        self.password = password
        self.datastore = datastore
        self.vcenter = vcenter
        self.folder = folder
        self.datacenter = datacenter
        self.portgroup = portgroup
        self.cluster = cluster

    @classmethod
    def load_from_db(cls, query: Dict = {"_id": ESXI_SETTINGS_ID}) -> Model:
        mongo_document = mongo_settings().find_one(query)
        if mongo_document:
            esxi_settings = cls.schema.load(mongo_document, partial=("nodes",))
            esxi_settings.password = base64_to_string(esxi_settings.password)
            return esxi_settings
        return None

    def save_to_db(self):
        """
        Saves Kit Settings to mongo database.

        :param kit_settings_form: Dictionary for the Kit Settings form
        """
        self.password = string_to_base64(self.password)

        esxi_settings = self.schema.dump(self)
        mongo_settings().find_one_and_replace(
            {"_id": ESXI_SETTINGS_ID}, esxi_settings, upsert=True
        )  # type: InsertOneResult
        self.password = base64_to_string(self.password)
        _generate_esxi_inventory()

    def to_dict(self) -> Dict:
        ret_val = super().to_dict()
        if not self.vcenter:
            ret_val["datacenter"] = "ha-datacenter"
            ret_val["folder"] = "/ha-datacenter/vm"
        return ret_val


class EsxiSettingsInventoryGenerator:
    """
    The Esxi Inventory generator class.
    """

    def __init__(self, esxi_settings):
        self._template_ctx = esxi_settings.to_dict()

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        template = JINJA_ENV.get_template("esxi.yml")
        esxi_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(CORE_DIR / "playbooks/inventory")):
            os.makedirs(str(CORE_DIR / "playbooks/inventory"))

        with open(
            str(CORE_DIR / "playbooks/inventory/esxi.yml"), "w"
        ) as kit_settings_file:
            kit_settings_file.write(esxi_template)
