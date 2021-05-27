from app import app, conn_mng, KIT_SETUP_NS
from flask import request, Response, jsonify
from app.models.common import JobID
from app.models.nodes import (Node, NodeSchema, JobSchema, NodeJob, DBModelNotFound)
from app.models.settings.kit_settings import GeneralSettingsForm
from app.service.socket_service import notify_node_management
from app.utils.constants import MIP_CONFIG_ID, DEPLOYMENT_JOBS, JOB_PROVISION, JOB_CREATE, NODE_TYPES, DEPLOYMENT_TYPES, PXE_TYPES
from app.service.node_service import execute, send_notification
from flask_restx import Resource
from pymongo import ReturnDocument
from app.middleware import controller_admin_required
from typing import Dict, List
from app.utils.constants import MAC_BASE
from randmac import RandMac


@KIT_SETUP_NS.route('/mip')
class MipCtrl(Resource):
    def _execute_mip_kickstart_job(self, mip: Node):
        job = execute.delay(node=mip, exec_type=DEPLOYMENT_JOBS.kickstart_profiles, stage=JOB_CREATE)
        return JobID(job).to_dict()

    def _execute_create_virtual_job(self, node: Node) -> Dict:
        job = execute.delay(node=node, exec_type=DEPLOYMENT_JOBS.create_virtual)
        return JobID(job).to_dict()

    def post(self):
        settings = GeneralSettingsForm.load_from_db() # type: Model
        mip = Node.load_node_from_request(KIT_SETUP_NS.payload) # type: Node
        if not mip.hostname.endswith(settings.domain):
                mip.hostname = "{}.{}".format(mip.hostname, settings.domain)
        mip.node_type = NODE_TYPES.mip.value
        if mip.deployment_type == DEPLOYMENT_TYPES.virtual.value:
            mip.mac_address = str(RandMac(MAC_BASE)).strip("'")
            mip.pxe_type = PXE_TYPES.scsi_sata_usb.value
        mip.create()
        send_notification()

        if mip.deployment_type == DEPLOYMENT_TYPES.virtual.value:
            return self._execute_create_virtual_job(mip), 200
        return self._execute_mip_kickstart_job(mip), 200


@KIT_SETUP_NS.route('/mips')
class MipsCtrl(Resource):
    def get(self):
        try:
            results = []
            mips = Node.load_deployable_mips_from_db()
            for mip in mips:
                job_list = []
                jobs = NodeJob.load_jobs_by_node(mip)
                for job in jobs:
                    job_list.append(job.to_dict())
                mip_dict = mip.to_dict() # type: Dict
                mip_dict["jobs"] = job_list
                results.append(mip_dict)
            return results
        except DBModelNotFound:
            return {}, 200
