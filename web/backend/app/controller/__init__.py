from app.utils.namespaces import (AGENT_NS, ALERTS_NS, APP_NS, CATALOG_NS,
                                  COLDLOG_NS, COMMON_NS, CURATOR_NS,
                                  DEVICE_FACTS_NS, DIAGNOSTICS_NS, HEALTH_NS,
                                  HIVE_NS, JOB_NS, KIT_SETUP_NS, KIT_TOKEN_NS,
                                  KUBERNETES_NS, NOTIFICATIONS_NS, POLICY_NS,
                                  PORTAL_NS, SCALE_NS, SETINGS_NS, TOOLS_NS,
                                  VERSION_NS)
from flask import Blueprint
from flask_restx import Api

from . import (agent_builder_controller, alerts_controller, catalog_controller,
               cold_log_controller, common_controller, configmap_controller,
               curator_controller, diagnostics_controller, health_controller,
               health_dashboard_controller, job_controller, kit_controller,
               kit_tokens_controller, mip_controller, node_controller,
               notification_controller, pcap_controller, portal_controller,
               registry_controller, ruleset_controller, scale_controller,
               settings_controller, tools_controller, version_controller)

api_blueprint = Blueprint("api", __name__)
api = Api(
    api_blueprint,
    version="1.0",
    title="TFPlenum Backend API",
    description="TFPlenums API documentation",
    doc="/docs",
)
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
api.add_namespace(POLICY_NS)
api.add_namespace(HIVE_NS)
api.add_namespace(JOB_NS)
api.add_namespace(KIT_SETUP_NS)
api.add_namespace(KIT_TOKEN_NS)
api.add_namespace(KUBERNETES_NS)
api.add_namespace(NOTIFICATIONS_NS)
api.add_namespace(PORTAL_NS)
api.add_namespace(SCALE_NS)
api.add_namespace(SETINGS_NS)
api.add_namespace(TOOLS_NS)
api.add_namespace(VERSION_NS)
