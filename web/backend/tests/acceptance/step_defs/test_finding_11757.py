"""
Acceptance test files follow the naming convention test_<type>_<ticket>.py. There is a cooresponding
.feature file in the features directory.

"""
import os

from pytest_bdd import given, scenarios, then, when

scenarios("../features/finding_11757.feature")


@given("I have a non-pcap file", target_fixture="fake_pcap_file")
def fake_pcap_file(tmp_path):
    temp_fake_pcap_file = os.path.join(tmp_path, "fake.pcap")
    with open(temp_fake_pcap_file, "x") as f:
        f.writelines("THIS IS A FAKE PCAP FILE")
    return temp_fake_pcap_file


@when("I upload the non-pcap file", target_fixture="code")
def get_status_code(client, fake_pcap_file):
    payload = {
        "upload_file": (
            open(fake_pcap_file, "rb"),
            "fake_pcap.pcap",
        )
    }

    return client.post(
        "/api/policy/pcap/upload",
        data=payload,
        content_type="multipart/form-data",
    ).status_code


@then("I should receive a 422 Unprocessable Entity Error")
def response_error(code):
    assert code == 422
