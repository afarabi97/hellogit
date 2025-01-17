from typing import List, Set

from app.middleware import controller_maintainer_required, login_required_roles
from app.models.catalog import (ChartInfoModel, ChartModel,
                                ChartNodeModel, HELMActionModel,
                                SavedHelmValuesModel)
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.job_id import JobIDModel
from app.models.nodes import Node
from app.service.catalog_service import (chart_info, delete_helm_apps,
                                         generate_values, get_app_state,
                                         get_helm_list, get_node_apps,
                                         get_nodes, get_repo_charts,
                                         install_helm_apps,
                                         reinstall_helm_apps)
from app.utils.collections import mongo_catalog_saved_values
from app.utils.connection_mngs import objectify
from app.utils.logging import logger
from app.utils.namespaces import CATALOG_NS
from flask import Response, request
from flask_restx import Resource, fields

NAMESPACE = "default"


@CATALOG_NS.route('/<application>/saved-values')
class HelmChartSavedValues(Resource):

    @CATALOG_NS.response(200, "SavedHelmValues", SavedHelmValuesModel.DTO)
    def get(self, application: str) -> Response:
        saved_values = list(mongo_catalog_saved_values().find(
            {"application": application}))
        return [objectify(item) for item in saved_values]


def _add_to_set(sensor_hostname: str, values: List, out_ifaces: Set):
    for config in values:
        if sensor_hostname == config["values"]["node_hostname"]:
            for iface_name in config["values"]["interfaces"]:
                out_ifaces.add(iface_name)


@CATALOG_NS.route('/configured-ifaces/<sensor_hostname>')
class ConfiguredIfaces(Resource):

    @CATALOG_NS.response(200, 'A list of iface names that are configured with either zeek, suricata or arkime.',
                         [fields.String(example="ens192")])
    @CATALOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    def get(self, sensor_hostname: str) -> Response:
        ifaces = set()
        for application in ("zeek", "suricata", "arkime"):
            values = list(mongo_catalog_saved_values().find({"application": application}))
            _add_to_set(sensor_hostname, values, ifaces) if values else None
        return list(ifaces) or ({'error_message': 'Failed to list iface names configured with either arkime, zeek, or suricata'}, 500)

@CATALOG_NS.route('/install')
class HELMInstallCtrl(Resource):

    @CATALOG_NS.doc(description="Installs an application using helm.")
    @CATALOG_NS.expect(HELMActionModel.DTO)
    @CATALOG_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @CATALOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        payload = request.get_json()
        application = payload["role"]
        processdic = payload["process"]
        process = processdic["selectedProcess"]
        node_affinity = processdic["node_affinity"]
        values = payload["values"]

        if process == "install":
            job = install_helm_apps.delay(
                application, NAMESPACE, node_affinity=node_affinity, values=values)  # type: list
            return JobIDModel(job).to_dict(), 200

        logger.error("Executing /api/catalog/install has failed.")
        return {'error_message': 'Failed to install catalog application using helm'}, 500


@CATALOG_NS.route('/uninstall')
class HELMDeleteCtrl(Resource):

    @CATALOG_NS.doc(description="Delete an application using helm")
    @CATALOG_NS.expect(HELMActionModel.DTO)
    @CATALOG_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @CATALOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        payload = request.get_json()
        application = payload["role"]
        processdic = payload["process"]
        process = processdic["selectedProcess"]
        nodes = processdic["selectedNodes"]

        if process == "uninstall":
            job = delete_helm_apps.delay(
                application=application, namespace=NAMESPACE, nodes=nodes)  # type: Response
            return JobIDModel(job).to_dict(), 200

        logger.error("Executing /api/catalog/uninstall has failed.")
        return {'error_message': 'Failed to uninstall catalog application using helm'}, 500


