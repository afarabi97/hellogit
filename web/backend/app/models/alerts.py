from typing import Dict

from app.models import Model
from app.utils.constants import HIVE_ID
from app.utils.collections import mongo_hive_settings
from flask_restx import Namespace, fields
from marshmallow import Schema, ValidationError
from marshmallow import fields as marsh_fields
from marshmallow import post_load, validates

ALERTS_NS = Namespace("alerts",
                    description="Alerts related operations that allow operators to display or Acknowledge or Escalate alert events that come in.")

HIVE_NS = Namespace("hive", description="Hive related webhook operations.")

class AlertsModel(Model):
    DTO = ALERTS_NS.model('AlertModel', {
        "count": fields.String(example="200",
                             description="Number of alerts in this group."),
        "event.category": fields.String(example="network",
                             description="The cataegory of the event."),
        "event.kind": fields.String(example="alert",
                             description="The kind of event such as alert or signal"),
        "rule.name": fields.String(example="ET CHAT IRC USER command",
                             description="The rule name either from suricata or detections."),
        "additionalGroupByFields": fields.String(
                                     description="Additional Group By Fields")
    })


class HiveForm(Model):
    DTO = ALERTS_NS.model('HiveFormModel', {
        "event_title": fields.String(example="Unknown_protocol",
                                     description="The title of the Hive case."),
        "event_tags": fields.String(example="test1,test2",
                                    description="Tags to be assigned to Hive case."),
        "event_severity": fields.String(example="2",
                                        description="Severity of the Event can be 1 2 or 3."),
        "event_description": fields.String(description="A description of the Alerts being escalated."),
    })


class AlertFormModel(Model):
    DTO = ALERTS_NS.model('AlertFormModel', {
    "acknowledged": fields.Boolean(example=False,
                                   description="Search attribute for returning acknowledged alerts."),
    "escalated": fields.Boolean(example=False,
                                description="Search attribute for returning escalated alerts."),
    "showClosed": fields.Boolean(example=False,
                                 description="When set to true, will display only closed Alerts."),
    "timeInterval": fields.String(example="hours",
                                  description="Time selection interval such as days, hours, minutes."),
    "timeAmount": fields.String(example="24",
                             description="Time amount such as 24"),
    "performEscalation": fields.Boolean(example=False,
                             description="Perform escalation to hive."),
    "hiveForm": fields.Nested(HiveForm.DTO)
    })


class UpdateAlertsModel(Model):
    DTO = ALERTS_NS.model('UpdateAlertModel', {
        "count": fields.String(example="200",
                               description="Number of alerts in this group."),
        "event.module": fields.String(example="network",
                                      description="The module of the event."),
        "event.kind": fields.String(example="alert",
                                    description="The kind of event such as alert or signal"),
        "rule.name": fields.String(example="ET CHAT IRC USER command",
                                  description="The rule name either from suricata or detections."),
        "form": fields.Nested(AlertFormModel.DTO)
    })

class HiveSchema(Schema):
    _id = marsh_fields.Str()
    admin_api_key = marsh_fields.Str(required=True)
    org_admin_api_key = marsh_fields.Str(required=True)

    @post_load
    def create_HiveSettingsModel(self, data: Dict, many: bool, partial: bool):
        return HiveSettingsModel(**data)

    @validates("admin_api_key")
    def validate_admin_hive_api_key(self, value: str):
        if len(value) != 32:
            raise ValidationError("The admin API key you passed in does not match the appropriate string size of 32.")

    @validates("org_admin_api_key")
    def validate_org_admin_hive_api_key(self, value: str):
        if len(value) != 32:
            raise ValidationError("The org_admin API key you passed in does not match the appropriate string size of 32.")


class HiveSettingsModel(Model):
    schema = HiveSchema()
    DTO = HIVE_NS.model('HiveSettings', {
        "admin_api_key": fields.String(required=True,
                                       example="JFBuZo0AMSy3a8hCdvUIYHhgJLXsZ/2s",
                                       description="The API key needed in order to create Hive cases."),
        "org_admin_api_key": fields.String(required=True,
                                           example="JFBuZo0AMSy3a8hCdvUIYHhgJLXsZ/2s",
                                           description="The API key needed in order to create Hive cases.")
    })

    def __init__(self, admin_api_key: str, org_admin_api_key: str, _id: str=HIVE_ID):
        if admin_api_key:
            self.admin_api_key = admin_api_key
        else:
            self.admin_api_key = ""

        if org_admin_api_key:
            self.org_admin_api_key = org_admin_api_key
        else:
            self.org_admin_api_key = ""

        self._id = _id

    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_kit = cls.schema.load(payload) # type: HiveSettingsModel
        return new_kit

    def save_to_db(self):
        serialized = self.schema.dump(self)
        mongo_hive_settings().find_one_and_replace({"_id": HIVE_ID}, serialized, upsert=True)

    @classmethod
    def load_from_db(cls) -> Model:
        ret_val = mongo_hive_settings().find_one({"_id": HIVE_ID})
        if ret_val:
            return cls.schema.load(ret_val)

        return HiveSettingsModel("", "")
