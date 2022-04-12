from fakeredis import FakeStrictRedis
from tests.unit.mock_classes import MockJobID, MockWorker
from tests.unit.static_data.jobs import mock_jobs


def test_get_job_id(client, mocker):
    mocker.patch("app.controller.task_controller.get_all_jobs", return_value=FakeStrictRedis())
    mocker.patch("app.controller.task_controller.transform_jobs", return_value=mock_jobs)
    results = client.get("/api/jobs/e963687f-88f4-493d-ba84-e0ba9f408c22")
    assert results.status_code == 200
    assert results.json['job_id'] == mock_jobs[0]['job_id']


def test_get_job_id_empty(client, mocker):
    mocker.patch("app.controller.task_controller.get_all_jobs", return_value=FakeStrictRedis())
    mocker.patch("app.controller.task_controller.transform_jobs", return_value=mock_jobs)
    results = client.get("/api/jobs/e963687f-88f4-493d-ba84-e0ba9f408c00")
    assert results.status_code == 200
    assert results.json == {}


def test_delete_job(client, mocker):
    workers = []
    worker = MockWorker("6a4c8acca21447c4abbf37314fd71165", "controller.lan", 30725,
                        "idle", "2020-10-06 19:19:07.123298", "2020-10-06 18:58:52.046694", 1, 2, 3)
    job_id_class = MockJobID("2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6",
                             "rq:job:2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6")
    workers.append(worker)
    mocker.patch("app.controller.task_controller.Job", return_value=FakeStrictRedis())
    mocker.patch("app.service.job_service.Job", return_value=FakeStrictRedis())
    mocker.patch("app.service.job_service.Worker.all", return_value=workers)
    mocker.patch("app.service.job_service.JobID", return_value=job_id_class)
    results = client.delete("/api/jobs/e2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6")
    assert results.status_code == 200
