from pytest_mock.plugin import MockerFixture
from flask.testing import FlaskClient
from pathlib import Path

from fakeredis import FakeStrictRedis
from rq import SimpleWorker, Queue
from app.service.diagnostics_service import run_diagnostics


def test_download_diagnostics(client: FlaskClient, mocker: MockerFixture):
    fake_redis = FakeStrictRedis()
    queue = Queue(is_async=False, connection=FakeStrictRedis())
    job = queue.enqueue(run_diagnostics)
    assert job.is_finished
    mocker.patch("app.service.diagnostics_service.run_diagnostics.delay", return_value=job)
    response = client.post("/api/diagnostics")
    assert response.status_code == 200
    response = client.get(f"/api/diagnostics/download/{response.json['job_id']}")
    assert response.status_code == 200