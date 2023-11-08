from app.common import NO_CONTENT, OK_RESPONSE
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.static_data.health import (datastores, elastic_rejects,
                                           metrics_cpu_percentage_model,
                                           metrics_data_usage_model,
                                           metrics_memory_model,
                                           metrics_root_usage_model, node_name,
                                           node_or_pod, node_status,
                                           pod_inform, pod_logs, pod_status,
                                           remote_agent_ip, suricata_packets,
                                           token_id, zeek_packets)
from tests.unit.utils.mock_object_variable_tester import \
    json_object_key_value_checker

# Test DescribePodApi

def test_get_pod_describe_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pod_describe", return_value=node_or_pod)
    response = client.get(f'api/kubernetes/pod/describe/{pod_inform["podName"]}/{pod_inform["namespace"]}')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, node_or_pod) == True


def test_get_pod_describe_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pod_describe", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/kubernetes/pod/describe/{pod_inform["podName"]}/{pod_inform["namespace"]}')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test PodLogsApi

def test_get_pod_logs_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pod_logs", return_value=pod_logs)
    response = client.get(f'api/kubernetes/pod/logs/{pod_inform["podName"]}/{pod_inform["namespace"]}')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, pod_logs) == True


def test_get_pod_logs_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pod_logs", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/kubernetes/pod/logs/{pod_inform["podName"]}/{pod_inform["namespace"]}')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test DescribeNodeApi

def test_get_describe_node_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_describe_node", return_value=node_or_pod)
    response = client.get(f'api/kubernetes/node/describe/{node_name["node_name"]}')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json, node_or_pod) == True


def test_get_describe_node_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_describe_node", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/kubernetes/node/describe/{node_name["node_name"]}')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test NodesStatusApi

def test_get_nodes_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_nodes_statuses", return_value=node_status)
    response = client.get("api/kubernetes/nodes/status")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], node_status[0]) == True


def test_get_nodes_status_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_nodes_statuses", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/kubernetes/nodes/status")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test PodsStatusApi

def test_get_pods_statuses_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pods_statuses", return_value=pod_status)
    response = client.get("api/kubernetes/pods/status")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], pod_status[0]) == True


def test_get_pods_statuses_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pods_statuses", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/kubernetes/pods/status")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RemoteNodesStatusApi

def test_get_remote_nodes_status_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_nodes_status_remote", return_value=node_status)
    response = client.get(f'api/kubernetes/remote/{token_id}/nodes/status')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], node_status[0]) == True


def test_get_remote_nodes_status_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_nodes_status_remote", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/kubernetes/remote/{token_id}/nodes/status')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RemotePodsStatusApi

def test_get_pods_status_remote_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pods_status_remote", return_value=pod_status)
    response = client.get(f'api/kubernetes/remote/{token_id}/pods/status')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], pod_status[0]) == True


def test_get_pods_status_remote_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_pods_status_remote", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/kubernetes/remote/{token_id}/pods/status')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test RemoteAgentApi

def test_post_remote_agent_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.post_remote_agent", return_value=OK_RESPONSE)
    response = client.post("api/health/remote/agent", json="Test String")
    assert response.status_code == 200


def test_post_remote_agent_204(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.post_remote_agent", return_value=NO_CONTENT)
    response = client.post("api/health/remote/agent", json="Test String")
    assert response.status_code == 204


def test_post_remote_agent_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.post_remote_agent", side_effect=Exception({"error": "mocked error"}))
    response = client.post('api/health/remote/agent', json="Test String")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test DatastoresApi

def test_get_datastores_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_datastores", return_value=datastores)
    response = client.get("api/health/datastores")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], datastores[0])


def test_get_datastores_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_datastores", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/health/datastores")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test ElasticserchRejectsApi

def test_get_elasticsearch_rejects_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_elasticsearch_rejects", return_value=elastic_rejects)
    response = client.get("api/app/elasticsearch/rejects")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], elastic_rejects[0]) == True


def test_get_elasticsearch_rejects_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_elasticsearch_rejects", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/app/elasticsearch/rejects")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test ElasticsearchRejectsRemoteApi

def test_get_elasticsearch_rejects_remote_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_elasticsearch_rejects_remote", return_value=elastic_rejects)
    response = client.get(f'api/app/elasticsearch/rejects/remote/{remote_agent_ip}')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], elastic_rejects[0]) == True


def test_get_elasticsearch_rejects_remote_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_elasticsearch_rejects_remote", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/app/elasticsearch/rejects/remote/{remote_agent_ip}')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test ZeekPacketsApi

def test_get_zeek_packets_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_zeek_packets", return_value=zeek_packets)
    response = client.get("api/app/zeek/packets")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], zeek_packets[0]) == True


def test_get_zeek_packets_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_zeek_packets", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/app/zeek/packets")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test SuricataPacketsAPi

def test_get_suricata_packets_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_suricata_packets", return_value=suricata_packets)
    response = client.get("api/app/suricata/packets")
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], suricata_packets[0]) == True


def test_get_suricata_packets_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_suricata_packets", side_effect=Exception({"error": "mocked error"}))
    response = client.get("api/app/suricata/packets")
    assert response.status_code == 500
    assert response.json["error_message"]


# Test ZeekPacketsRemoteApi

def test_get_zeek_packets_remote_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_zeek_packets_remote", return_value=zeek_packets)
    response = client.get(f'api/app/zeek/packets/remote/{remote_agent_ip}')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], zeek_packets[0]) == True


def test_get_zeek_packets_remote_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_zeek_packets_remote", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/app/zeek/packets/remote/{remote_agent_ip}')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test SuricataPacketsRemoteAPi

def test_get_suricata_packets_remote_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_suricata_packets_remote", return_value=suricata_packets)
    response = client.get(f'api/app/suricata/packets/remote/{remote_agent_ip}')
    assert response.status_code == 200
    assert json_object_key_value_checker(response.json[0], suricata_packets[0]) == True


def test_get_suricata_packets_remote_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.health_controller.get_suricata_packets_remote", side_effect=Exception({"error": "mocked error"}))
    response = client.get(f'api/app/suricata/packets/remote/{remote_agent_ip}')
    assert response.status_code == 500
    assert response.json["error_message"]


# Test MetricsApi

def test_post_metrics_200(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_metric = [metrics_memory_model, metrics_root_usage_model, metrics_data_usage_model, metrics_cpu_percentage_model]
    mocker.patch("app.controller.health_controller.post_metrics", return_value=mock_metric)
    response = client.post("api/health/metrics", json=mock_metric)
    assert response.status_code == 200
    assert len(response.json) == len(mock_metric)


def test_post_metrics_500(client: FlaskClient, mocker: MockerFixture) -> None:
    mock_metric = [metrics_memory_model, metrics_root_usage_model, metrics_data_usage_model, metrics_cpu_percentage_model]
    mocker.patch("app.controller.health_controller.post_metrics", side_effect=Exception({"error": "mocked error"}))
    response = client.post("api/health/metrics", json=mock_metric)
    assert response.status_code == 500
    assert response.json["error_message"]
