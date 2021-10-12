import time

import requests
import urllib3
from app.common import ERROR_RESPONSE
from app.middleware import login_required_roles
from app.models.health import APP_NS, HEALTH_NS
from app.utils.connection_mngs import KubernetesWrapper
from app.utils.db_mngs import conn_mng
from app.utils.elastic import ElasticWrapper, get_elastic_password
from app.utils.logging import logger
from app.utils.utils import get_domain
from flask import Response
from flask_restx import Resource, fields


def client_session(username: str, password: str) -> object:
    with requests.Session() as session:
        session.auth = (username, password)
        session.timeout = 60
    return session

def get_kibana_ipaddress():
    try:
        with KubernetesWrapper(conn_mng) as api:
            services = api.list_service_for_all_namespaces()
            for service in services.items:
                name = service.metadata.name
                if service.status.load_balancer.ingress and name == "kibana":
                    kibana_ip = service.status.load_balancer.ingress[0].ip
                    return kibana_ip

    except Exception as e:
        logger.exception(e)
    return ERROR_RESPONSE

@HEALTH_NS.route('/dashboard/status')
class HealthDashboardStatus(Resource):
    @HEALTH_NS.response(200, 'Dashboard Status')
    def get(self) -> Response:
        status = []
        elastic_status = {}
        try:
            client = ElasticWrapper()
            response = client.cluster.health()
            elastic_status['elasticsearch_status'] = response['status']

            kibana_ipaddress = get_kibana_ipaddress()
            elastic_password = get_elastic_password()
            urllib3.disable_warnings( urllib3.exceptions.InsecureRequestWarning )
            session = client_session('elastic', elastic_password)
            request = session.get("https://{}/api/status".format(kibana_ipaddress), verify=False)
            kibana_status = request.json()['status']['overall']['state']
            elastic_status['kibana_status'] = kibana_status
            status.append(elastic_status)
            return status

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/remote/dashboard/status')
class RemoteHealthDashboardStatus(Resource):
    @HEALTH_NS.response(200, 'Remote Dashboard Status')
    def get(self) -> Response:
        try:
            response = []
            for kit_token in conn_mng.mongo_kit_tokens.find():
                kit_token_id = str(kit_token.pop("_id"))
                kit_token["kit_token_id"] = kit_token_id
                response.append(kit_token)

            dashboard_summary = []
            for data in response:
                if data.get("timestamp", 0) > (time.time() - 30):
                    dashboard_status = {}
                    dashboard_status['ipaddress'] = data['ipaddress']
                    dashboard_status['token'] = data['token']
                    dashboard_status['kit_token_id'] = data['kit_token_id']
                    dashboard_status['elasticsearch_status'] = data['dashboard_status'][0]['elasticsearch_status']
                    dashboard_status['kibana_status'] = data['dashboard_status'][0]['kibana_status']
                    dashboard_status['hostname'] = data['hostname']
                    dashboard_summary.append(dashboard_status)
                else:
                    dashboard_summary.append({
                        "ipaddress": data["ipaddress"],
                        "elasticsearch_status": None,
                        "token": None,
                        "kit_token_id": None,
                        "kibana_status": None,
                        "hostname": None
                    })
            return dashboard_summary

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/hostname')
class Hostname(Resource):
    @HEALTH_NS.response(200, 'Hostname', fields.String())
    def get(self) -> Response:
        try:
            response = conn_mng.mongo_settings.find_one({"_id": "general_settings_form"})
            hostname = "controller.{}".format(response['domain'])
            return hostname
        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE


@APP_NS.route('/kibana/info')
class KibanaLoginInfo(Resource):
    @APP_NS.response(200, 'Kibana Login Info')
    def get(self) -> Response:
        try:
            kibana_info = {}
            kit_domain = get_domain()
            elastic_password = get_elastic_password()
            print(elastic_password)

            with KubernetesWrapper(conn_mng) as api:
                services = api.list_service_for_all_namespaces()
                for service in services.items:
                    name = service.metadata.name
                    if name == "kibana":
                        svc_ip = service.status.load_balancer.ingress[0].ip
                        kibana_info['DNS'] = "https://{}.{}".format(name, kit_domain)
                        kibana_info['IP Address'] = "https://{}".format(svc_ip)
                        kibana_info['Username/Password'] = 'elastic/{}'.format(elastic_password)
            return kibana_info

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@APP_NS.route('/kibana/info/remote/<ipaddress>')
class RemoteKibanaLoginInfo(Resource):
    @APP_NS.response(200, 'Kibana Login')
    def get(self, ipaddress:str) -> Response:
        try:
            response = conn_mng.mongo_kit_tokens.find_one({"ipaddress": ipaddress})
            kibana_info = response['kibana_info']
            return kibana_info

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE
