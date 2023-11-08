from app.models import Model
from app.utils.namespaces import JOB_NS
from flask_restx import fields
from rq.job import Job, JobStatus


class BackgroundJobModel(Model):
    POSSIBLE_STATES = [JobStatus.QUEUED, JobStatus.FINISHED,
                       JobStatus.FAILED, JobStatus.STARTED,
                       JobStatus.DEFERRED, JobStatus.SCHEDULED]
    DTO = JOB_NS.model('BackgroundJobModel', {
        "job_id": fields.String(required=True, example="fbbd7123-4926-4a84-a8ea-7c926e38edab",
                                description="The task id of the BackgroundJobModel use /api/jobs/<id> for more information."),
        "redis_key": fields.String(required=True, example="fbbd7123-4926-4a84-a8ea-7c926e38edab",
                                   description="The actual key that is stored in Redis database queue."),
        "created_at": fields.String(required=True, example='2020-10-06T16:36:17.566553Z'),
        "enqueued_at": fields.String(required=True, example='2020-10-06T16:36:17.566640Z'),
        "started_at": fields.String(required=True, example='2020-10-06T16:36:19.278810Z'),
        "ended_at": fields.String(required=True, example='2020-10-06T16:36:19.282604Z'),
        "origin": fields.String(required=True, example="default",
                                description="The queue that was used for this job."),
        "description": fields.String(required=True, example="app.service.kickstart_service.perform_kickstart('ansible-playbook site.yml -i inventory.yml -t preflight,setup,update_porta...)",
                                     description="The function string that was queued up."),
        "timeout": fields.Integer(required=True, example=180,
                                  description="The amount of time a job is given before terminated."),
        "status": fields.String(required=True, example=JobStatus.QUEUED, description="The status of the job. It can be one of {}".format(str(POSSIBLE_STATES))),
        "ttl": fields.String(required=True, example="",
                             description="Returns ttl for a job that determines how long a job will be persisted. "
                                         "In the future, this method will also be responsible for determining ttl for repeated jobs."),
        "result_ttl": fields.Integer(required=False, example=500,
                                     description="Returns ttl for a job that determines how long a jobs result will "
                                                 "be persisted. In the future, this method will also be responsible "
                                                 "for determining ttl for repeated jobs."),
        "queued_position": fields.Integer(required=True, example=1, description="The position the job is in the queue at."),
        "meta": fields.String(required=True, description="Meta data saved on job."),
        "worker_name": fields.String(description="Worker name")
    })

    def __init__(self, job: Job):
        """
        {'created_at': ,  'started_at': ,
        'ended_at': , 'origin': 'default', 'description':
        'app.service.kickstart_service.perform_kickstart(<function perform_kickstart at 0x7fa10cbb21e0>)',
        'enqueued_at': ,
        'timeout': , 'result_ttl': 500, 'status': 'failed'}
        """
        job_obj = job.to_dict()
        self.job_id = job.get_id()
        self.redis_key = job.key.decode("utf-8")
        self.created_at = job_obj['created_at']
        self.enqueued_at = job_obj['enqueued_at']
        self.started_at = job_obj['started_at']
        self.ended_at = job_obj['ended_at']
        self.origin = job_obj['origin']
        self.description = job.get_call_string()
        self.timeout = job_obj["timeout"]
        self.status = job_obj['status']
        self.meta = job.meta
        self.ttl = job.get_ttl()
        self.result_ttl = job.get_result_ttl(500)
        self.queued_position = job.get_position(),
        self.worker_name = job_obj["worker_name"]
