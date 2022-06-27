import json
from typing import Dict

from app.models import Model
from app.utils.collections import mongo_configurations
from app.utils.constants import WINDOWS_COLD_LOG_CONFIG_ID
from werkzeug.datastructures import FileStorage, ImmutableMultiDict
from werkzeug.utils import secure_filename


class ColdLogUploadModel(Model):

    def __init__(self):
        self.system_type = ""
        self.module = ""
        self.fileset = ""
        self.index_suffix = ""
        self.filename = ""
        self.upload_file = None  # type: FileStorage
        self.send_to_logstash = False

    def from_request(self,
                     payload: ImmutableMultiDict,
                     form: ImmutableMultiDict):
        cold_log_form = json.loads(form['cold_log_form'], encoding="utf-8")
        self.module = cold_log_form["module"]
        self.fileset = cold_log_form["fileset"]
        self.index_suffix = cold_log_form["index_suffix"]
        self.upload_file = payload['upload_file']
        self.filename = secure_filename(self.upload_file.filename)
        self.send_to_logstash = cold_log_form["send_to_logstash"]

    def from_dictionary(self, payload: Dict):
        self.module = payload["module"]
        self.index_suffix = payload["index_suffix"]
        self.filename = payload['filename']
        self.fileset = payload["fileset"]
        self.send_to_logstash = payload["send_to_logstash"]

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


class WinlogbeatInstallModel(Model):

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
