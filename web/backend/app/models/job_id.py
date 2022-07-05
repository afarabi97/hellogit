from app.models import Model
from app.utils.namespaces import JOB_NS
from flask_restx import fields
from rq.job import Job


class JobIDModel(Model):
    DTO = JOB_NS.model('JobIDModel', {
        "job_id": fields.String(required=True, example="fbbd7123-4926-4a84-a8ea-7c926e38edab",
                                description="The job id of the BackgroundJobModel use /api/jobs/<id> for more information."),
        "redis_key": fields.String(required=True, example="fbbd7123-4926-4a84-a8ea-7c926e38edab",
                                   description="The actual key that is stored in Redis database queue.")
    })

    def __init__(self, job: Job):
        self.job_id = job.get_id()
        self.redis_key = job.key.decode("UTF-8")
