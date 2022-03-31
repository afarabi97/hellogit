from tests.unit.static_data.health import nodes_and_pods, zeek_stats


def test_suricata_installed(client, mocker):
    mocker.patch(
        "app.controller.health_controller.get_k8s_app_nodes",
        return_value=nodes_and_pods,
    )
    mocker.patch(
        "app.controller.health_controller.get_suricata_stats", return_value=(0, 0)
    )
    results = client.get("/api/app/suricata/packets")
    assert 200 == results.status_code
    assert len(results.json) == 4


def test_suricata_uninstalled(client, mocker):
    mocker.patch(
        "app.controller.health_controller.get_k8s_app_nodes", return_value=[])
    mocker.patch(
        "app.controller.health_controller.get_suricata_stats", return_value=(0, 0)
    )
    results = client.get("/api/app/suricata/packets")
    assert 200 == results.status_code
    assert len(results.json) == 0


def test_zeek_installed(client, mocker):
    mocker.patch(
        "app.controller.health_controller.get_k8s_app_nodes",
        return_value=nodes_and_pods,
    )
    mocker.patch(
        "app.controller.health_controller.get_zeek_stats", return_value=zeek_stats
    )
    results = client.get("/api/app/zeek/packets")
    assert 200 == results.status_code
    assert len(results.json) == 4


def test_zeek_uninstalled(client, mocker):
    mocker.patch(
        "app.controller.health_controller.get_k8s_app_nodes", return_value=[])
    mocker.patch(
        "app.controller.health_controller.get_zeek_stats", return_value=zeek_stats
    )
    results = client.get("/api/app/zeek/packets")
    assert 200 == results.status_code
    assert len(results.json) == 0
