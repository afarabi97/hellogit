"""
Main module for handling all of the Kit Configuration REST calls.
"""
from typing import Dict

from app.middleware import controller_admin_required
from app.models import DBModelNotFound
from app.models.common import COMMON_ERROR_DTO, COMMON_ERROR_MESSAGE, JobID
from app.models.nodes import KIT_SETUP_NS, Node
from app.service.node_service import execute, get_kit_status
from app.utils.constants import DEPLOYMENT_JOBS, JOB_DEPLOY
from flask import Response
from flask_restx import Resource


@KIT_SETUP_NS.route("/status")
class KitStatusCtrl(Resource):

    @KIT_SETUP_NS.response(400, "ErrorMessage", COMMON_ERROR_MESSAGE)
    def get(self) -> Response:
        try:
            kit_status = get_kit_status()
            if kit_status:
                return kit_status, {}
        except DBModelNotFound:
            return {"error_message": "DBModelNotFound."}
        return {"error_message": "Unknown error."}

@KIT_SETUP_NS.route("/deploy")
class KitCtrl(Resource):

    def _execute_kit_job(self) -> Dict:
        nodes = Node.load_all_servers_sensors_from_db()
        job = execute.delay(node=nodes, exec_type=DEPLOYMENT_JOBS.base_kit, stage=JOB_DEPLOY)
        return JobID(job).to_dict()

    @KIT_SETUP_NS.response(200, 'JobID Model', JobID.DTO)
    @KIT_SETUP_NS.response(400, 'Error Model', COMMON_ERROR_DTO)
    @controller_admin_required
    def get(self) -> Response:
        return self._execute_kit_job()
