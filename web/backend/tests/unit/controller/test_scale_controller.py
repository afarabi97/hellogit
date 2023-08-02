from app.utils.exceptions import ObjectKeyError
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.scale import (mock_elastic_scale_advanced_config,
                                          mock_elastic_scale_check,
                                          mock_elastic_scale_node_in,
                                          mock_elastic_scale_node_out)
from tests.unit.static_data.success_message import success_message
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker

# Test ScaleCheckCtrlApi

def test_get_elastic_scale_check_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.get_elastic_scale_check", return_value=mock_elastic_scale_check)
    response = client.get("/api/scale/check")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_elastic_scale_check) == True


def test_get_elastic_scale_check_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.get_elastic_scale_check", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/scale/check")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test ScaleElasticCtrlApi

def test_post_elastic_scale_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.post_elastic_scale", return_value=success_message)
    response = client.post("/api/scale/elastic", json=mock_elastic_scale_node_in)
    assert response.status_code == 200
    assert response.json["success_message"] == success_message["success_message"]


def test_post_elastic_scale_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.post_elastic_scale", side_effect=Exception({"error": "mocked error"}))
    response = client.post("/api/scale/elastic", json=mock_elastic_scale_node_in)
    assert response.status_code == 500
    assert response.json["error_message"]


# # Test ScaleAdvancedCtrlApi

def test_get_elastic_scale_advanced_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.get_elastic_scale_advanced", return_value=mock_elastic_scale_advanced_config)
    response = client.get("/api/scale/elastic/advanced")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_elastic_scale_advanced_config) == True


def test_get_elastic_scale_advanced_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.get_elastic_scale_advanced", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/scale/elastic/advanced")
    assert response.status_code == 500
    assert response.json["error_message"]


def test_post_elastic_scale_advanced_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.post_elastic_scale_advanced", return_value=success_message)
    response = client.post("/api/scale/elastic/advanced", json=mock_elastic_scale_advanced_config)
    assert response.status_code == 200
    assert response.json["success_message"] == success_message["success_message"]


def test_post_elastic_scale_advanced_406_ObjectKeyError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.post_elastic_scale_advanced", side_effect=ObjectKeyError)
    response = client.post("/api/scale/elastic/advanced", json=mock_elastic_scale_advanced_config)
    assert response.status_code == 406
    assert response.json["error_message"]


def test_post_elastic_scale_advanced_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.post_elastic_scale_advanced", side_effect=Exception({"error": "mocked error"}))
    response = client.post("/api/scale/elastic/advanced", json=mock_elastic_scale_advanced_config)
    assert response.status_code == 500
    assert response.json["error_message"]


# # Test ElasticNodeCountCtrlApi

def test_get_elastic_scale_nodes_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.get_elastic_scale_nodes", return_value=mock_elastic_scale_node_out)
    response = client.get("/api/scale/elastic/nodes")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_elastic_scale_node_out) == True


def test_get_elastic_scale_nodes_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.scale_controller.get_elastic_scale_nodes", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/scale/elastic/nodes")
    assert response.status_code == 500
    assert response.json["error_message"]
