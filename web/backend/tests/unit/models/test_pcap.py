"""This file houses the unit tests for the pcap model module."""
import os

import pytest
from app.models.pcap import PcapModel

REGULAR_PCAP_BYTES = b'\xd4\xc3\xb2\xa1\x02\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff\x00\x00\x01\x00\x00\x00'
PCAP_NEXT_GEN_BYTES = b'\n\r\r\n\xc0\x00\x00\x00M<+\x1a\x01\x00\x00\x00\xff\xff\xff\xff\xff\xff\xff\xff'
INVALID_PCAP_BYTES = b'<html><script>alert(TESTING_ALERT_MESSAGE)</script></b></html>\n'

INVALID_PCAP_FILE_NAME = "invalid_pcap_file.pcap"
VALID_PCAP_FILE_NO_EXTENSION_NAME = "valid_pcap_no_extension"
VALID_PCAPNG_FILE_NAME = "valid_pcapng_file.pcap"
VALID_PCAP_FILE_NAME = "valid_pcap_file.pcap"


def write_pcap_to_file(file, data):
    with open(file, "wb") as fp:
        fp.write(data)
    return file


@pytest.fixture
def pcap_dict(tmp_path):
    """This fixture mocks a fake pcap file."""
    invalid_pcap_file = write_pcap_to_file(os.path.join(
        tmp_path, INVALID_PCAP_FILE_NAME), INVALID_PCAP_BYTES)
    valid_pcap_no_extension = write_pcap_to_file(os.path.join(
        tmp_path, VALID_PCAP_FILE_NO_EXTENSION_NAME), REGULAR_PCAP_BYTES)
    valid_pcapng_file = write_pcap_to_file(os.path.join(
        tmp_path, VALID_PCAPNG_FILE_NAME), PCAP_NEXT_GEN_BYTES)
    valid_pcap_file = write_pcap_to_file(os.path.join(
        tmp_path, VALID_PCAP_FILE_NAME), REGULAR_PCAP_BYTES)
    return {
        "invalid_pcap_file": {"file": invalid_pcap_file, "name": INVALID_PCAP_FILE_NAME, "expected_name": INVALID_PCAP_FILE_NAME},
        "valid_pcap_no_extension": {"file": valid_pcap_no_extension, "name": VALID_PCAP_FILE_NO_EXTENSION_NAME, "expected_name": f"{VALID_PCAP_FILE_NO_EXTENSION_NAME}.pcap"},
        "valid_pcapng_file": {"file": valid_pcapng_file, "name": VALID_PCAPNG_FILE_NAME, "expected_name": VALID_PCAPNG_FILE_NAME},
        "valid_pcap_file": {"file": valid_pcap_file, "name": VALID_PCAP_FILE_NAME, "expected_name": VALID_PCAP_FILE_NAME}
    }


def test_invalid_pcap_file(pcap_dict):
    """Tests the validate_file function against a fake pcap."""
    obj = pcap_dict["invalid_pcap_file"]
    pcap_file = obj["file"]
    pcap_name = obj["name"]
    valid = PcapModel.validate_file(pcap_file)
    file_name = PcapModel.get_secure_filename(pcap_name)
    assert file_name == obj["expected_name"]
    assert valid is False


def test_valid_pcap_no_extension(pcap_dict):
    """Tests the validate_file function against a fake pcap."""
    obj = pcap_dict["valid_pcap_no_extension"]
    pcap_file = obj["file"]
    pcap_name = obj["name"]
    valid = PcapModel.validate_file(pcap_file)
    file_name = PcapModel.get_secure_filename(pcap_name)
    assert file_name == obj["expected_name"]
    assert valid is True


def test_valid_pcapng_file(pcap_dict):
    """Tests the validate_file function against a fake pcap."""
    obj = pcap_dict["valid_pcapng_file"]
    pcap_file = obj["file"]
    pcap_name = obj["name"]
    valid = PcapModel.validate_file(pcap_file)
    file_name = PcapModel.get_secure_filename(pcap_name)
    assert file_name == obj["expected_name"]
    assert valid is False


def test_valid_pcap_file(pcap_dict):
    """Tests the validate_file function against a fake pcap."""
    obj = pcap_dict["valid_pcap_file"]
    pcap_file = obj["file"]
    pcap_name = obj["name"]
    valid = PcapModel.validate_file(pcap_file)
    file_name = PcapModel.get_secure_filename(pcap_name)
    assert file_name == obj["expected_name"]
    assert valid is True
