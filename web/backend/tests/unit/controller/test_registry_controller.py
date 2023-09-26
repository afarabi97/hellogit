from app.utils.exceptions import InternalServerError
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.docker_registry import mock_docker_images
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker

# Test DockerRegistryCtrlApi

def test_get_docker_registry_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.registry_controller.get_docker_registry", return_value=mock_docker_images[0])
    response = client.get("api/kubernetes/docker/registry")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_docker_images[0]) == True


def test_get_docker_registry_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.registry_controller.get_docker_registry", side_effect=InternalServerError)
    response = client.get("api/kubernetes/docker/registry")
    assert response.status_code == 500
    assert response.json["error_message"]
