

def test_used_ip_address(client, mocker):
    mocker.patch(
        "app.controller.common_controller._nmap_scan",
        return_value=["10.40.12.12", "10.40.12.13"],
    )
    ip_or_network_id = "10.40.12.0"
    netmask = "255.255.255.0"
    results = client.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 200
    assert len(results.json) > 0


def test_used_ip_address_failure_cases(client):
    # Test invalid netmask
    ip_or_network_id = "10.40.12.0"
    netmask = "255.25255.0"
    results = client.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid Netmask Error" == results.json["message"]

    # Test invalid ip address
    ip_or_network_id = "10.40.12"
    netmask = "255.255.255.0"
    results = client.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid IP Address Error" == results.json["message"]

    # Test command injection
    ip_or_network_id = "10.40.12.0%3Bip%20addr%3B"
    netmask = "255.255.255.0"
    results = client.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid IP Address Error" == results.json["message"]

    ip_or_network_id = "10.40.12.0"
    netmask = "10.40.12.0%3Bip%20addr%3B"
    results = client.get(f"/api/used-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid Netmask Error" == results.json["message"]


def test_unused_ip_address(client, mocker):
    # Test successful condition
    mocker.patch(
        "app.controller.common_controller._nmap_scan",
        return_value=["10.40.12.12", "10.40.12.13"],
    )
    ip_or_network_id = "10.40.12.0"
    netmask = "255.255.255.0"
    results = client.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 200
    assert len(results.json) > 0


def test_unused_ip_address_failure_cases(client):
    # Test invalid netmask
    ip_or_network_id = "10.40.12.0"
    netmask = "255.25255.0"
    results = client.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid Netmask Error" == results.json["error_message"]

    # Test invalid ip address
    ip_or_network_id = "10.40.12"
    netmask = "255.255.255.0"
    results = client.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid IP Address Error" == results.json["error_message"]

    # Test command injection
    ip_or_network_id = "10.40.12.0%3Bip%20addr%3B"
    netmask = "255.255.255.0"
    results = client.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid IP Address Error" == results.json["error_message"]

    ip_or_network_id = "10.40.12.0"
    netmask = "10.40.12.0%3Bip%20addr%3B"
    results = client.get(f"/api/unused-ip-addrs/{ip_or_network_id}/{netmask}")
    assert results.status_code == 500
    assert "Invalid Netmask Error" == results.json["error_message"]
