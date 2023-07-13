import time

import urllib3
from app.common import ERROR_RESPONSE
from app.service.health_service import client_session, get_kibana_ipaddress
from app.utils.collections import mongo_kit_tokens, mongo_settings
from app.utils.connection_mngs import KubernetesWrapper
from app.utils.elastic import ElasticWrapper, get_elastic_password
from app.utils.logging import logger
from app.utils.namespaces import APP_NS, HEALTH_NS
from app.utils.utils import get_domain
from flask import Response
from flask_restx import Resource, fields

from app.middleware import login_required_roles


@HEALTH_NS.route("/dashboard/status")
class HealthDashboardStatus(Resource):
    @HEALTH_NS.response(200, "Dashboard Status")
    @login_required_roles()
    def get(self) -> Response:
        status = []
        elastic_status = {}
        try:
            client = ElasticWrapper()
            response = client.cluster.health()
            elastic_status["elasticsearch_status"] = response["status"]

            kibana_ipaddress = get_kibana_ipaddress()
            elastic_password = get_elastic_password()
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            session = client_session("elastic", elastic_password)
            request = session.get(
                "https://{}/api/status".format(kibana_ipaddress), verify=False
            )
            kibana_status = request.json()["status"]["overall"]["state"]
            elastic_status["kibana_status"] = kibana_status
            status.append(elastic_status)
            return status

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@HEALTH_NS.route("/remote/dashboard/status")
class RemoteHealthDashboardStatus(Resource):
    @HEALTH_NS.response(200, "Remote Dashboard Status")
    @login_required_roles()
    def get(self) -> Response:
        try:
            response = []
            for kit_token in mongo_kit_tokens().find():
                kit_token_id = str(kit_token.pop("_id"))
                kit_token["kit_token_id"] = kit_token_id
                response.append(kit_token)

            dashboard_summary = []
            for data in response:
                if data.get("timestamp", 0) > (time.time() - 30):
                    dashboard_status = {}
                    dashboard_status["ipaddress"] = data["ipaddress"]
                    dashboard_status["token"] = data["token"]
                    dashboard_status["kit_token_id"] = data["kit_token_id"]
                    dashboard_status["elasticsearch_status"] = data["dashboard_status"][
                        0
                    ]["elasticsearch_status"]
                    dashboard_status["kibana_status"] = data["dashboard_status"][0][
                        "kibana_status"
                    ]
                    dashboard_status["hostname"] = data["hostname"]
                    dashboard_summary.append(dashboard_status)
                else:
                    dashboard_summary.append(
                        {
                            "ipaddress": data["ipaddress"],
                            "elasticsearch_status": None,
                            "token": None,
                            "kit_token_id": None,
                            "kibana_status": None,
                            "hostname": None,
                        }
                    )
            return dashboard_summary

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@HEALTH_NS.route("/hostname")
class Hostname(Resource):
    @HEALTH_NS.response(200, "Hostname", fields.String())
    @login_required_roles()
    def get(self) -> Response:
        try:
            response = mongo_settings().find_one(
                {"_id": "general_settings_form"})
            hostname = "controller.{}".format(response["domain"])
            return hostname
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route("/kibana/info")
class KibanaLoginInfo(Resource):
    @APP_NS.response(200, "Kibana Login Info")
    @login_required_roles()
    def get(self) -> Response:
        try:
            kibana_info = {}
            kit_domain = get_domain()
            elastic_password = get_elastic_password()
            print(elastic_password)

            with KubernetesWrapper() as api:
                services = api.list_service_for_all_namespaces()
                for service in services.items:
                    name = service.metadata.name
                    if name == "kibana":
                        svc_ip = service.status.load_balancer.ingress[0].ip
                        kibana_info["DNS"] = "https://{}.{}".format(
                            name, kit_domain)
                        kibana_info["IP Address"] = "https://{}".format(svc_ip)
                        kibana_info["Username/Password"] = "elastic/{}".format(
                            elastic_password
                        )
            return kibana_info

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route("/kibana/info/remote/<ipaddress>")
class RemoteKibanaLoginInfo(Resource):
    @APP_NS.response(200, "Kibana Login")
    @login_required_roles()
    def get(self, ipaddress: str) -> Response:
        try:
            response = mongo_kit_tokens().find_one({"ipaddress": ipaddress})
            kibana_info = response["kibana_info"]
            return kibana_info

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE
