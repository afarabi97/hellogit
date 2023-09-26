from app.utils.exceptions import NoSuchLogArchiveError, NoSuchLogError
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.jobs import mock_job_id_model
from tests.unit.static_data.success_message import mock_success_message
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker


# Test DiagnosticsCtrlApi

def test_post_diagnostics_200_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.diagnostics_controller.post_diagnostics", return_value=mock_job_id_model)
    response = client.post("/api/diagnostics")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_job_id_model) == True


def test_post_diagnostics_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.diagnostics_controller.post_diagnostics", side_effect=Exception({"error": "mocked error"}))
    response = client.post("/api/diagnostics")
    assert response.status_code == 500
    assert response.json["error_message"]


def test_get_download_diagnostics_200_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.diagnostics_controller.get_diagnostics", return_value=mock_success_message)
    response = client.get(f"/api/diagnostics/download/{mock_job_id_model['job_id']}")
    assert response.status_code == 200
    assert response.json["success_message"] == mock_success_message["success_message"]


def test_get_download_diagnostics_404_NoSuchLogError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.diagnostics_controller.get_diagnostics", side_effect=NoSuchLogError(f"Couldn't find the log for {mock_job_id_model['job_id']}."))
    response = client.get(f"/api/diagnostics/download/{mock_job_id_model['job_id']}")
    assert response.status_code == 404
    assert response.json["error_message"]


def test_get_download_archive_diagnostics_404_NoSuchLogARchiveError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.diagnostics_controller.get_diagnostics", side_effect=NoSuchLogArchiveError(f"Couldn't find the archive for {mock_job_id_model['job_id']}."))
    response = client.get(f"/api/diagnostics/download/{mock_job_id_model['job_id']}")
    assert response.status_code == 404
    assert response.json["error_message"]


def test_get_download_diagnostics_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.diagnostics_controller.get_diagnostics", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f"/api/diagnostics/download/{mock_job_id_model['job_id']}")
    assert response.status_code == 500
    assert response.json["error_message"]
