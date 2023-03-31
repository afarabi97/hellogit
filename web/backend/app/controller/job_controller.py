from app.middleware import controller_admin_required, handle_errors
from app.models.background_job import BackgroundJobModel
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.job_id import JobIDModel
from app.models.job_log import JobLogModel
from app.service.job_service import (delete_job_with_job_id, get_all_jobs,
                                     get_job_log, get_job_with_job_id,
                                     put_job_retry)
from app.utils.namespaces import JOB_NS
from flask import Response
from flask_restx import Resource


@JOB_NS.route("")
class RedisJobsApi(Resource):

    @JOB_NS.doc(description="Returns all jobs in the queue.")
    @JOB_NS.response(200, "List BackgroundJobModel", [BackgroundJobModel.DTO])
    @JOB_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self) -> Response:
        return get_all_jobs(), 200


@JOB_NS.route("/<job_id>")
@JOB_NS.doc(params={"job_id": "A background job's job_id"})
class RedisJobApi(Resource):

    @JOB_NS.doc(description="Gets a redis queue job by job_id.")
    @JOB_NS.response(200, "BackgroundJobModel", BackgroundJobModel.DTO)
    @JOB_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, job_id: str) -> Response:
        return get_job_with_job_id(job_id), 200


    @JOB_NS.doc(description="Deletes a Job by ID. This API REST call will also kill the Job if it is running.")
    @JOB_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @JOB_NS.response(404, "ErrorMessage: Job does not exist", COMMON_ERROR_MESSAGE)
    @JOB_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    @controller_admin_required
    def delete(self, job_id: str) -> Response:
        return delete_job_with_job_id(job_id), 200


@JOB_NS.route("/<job_id>/retry")
@JOB_NS.doc(params={"job_id": "A background job's job_id"})
class RedisJobRetryApi(Resource):

    @JOB_NS.doc(description="Retry a Job by ID. This API REST call will also kill the Job if it is running.")
    @JOB_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @JOB_NS.response(404, "ErrorMessage: Job does not exist", COMMON_ERROR_MESSAGE)
    @JOB_NS.response(404, "ErrorMessage: Node job does not exist", COMMON_ERROR_MESSAGE)
    @JOB_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    @controller_admin_required
    def put(self, job_id: str) -> Response:
        return put_job_retry(job_id), 200


@JOB_NS.route("/log/<job_id>")
@JOB_NS.doc(params={"job_id": "A background job's job_id"})
class RedisJobLogApi(Resource):

    @JOB_NS.doc(description="Retrieves all of the terminal log lines for an entire job.")
    @JOB_NS.response(200, "List JobLogModel", [JobLogModel.DTO])
    @JOB_NS.response(404, "ErrorMessage: Job does not exist", COMMON_ERROR_MESSAGE)
    @JOB_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, job_id: str) -> Response:
        return get_job_log(job_id), 200
