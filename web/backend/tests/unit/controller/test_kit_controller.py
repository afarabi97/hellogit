from app.persistence import DBModelNotFound
from app.utils.exceptions import InternalServerError
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.jobs import mock_job_id_model
from tests.unit.static_data.kit_status import mock_kit_status
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker

# Test KitStatusCtrlApi

def test_get_new_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_controller.get_new_kit_status", return_value=mock_kit_status)
    response = client.get("/api/kit/status")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_kit_status) == True


def test_get_new_status_400_DBModelNotFound(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_controller.get_new_kit_status", side_effect=DBModelNotFound)
    response = client.get("/api/kit/status")
    assert response.status_code == 400
    assert response.json["error_message"]


def test_get_new_status_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_controller.get_new_kit_status", side_effect=InternalServerError)
    response = client.get("/api/kit/status")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test KitCtrlApi

def test_get_execute_kit_job_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_controller.get_execute_kit_job", return_value=mock_job_id_model)
    response = client.get("/api/kit/deploy")
    assert response.status_code == 200
    assert response.json["job_id"] == mock_job_id_model['job_id']


def test_get_execute_kit_job_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_controller.get_execute_kit_job", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/kit/deploy")
    assert response.status_code == 500
    assert response.json["error_message"]
