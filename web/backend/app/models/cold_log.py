import json
from typing import Dict

from app.models import Model
from app.utils.collections import mongo_configurations
from app.utils.constants import WINDOWS_COLD_LOG_CONFIG_ID, ColdLogModules
from app.utils.namespaces import COLDLOG_NS
from flask_restx import fields
from marshmallow import Schema
from marshmallow import fields as marsh_fields
from werkzeug.datastructures import FileStorage, ImmutableMultiDict
from werkzeug.utils import secure_filename


class FileSetModel(Model):
    DTO = COLDLOG_NS.model('FileSetModel', {
        "value": fields.String(required=True, example="ec2", description="value for fileset"),
        "name": fields.String(required=True, example="EC2 logs", description="name for fileset"),
        "tooltip": fields.String(required=True, example="", description="tooltip that can be displayed in html"),
    })


class FilebeatModuleModel(Model):
    DTO = COLDLOG_NS.model('FilebeatModuleModel', {
        "value": fields.String(required=True, example="aws", description="value for filebeat set"),
        "name": fields.String(required=True, example="AWS", description="name for filebeat set"),
        "filesets": fields.List(fields.Nested(FileSetModel.DTO))
    })


class ColdLogUploadFormSchema(Schema):
    module = marsh_fields.Str(required=True)
    fileset = marsh_fields.Str(required=True)
    index_suffix = marsh_fields.Str(required=True)
    send_to_logstash = marsh_fields.Boolean(required=True)


class ColdLogUploadFormModel(Model):
    schema = ColdLogUploadFormSchema()
    DTO = COLDLOG_NS.model('ColdLogUploadFormModel', {
        "module": fields.String(required=True, example="system", description="Reference module for saving cold log"),
        "fileset": fields.String(required=True, example="syslog", description="Fileset for storing cold log"),
        "index_suffix": fields.String(required=True, example="cold-log", description="Suffix for storing cold log"),
        "send_to_logstash": fields.Boolean(required=True, example=False, description="Indicates if cold log file should be sent to logstash")
    })


class ColdLogUploadSchema(Schema):
    upload_file = marsh_fields.Raw(required=True, type=FileStorage)
    cold_log_form = marsh_fields.Nested(ColdLogUploadFormSchema)


class ColdLogUploadModel(Model):
    schema = ColdLogUploadSchema()
    DTO = COLDLOG_NS.model('ColdLogUploadModel', {
        "upload_file": fields.Raw(required=True, type=FileStorage),
        "cold_log_form": fields.Nested(ColdLogUploadFormModel.DTO)
    })

    def __init__(self):
        self.module = ""
        self.fileset = ""
        self.index_suffix = ""
        self.filename = ""
        self.upload_file = None  # type: FileStorage
        self.send_to_logstash = False

    def from_request(self, files: ImmutableMultiDict, form: ImmutableMultiDict):
        cold_log_form = json.loads(form['cold_log_form'], encoding="utf-8")
        if self._inputs_are_valid(cold_log_form):
            self.module = cold_log_form["module"]
            self.fileset = cold_log_form["fileset"]
            self.index_suffix = cold_log_form["index_suffix"]
            self.upload_file = files['upload_file']
            self.filename = secure_filename(self.upload_file.filename)
            self.send_to_logstash = cold_log_form["send_to_logstash"]
        else:
            raise ValueError("Invalid Cold Log Form Parameter")

    def from_dictionary(self, payload: Dict):
        if self._inputs_are_valid(payload):
            self.module = payload["module"]
            self.index_suffix = payload["index_suffix"]
            self.filename = payload['filename']
            self.fileset = payload["fileset"]
            self.send_to_logstash = payload["send_to_logstash"]
        else:
            raise ValueError("Invalid Cold Log Form Parameter")

    def is_windows(self) -> bool:
        return self.module == "windows"

    def is_linux(self) -> bool:
        return not self.is_windows()

    def has_valid_extension(self) -> bool:
        pos = self.filename.rfind('.') + 1
        return self.filename[pos:] == 'zip' or self.filename[pos:] == 'evtx' or self.filename[pos:] == 'log'

    def is_zip(self) -> bool:
        pos = self.filename.rfind('.') + 1
        return self.filename[pos:] == 'zip'

    def to_dict(self) -> Dict:
        return {
            'module': self.module,
            'index_suffix': self.index_suffix,
            'filename': self.filename,
            'send_to_logstash': self.send_to_logstash,
            'fileset': self.fileset
        }

    def _inputs_are_valid(self, inputs) -> bool:
        # guard clause for unknown fileset types
        if not ColdLogModules.is_valid_fileset_type(inputs["fileset"]):
            return False
        return True


class WinlogbeatInstallSchema(Schema):
    windows_host = marsh_fields.Str(required=True)
    winrm_port = marsh_fields.Integer(required=True)
    username = marsh_fields.Str(required=True)
    password = marsh_fields.Str(required=True)
    winrm_transport = marsh_fields.Str(required=True)
    winrm_scheme = marsh_fields.Str(required=True)


class WinlogbeatInstallModel(Model):
    schema = WinlogbeatInstallSchema()
    DTO = COLDLOG_NS.model('WinLogbeatInstallModel', {
        "windows_host": fields.String(required=True, example=""),
        "winrm_port": fields.Integer(required=True, example=0),
        "username": fields.String(required=True, example=""),
        "password": fields.String(required=True, example=""),
        "winrm_transport": fields.String(required=True, example=""),
        "winrm_scheme": fields.String(required=True, example="")
    })

    def __init__(self):
        self.windows_host = ""
        self.winrm_port = 0
        self.username = ""
        self.password = ""
        self.winrm_transport = ""
        self.winrm_scheme = ""

    def from_request(self, payload: Dict):
        self.windows_host = payload["windows_host"]
        self.winrm_port = payload["winrm_port"]
        self.username = payload["username"]
        self.password = payload["password"]
        self.winrm_transport = payload["winrm_transport"]
        self.winrm_scheme = payload["winrm_scheme"]

    def save_to_mongo(self):
        self.password = self.b64encode_string(self.password)
        payload = self.to_dict()
        payload["_id"] = WINDOWS_COLD_LOG_CONFIG_ID
        mongo_configurations().find_one_and_replace({"_id": WINDOWS_COLD_LOG_CONFIG_ID},
                                                    payload,
                                                    upsert=True)

    def is_configured(self) -> bool:
        ret_val = mongo_configurations().find_one(
            {"_id": WINDOWS_COLD_LOG_CONFIG_ID})
        return ret_val != None

    def initalize_from_mongo(self):
        ret_val = mongo_configurations().find_one(
            {"_id": WINDOWS_COLD_LOG_CONFIG_ID})
        if ret_val:
            self.windows_host = ret_val["windows_host"]
            self.winrm_port = ret_val["winrm_port"]
            self.username = ret_val["username"]
            self.password = self.b64decode_string(ret_val["password"])
            self.winrm_transport = ret_val["winrm_transport"]
            self.winrm_scheme = ret_val["winrm_scheme"]
        else:
            raise ValueError("The {} configuration was not created or does not exist.".format(
                WINDOWS_COLD_LOG_CONFIG_ID))
