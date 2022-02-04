"""This file houses the unit tests for the pcap model module."""
import os

import pytest
from app.models.pcap import PcapModel


@pytest.fixture
def fake_pcap_file(tmp_path):
    """This fixture mocks a fake pcap file."""
    temp_fake_pcap_file = os.path.join(tmp_path, "fake.pcap")
    with open(temp_fake_pcap_file, "x") as f:
        f.writelines("THIS IS A FAKE PCAP FILE")
    return temp_fake_pcap_file


def test_invalid_pcap_file(fake_pcap_file):
    """Tests the validate_file function against a fake pcap."""
    valid = PcapModel.validate_file(fake_pcap_file)
    assert valid is False
