from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.associated_pods import ASSOCIATED_PODS
from tests.unit.static_data.config_map import (CONFIG_MAP_LIST,
                                               CONFIG_MAP_SAVE,
                                               CONFIG_MAP_SAVED)

# AssociatedPodsApi

def test_get_associated_pods_with_config_map_name_200(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.controller.configmap_controller.get_associated_pods", return_value=ASSOCIATED_PODS)
    response = client.get("/api/kubernetes/associated/pods/a")
    assert response.status_code == 200
    assert response.json[0] == ASSOCIATED_PODS[0]


def test_get_associated_pods_with_config_map_name_500_Exception(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.controller.configmap_controller.get_associated_pods", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/kubernetes/associated/pods/a")
    assert response.status_code == 500
    assert response.json["error_message"]


# ConfigMapsApi

def test_get_config_maps_200(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.controller.configmap_controller.get_config_maps", return_value=CONFIG_MAP_LIST)
    response = client.get("/api/kubernetes/configmaps")
    assert response.status_code == 200
    assert response.json == CONFIG_MAP_LIST


def test_get_config_maps_500_Exception(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.controller.configmap_controller.get_config_maps", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/kubernetes/configmaps")
    assert response.status_code == 500
    assert response.json["error_message"]


# ConfigMapApi

def test_put_config_map_200(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.controller.configmap_controller.put_config_map", return_value=CONFIG_MAP_SAVED)
    response = client.put("/api/kubernetes/configmap", json=CONFIG_MAP_SAVE)
    assert response.status_code == 200
    assert response.json["name"] == CONFIG_MAP_SAVED["name"]


def test_put_config_map_500_Exception(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.controller.configmap_controller.put_config_map", side_effect=Exception({"error": "mocked error"}))
    response = client.put("/api/kubernetes/configmap", json=CONFIG_MAP_SAVE)
    assert response.status_code == 500
    assert response.json["error_message"]
