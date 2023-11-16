from app.middleware import handle_errors, login_required_roles
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.health_dashboard import (HealthDashboardModel,
                                         KibanaLoginInfoModel)
from app.service.health_dashboard_service import (
    get_health_dashboard_status, get_hostname, get_kibana_login_info,
    get_remote_health_dashboard_status, get_remote_kibana_login_info)
from app.utils.constants import METRICS_ROLES
from app.utils.namespaces import APP_NS, HEALTH_NS
from flask import Response
from flask_restx import Resource, fields


@HEALTH_NS.route("/dashboard/status")
class HealthDashboardStatusApi(Resource):

    @HEALTH_NS.doc(description="Gets health dashboard status.")
    @HEALTH_NS.response(200, "Dashboard Status", HealthDashboardModel.DTO)
    @HEALTH_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
        return get_health_dashboard_status()


@HEALTH_NS.route("/remote/dashboard/status")
class RemoteHealthDashboardStatusApi(Resource):

    @HEALTH_NS.doc(description="Gets remote health dashboard status.")
    @HEALTH_NS.response(200, "Remote Dashboard Status", HealthDashboardModel.DTO)
    @HEALTH_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_remote_health_dashboard_status()


@HEALTH_NS.route("/hostname")
class HostnameApi(Resource):

    @HEALTH_NS.doc(description="Gets hostname.")
    @HEALTH_NS.response(200, "Hostname", fields.String())
    @HEALTH_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
        return get_hostname()


@APP_NS.route("/kibana/info")
class KibanaLoginInfoApi(Resource):

    @APP_NS.doc(description="Gets Kibana login information.")
    @APP_NS.response(200, "Kibana Login Info", KibanaLoginInfoModel.DTO)
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
        return get_kibana_login_info()


@APP_NS.route("/kibana/info/remote/<ipaddress>")
class RemoteKibanaLoginInfoApi(Resource):

    @APP_NS.doc(description="Gets remote Kibana login information.")
    @APP_NS.response(200, "Remote Kibana Login", KibanaLoginInfoModel.DTO)
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self, ipaddress: str) -> Response:
        return get_remote_kibana_login_info(ipaddress)
