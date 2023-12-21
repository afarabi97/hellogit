from app.middleware import handle_errors, login_required_roles
from app.models.common import COMMON_ERROR_MESSAGE
from app.models.elasticsearch import ElasticSearchRejectModel
from app.models.health import (DatastoreModel, MetricsCPUPercentModel,
                               MetricsDataUsageModel, MetricsMemoryModel,
                               MetricsRootUsageModel, PacketsModel)
from app.models.kubernetes import (KubernetesNodeMetricsModel,
                                   KubernetesPodMetricsModel,
                                   NodeOrPodStatusModel, PodLogsModel)
from app.service.health_service import (get_datastores, get_describe_node,
                                        get_elasticsearch_rejects,
                                        get_elasticsearch_rejects_remote,
                                        get_nodes_status_remote,
                                        get_nodes_statuses, get_pod_describe,
                                        get_pod_logs, get_pods_status_remote,
                                        get_pods_statuses,
                                        get_suricata_packets,
                                        get_suricata_packets_remote,
                                        get_zeek_packets,
                                        get_zeek_packets_remote, post_metrics,
                                        post_remote_agent)
from app.utils.constants import METRICS_ROLES
from app.utils.namespaces import APP_NS, HEALTH_NS, KUBERNETES_NS
from flask import Response, request
from flask_restx import Resource


@KUBERNETES_NS.route("/pod/describe/<pod_name>/<namespace>")
class PodDescribeApi(Resource):

    @KUBERNETES_NS.doc(description="The stdout field is the content returned from a kubectl describe pod <pod_name> -n <namespace> command.")
    @KUBERNETES_NS.response(200, "NodeOrPodStatusModel", NodeOrPodStatusModel.DTO)
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, pod_name: str, namespace: str) -> Response:
        return get_pod_describe(pod_name, namespace)


@KUBERNETES_NS.route("/pod/logs/<pod_name>/<namespace>")
class PodLogsApi(Resource):

    @KUBERNETES_NS.doc(description="Runs a command and pulls the pods describe command output.")
    @KUBERNETES_NS.response(200, "PodLogsModel", PodLogsModel.DTO)
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, pod_name: str, namespace: str) -> Response:
        return get_pod_logs(pod_name, namespace)


@KUBERNETES_NS.route("/node/describe/<node_name>")
class DescribeNodeApi(Resource):

    @KUBERNETES_NS.doc(description="The stdout field is the content returned from a kubectl describe node command.")
    @KUBERNETES_NS.response(200, "NodeOrPodStatusModel", NodeOrPodStatusModel.DTO)
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @handle_errors
    def get(self, node_name: str) -> Response:
        return get_describe_node(node_name)


