"""
[summary]
"""
from pathlib import Path

from tests.unit import TEST_SAMPLES_DIR


def test_update_docs(client):
    """
    [summary]

    Args:
        client ([type]): [description]
    """
    # Test successful condition
    payload = {
        "upload_file": (
            open(TEST_SAMPLES_DIR + "/v3.6.1_Supplemental_Guide.zip", "rb"),
            "v3.6.1_Supplemental_Guide.zip",
        ),
        "space_name": "THISISCVAH",
    }
    results = client.post(
        "/api/tools/documentation/upload",
        data=payload,
        content_type="multipart/form-data",
    )
    assert results.status_code == 200
    assert Path("/var/www/html/docs/THISISCVAH").exists()

    # Test condition that saves the file in a weird place
    payload = {
        "upload_file": (
            open(TEST_SAMPLES_DIR + "/v3.6.1_Supplemental_Guide.zip", "rb"),
            "v3.6.1_Supplemental_Guide.zip",
        ),
        "space_name": "../../../root/THISISCVAH",
    }
    results = client.post(
        "/api/tools/documentation/upload",
        data=payload,
        content_type="multipart/form-data",
    )
    assert results.status_code == 400
    assert "error_message" in results.json

    # Test null character
    payload = {
        "upload_file": (
            open(TEST_SAMPLES_DIR + "/v3.6.1_Supplemental_Guide.zip", "rb"),
            "v3.6.1_Supplemental_Guide.zip",
        ),
        "space_name": "\x00",
    }
    results = client.post(
        "/api/tools/documentation/upload",
        data=payload,
        content_type="multipart/form-data",
    )
    assert results.status_code == 400
    assert "error_message" in results.json
