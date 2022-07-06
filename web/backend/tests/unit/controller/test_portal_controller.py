from urllib import response

from mongomock import ObjectId
from app.utils.namespaces import PORTAL_NS
from pytest_mock.plugin import MockerFixture
from flask.testing import FlaskClient

def test_get_kit_portal_links(client: FlaskClient, mocker: MockerFixture):
    # Send a request to get kit generated portal links
    get_links = client.get("/api/portal/links")
    assert get_links.status_code == 200
    
    # Send a request to get user generated portal links
    get_user_links = client.get("/api/portal/user/links")
    assert get_user_links.status_code == 200

    # Send a request to add a new link
    add_link = client.post("/api/portal/user/links", json={"name": "test", "url": "http://test.com", "description": "test"})
    assert add_link.status_code == 200

    # Send a request to delete the user generated a portal link
    delete_link = client.delete("/api/portal/user/links/" + str(ObjectId()))
    assert delete_link.status_code == 200