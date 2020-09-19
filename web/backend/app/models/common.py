from app import api
from app.models import Model
from flask_restplus import fields
from rq.job import Job, JobStatus
from rq.worker import Worker

"""
Example of the common Error format.

{
  "upstream_ntp": [
    "Not a valid IPv4 address."
  ]
},

{
  "post_validation": [
    "Kickstart form submission require at least 2 nodes to be defined before submission."
  ]
}
"""
COMMON_ERROR_DTO = api.model('Error', {
    "<field_name>": fields.String(required=False,
                                  example="Not a valid IPv4 address.",
                                  description="<field_name> refers to one of the fields in the marshmallow's model. \
                                               Note: many of these can be defined within the dictionary. Loop over \
                                               all the keys of the dictionary to parse out all the validation logic"),
    "post_validation": fields.List(fields.String(example="Kickstart form submission require at least 2 nodes to be defined before submission."),
                                   required=False,
                                   description="Post validation is custom validation after marshmallows valdation logic is executed")
})


COMMON_RETURNS = api.model("Misc", {
    "ip_blocks": fields.List(fields.String(example="10.40.12.16"),
                             example=["10.40.12.16","10.40.12.32","10.40.12.64","10.40.12.80","10.40.12.96"],
                             description="IP blocks /28 within a given subnet that are not in use."),
    "ip_addresses": fields.List(fields.String(example="10.40.12.4"),
                                example=["10.40.12.2","10.40.12.4","10.40.12.5","10.40.12.6","10.40.12.7"],
                                description="IP addresses within a given subnet that are not in use.")
})


class JobID(Model):
    DTO = api.model('JobID', {
        "job_id": fields.String(required=True, example="fbbd7123-4926-4a84-a8ea-7c926e38edab",
                                description="The job id of the BackgroundJob use /api/jobs/<id> for more information."),
        "redis_key": fields.String(required=True, example="fbbd7123-4926-4a84-a8ea-7c926e38edab",
                                 description="The actual key that is stored in Redis database queue.")
    })

    def __init__(self, job: Job):
        self.job_id = job.get_id()
        self.redis_key = job.key.decode("UTF-8")


class BackgroundJob(Model):
    POSSIBLE_STATES = [JobStatus.QUEUED, JobStatus.FINISHED,
                       JobStatus.FAILED, JobStatus.STARTED,
                       JobStatus.DEFERRED, JobStatus.SCHEDULED]
    DTO = api.model('BackgroundJob', {
        "job_id": fields.String(required=True, example="fbbd7123-4926-4a84-a8ea-7c926e38edab",
                                description="The task id of the BackgroundJob use /api/jobs/<id> for more information."),
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
        "result_ttl": fields.Integer(required=True, example=500,
                                     description="Returns ttl for a job that determines how long a jobs result will "
                                                 "be persisted. In the future, this method will also be responsible "
                                                 "for determining ttl for repeated jobs."),
        "queued_position": fields.Integer(required=True, example=1, description="The position the job is in the queue at.")
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
        self.ttl = job.get_ttl()
        self.result_ttl = job.get_result_ttl()
        self.queued_position = job.get_position()


class WorkerModel(Model):
    DTO = api.model('WorkerModel', {
        "name": fields.String(required=True, example="6a4c8acca21447c4abbf37314fd71165", description="The name of the worker."),
        "hostname": fields.String(required=True, example="dip-controller.lan", description="The hostname where the worker is running."),
        "pid": fields.Integer(required=True, example=30725, description="The process ID of the running worker."),
        "queues": fields.List(fields.String(required=True), required=True, example=['default'],
                              description="The queues this worker is grabbing jobs off of."),
        "state": fields.String(required=True, example="idle", description="The state of the worker."),
        "last_heartbeat": fields.String(required=True, example="2020-10-06 19:19:07.123298", description="Last date time the worker checked the queue for work."),
        "birth_date": fields.String(required=True, example="2020-10-06 18:58:52.046694", description="The last date time the worker either rebooted or started."),
        "successful_job_count": fields.Integer(required=True, example=3,
                                               description="The number of jobs completed successfully by this worker."),
        "failed_job_count": fields.Integer(required=True, example=2,
                                           description="The number of jobs that have failed by this worker."),
        "total_working_time": fields.Integer(required=True, example=1,
                                             description="???"),
        "current_job": fields.Nested(BackgroundJob.DTO)
    })

    def __init__(self, worker: Worker):
        self.name = worker.name
        self.hostname = worker.hostname
        self.pid = worker.pid
        self.queues = [queue.name for queue in worker.queues]
        self.state = worker.state
        self.last_heartbeat = str(worker.last_heartbeat)
        self.birth_date = str(worker.birth_date)
        self.successful_job_count = worker.successful_job_count
        self.failed_job_count = worker.failed_job_count
        self.total_working_time = worker.total_working_time
        current_job = worker.get_current_job()
        if current_job:
            self.current_job = BackgroundJob(current_job)
        else:
            self.current_job = None
