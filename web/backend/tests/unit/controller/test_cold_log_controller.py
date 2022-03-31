import json
import os

RULE_UPLOAD_CONTENT_TYPE = "multipart/form-data"

class MyTestJob:
    def __init__(self, id, key):
        self.id = id
        self.key = key.encode("UTF-8")

    def get_id(self):
        return self.id

    def delay():
        pass

def test_upload_route(tmp_path, client, mocker):
    upload_file_name = "test_upload.log"
    test_file = os.path.join(tmp_path, upload_file_name)
    with open(test_file, "wb") as f:
        f.write(b"1234")

    job = MyTestJob("fbbd7123-4926-4a84-a8ea-7c926e38edab", "fbbd7123-4926-4a84-a8ea-7c926e38edab")
    mocker.patch("app.service.cold_log_service.process_cold_logs.delay", return_value=job)

    # Here we test a valid cold log upload
    payload = {
        "upload_file": (open(test_file, "rb"),
                        upload_file_name),
        "cold_log_form": json.dumps(
            {
                "module": "apache",
                "fileset": "access",
                "index_suffix": "cold-log",
                "send_to_logstash": "false"
            }
        )
    }
    results = client.post("/api/coldlog/upload", data=payload,
                          content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert results.status_code == 200

    # Here we test a cold log upload without a file being chosen
    payload = {
        "cold_log_form": json.dumps(
            {
                "module": "apache",
                "fileset": "access",
                "index_suffix": "cold-log",
                "send_to_logstash": "false"
            }
        )
    }
    results = client.post("/api/coldlog/upload", data=payload,
                          content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert results.status_code == 400

    # Here we test a cold log upload without Winlogbeat being setup
    payload = {
        "upload_file": (open(test_file, "rb"),
                        upload_file_name),
        "cold_log_form": json.dumps(
            {
                "module": "windows",
                "fileset": "access",
                "index_suffix": "cold-log",
                "send_to_logstash": "false"
            }
        )
    }
    results = client.post("/api/coldlog/upload", data=payload,
                          content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert results.status_code == 500

    # TODO: Need to add WinLogbeat setup to test for 200 with windows log


def test_module_info_route(client):
    results = client.get("/api/coldlog/module/info")
    assert results.status_code == 200
    assert results.get_json() != "{}"


def test_winlogbeat_configure_route(client):
    results = client.get("/api/coldlog/winlogbeat/configure")
    assert results.status_code == 200
    assert results.get_json() != "{}"


def test_winlogbeat_install_route(client, mocker):
    payload = {
        "windows_host": "testhost",
        "winrm_port": "8888",
        "username": "test",
        "password": "password",
        "winrm_transport": "tcp",
        "winrm_scheme": "none"
    }
    job = MyTestJob("fbbd7123-4926-4a84-a8ea-7c926e38edab", "fbbd7123-4926-4a84-a8ea-7c926e38edab")
    mocker.patch("app.service.cold_log_service.install_winlogbeat_srv.delay", return_value=job)
    results = client.post("/api/coldlog/winlogbeat/install", json=payload)
    assert results.status_code == 200
    assert results.get_json() != ""
