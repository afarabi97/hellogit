from app import api
from app.models import Model
from app.models.kit_setup import Node
from flask_restplus import fields
from flask_restplus.fields import Nested


class AlertsModel(Model):
    DTO = api.model('AlertModel', {
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
    DTO = api.model('HiveFormModel', {
        "event_title": fields.String(example="Unknown_protocol",
                                     description="The title of the Hive case."),
        "event_tags": fields.String(example="test1,test2",
                                    description="Tags to be assigned to Hive case."),
        "event_severity": fields.String(example="2",
                                        description="Severity of the Event can be 1 2 or 3."),
        "event_description": fields.String(description="A description of the Alerts being escalated."),
    })


class AlertFormModel(Model):
    DTO = api.model('AlertFormModel', {
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
    DTO = api.model('UpdateAlertModel', {
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

