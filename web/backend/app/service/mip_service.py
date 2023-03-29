from typing import Dict

from app.models.job_id import JobIDModel
from app.models.nodes import Node
from app.service.node_service import execute, send_notification
from app.utils.constants import (DEPLOYMENT_JOBS, DEPLOYMENT_TYPES, JOB_CREATE,
                                 NODE_TYPES)


def post_mip(configuration: Dict) -> JobIDModel:
    mip = __add_mip_to_database(configuration)
    job = __deploy_mip(mip)
    return job


def __add_mip_to_database(configuration: Dict) -> Node:
    configuration['node_type'] = NODE_TYPES.mip.value
    mip = Node.load_node_from_request(configuration)
    mip.create()
    send_notification()
    return mip


def __deploy_mip(node: Node) -> JobIDModel:
    if node.deployment_type == DEPLOYMENT_TYPES.virtual.value:
        job = execute.delay(
            node=node, exec_type=DEPLOYMENT_JOBS.create_virtual)
        return JobIDModel(job).to_dict()
    elif node.deployment_type == DEPLOYMENT_TYPES.baremetal.value:
        job = execute.delay(
            node=node, exec_type=DEPLOYMENT_JOBS.kickstart_profiles, stage=JOB_CREATE)
        return JobIDModel(job).to_dict()
