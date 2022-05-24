from pytest_mock.plugin import MockerFixture
from flask.testing import FlaskClient
from tests.unit.mock_classes import (MockMinIOManager,
                                     MockJobID2,
                                     MockElasticsearch,
                                     mock_get_kubernetes_secret)


def test_minio_repository_settings_post(client: FlaskClient,
                                        mocker: MockerFixture):
    minio_payload = {
        "username": "assessor",
        "password": "password",
        "ip_address": "10.40.12.20",
        "port": 9001,
        "protocol": "http",
        "bucket": "tfplenum"
    }
    mocker.patch("app.controller.settings_controller.wait_for_elastic_cluster_ready", return_value=None)
    mocker.patch("app.controller.settings_controller.MinIOManager", side_effect=MockMinIOManager)
    mocker.patch("app.controller.settings_controller.JobID", side_effect=MockJobID2)
    mocker.patch("app.controller.settings_controller.setup_s3_repository.delay", return_value=None)

    response = client.post("/api/settings/minio_repository", json=minio_payload)
    expected = {'job_id': 'bd19eeb80-5499-4223-8685-a5103bcf47e8',
                'redis_key': 'rq:job:bd19eeb80-5499-4223-8685-a5103bcf47e8'}
    actual = response.json
    assert response.status_code == 200
    assert len(expected) == len(actual)
    for key in expected:
        assert expected[key] == actual[key]

    minio_payload["password"] = "invalid_password"
    response = client.post("/api/settings/minio_repository", json=minio_payload)
    assert response.status_code == 500
    assert response.json == {'error_message': "Invalid Password"}

    minio_payload['ip_address'] = "invalid ip"
    response = client.post("/api/settings/minio_repository", json=minio_payload)
    assert response.status_code == 400
    assert response.json == {'ip_address': ['Not a valid IPv4 address.']}


def test_minio_repository_settings(client: FlaskClient, mocker: MockerFixture):
    mocker.patch("app.models.settings.minio_settings.ElasticWrapper", return_value=MockElasticsearch())
    mocker.patch("app.models.settings.minio_settings.get_kubernetes_secret", side_effect=mock_get_kubernetes_secret)

    results = client.get("/api/settings/minio_repository")
    assert results.status_code == 200
    actual = results.json
    expected = {'username': 'testuser',
                'password': 'password',
                'ip_address': '10.40.12.20',
                'port': 9001,
                'protocol': 'http',
                'bucket': 'tfplenum'}

    assert len(expected) == len(actual)
    for key in expected:
        assert expected[key] == actual[key]


def test_minio_respository_not_configured(client: FlaskClient):
    results = client.get("/api/settings/minio_repository")
    assert results.status_code == 200
    actual = results.json
    expected = {'username': '',
                'password': '',
                'ip_address': '',
                'port': 9001,
                'protocol': 'http',
                'bucket': 'tfplenum'}

    assert len(expected) == len(actual)
    for key in expected:
        assert expected[key] == actual[key]
