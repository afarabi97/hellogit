from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.health_dashboard import (
    mock_healthdashboard_status, mock_hostname, mock_kibanainfo)
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker

# Test HealthDashboardStatusApi

def test_get_health_dashboard_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_health_dashboard_status", return_value=mock_healthdashboard_status)
    response = client.get("api/health/dashboard/status")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_healthdashboard_status) == True


def test_get_health_dashboard_status_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_health_dashboard_status", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/health/dashboard/status")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RemoteHealthDashboardStatusApi

def test_get_remote_health_dashboard_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_remote_health_dashboard_status", return_value=mock_healthdashboard_status)
    response = client.get("api/health/remote/dashboard/status")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_healthdashboard_status) == True


def test_get_remote_health_dashboard_status_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_remote_health_dashboard_status", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/health/remote/dashboard/status")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test HostnameApi

def test_get_hostname_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_hostname", return_value=mock_hostname)
    response = client.get("api/health/hostname")
    assert response.status_code == 200


def test_get_hostname_status_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_hostname", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/health/hostname")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test KibanaLoginInfoApi

def test_get_kibana_login_info_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_kibana_login_info", return_value=mock_kibanainfo)
    response = client.get("api/app/kibana/info")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_kibanainfo) == True


def test_get_kibana_login_info_status_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_dashboard_controller.get_kibana_login_info", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/app/kibana/info")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RemoteKibanaLoginInfoApi

def test_get_remote_kibana_login_info_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    kibana_ip = "10.40.20.64"
    mocker.patch("app.controller.health_dashboard_controller.get_remote_kibana_login_info", return_value=mock_kibanainfo)
    response = client.get(f"api/app/kibana/info/remote/{kibana_ip}")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_kibanainfo) == True


def test_get_remote_kibana_login_info_status_500(client: FlaskClient, mocker: MockerFixture) -> None:
    kibana_ip = "10.40.20.64"
    mocker.patch("app.controller.health_dashboard_controller.get_remote_kibana_login_info", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f"api/app/kibana/info/remote/{kibana_ip}")
    assert response.status_code == 500
    assert response.json["error_message"]
