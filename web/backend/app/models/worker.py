from app.models import Model
from app.models.background_job import BackgroundJobModel
from app.utils.namespaces import JOB_NS
from flask_restx import fields
from rq.exceptions import NoSuchJobError
from rq.worker import Worker


class WorkerModel(Model):
    DTO = JOB_NS.model('WorkerModel', {
        "name": fields.String(required=True, example="6a4c8acca21447c4abbf37314fd71165", description="The name of the worker."),
        "hostname": fields.String(required=True, example="controller.lan", description="The hostname where the worker is running."),
        "pid": fields.Integer(required=True, example=30725, description="The process ID of the running worker."),
        "state": fields.String(required=True, example="idle", description="The state of the worker."),
        "last_heartbeat": fields.String(required=True, example="2020-10-06 19:19:07.123298", description="Last date time the worker checked the queue for work."),
        "birth_date": fields.String(required=True, example="2020-10-06 18:58:52.046694", description="The last date time the worker either rebooted or started."),
        "successful_job_count": fields.Integer(required=True, example=3,
                                               description="The number of jobs completed successfully by this worker."),
        "failed_job_count": fields.Integer(required=True, example=2,
                                           description="The number of jobs that have failed by this worker."),
        "total_working_time": fields.Integer(required=True, example=1,
                                             description="???"),
        "current_job": fields.Nested(BackgroundJobModel.DTO)
    })

    def __init__(self, worker: Worker):
        self.name = worker.name
        self.hostname = worker.hostname
        self.pid = worker.pid
        self.state = worker.state
        self.last_heartbeat = str(worker.last_heartbeat)
        self.birth_date = str(worker.birth_date)
        self.successful_job_count = worker.successful_job_count
        self.failed_job_count = worker.failed_job_count
        self.total_working_time = worker.total_working_time
        try:
            current_job = worker.get_current_job()
            if current_job:
                self.current_job = BackgroundJobModel(current_job)
            else:
                self.current_job = None
        except NoSuchJobError:
            self.current_job = None
