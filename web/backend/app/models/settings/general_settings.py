"""
https://flask-restplus.readthedocs.io/en/0.9.2/example.html

"""
import os
import re
from ipaddress import IPv4Address
from typing import Dict

from app.models import Model
from app.models.settings.settings_base import SettingsBase
from app.utils.collections import mongo_settings
from app.utils.constants import CORE_DIR, GENERAL_SETTINGS_ID, TEMPLATE_DIR
from app.utils.namespaces import SETINGS_NS
from flask_restx import fields
from jinja2 import Environment, FileSystemLoader, select_autoescape
from marshmallow import Schema, ValidationError
from marshmallow import fields as marsh_fields
from marshmallow import post_load, validates

JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


def _generate_general_settings_inventory():
    settings = GeneralSettingsForm.load_from_db()  # type: GeneralSettingsForm
    config_generator = GeneralSettingsInventoryGenerator(settings.to_dict())
    config_generator.generate()


class GeneralSettingsSchema(Schema):
    _id = marsh_fields.Str()
    controller_interface = marsh_fields.IPv4(required=True)
    netmask = marsh_fields.IPv4(required=True)
    gateway = marsh_fields.IPv4(required=True)
    domain = marsh_fields.Str(required=True)
    dhcp_range = marsh_fields.IPv4(required=True)
    job_id = marsh_fields.Str()
    job_completed = marsh_fields.Bool(required=False, allow_none=True)

    @post_load
    def create_kickstart(self, data: Dict, many: bool, partial: bool):
        return GeneralSettingsForm(**data)

    @validates("domain")
    def validate_domain(self, value: str):
        pattern = "^[a-z]([a-z0-9-]){2,39}$"
        if not re.match(pattern, value):
            raise ValidationError("Domain must be alphanumeric and less than 41 characters. "
                                  "Special characters are not allowed with the exception of dashes (IE -).")


class GeneralSettingsForm(SettingsBase):
    schema = GeneralSettingsSchema()
    DTO = SETINGS_NS.model('GeneralSettingsForm', {
        'controller_interface': fields.String(example="10.40.12.145", required=True, description="The IP Address of the controller's management interface."),
        'netmask': fields.String(required=True, example="255.255.255.0", description="The netmask of the systems' network.", default="255.255.255.0"),
        'gateway': fields.String(required=True, example="10.40.12.1", description="The internal gateway IP Address for Kickstart."),
        'domain': fields.String(required=True, example="lan", description="The domain of the system."),
        'dhcp_range': fields.String(required=True, example="10.40.12.153", description="The dhcp_range that is used for the kickstart process."),
        'job_id': fields.String(required=False, description="The latest job that ran for general settings."),
        'job_completed': fields.Boolean(required=False, description="If general settings job completed"),
    })

    def __init__(self, controller_interface: IPv4Address,
                 netmask: IPv4Address, gateway: IPv4Address,
                 domain: str,  dhcp_range: IPv4Address,
                 job_completed: bool = False,
                 _id: str = None, job_id: str = ''):
        self._id = _id or GENERAL_SETTINGS_ID
        self.controller_interface = controller_interface
        self.netmask = netmask
        self.gateway = gateway
        self.domain = domain
        self.dhcp_range = dhcp_range
        self.job_id = job_id
        self.job_completed = job_completed

    @classmethod
    def load_from_db(cls, query: Dict = {"_id": GENERAL_SETTINGS_ID}) -> Model:
        mongo_document = mongo_settings().find_one(query)
        if mongo_document:
            general_settings = cls.schema.load(
                mongo_document, partial=("nodes",))
            return general_settings
        return None

    def save_to_db(self):
        """
        Saves General Settings to mongo database.

        :param general_settings_form: Dictionary for the Kit Settings form
        """
        general_settings = self.schema.dump(self)
        mongo_settings().find_one_and_replace({"_id": GENERAL_SETTINGS_ID},
                                              general_settings,
                                              upsert=True)  # type: InsertOneResult
        _generate_general_settings_inventory()


class GeneralSettingsInventoryGenerator:
    def __init__(self, mip_settings: dict):
        self._template_ctx = mip_settings

    def _set_dhcp_range(self):
        self._template_ctx['dhcp_start'] = self._template_ctx['dhcp_range']
        pos = self._template_ctx['dhcp_range'].rfind('.') + 1
        last_octet = int(self._template_ctx['dhcp_range'][pos:]) + 15
        end_ip = self._template_ctx['dhcp_range'][0:pos] + str(last_octet)
        self._template_ctx['dhcp_end'] = end_ip

    def generate(self) -> None:
        self._set_dhcp_range()
        template = JINJA_ENV.get_template('settings.yml')

        inventory = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(CORE_DIR / 'playbooks/inventory')):
            os.makedirs(str(CORE_DIR / 'playbooks/inventory'))

        with open(str(CORE_DIR / 'playbooks/inventory/settings.yml'), "w") as inventory_file:
            inventory_file.write(inventory)
