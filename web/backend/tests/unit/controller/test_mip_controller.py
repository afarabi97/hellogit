from pytest_mock.plugin import MockerFixture

sample_configuration_2 = {"hostname": "miperest"}
sample_configuration_3 = {"hostname": "tester", "ip_address": "10.40.20.40", "deployment_type": "Baremetal"}

sample_configuration_1 = {"hostname": "miper", "ip_address": "10.40.20.4",
                          "mac_address": None, "deployment_type": "Virtual", "virtual_cpu": 8, "virtual_mem": 8, "virtual_os": 500}
sample_configuration_4 = {"hostname": "miper", "ip_address": "10.40.20.5", "mac_address": "66:5b:4e:c8:c6:f4",
                          "pxe_type": "SCSI/SATA/USB", "deployment_type": "Baremetal", "virtual_cpu": 8, "virtual_mem": 8, "virtual_os": 500}
# hostname
# ip_address (for now)
# static or dhcp (later)
#   ip_address if static
# deployment_type
# if baremetal
#   mac_address
# else if virtual
#   virtual_cpu
#   virtual_memory
#   virtual_os

def test_create_mip(client, mocker: MockerFixture):
    mocker.patch("app.models.nodes.Node._set_hostname",
                 retrun_value="miper.test")
    mocker.patch(
        "app.controller.mip_controller.add_mip_to_database", return_value={})
    mocker.patch("app.controller.mip_controller.deploy_mip",
                 return_value="success")
    results = client.post("/api/kit/mip", json=sample_configuration_1)
    assert results.status_code == 202
    results = client.post("/api/kit/mip", json=sample_configuration_2)
    assert results.status_code == 400


def test_should_return_202_with_valid_hostname_and_ip_and_deployment_type(client, mocker: MockerFixture):
    mocker.patch("app.models.nodes.Node._set_hostname",
                 retrun_value="miper.test")
    mocker.patch(
        "app.controller.mip_controller.add_mip_to_database", return_value={})
    mocker.patch("app.controller.mip_controller.deploy_mip",
                 return_value="success")
    results = client.post("/api/kit/mip", json=sample_configuration_3)
    assert results.status_code == 202
