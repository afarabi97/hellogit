from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture


def test_get_version(client: FlaskClient, mocker: MockerFixture) -> None:
    version = "3.7.0"
    build_date = "june 09, 2022"
    commit_hash = "48d1ce15"
    mocker.patch("app.controller.version_controller.get_version", return_value=version)
    mocker.patch("app.controller.version_controller.get_build_date", return_value=build_date)
    mocker.patch("app.controller.version_controller.get_commit_hash", return_value=commit_hash)
    response = client.get("/api/version/information")
    assert response.status_code == 200
    assert response.json["version"] == version

def test_get_version_500(client: FlaskClient, mocker: MockerFixture) -> None:
    build_date = "june 09, 2022"
    commit_hash = "48d1ce15"
    mocker.patch("app.controller.version_controller.get_version", side_effect=Exception('mocked error'))
    mocker.patch("app.controller.version_controller.get_build_date", return_value=build_date)
    mocker.patch("app.controller.version_controller.get_commit_hash", return_value=commit_hash)
    response = client.get("/api/version/information")
    assert response.status_code == 500
    assert response.json["error_message"]
