from urllib import response
from app.utils.namespaces import TOKEN_NS
from pytest_mock.plugin import MockerFixture
from flask.testing import FlaskClient


def test_get_kit_tokens_post(client: FlaskClient, mocker: MockerFixture):
    # Use mocker patching to mock the kit token API test calls
    mocker.patch("app.controller.kit_tokens_controller")
    # Create a request to create a fake kit token from the kit token API
    create_token = client.post("/api/token", json={"ipaddress": "127.0.0.1", "kit_token_id": "test"})
    assert create_token.status_code == 201

    # Create a request to retrieve the kit token created from the previous call
    get_tokens = client.get("api/token")
    assert get_tokens.status_code == 200

    # Create a request to delete the kit token created for testting the kit token controller API
    delete_token = client.delete("/api/token/{}".format(create_token.json["kit_token_id"]))
    assert delete_token.status_code == 204