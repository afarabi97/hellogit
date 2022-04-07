from app.middleware import controller_admin_required
from app.models.common import (COMMON_ERROR_MESSAGE, BackgroundJob, JobID,
                               WorkerModel)
from app.models.nodes import NodeJob
from app.service.job_service import delete_job, get_all_jobs, transform_jobs
from app.utils.collections import mongo_console
from app.utils.connection_mngs import REDIS_CLIENT, REDIS_QUEUE
from flask import Response
from flask_restx import Namespace, Resource
from rq import Worker
from rq.exceptions import NoSuchJobError
from rq.job import Job

JOB_NS = Namespace('jobs', description="Job Queue related operations.")

#Endpoint for developer debugging
@JOB_NS.route('/workers')
class RedisWorker(Resource):

    @JOB_NS.response(200, 'Success', [WorkerModel.DTO])
    def get(self):
        ret_val = []
        workers = Worker.all(queue=REDIS_QUEUE)
        for worker in workers:
            ret_val.append(WorkerModel(worker).to_dict())
        return ret_val


@JOB_NS.route('/<job_id>')
@JOB_NS.doc(params={'job_id': "A background job's job_id"})
class RedisJob(Resource):

    @JOB_NS.doc(description="Gets a RQ job by ID.")
    @JOB_NS.response(200, 'BackgroundJob', BackgroundJob.DTO)
    def get(self, job_id: str):
        jobs = transform_jobs(get_all_jobs())
        for job in jobs:
            if job["job_id"] == job_id:
                return job
        return {}

    @JOB_NS.doc(description="Deletes a Job by ID. This API REST call will also kill the Job if it is running.")
    @JOB_NS.response(200, 'BackgroundJob', JobID.DTO)
    @controller_admin_required
    def delete(self, job_id: str):
        try:
            job = Job.fetch(job_id, connection=REDIS_CLIENT)
            if job:
                return delete_job(job_id)
            else:
                return {"error_message": "Job does not exist."}
        except NoSuchJobError:
                return {"error_message": "Job does not exist."}, 404

@JOB_NS.route('/<job_id>/retry')
@JOB_NS.doc(params={'job_id': "A background job's job_id"})
class RedisJobRetry(Resource):

    @JOB_NS.doc(description="Retry a Job by ID. This API REST call will also kill the Job if it is running.")
    @JOB_NS.response(200, 'BackgroundJob', JobID.DTO)
    @JOB_NS.response(400, 'ErrorMessage', COMMON_ERROR_MESSAGE)
    @controller_admin_required
    def put(self, job_id: str):
        try:
            job = Job.fetch(job_id, connection=REDIS_CLIENT)
            job.requeue()
            job_obj = NodeJob.load_jobs_by_job_id(job_id)  # type: NodeJob
            if job_obj:
                job_obj.set_inprogress(job_id)
            return JobID(job).to_dict()
        except NoSuchJobError:
            return {"error_message": "The passed in job ID no longer exists on the redis queue. It is possible that something erased it."}, 400


@JOB_NS.route('')
class RedisJobs(Resource):

    @JOB_NS.response(200, 'BackgroundJob', [BackgroundJob.DTO])
    def get(self):
        return transform_jobs(get_all_jobs())

    @JOB_NS.response(200, "List of JobIDs", [JobID.DTO])
    @JOB_NS.doc(description="Deletes all jobs in the queue.  If a job is already running, it will not stop the process.")
    @controller_admin_required
    def delete(self):
        ret_val = []
        for job in get_all_jobs():
            ret_val.append(JobID(job).to_dict())
            job.delete()

        return ret_val


@JOB_NS.route('/process/<process_name>')
class RedisJobsByProcess(Resource):

    @JOB_NS.response(200, 'BackgroundJob', [BackgroundJob.DTO])
    def get(self, process_name: str):
        jobs = []
        for job in get_all_jobs():
            if "tags" in job.meta and process_name in job.meta["tags"]:
                jobs.append(job)
        return transform_jobs(jobs)


@JOB_NS.route('/log/<job_id>')
class Jobs(Resource):
    def get(self, job_id: str) -> Response:
        """
        Gets the console logs by Job name.

        :param job_name: The name of the job (EX: Kickstart or Kit)
        """
        job_list = {"jobid": job_id}
        logs = list(mongo_console().find(job_list, {'_id': False}))
        return logs, 200
