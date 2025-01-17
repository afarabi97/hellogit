from typing import Dict

from app.models import Model
from app.utils.constants import RULE_TYPES, RULESET_STATES
from app.utils.namespaces import POLICY_NS
from flask_restx import fields


class SimpleSensor(Model):
    DTO = POLICY_NS.model('SimpleSensor', {
        'hostname': fields.String(example="navarro2-sensor1.lan", required=True),
        'mac': fields.String(example="00:0a:29:06:eb:12", required=True),
        'management_ip': fields.String(example="10.40.12.67", required=True)
    })

    def __init__(self):
        pass


class SensorState(Model):
    DTO = POLICY_NS.model('SensorState', {
        'hostname': fields.String(example="navarro2-sensor1.lan", required=True),
        'state': fields.String(example="Created", description="The state the ruleset synced sensor is in. Can be one of {}".format(str(RULESET_STATES)))
    })

    def __init__(self):
        pass


class RuleSetModel(Model):
    DTO = POLICY_NS.model('RuleSet', {
        '_id': fields.Integer(example=67811),
        'appType': fields.String(example="Suricata", required=True,
                                 description="The type of RuleSet.  Currently only {} supported.".format(str(RULE_TYPES))),
        'name': fields.String(example="Emerging Threats", required=True, description="The name of the Rule Set."),
        'clearance': fields.String(example="Unclassified", required=True, description="The classification of the Rule Set."),
        'sensors': fields.List(fields.Nested(SimpleSensor.DTO), description="The sensor that will be assigned the RuleSet on next Rule Sync."),
        'state': fields.String(example="Created", description="The state the ruleset is in. Can be one of {}".format(str(RULESET_STATES))),
        'sensor_states': fields.List(fields.Nested(SensorState.DTO), description="The state of synced sensors for given ruleset."),
        'isEnabled': fields.Boolean(default=True, description="Determines whether or not the RuleSet will be Synced. It is set to True initally when a RuleSet is created."),
        'createdDate': fields.String(example="2020-12-15 23:20:08", description="The datetime the RuleSet was created."),
        'lastModifiedDate': fields.String(example="2020-12-15 23:20:08", description="The datetime the RuleSet was last modified.")
    })

    def __init__(self):
        pass


"""
{"rulesetID":67820,"ruleToAdd":
{"ruleName":"Test","rule":"test","isEnabled":true,"_id":"","byPassValidation":true}}
"""


class RuleModel(Model):
    DTO = POLICY_NS.model('Rule', {
        '_id': fields.Integer(example=3421),
        'ruleName': fields.String(example="emerging-mobile_malware.rules", required=True,
                                  description="The name of the rule."),
        'isEnabled': fields.Boolean(default=True, description="Determines whether or not the Rule will be Synced.  It is set to True initally when a Rule is created."),
        'rule_set_id': fields.Integer(example=3421, description="The ruleset this rule belongs to."),
        'createdDate': fields.String(example="2020-12-15 23:20:08", description="The datetime the Rule was created."),
        'lastModifiedDate': fields.String(example="2020-12-15 23:20:08", description="The datetime the Rule was last modified."),
        'byPassValidation': fields.Boolean(default=False, description="If set to true, the rule will save even on validation errors."),
        "rule": fields.String(description="Stores the Suricata rules or Zeek scripts based on the RuleSet type.  \
                                           The /api/rule/<rule_id>/content is the only call that loads this into \
                                           the rules definition because some rules can be up to MB in size.")
    })

    def __init__(self):
        pass


class TestAgainstPcap(Model):
    DTO = POLICY_NS.model('TestAgainstPcap', {
        'pcap_name': fields.String(required=True,
                                   description="The name of the PCAP to test against."),
        'rule_content': fields.String(description="The rule or rules you wish to test."),
        'ruleType': fields.String(example="Suricata", description="Must be {}".format(str(RULE_TYPES))),
    })


class PCAPReplayModel(Model):
    DTO = POLICY_NS.model('PCAPReplay', {
        'pcap': fields.String(example="2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap", description="The name of the PCAP as saved on disk."),
        'sensor_ip': fields.String(example="10.40.12.67", description="The IP Address of the sensor we wish to replay our PCAP against."),
        'sensor_hostname': fields.String(example="sensor3.flash", description="The FQDN of the sensor we wish to replay our PCAP against."),
        'ifaces': fields.List(fields.String(description="The network interface to replay the traffic against.")),
        'preserve_timestamp': fields.Boolean(description="If set to true it will preserve the replayed PCAPs timestamp data.")
    })

    def __init__(self, payload: Dict):
        self.pcap = payload['pcap']
        self.sensor_ip = payload['sensor_ip']
        self.preserve_timestamp = payload['preserve_timestamp']
        self.ifaces = payload['ifaces']
        self.sensor_hostname = payload['sensor_hostname']
