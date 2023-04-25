from app.models.job_id import JobIDModel
from app.models.kit_status import KitStatusModel
from app.models.nodes import Node
from app.service.node_service import execute, get_kit_status
from app.utils.constants import DEPLOYMENT_JOBS, JOB_DEPLOY
from app.utils.exceptions import InternalServerError


def get_new_kit_status() -> KitStatusModel:
    kit_status = get_kit_status()
    if kit_status:
        return kit_status
    raise InternalServerError


def get_execute_kit_job() -> JobIDModel:
    nodes = Node.load_all_servers_sensors_from_db()
    job = execute.delay(node=nodes, exec_type=DEPLOYMENT_JOBS.base_kit, stage=JOB_DEPLOY)
    return JobIDModel(job).to_dict()
