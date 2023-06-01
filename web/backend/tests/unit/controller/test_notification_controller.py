from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.success_message import success_message
from tests.unit.static_data.notifications import notifications
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker


# Test NotificationsCtrlApi

def test_get_notifications(client: FlaskClient, mocker: MockerFixture) -> None:
    get_notifications = notifications
    mocker.patch("app.controller.notification_controller.get_notifications", return_value=get_notifications)
    response = client.get("api/notifications/{offset}/{role}")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, get_notifications) == True

def test_get_notifications_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.notification_controller.get_notifications", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/notifications/{offset}/{role}")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test NotificationsDelCtrlApi

def test_delete_notifications_del_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.notification_controller.delete_notifications_del", return_value= success_message)
    response = client.delete("/api/notifications")
    assert response.status_code == 200
    assert response.json["success_message"] == success_message["success_message"]

def test_delete_notifications_del_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.notification_controller.delete_notifications_del", side_effect=Exception({"error": "mocked error"}))
    response = client.delete("/api/notifications")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test DeleteNotificationsCtrlApi

def test_delete_notifciation_id_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.notification_controller.delete_notification_id", return_value= success_message)
    response = client.delete("/api/notifications/{notification_id}")
    assert response.status_code == 200
    assert response.json["success_message"] == success_message["success_message"]

def test_delete_notifciation_id_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.notification_controller.delete_notification_id", side_effect=Exception({"error": "mocked error"}))
    response = client.delete("/api/notifications/{notification_id}")
    assert response.status_code == 500
    assert response.json["error_message"]