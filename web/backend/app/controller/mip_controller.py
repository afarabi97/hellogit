
from typing import Dict, List

from app.models.nodes import KIT_SETUP_NS
from app.models.common import JobID
from app.models.nodes import Node
from app.models.settings.kit_settings import GeneralSettingsForm
from app.service.node_service import execute, send_notification
from app.utils.constants import (DEPLOYMENT_JOBS, DEPLOYMENT_TYPES, JOB_CREATE,
                                 MAC_BASE, NODE_TYPES, PXE_TYPES)
from flask_restx import Resource
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
