import os

from app import app, conn_mng, REDIS_QUEUE, api, REDIS_CLIENT
from app.common import OK_RESPONSE, JSONEncoder
from app.middleware import controller_admin_required
from app.models.common import BackgroundJob, WorkerModel, JobID, COMMON_MESSAGE
from flask import Response
from flask_restx import Resource, fields, Namespace
from rq import Worker
from rq.job import Job
from rq.exceptions import NoSuchJobError
from rq.registry import StartedJobRegistry, FinishedJobRegistry, FailedJobRegistry, DeferredJobRegistry
from app.utils.utils import kill_child_processes
from typing import List, Dict
from app.models.nodes import NodeJob


ns = Namespace('Job Queue', path="/api", description="Job Queue related operations.")
api.add_namespace(ns)


def transform_jobs(job_objects: List[Job]):
    ret_val = []
    for job in job_objects:
        if job:
            ret_val.append(BackgroundJob(job).to_dict())

    return ret_val


def get_all_jobs() -> List[Job]:
    finished_registry = FinishedJobRegistry('default', connection=REDIS_CLIENT)
    started_registry = StartedJobRegistry('default', connection=REDIS_CLIENT)
    failed_registery = FailedJobRegistry('default', connection=REDIS_CLIENT)
    waiting_registery = DeferredJobRegistry('default', connection=REDIS_CLIENT)

    all_jobs = waiting_registery.get_job_ids()
    all_jobs += started_registry.get_job_ids()
    all_jobs += finished_registry.get_job_ids()
    all_jobs += failed_registery.get_job_ids()

    return Job.fetch_many(all_jobs, connection=REDIS_CLIENT)


@ns.route('/workers')
class RedisWorker(Resource):

    @ns.response(200, 'Success', [WorkerModel.DTO])
    def get(self):
        ret_val = []
        workers = Worker.all(queue=REDIS_QUEUE)
        for worker in workers:
            ret_val.append(WorkerModel(worker).to_dict())
        return ret_val


@ns.route('/job/<job_id>')
@ns.doc(params={'job_id': "A background job's job_id"})
class RedisJob(Resource):

    @ns.doc(description="Gets a RQ job by ID.")
    @ns.response(200, 'BackgroundJob', BackgroundJob.DTO)
    def get(self, job_id: str):
        jobs = transform_jobs(get_all_jobs())
        for job in jobs:
            if job["job_id"] == job_id:
                return job
        return {}

    @ns.doc(description="Deletes a Job by ID. This API REST call will also kill the Job if it is running.")
    @ns.response(200, 'BackgroundJob', JobID.DTO)
    @controller_admin_required
    def delete(self, job_id: str):
        job_obj = NodeJob.load_jobs_by_job_id(job_id) # type: NodeJob
        if job_obj:
            job_obj.set_error("Job killed by User")

        workers = Worker.all(queue=REDIS_QUEUE)
        for worker in workers:
            job = worker.get_current_job()
            if job and job_id == job.get_id():
                kill_child_processes(worker.pid)
                job.delete()
                return JobID(job).to_dict()

        job = Job.fetch(job_id, connection=REDIS_CLIENT)
        job.delete()
        return JobID(job).to_dict()


@ns.route('/job/<job_id>/retry')
@ns.doc(params={'job_id': "A background job's job_id"})
class RedisJobRetry(Resource):

    @ns.doc(description="Retry a Job by ID. This API REST call will also kill the Job if it is running.")
    @ns.response(200, 'BackgroundJob', JobID.DTO)
    @ns.response(400, 'CommonMsg', COMMON_MESSAGE)
    @controller_admin_required
    def put(self, job_id: str):
        try:
            job = Job.fetch(job_id, connection=REDIS_CLIENT)
            job.requeue()
            job_obj = NodeJob.load_jobs_by_job_id(job_id) # type: NodeJob
            if job_obj:
                job_obj.set_inprogress(job_id)
            return JobID(job).to_dict()
        except NoSuchJobError:
            return {"message": "The passed in job ID no longer exists on the redis queue.  It is possible that something erased it."}, 400


@ns.route('/jobs')
class RedisJobs(Resource):

    @ns.response(200, 'BackgroundJob', [BackgroundJob.DTO])
    def get(self):
        return transform_jobs(get_all_jobs())

    @ns.response(200, "List of JobIDs", [JobID.DTO])
    @ns.doc(description="Deletes all jobs in the queue.  If a job is already running, it will not stop the process.")
    @controller_admin_required
    def delete(self):
        ret_val = []
        for job in get_all_jobs():
            ret_val.append(JobID(job).to_dict())
            job.delete()

        return ret_val


@ns.route('/jobs/<process_name>')
class RedisJobsByProcess(Resource):

    @ns.response(200, 'BackgroundJob', [BackgroundJob.DTO])
    def get(self, process_name: str):
        jobs = []
        for job in get_all_jobs():
            if "tags" in job.meta and process_name in job.meta["tags"]:
                jobs.append(job)
        return transform_jobs(jobs)
