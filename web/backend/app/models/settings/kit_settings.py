"""
https://flask-restplus.readthedocs.io/en/0.9.2/example.html

"""
import re
import uuid

from app import api, conn_mng, TEMPLATE_DIR
from app.models import Model, DBModelNotFound, PostValidationError
from app.models.settings.settings_base import SettingsBase, validate_password_stigs
from app.models.settings.general_settings import GeneralSettingsForm
from app.models.nodes import _generate_inventory
from ipaddress import IPv4Address, ip_network
from flask_restx import fields
from flask_restx.fields import Nested

from marshmallow import Schema, post_load, pre_load, validate, validates, ValidationError
from marshmallow import fields as marsh_fields
from pymongo import ReturnDocument
from pymongo.results import InsertOneResult
from app.utils.constants import (KIT_SETTINGS_ID, CORE_DIR)
from app.utils.utils import encode_password, decode_password
from typing import List, Dict

# imports for inventory generation
import os
from jinja2 import Environment, select_autoescape, FileSystemLoader
from app.calculations import (get_sensors_from_list, get_servers_from_list, server_and_sensor_count)
from app.models.nodes import Node
from app.resources import NodeResourcePool

JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)

def _generate_kit_settings_inventory():
    kit_settings = KitSettingsForm.load_from_db() # type: KitSettingsForm
    kit_settings_generator = KitSettingsInventoryGenerator(kit_settings.to_dict())
    kit_settings_generator.generate()

class KitSettingsSchema(Schema):
    _id = marsh_fields.Str()
    kubernetes_services_cidr = marsh_fields.IPv4(required=True)
    password = marsh_fields.Str(required=True)
    upstream_dns = marsh_fields.IPv4(required=False, allow_none=True)
    upstream_ntp = marsh_fields.IPv4(required=False, allow_none=True)
    is_gip = marsh_fields.Bool()
    job_id = marsh_fields.Str()
    job_completed = marsh_fields.Bool(required=False, allow_none=True)

    @post_load
    def create_kickstart(self, data: Dict, many: bool, partial: bool):
        return KitSettingsForm(**data)

    @validates("password")
    def validate_password(self, value: str):
        validate_password_stigs(value)


class KitSettingsForm(SettingsBase):
    schema = KitSettingsSchema()
    DTO = api.model('KitSettingsForm', {
        'kubernetes_services_cidr': fields.String(example="10.40.12.64", required=True,
                                                  description="The /27 IP Address block that will be used. EX: 10.40.12.64 - 95"),
        'password': fields.String(required=True, example="mypassword1!Afoobar", description="The root and ssh password for all the nodes in the kit."),
        'upstream_dns': fields.String(required=False, example="10.10.101.11",
                                        description="This is the upstream DNS server that the controller uses for additional DNS lookups that are not on Kit."),
        'upstream_ntp': fields.String(required=False, example="10.10.101.11",
                                        description="This is the upstream NTP server where the controller will get its time from."),
        'is_gip': fields.Boolean(required=True, example=True,
                                        description="Setting determines whether kit type is GIP."),
        'job_id': fields.String(required=False, description="The latest job that ran for Kit settings."),
        'job_completed': fields.Boolean(required=False, description="If kit settings job completed"),
    })

    def __init__(self, kubernetes_services_cidr: IPv4Address, password: str,
                 job_completed: bool=False,
                 upstream_dns: IPv4Address=IPv4Address("0.0.0.0"),
                 upstream_ntp: IPv4Address=IPv4Address("0.0.0.0"),
                 is_gip: bool=False, _id: str=None, job_id: str=''):
        self._id = _id or KIT_SETTINGS_ID
        self.kubernetes_services_cidr = kubernetes_services_cidr
        self.password = password
        self.upstream_dns = upstream_dns
        self.upstream_ntp = upstream_ntp
        self.is_gip = is_gip
        self.job_id = job_id
        self.job_completed = job_completed

    @classmethod
    def load_combined_from_db(cls, query: Dict={"_id": KIT_SETTINGS_ID}) -> dict:
        mongo_document = conn_mng.mongo_settings.find_one(query)
        if mongo_document:
            kit_settings = cls.schema.load(mongo_document)
            kit_settings.password = decode_password(kit_settings.password)
            general_dict = GeneralSettingsForm.load_from_db().to_dict()
            kit_dict = cls.schema.dump(kit_settings)
            general_dict.update(kit_dict)
            return general_dict

        raise DBModelNotFound("Kit Settings has not been saved yet.")

    @classmethod
    def load_from_db(cls, query: Dict={"_id": KIT_SETTINGS_ID}) -> Model:
        mongo_document = conn_mng.mongo_settings.find_one(query)
        if mongo_document:
            kit_settings = cls.schema.load(mongo_document)
            kit_settings.password = decode_password(kit_settings.password)
            return kit_settings
        return None

    def save_to_db(self, delete_kit: bool=False, delete_add_node_wizard: bool=False):
        """
        Saves Kit Settings to mongo database.

        :param kit_settings_form: Dictionary for the Kit Settings form
        """
        self.password = encode_password(self.password)

        kit_settings = self.schema.dump(self)
        conn_mng.mongo_settings.find_one_and_replace({"_id": KIT_SETTINGS_ID},
                                                      kit_settings,
                                                      upsert=True)  # type: InsertOneResult
        self.password = decode_password(self.password)
        _generate_kit_settings_inventory()
        #if delete_kit:
        #    DIPKitForm.delete_from_db()

        #if delete_add_node_wizard:
        #    AddNodeWizard.delete_from_db()
        _generate_inventory()

class KitSettingsInventoryGenerator:
    """
    The KickstartInventory generator class.
    """

    def __init__(self, kit_settings):
        self._template_ctx = kit_settings


    def _set_kubernetes_cidr(self):
        cidr = ip_network("{}/27".format(self._template_ctx['kubernetes_services_cidr']))
        self._template_ctx['kubernetes_svc_first_ip'] = cidr[0]
        self._template_ctx['kubernetes_svc_last_ip'] = cidr[-1]

    # def _set_raid(self):
    #     for node in self._template_ctx["nodes"]:
    #         if node['os_raid']:
    #             node['boot_drives'] = ""
    #             node['data_drives'] = ""
    #         if not node['os_raid']:
    #             node['raid_drives'] = []

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._set_kubernetes_cidr()
        #self._set_raid()
        template = JINJA_ENV.get_template('kit_settings.yml')
        kickstart_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(CORE_DIR / 'playbooks/inventory')):
            os.makedirs(str(CORE_DIR / 'playbooks/inventory'))

        with open(str(CORE_DIR / 'playbooks/inventory/kit_settings.yml'), "w") as kit_settings_file:
            kit_settings_file.write(kickstart_template)
