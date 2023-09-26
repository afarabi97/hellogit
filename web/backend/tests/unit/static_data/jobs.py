from typing import List

from app.models.background_job import BackgroundJobModel
from app.models.job_id import JobIDModel
from app.models.job_log import JobLogModel

mock_job_id_model: JobIDModel = {
    "job_id": "2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6",
    "redis_key": "rq:job:2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6"
}


mock_jobs: List[BackgroundJobModel] = [
   {
       "job_id": "e963687f-88f4-493d-ba84-e0ba9f408c22",
       "redis_key": "rq:job:e963687f-88f4-493d-ba84-e0ba9f408c22",
       "created_at": "2022-02-11T01:47:00.243027Z",
       "enqueued_at": "2022-02-11T01:47:00.243217Z",
       "started_at": "2022-02-11T01:47:00.779745Z",
       "ended_at": "2022-02-11T02:07:20.645072Z",
       "origin": "default",
       "description": "app.service.node_service.execute(exec_type=<DEPLOYMENT_JOBS.provision_virtual: 'Provision Virtual Machine'>, node=<app.models.nodes.Node object at 0x7f118818ec50>, stage='provision')",
       "timeout": 7200,
       "status":
       "failed",
       "meta": {},
       "ttl": None,
       "result_ttl": 500,
       "queued_position": (None,),
       "worker_name": ""
   }
]


mock_job_log_model_1: JobLogModel = {
    "jobid": "2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6",
    "jobName": "mock test",
    "color": "white",
    "log": "Test Log Entry 1"
}


mock_job_log_model_2: JobLogModel = {
    "jobid": "2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6",
    "jobName": "mock test",
    "color": "white",
    "log": "Test Log Entry 2"
}
