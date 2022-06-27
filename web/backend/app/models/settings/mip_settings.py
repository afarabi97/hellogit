"""
https://flask-restplus.readthedocs.io/en/0.9.2/example.html

"""
# imports for inventory generation
import os
from typing import Dict

from app.models import DBModelNotFound, Model
from app.models.settings.general_settings import GeneralSettingsForm
from app.models.settings.settings_base import (SettingsBase,
                                               validate_password_stigs)
from app.utils.collections import mongo_settings
from app.utils.constants import MIP_DIR, MIP_SETTINGS_ID, TEMPLATE_DIR
from app.utils.namespaces import SETINGS_NS
from app.utils.utils import base64_to_string, string_to_base64
from flask_restx import fields
from jinja2 import Environment, FileSystemLoader, select_autoescape
from marshmallow import Schema
from marshmallow import fields as marsh_fields
from marshmallow import post_load, validates

JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


def _generate_mip_settings_inventory():
    mip_settings = MipSettingsForm.load_from_db()  # type: MipSettingsForm
    mip_config_generator = MIPSettingsInventoryGenerator(
        mip_settings.to_dict())
    mip_config_generator.generate()


class MipSettingsSchema(Schema):
    _id = marsh_fields.Str()
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
    def validate_user_password(self, value: str):
        validate_password_stigs(value)

    @validates("luks_password")
    def validate_luks_password(self, value: str):
        validate_password_stigs(value)


class MipSettingsForm(SettingsBase):
    schema = MipSettingsSchema()
    DTO = SETINGS_NS.model('MipSettingsForm', {
        'password': fields.String(required=True, example="mypassword1!Afoobar", description="The root and ssh password for all the MIPs in the kit."),
        'user_password': fields.String(required=True, example="mypassword1!Afoobar", description="The user and ssh password for all the MIPs in the kit."),
        'luks_password': fields.String(required=True, example="mypassword1!Afoobar", description="The drive encryption password for all the MIPs in the kit.")
    })

    def __init__(self, password: str,
                 user_password: str,
                 luks_password: str,
                 _id: str = None):
        self._id = _id or MIP_SETTINGS_ID
        self.password = password
        self.user_password = user_password
        self.luks_password = luks_password

    @classmethod
    def load_combined_from_db(cls, query: Dict = {"_id": MIP_SETTINGS_ID}) -> dict:
        mongo_document = mongo_settings().find_one(query)
        if mongo_document:
            mip_settings = cls.schema.load(mongo_document, partial=("nodes",))
            mip_settings.password = base64_to_string(mip_settings.password)
            mip_settings.user_password = base64_to_string(
                mip_settings.user_password)
            mip_settings.luks_password = base64_to_string(
                mip_settings.luks_password)
            general_dict = GeneralSettingsForm.load_from_db().to_dict()
            mip_dict = cls.schema.dump(mip_settings)
            general_dict.update(mip_dict)
            return general_dict

        raise DBModelNotFound("MIP Settings has not been saved yet.")

    @classmethod
    def load_from_db(cls, query: Dict = {"_id": MIP_SETTINGS_ID}) -> Model:
        mongo_document = mongo_settings().find_one(query)
        if mongo_document:
            mip_settings = cls.schema.load(mongo_document, partial=("nodes",))
            mip_settings.password = base64_to_string(mip_settings.password)
            mip_settings.user_password = base64_to_string(
                mip_settings.user_password)
            mip_settings.luks_password = base64_to_string(
                mip_settings.luks_password)
            return mip_settings
        return None

    def save_to_db(self):
        self.password = string_to_base64(self.password)
        self.user_password = string_to_base64(self.user_password)
        self.luks_password = string_to_base64(self.luks_password)
        mip_settings = self.schema.dump(self)
        mongo_settings().find_one_and_replace({"_id": MIP_SETTINGS_ID},
                                              mip_settings,
                                              upsert=True)  # type: InsertOneResult
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
