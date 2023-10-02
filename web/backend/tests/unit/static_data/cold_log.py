import json
import os
from typing import List

from app.models.cold_log import FilebeatModuleModel, WinlogbeatInstallModel
from werkzeug.datastructures import FileStorage, ImmutableMultiDict


def create_mock_cold_log() -> ImmutableMultiDict:
    upload_file_name = "test_upload.log"
    tmp_path = "./"
    test_file = os.path.join(tmp_path, upload_file_name)
    file_loc = open(test_file, "wb")
    file_loc.write(b"1234")
    file_storage = FileStorage(upload_file_name, file_loc, "application/octet-stream")
    file_loc.close()
    form_date = {
        "module": "system",
        "fileset": "syslog",
        "index_suffix": "cold-log",
        "send_to_logstash": False
    }
    return {
        "upload_file": file_storage,
        "cold_log_form": json.dumps(form_date)
    }


mock_filebeat_list: List[FilebeatModuleModel] = [
    {
        "value": "auditd",
        "name": "Auditd",
        "filesets": [
            {
                "value": "log",
                "name": "Auditd logs",
                "tooltip": ""
            }
        ]
    }
]


mock_winlogbeat_install_model: WinlogbeatInstallModel = {
    "windows_host": "testhost",
    "winrm_port": 8888,
    "username": "test",
    "password": "password",
    "winrm_transport": "tcp",
    "winrm_scheme": "none"
}

mock_winlogbeat_install_model_bad: WinlogbeatInstallModel = {
    "windows_host": None,
    "winrm_port": 8888,
    "username": "test",
    "password": "password",
    "winrm_transport": "tcp",
    "winrm_scheme": "none"
}
