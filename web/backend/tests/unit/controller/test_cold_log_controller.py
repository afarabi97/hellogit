from app.utils.exceptions import FailedToUploadFile, FailedToUploadWinLog
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.cold_log import (create_mock_cold_log,
                                             mock_filebeat_list,
                                             mock_winlogbeat_install_model,
                                             mock_winlogbeat_install_model_bad)
from tests.unit.static_data.content_types import RULE_UPLOAD_CONTENT_TYPE
from tests.unit.static_data.jobs import mock_job_id_model
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker


# Test ColdLogUploadApi


def test_post_coldlog_upload_200(client: FlaskClient, mocker: MockerFixture) -> None:
    data = create_mock_cold_log()
    mocker.patch("app.controller.cold_log_controller.post_coldlog_upload", return_value=mock_job_id_model)
    response = client.post("/api/coldlog/upload", data=data, content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_job_id_model) == True


def test_post_coldlog_upload_404_FileNotFoundError(client: FlaskClient, mocker: MockerFixture) -> None:
    data = create_mock_cold_log()
    mocker.patch("app.controller.cold_log_controller.post_coldlog_upload", side_effect=FileNotFoundError)
    response = client.post("/api/coldlog/upload", data=data, content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert response.status_code == 404
    assert response.json["error_message"]


def test_post_coldlog_upload_409_FailedToUploadFile(client: FlaskClient, mocker: MockerFixture) -> None:
    data = create_mock_cold_log()
    mocker.patch("app.controller.cold_log_controller.post_coldlog_upload", side_effect=FailedToUploadFile)
    response = client.post("/api/coldlog/upload", data=data, content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert response.status_code == 409
    assert response.json["error_message"]


def test_post_coldlog_upload_500_FailedToUploadWinLOg(client: FlaskClient, mocker: MockerFixture) -> None:
    data = create_mock_cold_log()
    mocker.patch("app.controller.cold_log_controller.post_coldlog_upload", side_effect=FailedToUploadWinLog)
    response = client.post("/api/coldlog/upload", data=data, content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert response.status_code == 500
    assert response.json["error_message"]


def test_post_coldlog_upload_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    data = create_mock_cold_log()
    mocker.patch("app.controller.cold_log_controller.post_coldlog_upload", side_effect=Exception({"error": "mocked error"}))
    response = client.post("/api/coldlog/upload", data=data, content_type=RULE_UPLOAD_CONTENT_TYPE)
    assert response.status_code == 500
    assert response.json["error_message"]


# Test ModuleInfoApi


def test_get_module_info_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.cold_log_controller.get_module_info", return_value=mock_filebeat_list)
    response = client.get("/api/coldlog/module/info")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], mock_filebeat_list[0]) == True


def test_get_module_info_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.cold_log_controller.get_module_info", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/coldlog/module/info")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test WinlogbeatConfigureApi


def test_get_winlogbeat_configure_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.cold_log_controller.get_winlogbeat_configure", return_value=mock_winlogbeat_install_model)
    response = client.get("/api/coldlog/winlogbeat/configure")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_winlogbeat_install_model) == True


def test_get_winlogbeat_configure_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.cold_log_controller.get_winlogbeat_configure", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/coldlog/winlogbeat/configure")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test WinlogbeatInstallApi


def test_post_winlogbeat_install_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.cold_log_controller.post_winlogbeat_install", return_value=mock_job_id_model)
    response = client.post("/api/coldlog/winlogbeat/install", json=mock_winlogbeat_install_model)
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_job_id_model) == True


def test_post_winlogbeat_install_400_ValidationError(client: FlaskClient) -> None:
    response = client.post("/api/coldlog/winlogbeat/install", json=mock_winlogbeat_install_model_bad)
    assert response.status_code == 400
    assert response.json["status"]
    assert response.json["messages"]


def test_post_winlogbeat_install_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.cold_log_controller.post_winlogbeat_install", side_effect=Exception({"error": "mocked error"}))
    response = client.post("/api/coldlog/winlogbeat/install", json=mock_winlogbeat_install_model)
    assert response.status_code == 500
    assert response.json["error_message"]
