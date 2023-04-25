from app.models import Model
from app.utils.namespaces import KIT_SETUP_NS
from flask_restx import fields


class KitStatusModel(Model):
    DTO = KIT_SETUP_NS.model('KitStatusModel', {
        "control_plane_deployed": fields.Boolean(required=True, default=False),
        "general_settings_configured": fields.Boolean(required=True, default=False),
        "kit_settings_configured": fields.Boolean(required=True, default=False),
        "esxi_settings_configured": fields.Boolean(required=True, default=False),
        "ready_to_deploy": fields.Boolean(required=True, default=False),
        "base_kit_deployed": fields.Boolean(required=True, default=False),
        "jobs_running": fields.Boolean(required=True, default=False),
        "deploy_kit_running": fields.Boolean(required=True, default=False)
    })

    def __init__(self, control_plane_deployed: bool, general_settings_configured: bool,
                 kit_settings_configured: bool, esxi_settings_configured: bool,
                 ready_to_deploy: bool, base_kit_deployed: bool,
                 jobs_running: bool, deploy_kit_running: bool):
        self.control_plane_deployed = control_plane_deployed
        self.general_settings_configured = general_settings_configured
        self.kit_settings_configured = kit_settings_configured
        self.esxi_settings_configured = esxi_settings_configured
        self.ready_to_deploy = ready_to_deploy
        self.base_kit_deployed = base_kit_deployed
        self.jobs_running = jobs_running
        self.deploy_kit_running = deploy_kit_running
