from app.models import DBModelNotFound
from app.utils.exceptions import InternalServerError
from app.utils.namespaces import PORTAL_NS
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.portal_link import (mock_portal_link_list,
                                                mock_portal_user_links)
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker

# Test PortalLinksCtrlApi

def test_get_portal_link_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.portal_controller.get_portal_links", return_value=mock_portal_link_list)
    response = client.get("/api/portal/links")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_portal_link_list) == True


def test_get_portal_link_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.portal_controller.get_portal_links", side_effect=InternalServerError)
    response = client.get("/api/portal/links")
    assert response.status_code == 500


# Test UserLinksCtrlApi

def test_get_user_links_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.portal_controller.get_user_links", return_value=mock_portal_user_links[0])
    response = client.get("/api/portal/user/links")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_portal_user_links[0]) == True


def test_get_user_links_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.portal_controller.get_user_links", side_effect=InternalServerError)
    response = client.get("/api/portal/user/links")
    assert response.status_code == 500


def test_post_user_links_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.portal_controller.post_user_links", return_value=mock_portal_user_links[0])
    response = client.post("/api/portal/user/links", json=mock_portal_user_links[0])
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_portal_user_links[0]) == True


def test_post_user_links_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.portal_controller.post_user_links", side_effect=InternalServerError)
    response = client.post("/api/portal/user/links", json=mock_portal_user_links[0])
    assert response.status_code == 500


# Test DelUserLinksCtrlApi

def test_delete_user_links_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_portal_id = mock_portal_user_links[0]['_id']
    mocker.patch("app.controller.portal_controller.delete_user_links", return_value=mock_portal_user_links[0])
    response = client.delete(f"/api/portal/user/links/{mock_portal_id}")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, mock_portal_user_links[0]) == True


def test_delete_user_links_400(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_portal_id = mock_portal_user_links[0]['_id']
    mocker.patch("app.controller.portal_controller.delete_user_links", side_effect=DBModelNotFound)
    response = client.delete(f"/api/portal/user/links/{mock_portal_id}")
    assert response.status_code == 400


def test_delete_user_links_500_InternalServerError(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_portal_id = mock_portal_user_links[0]["_id"]
    mocker.patch("app.controller.portal_controller.delete_user_links", side_effect=InternalServerError)
    response = client.delete(f"/api/portal/user/links/{mock_portal_id}")
    assert response.status_code == 500
