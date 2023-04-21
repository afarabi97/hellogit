from ipaddress import IPv4Address

import pytest
from app.models.settings.general_settings import GeneralSettingsForm
from app.utils.collections import Collections, get_collection
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.node import (get_node_expected, jobs_collection,
                                         nodes_collection)


class Settings:
    domain = "kit200"


@pytest.fixture
def settings():
    return Settings()

def test_node(client: FlaskClient, mocker: MockerFixture, settings: Settings):
    mocker.patch("app.controller.node_controller.NodeCtrl._get_settings", return_value=settings)
    get_collection(Collections.NODES).insert_many(nodes_collection)
    get_collection(Collections.JOBS).insert_many(jobs_collection)
    results = client.get("/api/kit/node/md2-sensor3.kit200")
    assert get_node_expected == results.get_json()


def test_add_minio(client: FlaskClient, mocker: MockerFixture):

    mock_job = {"job_id": "mock_id",
                "redis_key": "mock_redis_key"}
    settings_mock = GeneralSettingsForm(IPv4Address('10.40.12.64'), IPv4Address('255.255.255.0'),
                                        IPv4Address('10.40.12.1'), 'nav200', True,
                                        'general_settings_form', 'bdf93a51-11c5-4880-bc2b-8c610fb5e281')
    mocker.patch("app.controller.node_controller.NewNodeCtrl._get_settings", return_value=settings_mock)
    mocker.patch("app.controller.node_controller.NewNodeCtrl._execute_create_virtual_job", return_value=mock_job)
    mocker.patch("app.controller.node_controller.NewNodeCtrl._execute_kickstart_profile_job", return_value=mock_job)
    mocker.patch("app.models.settings.kit_settings.GeneralSettingsForm.load_from_db", return_value=settings_mock)

    node_post = "/api/kit/node"
    minio_payload = {
        "hostname":"navarro-miniotest3",
        "ip_address":"10.40.12.53sdf",
        "node_type":"MinIO",
        "deployment_type":"Virtual",
        "mac_address":"",
        "raid0_override":False,
        "virtual_cpu":8,
        "virtual_mem":8,
        "virtual_os":100,
        "virtual_data":1000
    }

    response = client.post(node_post, json=minio_payload)
    assert response.status_code == 400
    assert response.json == {'ip_address': ['Not a valid IPv4 address.']}

    minio_payload['ip_address'] = '10.40.12.53'

    response = client.post(node_post, json=minio_payload)
    assert response.status_code == 200

    response = client.post(node_post, json=minio_payload)
    assert response.status_code == 400
    assert response.json == {'post_validation': {'minio': ['MinIO has already been added. Only one is allowed.']}}
