from pytest_mock.plugin import MockerFixture
from flask.testing import FlaskClient
from tests.unit.mock_classes import MockElasticsearch, MockMinIOManager
from app.models.settings.minio_settings import RepoSettingsModel


def test_curator_indices_get(client: FlaskClient, mocker: MockerFixture):
    response = client.get("/api/curator/indices/open")
    assert response.status_code == 500
    assert "error_message" in response.json

    mocker.patch("app.controller.curator_controller.ElasticWrapper", return_value=MockElasticsearch())
    mocker.patch("app.controller.curator_controller.check_read_only_allow_delete", return_value=False)
    response = client.get("/api/curator/indices/open")
    assert response.status_code == 200

    # Even though there is 10 in the sample 4 are discluded because of the exclusion filter.
    assert len(response.json) == 46

    response = client.get("/api/curator/indices/close")
    assert response.status_code == 200
    assert len(response.json) == 3

    response = client.get("/api/curator/indices/blah")
    assert response.status_code == 400
    assert "error_message" in response.json


def test_minio_check(client: FlaskClient, mocker: MockerFixture):
    response = client.get("/api/curator/minio_check")
    assert response.status_code == 500
    assert "error_message" in response.json

    mock_model = RepoSettingsModel("assessor", "password", "10.40.12.20", 9001, "http", "tfplenum")

    mocker.patch("app.controller.curator_controller.wait_for_elastic_cluster_ready", return_value=None)
    mocker.patch("app.controller.curator_controller.RepoSettingsModel.load_from_kubernetes_and_elasticsearch", return_value=mock_model)
    mocker.patch("app.controller.curator_controller.MinIOManager", side_effect=MockMinIOManager)

    response = client.get("/api/curator/minio_check")
    assert response.status_code == 200
    assert "success_message" in response.json


def test_curator_process(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.controller.curator_controller.execute_curator.delay", return_value=None)
    expected_invalid_value = {'error_message': 'Invalid value for action'}
    payload = {"action": "foobar", "index_list": []}
    response = client.post("/api/curator/process", json=payload)
    assert response.status_code == 400
    assert response.json == expected_invalid_value

    payload = {"action": None, "index_list": None}
    response = client.post("/api/curator/process", json=payload)
    assert response.status_code == 400
    assert response.json == expected_invalid_value

    payload = {"action": "DeleteIndices", "index_list": []}
    response = client.post("/api/curator/process", json=payload)
    assert response.status_code == 400
    assert response.json == {'error_message': 'Index list is empty'}

    payload = {"action": "CloseIndices", "index_list": None}
    response = client.post("/api/curator/process", json=payload)
    assert response.status_code == 400
    assert response.json == {'error_message': 'Index required'}

    payload = {"action": "CloseIndices", "index_list": ["foobar"]}
    response = client.post("/api/curator/process", json=payload)
    assert response.status_code == 200
    assert response.json == {'success_message': 'Curator job submitted check notifications for progress.'}
