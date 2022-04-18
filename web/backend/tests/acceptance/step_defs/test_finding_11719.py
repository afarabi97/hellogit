import json
from ipaddress import ip_address
from time import sleep

from pytest import fixture
from pytest_bdd import given, scenarios, then, when

scenarios("../features/finding_11719.feature")


@fixture
def mip(ctrl_ip):
    mip = {"hostname": "miper22", "ip_address": "", "mac_address": None, "pxe_type": None,
           "deployment_type": "Virtual", "virtual_cpu": 8, "virtual_mem": 8, "virtual_os": 500}
    mip["ip_address"] = str(ip_address(ctrl_ip) - 22)
    return mip


@given("A virtual provisioning MIP")
def given_MIP(mip, real_client):
    # depoy a mip
    real_client.post('/api/kit/mip', json=mip)

    # wait for it to reach the provision stage
    next = False
    while (True):
        response = real_client.get("/api/kit/node/miper22").data
        data = json.loads(response)
        for job in data['jobs']:
            if job['name'] == 'provision' and job['inprogress']:
                next = True
        if next:
            break
        else:
            sleep(10)


@when("I delete the MIP")
def when_i_delete_mip(real_client):
    real_client.delete('/api/kit/node/miper22')

@then("the MIP is not found on the ESXI server")
def then_no_mip(real_client):
    for x in range(30):
        response = real_client.get('/api/kit/node/miper22')
        status_code = response.status_code
        if status_code == 404:
            assert True
            return 0
        else:
            sleep(10)
    assert False