@KUBERNETES_NS.route("/nodes/status")
class NodesStatusApi(Resource):

    @KUBERNETES_NS.doc(description="Gets the nodes status.")
    @KUBERNETES_NS.response(200, "List KubernetesNodeMetricsModel", [KubernetesNodeMetricsModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
        return get_nodes_statuses()


@KUBERNETES_NS.route("/pods/status")
class PodsStatusApi(Resource):

    @KUBERNETES_NS.doc(description="Gets the pods status.")
    @KUBERNETES_NS.response(200, "List KubernetesPodMetricsModel", [KubernetesPodMetricsModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
        return get_pods_statuses()


@KUBERNETES_NS.route("/remote/<token_id>/nodes/status")
class NodesStatusRemoteApi(Resource):

    @KUBERNETES_NS.doc(description="Gets remote nodes status.")
    @KUBERNETES_NS.response(200, "List KubernetesNodeMetricsModel", [KubernetesNodeMetricsModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self, token_id: str) -> Response:
        return get_nodes_status_remote(token_id)


@KUBERNETES_NS.route("/remote/<token_id>/pods/status")
class PodsStatusRemoteApi(Resource):

    @KUBERNETES_NS.doc(description="Gets remote pods status.")
    @KUBERNETES_NS.response(200, "List KubernetesNodeMetricsModel", [KubernetesNodeMetricsModel.DTO])
    @KUBERNETES_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self, token_id: str) -> Response:
        return get_pods_status_remote(token_id)


@HEALTH_NS.route("/remote/agent")
class RemoteAgentApi(Resource):

    @HEALTH_NS.doc(description="Post remote agent.")
    @HEALTH_NS.response(200, "OK_RESPONSE")
    @HEALTH_NS.response(204, "NO_CONTENT")
    @HEALTH_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(["metrics"], all_roles_req=False)
    @handle_errors
    def post(self) -> Response:
        return post_remote_agent(request.get_json())


@HEALTH_NS.route("/datastores")
class DatastoresApi(Resource):

    @HEALTH_NS.doc(description="Gets datastores.")
    @HEALTH_NS.response(200, "List DatastoreModel", [DatastoreModel.DTO])
    @HEALTH_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_datastores()


@APP_NS.route("/elasticsearch/rejects")
class ElasticsearchRejectsApi(Resource):

    @APP_NS.doc(description="Gets elasticsearch write rejects.")
    @APP_NS.response(200, "List ElasticSearchRejectModel", [ElasticSearchRejectModel.DTO])
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
       return get_elasticsearch_rejects()


@APP_NS.route("/elasticsearch/rejects/remote/<ipaddress>")
class ElasticsearchRejectsRemoteApi(Resource):

    @APP_NS.doc(description="Gets remote elasticsearch write rejects.")
    @APP_NS.response(200, "List ElasticSearchRejectModel", [ElasticSearchRejectModel.DTO])
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self, ipaddress: str) -> Response:
        return get_elasticsearch_rejects_remote(ipaddress)


@APP_NS.route("/zeek/packets")
class ZeekPacketsApi(Resource):

    @APP_NS.doc(description="Gets zeek packets.")
    @APP_NS.response(200, "List PacketsModel", [PacketsModel.DTO])
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
       return get_zeek_packets()


@APP_NS.route("/suricata/packets")
class SuricataPacketsApi(Resource):

    @APP_NS.doc(description="Gets suricata packets.")
    @APP_NS.response(200, "List PacketsModel", [PacketsModel.DTO])
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles(roles=METRICS_ROLES)
    @handle_errors
    def get(self) -> Response:
        return get_suricata_packets()


@APP_NS.route("/zeek/packets/remote/<ipaddress>")
class ZeekPacketsRemoteApi(Resource):

    @APP_NS.doc(description="Gets remote zeek packets.")
    @APP_NS.response(200, "List PacketsModel", [PacketsModel.DTO])
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self, ipaddress: str) -> Response:
        return get_zeek_packets_remote(ipaddress)


@APP_NS.route("/suricata/packets/remote/<ipaddress>")
class SuricataPacketsRemoteApi(Resource):

    @APP_NS.doc(description="Gets remote suricata packets.")
    @APP_NS.response(200, "List PacketsModel", [PacketsModel.DTO])
    @APP_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self, ipaddress: str) -> Response:
        return get_suricata_packets_remote(ipaddress)


@HEALTH_NS.route("/metrics")
class MetricsApi(Resource):

    @HEALTH_NS.doc(description="Post Metrics")
    @HEALTH_NS.doc(payload=[MetricsMemoryModel, MetricsRootUsageModel, MetricsDataUsageModel, MetricsCPUPercentModel])
    @HEALTH_NS.response(200, "List MetricsMemoryModel, MetricsRootUsageModel, MetricsDataUsageModel, MetricsCPUPercentModel", [MetricsMemoryModel.DTO, MetricsRootUsageModel.DTO, MetricsDataUsageModel.DTO, MetricsCPUPercentModel.DTO])
    @HEALTH_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @HEALTH_NS.expect([MetricsMemoryModel.DTO, MetricsRootUsageModel.DTO, MetricsDataUsageModel.DTO, MetricsCPUPercentModel.DTO])
    @login_required_roles(["metrics"], all_roles_req=False)
    @handle_errors
    def post(self) -> Response:
        return post_metrics(HEALTH_NS.payload)
