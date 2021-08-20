"""
https://flask-restplus.readthedocs.io/en/0.9.2/example.html

"""
import re
import uuid

from app import api, conn_mng, TEMPLATE_DIR, CORE_DIR, MIP_DIR
from app.models import Model, DBModelNotFound, PostValidationError
from app.models.settings.settings_base import SettingsBase, validate_password_stigs
from app.models.settings.general_settings import GeneralSettingsForm
from ipaddress import IPv4Address, ip_network
from flask_restx import fields
from flask_restx.fields import Nested

from marshmallow import Schema, post_load, pre_load, validate, validates, ValidationError
from marshmallow import fields as marsh_fields
from pymongo import ReturnDocument
from pymongo.results import InsertOneResult
from app.utils.constants import (KIT_ID, GENERAL_SETTINGS_ID, KIT_SETTINGS_ID, ESXI_SETTINGS_ID, MIP_SETTINGS_ID,
                                 JOB_CREATE, JOB_PROVISION, JOB_DEPLOY, NODE_TYPES)
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


def _generate_mip_settings_inventory():
    mip_settings = MipSettingsForm.load_from_db() # type: MipSettingsForm
    mip_config_generator = MIPSettingsInventoryGenerator(mip_settings.to_dict())
    mip_config_generator.generate()


class MipSettingsSchema(Schema):
    _id = marsh_fields.Str()
    operator_type = marsh_fields.Str(required=True)
    password = marsh_fields.Str(required=True)
    user_password = marsh_fields.Str(required=True)
    luks_password = marsh_fields.Str(required=True)

    @post_load
    def create_kickstart(self, data: Dict, many: bool, partial: bool):
        return MipSettingsForm(**data)

    @validates("password")
    def validate_password(self, value: str):
        validate_password_stigs(value)

    @validates("user_password")
    def validate_password(self, value: str):
        validate_password_stigs(value)

    @validates("luks_password")
    def validate_password(self, value: str):
        validate_password_stigs(value)


class MipSettingsForm(SettingsBase):
    schema = MipSettingsSchema()
    DTO = api.model('MipSettingsForm', {
        'password': fields.String(required=True, example="mypassword1!Afoobar", description="The root and ssh password for all the MIPs in the kit."),
        'user_password': fields.String(required=True, example="mypassword1!Afoobar", description="The user and ssh password for all the MIPs in the kit."),
        'luks_password': fields.String(required=True, example="mypassword1!Afoobar", description="The drive encryption password for all the MIPs in the kit."),
        'operator_type': fields.String(required= True, description="Either CPT or MDT")
    })

    def __init__(self, password: str,
                 user_password: str,
                 luks_password: str,
                 operator_type: str, _id: str=None):
        self._id = _id or MIP_SETTINGS_ID
        self.password = password
        self.user_password = user_password
        self.luks_password = luks_password
        self.operator_type = operator_type

    @classmethod
    def load_combined_from_db(cls, query: Dict={"_id": MIP_SETTINGS_ID}) -> dict:
        mongo_document = conn_mng.mongo_settings.find_one(query)
        if mongo_document:
            mip_settings = cls.schema.load(mongo_document, partial=("nodes",))
            mip_settings.password = decode_password(mip_settings.password)
            mip_settings.user_password = decode_password(mip_settings.user_password)
            mip_settings.luks_password = decode_password(mip_settings.luks_password)
            general_dict = GeneralSettingsForm.load_from_db().to_dict()
            mip_dict = cls.schema.dump(mip_settings)
            general_dict.update(mip_dict)
            return general_dict

        raise DBModelNotFound("MIP Settings has not been saved yet.")

    @classmethod
    def load_from_db(cls, query: Dict={"_id": MIP_SETTINGS_ID}) -> Model:
        mongo_document = conn_mng.mongo_settings.find_one(query)
        if mongo_document:
            mip_settings = cls.schema.load(mongo_document, partial=("nodes",))
            mip_settings.password = decode_password(mip_settings.password)
            mip_settings.user_password = decode_password(mip_settings.user_password)
            mip_settings.luks_password = decode_password(mip_settings.luks_password)
            return mip_settings
        return None

    def save_to_db(self, delete_kit: bool=False, delete_add_node_wizard: bool=False):
        self.password = encode_password(self.password)
        self.user_password = encode_password(self.user_password)
        self.luks_password = encode_password(self.luks_password)
        mip_settings = self.schema.dump(self)
        conn_mng.mongo_settings.find_one_and_replace({"_id": MIP_SETTINGS_ID},
                                                      mip_settings,
                                                      upsert=True)  # type: InsertOneResult
        #self.password = decode_password(self.password)
        #self.user_password = decode_password(self.user_password)
        #self.luks_password = decode_password(self.luks_password)
        _generate_mip_settings_inventory()


class MIPSettingsInventoryGenerator:
    def __init__(self, mip_settings: dict):
        self._template_ctx = mip_settings

    def generate(self) -> None:
        template = JINJA_ENV.get_template('mip_settings.yml')

        inventory = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(MIP_DIR / 'inventory')):
            os.makedirs(str(MIP_DIR / 'inventory'))

        with open(str(MIP_DIR / 'inventory/mip_settings.yml'), "w") as inventory_file:
            inventory_file.write(inventory)
