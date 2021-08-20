from app import app, conn_mng, CATALOG_NS
from app.utils.logging import logger
from app.common import ERROR_RESPONSE
from flask import jsonify, request, Response
from flask_restx import Resource, fields
from typing import List
from app.catalog_service import (delete_helm_apps, install_helm_apps, get_app_state,
                                 get_repo_charts, chart_info, generate_values, get_nodes, get_node_apps,
                                 reinstall_helm_apps)
from app.middleware import controller_maintainer_required
from app.models.common import JobID
from app.models.catalog import (ChartModel, ChartInfoModel, ChartNodeModel,
                                HELMActionModel, SavedHelmValuesModel)
from app.models.nodes import Node
from app.utils.connection_mngs import objectify
from typing import Set, List

NAMESPACE = "default"


@CATALOG_NS.route('/catalog/<application>/saved-values')
class HelmChartSavedValues(Resource):

    @CATALOG_NS.response(200, "SavedHelmValues", SavedHelmValuesModel.DTO)
    def get(self, application: str) -> str:
        if application:
            saved_values = list(conn_mng.mongo_catalog_saved_values.find(
                {"application": application}))
            return [objectify(item) for item in saved_values]

        return ERROR_RESPONSE


def _add_to_set(sensor_hostname: str, values: List, out_ifaces: Set):
    for config in values:
        if sensor_hostname == config["values"]["node_hostname"]:
            for iface_name in config["values"]["interfaces"]:
                out_ifaces.add(iface_name)


@CATALOG_NS.route('/catalog/configured-ifaces/<sensor_hostname>')
class ConfiguredIfaces(Resource):

    @CATALOG_NS.response(200, 'A list of iface names that are configured with either zeek or suricata.', \
                         [fields.String(example="ens192")])
    def get(self, sensor_hostname: str):
        if sensor_hostname:
            ifaces = set()
            zeek_values = list(
                conn_mng.mongo_catalog_saved_values.find({"application": "zeek"}))
            suricata_values = list(
                conn_mng.mongo_catalog_saved_values.find({"application": "suricata"}))
            if zeek_values and len(zeek_values) > 0:
                _add_to_set(sensor_hostname, zeek_values, ifaces)

            if suricata_values and len(suricata_values) > 0:
                _add_to_set(sensor_hostname, suricata_values, ifaces)

            return list(ifaces)
        return ERROR_RESPONSE


@CATALOG_NS.route('/catalog/install')
class HELMInstallCtrl(Resource):

    @CATALOG_NS.doc(description="Installs an application using helm.")
    @CATALOG_NS.expect(HELMActionModel.DTO)
    @CATALOG_NS.response(200, "JobID", JobID.DTO)
    @CATALOG_NS.response(500, "Error")
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
            return JobID(job).to_dict(), 200

        logger.error("Executing /api/catalog/install has failed.")
        return ERROR_RESPONSE


@CATALOG_NS.route('/catalog/delete')
class HELMDeleteCtrl(Resource):

    @CATALOG_NS.doc(description="Delete an application using helm")
    @CATALOG_NS.expect(HELMActionModel.DTO)
    @CATALOG_NS.response(200, "JobID", JobID.DTO)
    @CATALOG_NS.response(500, "Error")
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
            return JobID(job).to_dict()

        logger.error("Executing /api/catalog/delete has failed.")
        return ERROR_RESPONSE


@CATALOG_NS.route('/catalog/reinstall')
class HELMReinstallCtrl(Resource):

    @CATALOG_NS.doc(description="Reinstall an application using helm")
    @CATALOG_NS.expect(HELMActionModel.DTO)
    @CATALOG_NS.response(200, "JobID", JobID.DTO)
    @CATALOG_NS.response(500, "Error")
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
            return JobID(job).to_dict()

        logger.error("Executing /api/catalog/delete has failed.")
        return ERROR_RESPONSE


@app.route('/api/catalog/generate_values', methods=["POST"])
@controller_maintainer_required
def generate_values_chart() -> Response:
    payload = request.get_json()
    application = payload["role"]
    configs = payload["configs"]
    results = []
    results = generate_values(application, NAMESPACE, configs)
    return jsonify(results)


def _get_all_charts() -> List:
    charts = []
    charts = get_repo_charts()  # type: list
    return charts


@app.route('/api/catalog/charts', methods=['GET'])
def get_all_charts() -> Response:
    charts = []
    charts = get_repo_charts()  # type: list
    return jsonify(charts)


@CATALOG_NS.route('/catalog/chart/<application>/status')
class ChartStatusCtrl(Resource):

    @CATALOG_NS.doc(description="The object returned will tell users which nodes \
                                 the chart was deployed to or it will return an empty array.")
    @CATALOG_NS.response(200, 'ChartNodes', [ChartNodeModel.DTO])
    def get(self, application: str) -> Response:
        results = []
        results = get_app_state(application, NAMESPACE)
        return results


@CATALOG_NS.route('/catalog/charts/status')
class ChartsCtrl(Resource):

    @CATALOG_NS.doc(description="The charts currently available for install.  Additionally, the object returned will \
                                 tell users which nodes the chart was deployed to.")
    @CATALOG_NS.response(200, 'Charts', [ChartModel.DTO])
    def get(self) -> Response:
        ret_val = []
        charts = _get_all_charts()
        for chart in charts:
            chart["nodes"] = get_app_state(chart['application'], NAMESPACE)
            ret_val.append(chart)
        return ret_val


@CATALOG_NS.route('/catalog/chart/<application>/info')
class ChartCtrl(Resource):

    @CATALOG_NS.doc(description="Displays a charts installation information.  It includes form controls etc.")
    @CATALOG_NS.response(200, 'ChartInfo', ChartInfoModel.DTO)
    def get(self, application: str) -> Response:
        results = []
        results = chart_info(application)  # type: list
        return results


@CATALOG_NS.route('/catalog/nodes')
class NodeDetails(Resource):

    @CATALOG_NS.doc(description="Returns a list of Nodes from the Kit configuration.")
    @CATALOG_NS.response(200, 'Node', [Node.DTO])
    def get(self) -> Response:
        nodes = get_nodes(details=True)
        return nodes


@CATALOG_NS.route('/catalog/<node_hostname>/apps')
class CatalogAppsCtrl(Resource):

    @CATALOG_NS.response(200, 'A list of charts installed on a target host.', \
                         [fields.String(example="suricata",description="Chart ID/ Names installed")])
    def get(self, node_hostname: str) -> Response:
        results = get_node_apps(node_hostname)
        return results
