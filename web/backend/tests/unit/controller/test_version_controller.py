from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture


# Test VersionCtrlApi

def test_get_version_information(client: FlaskClient, mocker: MockerFixture) -> None:
    version_information = {"version": "3.7.0", "build_date": "June 09, 2022", "commit_hash": "48d1ce15"}
    mocker.patch("app.controller.version_controller.get_version_information", return_value=version_information)
    response = client.get("/api/version/information")
    assert response.status_code == 200
    assert response.json["version"] == version_information["version"]
    assert response.json["build_date"] == version_information["build_date"]
    assert response.json["commit_hash"] == version_information["commit_hash"]

def test_get_version_information_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.version_controller.get_version_information", side_effect=Exception('mocked error'))
    response = client.get("/api/version/information")
    assert response.status_code == 500
    assert response.json["error_message"]
