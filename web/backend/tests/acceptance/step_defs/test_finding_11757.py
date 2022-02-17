"""
Acceptance test files follow the naming convention test_<type>_<ticket>.py. There is a cooresponding
.feature file in the features directory.

"""
import os

from pytest_bdd import given, parsers, scenarios, then, when

scenarios("../features/finding_11757.feature")

REGULAR_PCAP_BYTES = b'\xd4\xc3\xb2\xa1\x02\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff\x00\x00\x01\x00\x00\x00'
PCAP_NEXT_GEN_BYTES = b'\n\r\r\n\xc0\x00\x00\x00M<+\x1a\x01\x00\x00\x00\xff\xff\xff\xff\xff\xff\xff\xff'
INVALID_PCAP_BYTES = b'<html><script>alert(TESTING_ALERT_MESSAGE)</script></b></html>\n'

@given(parsers.parse("I have a {file_type} file that is {valid_or_invalid} and named {upload_file_name}"), target_fixture="pcap_file")
def given_this_file(tmp_path, file_type, valid_or_invalid, upload_file_name):
    pcap_file = os.path.join(tmp_path, upload_file_name)

    if valid_or_invalid == "invalid":
        with open(pcap_file, "wb") as f:
            f.write(INVALID_PCAP_BYTES)
        return pcap_file
    if file_type == "pcap":
        with open(pcap_file, "wb") as f:
            f.write(REGULAR_PCAP_BYTES)
        return pcap_file
    if file_type == "pcapng":
        with open(pcap_file, "wb") as f:
            f.write(PCAP_NEXT_GEN_BYTES)
        return pcap_file


@when("I try to upload the file", target_fixture="response")
def when_i_try_to_upload_the_file(client, pcap_file, upload_file_name):
    assert upload_file_name
    payload = {"upload_file": (open(pcap_file, "rb"), upload_file_name,)}
    response = client.post("/api/policy/pcap/upload",
                           data=payload, content_type="multipart/form-data",)
    return response


@then(parsers.parse("The message must say {message}"))
def then_test_the_message(response, message):
    assert message in response.json.values()


@then(parsers.parse("The status code must be {status_code:d}"))
def then_test_the_status_code(response, status_code):
    print("status_code", status_code)
    assert response.status_code == status_code
