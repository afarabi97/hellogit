from flask import Blueprint
from flask_restx import Api

api_blueprint = Blueprint("api", __name__)

api = Api(
    api_blueprint,
    version="1.0",
    title="TFPlenum Backend API",
    description="TFPlenums API documentation",
    doc="/docs",
)

from app.models.alerts import ALERTS_NS, HIVE_NS
from app.models.catalog import CATALOG_NS
from app.models.cold_log import COLDLOG_NS
from app.models.common import COMMON_NS
from app.models.device_facts import DEVICE_FACTS_NS
from app.models.health import APP_NS, HEALTH_NS
from app.models.kit_tokens import TOKEN_NS
from app.models.kubernetes import KUBERNETES_NS
from app.models.nodes import KIT_SETUP_NS
from app.models.ruleset import POLICY_NS
from app.models.scale import SCALE_NS
from app.models.settings.general_settings import SETINGS_NS

from . import (
    agent_builder_controller,
    alerts_controller,
    catalog_controller,
    cold_log_controller,
    common_controller,
    configmap_controller,
    curator_controller,
    diagnostics_controller,
    health_controller,
    health_dashboard_controller,
    kit_controller,
    kit_tokens_controller,
    mip_controller,
    node_controller,
    notification_controller,
    pcap_controller,
    portal_controller,
    registry_controller,
    ruleset_controller,
    scale_controller,
    settings_controller,
    task_controller,
    tools_controller,
    version_controller,
)
from .agent_builder_controller import AGENT_NS
from .curator_controller import CURATOR_NS
from .diagnostics_controller import DIAGNOSTICS_NS
from .notification_controller import NOTIFICATIONS_NS
from .portal_controller import PORTAL_NS
from .task_controller import JOB_NS
from .tools_controller import TOOLS_NS

api.add_namespace(AGENT_NS)
api.add_namespace(ALERTS_NS)
api.add_namespace(APP_NS)
api.add_namespace(CATALOG_NS)
api.add_namespace(COLDLOG_NS)
api.add_namespace(COMMON_NS)
api.add_namespace(CURATOR_NS)
api.add_namespace(DEVICE_FACTS_NS)
api.add_namespace(DIAGNOSTICS_NS)
api.add_namespace(HEALTH_NS)
api.add_namespace(HIVE_NS)
api.add_namespace(POLICY_NS)
api.add_namespace(JOB_NS)
api.add_namespace(KIT_SETUP_NS)
api.add_namespace(KUBERNETES_NS)
api.add_namespace(NOTIFICATIONS_NS)
api.add_namespace(PORTAL_NS)
api.add_namespace(SCALE_NS)
api.add_namespace(SETINGS_NS)
api.add_namespace(TOKEN_NS)
api.add_namespace(TOOLS_NS)
