from app.models import Model
from app.utils.namespaces import JOB_NS
from flask_restx import fields
from rq.job import Job


class JobIDModel(Model):
    DTO = JOB_NS.model('JobIDModel', {
        "job_id": fields.String(required=True, example="2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6",
                                description="The job id of the BackgroundJobModel use /api/jobs/<id> for more information."),
        "redis_key": fields.String(required=True, example="rq:job:2ccd6523-ea2a-4384-b4b0-7a5c1f8e43b6",
                                   description="The actual key that is stored in Redis database queue.")
    })

    def __init__(self, job: Job):
        self.job_id = job.get_id()
        self.redis_key = job.key.decode("UTF-8")
