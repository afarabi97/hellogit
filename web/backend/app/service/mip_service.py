from typing import Dict

from app.models.job_id import JobIDModel
from app.models.nodes import Node
from app.service.node_service import execute, send_notification
from app.utils.constants import (DEPLOYMENT_JOBS, DEPLOYMENT_TYPES, JOB_CREATE,
                                 NODE_TYPES)


def post_mip(payload: Dict) -> JobIDModel:
    mip = _add_mip_to_database(payload)
    job = _deploy_mip(mip)
    return job


def _add_mip_to_database(payload: Dict) -> Node:
    payload['node_type'] = NODE_TYPES.mip.value
    mip = Node.load_node_from_request(payload)
    mip.create()
    send_notification()
    return mip


def _deploy_mip(node: Node) -> JobIDModel:
    if node.deployment_type == DEPLOYMENT_TYPES.virtual.value:
        job = execute.delay(node=node, exec_type=DEPLOYMENT_JOBS.create_virtual)
        return JobIDModel(job).to_dict()
    elif node.deployment_type == DEPLOYMENT_TYPES.baremetal.value:
        job = execute.delay(node=node, exec_type=DEPLOYMENT_JOBS.kickstart_profiles, stage=JOB_CREATE)
        return JobIDModel(job).to_dict()