@CATALOG_NS.route('/reinstall')
class HELMReinstallCtrl(Resource):

    @CATALOG_NS.doc(description="Reinstall an application using helm")
    @CATALOG_NS.expect(HELMActionModel.DTO)
    @CATALOG_NS.response(200, "JobIDModel", JobIDModel.DTO)
    @CATALOG_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @controller_maintainer_required
    def post(self) -> Response:
        payload = request.get_json()
        application = payload["role"]
        processdic = payload["process"]
        process = processdic["selectedProcess"]
        nodes = processdic["selectedNodes"]
        node_affinity = processdic["node_affinity"]
        values = payload["values"]

        if process == "reinstall":
            job = reinstall_helm_apps.delay(application=application, namespace=NAMESPACE, nodes=nodes,
                                            node_affinity=node_affinity, values=values)
            return JobIDModel(job).to_dict(), 200

        logger.error("Executing /api/catalog/reinstall has failed.")
        return {'error_message': 'Failed to reinstall catalog application using helm'}, 500


@CATALOG_NS.route('/generate_values')
class CatalogGenerateValues(Resource):
    @controller_maintainer_required
    def post(self) -> Response:
        payload = request.get_json()
        application = payload["role"]
        configs = payload["configs"]
        results = []
        results = generate_values(application, NAMESPACE, configs)
        return results, 200


def _get_all_charts() -> List:
    charts = []
    charts = get_repo_charts()  # type: list
    return charts


@CATALOG_NS.route('/charts')
class CatalogGetCharts(Resource):
    @login_required_roles()
    def get(self) -> Response:
        charts = []
        charts = get_repo_charts()  # type: list
        return charts, 200


@CATALOG_NS.route('/chart/<application>/status')
class ChartStatusCtrl(Resource):

    @CATALOG_NS.doc(description="The object returned will tell users which nodes \
                                 the chart was deployed to or it will return an empty array.")
    @CATALOG_NS.response(200, 'ChartNodes', [ChartNodeModel.DTO])
    def get(self, application: str) -> Response:
        results = []
        results = get_app_state(application, NAMESPACE)
        return results


@CATALOG_NS.route('/charts/status')
class ChartsCtrl(Resource):

    @CATALOG_NS.doc(description="The charts currently available for install.  Additionally, the object returned will \
                                 tell users which nodes the chart was deployed to.")
    @CATALOG_NS.response(200, 'Charts', [ChartModel.DTO])
    @login_required_roles()
    def get(self) -> Response:
        ret_val = []
        charts = _get_all_charts()
        nodes = Node.load_dip_nodes_from_db()  # type: List[Node]
        chart_releases = get_helm_list()
        for chart in charts:
            chart["nodes"] = get_app_state(
                chart['application'], NAMESPACE, nodes=nodes, chart_releases=chart_releases)
            ret_val.append(chart)
        return ret_val


@CATALOG_NS.route('/chart/<application>/info')
class ChartCtrl(Resource):

    @CATALOG_NS.doc(description="Displays a charts installation information.  It includes form controls etc.")
    @CATALOG_NS.response(200, 'ChartInfo', ChartInfoModel.DTO)
    def get(self, application: str) -> Response:
        results = []
        results = chart_info(application)  # type: list
        return results


@CATALOG_NS.route('/nodes')
class NodeDetails(Resource):

    @CATALOG_NS.doc(description="Returns a list of Nodes from the Kit configuration.")
    @CATALOG_NS.response(200, 'Node', [Node.DTO])
    @login_required_roles()
    def get(self) -> Response:
        # Filter out nodes that have not been assigned deviceFacts
        # bool(n["deviceFacts"]) evaluates to true if it is not an empty object {}
        nodes = get_nodes(details=True)
        filter_data = filter(lambda n: bool(n["deviceFacts"]), nodes)
        nodes_filtered = list(filter_data)
        return nodes_filtered


@CATALOG_NS.route('/<node_hostname>/apps')
class CatalogAppsCtrl(Resource):

    @CATALOG_NS.response(200, 'A list of charts installed on a target host.',
                         [fields.String(example="suricata", description="Chart ID/ Names installed")])
    def get(self, node_hostname: str) -> Response:
        results = get_node_apps(node_hostname)
        return results
