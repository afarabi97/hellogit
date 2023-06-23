from app.utils.exceptions import (InternalServerError, NotFoundError,
                                  ResponseConflictError)
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.kit_token import mock_kit_tokens
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker

# Test KitTokensApi

def test_get_kit_tokens_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_tokens_controller.get_kit_tokens", return_value=mock_kit_tokens)
    response = client.get("/api/kit-token")
    assert response.status_code == 200
    assert len(response.json) == len(mock_kit_tokens)
    assert len(response.json) == 1
    assert json_object_key_value_checker(response.json[0], mock_kit_tokens[0]) == True


def test_get_kit_tokens_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_tokens_controller.get_kit_tokens", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/kit-token")
    assert response.status_code == 500
    assert response.json["error_message"]


def test_post_kit_tokens_201(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_tokens_controller.post_kit_tokens", return_value=mock_kit_tokens[0])
    response = client.post("/api/kit-token", json=mock_kit_tokens[0])
    assert response.status_code == 201
    assert json_object_key_value_checker(response.json, mock_kit_tokens[0]) == True


def test_post_kit_tokens_409_ResponseConflictError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_tokens_controller.post_kit_tokens", side_effect=ResponseConflictError)
    response = client.post("/api/kit-token", json=mock_kit_tokens[0])
    assert response.status_code == 409
    assert response.json["error_message"]


def test_post_kit_tokens_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.kit_tokens_controller.post_kit_tokens", side_effect=InternalServerError)
    response = client.post("/api/kit-token", json=mock_kit_tokens[0])
    assert response.status_code == 500
    assert response.json["error_message"]


def test_delete_kit_tokens_204(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_kit_token_id = mock_kit_tokens[0]["kit_token_id"]
    mocker.patch("app.controller.kit_tokens_controller.delete_kit_tokens", return_value=mock_kit_tokens[0])
    response = client.delete(f"/api/kit-token/{mock_kit_token_id}")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_kit_tokens[0]) == True


def test_delete_kit_tokens_404_ResponseConflictError(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_kit_token_id = mock_kit_tokens[0]["kit_token_id"]
    mocker.patch("app.controller.kit_tokens_controller.delete_kit_tokens", side_effect=NotFoundError)
    response = client.delete(f"/api/kit-token/{mock_kit_token_id}")
    assert response.status_code == 404
    assert response.json["error_message"]


def test_delete_kit_tokens__500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_kit_token_id = mock_kit_tokens[0]["kit_token_id"]
    mocker.patch("app.controller.kit_tokens_controller.delete_kit_tokens", side_effect=InternalServerError)
    response = client.delete(f"/api/kit-token/{mock_kit_token_id}")
    assert response.status_code == 500
    assert response.json["error_message"]
