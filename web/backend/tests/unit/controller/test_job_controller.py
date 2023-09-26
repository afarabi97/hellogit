from app.utils.exceptions import NoSuchNodeJobError
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from rq.exceptions import NoSuchJobError
from tests.unit.static_data.jobs import (mock_job_id_model,
                                         mock_job_log_model_1,
                                         mock_job_log_model_2, mock_jobs)

# Test RedisJobsApi

def test_get_jobs_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_all_jobs", return_value=mock_jobs)
    response = client.get("/api/jobs")
    assert response.status_code == 200
    assert len(response.json) == len(mock_jobs)
    assert len(response.json) == 1


def test_get_jobs_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_all_jobs", side_effect=Exception({"error": "mocked error"}))
    response = client.get("/api/jobs")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RedisJobApi

def test_get_job_with_job_id_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_job_with_job_id", return_value=mock_jobs[0])
    response = client.get(f"/api/jobs/{mock_job_id_model['job_id']}")
    assert response.status_code == 200
    assert response.json["job_id"] == mock_jobs[0]["job_id"]


def test_get_job_with_job_id_200_empty_object(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_job_with_job_id", return_value={})
    response = client.get(f"/api/jobs/{mock_job_id_model['job_id']}")
    assert response.status_code == 200
    assert response.json == {}


def test_get_job_with_job_id_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_job_with_job_id", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f"/api/jobs/{mock_job_id_model['job_id']}")
    assert response.status_code == 500
    assert response.json["error_message"]


def test_delete_job_with_job_id_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.delete_job_with_job_id", return_value=mock_job_id_model)
    response = client.delete(f"/api/jobs/{mock_job_id_model['job_id']}")
    assert response.status_code == 200
    assert response.json["job_id"] == mock_job_id_model['job_id']


def test_delete_job_with_job_id_404_NoSuchJobError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.delete_job_with_job_id", side_effect=NoSuchJobError)
    response = client.delete(f"/api/jobs/{mock_job_id_model['job_id']}")
    assert response.status_code == 404
    assert response.json["error_message"] == "Job does not exist."


def test_delete_job_with_job_id_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.delete_job_with_job_id", side_effect=Exception({"error": "mocked error"}))
    response = client.delete(f"/api/jobs/{mock_job_id_model['job_id']}")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RedisJobRetryApi

def test_put_job_retry_with_job_id_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.put_job_retry", return_value=mock_job_id_model)
    response = client.put(f"/api/jobs/{mock_job_id_model['job_id']}/retry")
    assert response.status_code == 200
    assert response.json["job_id"] == mock_job_id_model['job_id']


def test_put_job_retry_with_job_id_404_NoSuchJobError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.put_job_retry", side_effect=NoSuchJobError)
    response = client.put(f"/api/jobs/{mock_job_id_model['job_id']}/retry")
    assert response.status_code == 404
    assert response.json["error_message"] == "Job does not exist."


def test_put_job_retry_with_job_id_404_NoSuchNodeJobError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.put_job_retry", side_effect=NoSuchNodeJobError)
    response = client.put(f"/api/jobs/{mock_job_id_model['job_id']}/retry")
    assert response.status_code == 404
    assert response.json["error_message"] == "Node job does not exist."


def test_put_job_retry_with_job_id_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.put_job_retry", side_effect=Exception({"error": "mocked error"}))
    response = client.put(f"/api/jobs/{mock_job_id_model['job_id']}/retry")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RedisJobLogApi

def test_get_job_log_with_job_id_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_job_log", return_value=[mock_job_log_model_1, mock_job_log_model_2])
    response = client.get(f"/api/jobs/log/{mock_job_id_model['job_id']}")
    assert response.status_code == 200
    assert response.json[0]["log"] == mock_job_log_model_1["log"]
    assert response.json[1]["log"] == mock_job_log_model_2["log"]


def test_get_job_log_with_job_id_404_NoSuchJobError(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_job_log", side_effect=NoSuchJobError)
    response = client.get(f"/api/jobs/log/{mock_job_id_model['job_id']}")
    assert response.status_code == 404
    assert response.json["error_message"] == "Job does not exist."


def test_get_job_log_with_job_id_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.job_controller.get_job_log", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f"/api/jobs/log/{mock_job_id_model['job_id']}")
    assert response.status_code == 500
    assert response.json["error_message"]
