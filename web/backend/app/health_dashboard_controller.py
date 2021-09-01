import time
from app import app, api, conn_mng, HEALTH_NS
from app.utils.logging import logger
from app.common import NOTFOUND_RESPONSE, ERROR_RESPONSE, CONFLICT_RESPONSE, NO_CONTENT
from app.utils.elastic import ElasticWrapper, get_elastic_password
from app.utils.connection_mngs import  KubernetesWrapper
from app.middleware import login_required_roles
from base64 import b64decode
import urllib3
import requests

from flask import request, Response, jsonify
from flask_restx import Resource, fields

def client_session(username: str, password: str) -> object:
    with requests.Session() as session:
        session.auth = (username, password)
        session.timeout = 60
    return session

def get_local_api_key():
    with KubernetesWrapper(conn_mng) as api:
        response = api.read_namespaced_secret('metrics-api-key', 'default')
        api_key = b64decode(response.data['api-key']).decode('utf-8')
        return api_key

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

@HEALTH_NS.route('/health/dashboard/status')
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
            return jsonify(status)

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/remote/health/dashboard/status')
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
            return jsonify(dashboard_summary)

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/health/dashboard/kibana/info')
class KibanaLoginInfo(Resource):
    @HEALTH_NS.response(200, 'Kibana Login')
    def get(self) -> Response:
        try:
            kibana_info = {}
            token = get_local_api_key()
            portal_links = requests.get("https://localhost/api/get_portal_links",
                                         headers={"Authorization": "Bearer {}".format(token)},
                                         verify=False)

            for link in portal_links.json():
                if "kibana" in link['dns']:
                    kibana_info['DNS'] = link['dns']
                    kibana_info['IP Address'] = link['ip']
                    kibana_info['Username/Password'] = link['logins']

            return jsonify(kibana_info)

        except Exception as e:
            logger.exception(e)
        return ERROR_RESPONSE

@HEALTH_NS.route('/remote/health/dashboard/kibana/info/<ipaddress>')
class RemoteKibanaLoginInfo(Resource):
    @HEALTH_NS.response(200, 'Kibana Login')
    def get(self, ipaddress:str) -> Response:
        try:
            response = conn_mng.mongo_kit_tokens.find_one({"ipaddress": ipaddress})
            kibana_info = response['kibana_info']
            return jsonify(kibana_info)

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
