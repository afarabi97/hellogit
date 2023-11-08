import pytest
import os
from typing import List
from werkzeug.datastructures import FileStorage
from app.persistence import Repo
from app.models.pcap import PcapModel, ReplaySensorModel
from .conftest import FakePcapRepo

from app.service.pcap_service import PCAPService, PCAPServiceResponse, ServiceErrorType, ServiceMsgType, ServiceWarningType, Replayer, TCPReplayer
import io
import re


REGULAR_PCAP_BYTES = b'\xd4\xc3\xb2\xa1\x02\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff\x00\x00\x01\x00\x00\x00'
PCAP_NEXT_GEN_BYTES = b'\n\r\r\n\xc0\x00\x00\x00M<+\x1a\x01\x00\x00\x00\xff\xff\xff\xff\xff\xff\xff\xff'
INVALID_PCAP_BYTES = b'<html><script>alert(TESTING_ALERT_MESSAGE)</script></b></html>\n'

INVALID_PCAP_FILE_NAME = "invalid_pcap_file.pcap"
VALID_PCAP_FILE_NO_EXTENSION_NAME = "valid_pcap_no_extension"
VALID_PCAPNG_FILE_NAME = "valid_pcapng_file.pcapng"
VALID_PCAP_FILE_NAME = "valid_pcap_file.pcap"
UPLOADS_DIR = "uploads"

# ---------------------------------------------------------------------------- #
#                                     Tests                                    #
# ----------------------------------------------------------------------------

# ------------------------------ Pcap Repo Tests ----------------------------- #
@pytest.mark.pcap_repo
def test_pcap_repo_type(pcap_repo, capsys):

    service = PCAPService(pcap_repo)
    repo: FakePcapRepo = service.repo

    with capsys.disabled():
        print(f"\n\n------------ GET PCAP REPO ------------------")
        print(f"Repo: {repo}")
        print(f"Service: {service}")
        print(f"Repo pcaps: {repo.pcaps}")
        assert service.repo is not None, "The repo should not be None"
        assert isinstance(service.repo, Repo), "The repo should be an instance of PcapRepo"

@pytest.mark.pcap_repo
@pytest.mark.parametrize("pcap_name", [
    "wannacry.pcap",
    "2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap",
    "2019-03-06-Flawed-Ammyy-traffic.pcap",
    "2019-09-03-password-protected-Word-doc-pushes-Remcos-RAT.pcap",
    "FAILED_CORRECTLY"
])
def test_get_pcap_by_name(pcap_repo, pcap_name: str, capsys):
    with capsys.disabled():
        service_response: PCAPServiceResponse
        pcap: PcapModel
        service = PCAPService(pcap_repo)
        repo: FakePcapRepo = service.repo
        # pcap_name: str = name

        service_response, pcap = service._get_pcap_from_repo(pcap_name)

        print("\n\n------------ GET PCAP BY NAME ------------------")
        print(f"Name: {pcap_name}")
        print(f"Repo: {repo}")
        print(f"Service: {service}")
        print(f"Repo pcaps: {repo.pcaps}")
        print(f"PCAP: {pcap}")
        print(f"Service response: {service_response}")

        assert isinstance(pcap, PcapModel) if service_response.success else True, "The pcap should be an instance of PcapModel"
        assert True if service_response.success else isinstance(pcap, type(None)), "The pcap should be None"
        assert pcap.name == pcap_name if service_response.success else True, f"The pcap name should be {pcap_name}"

def test_pcap_repo_get_all_hashes(pcap_repo, capsys):
    # sourcery skip: extract-method
    service = PCAPService(pcap_repo)
    repo = service.repo
    hashes = service._get_all_repo_hashes()
    with capsys.disabled():
        print("\n\n------------ GET ALL HASHES ------------------")
        print(f"Repo: {repo}")
        print(f"Service: {service}")
        print(f"Repo pcaps: {repo.pcaps}")
        print(f"Hashes: {hashes}")


        assert hashes is not None, "The hashes should not be None"
        assert isinstance(hashes, list), "The hashes should be a dictionary"
        assert len(hashes) == len(repo.pcaps), f"The hashes should have {len(repo.pcaps)} hashes"

@pytest.mark.parametrize("pcap_file", [VALID_PCAP_FILE_NAME], indirect=True)
def test_sync_directory(tmp_path, pcap_repo, pcap_dict, capsys):
    upload_dir = tmp_path.joinpath(UPLOADS_DIR)
    upload_dir.mkdir(exist_ok=True)

    service = PCAPService(pcap_repo)

    with capsys.disabled():
        print("\n\n------------ ADD PCAP ------------------")
        # print(f"Repo: {service.repo}")
        # print(f"Service: {service}")
        # print(f"Repo pcaps: {service.repo.pcaps}")
        print(f"Repo pcaps length: {len(service.repo.pcaps)}")
        # import pdb; pdb.set_trace()
        # After sync there should be 2 pcaps
        service._sync_directory(pcap_dict["directory"])

        print(f"Repo pcaps: {service.repo.pcaps}")

        assert len(service.repo.pcaps) == 11, "The repo should have 11 pcap"

# ----------------------------- Replay PCAP Tests ----------------------------
@pytest.mark.parametrize("pcap_name", [
    "2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap", "2019-03-06-Flawed-Ammyy-traffic.pcap",
    "wannacry.pcap"
])
def test_get_pcap_from_repo(pcap_repo, pcap_name: str, capsys):
    with capsys.disabled():
        repo: FakePcapRepo = pcap_repo

        pcap: PcapModel
        v: PCAPServiceResponse

        service = PCAPService(repo)
        v, pcap = service._get_pcap_from_repo(pcap_name)

        print(f"\n\n------------ GET PCAP FROM REPO ------------------")
        print(f"Name: {pcap_name}")
        print(f"Repo: {repo}")
        print(f"Service: {service}")
        print(f"Repo pcaps: {repo.pcaps}")
        print(f"PCAP: {pcap}")
        print(f"Service response: {v}")


        assert v is not None, "The service response should not be None"
        assert v.success, "The service response should be successful"
        assert not v.errors, "The service response should not have any errors"

@pytest.mark.parametrize("sensor_name, preserve_timestamp",
                        [
                            ("brandon-sensor1.clarke", True),
                            ("brandon-sensor3.clarke", True),
                            pytest.param(
                                "robottest-sensor.clarke", True,
                                marks=pytest.mark.xfail(reason="This sensor does not have any applications installed."
                            )),
                        ])
def test_get_replayers_from_sensor_name(pcap_repo, sensor_name, preserve_timestamp, capsys):
    # Test that the replayer can get the appropriate replayers for the sensor. Relies on the sensor and pcap being valid.
    replayers: List[Replayer]
    sensor: ReplaySensorModel
    service_response: PCAPServiceResponse = PCAPServiceResponse(name="replay_pcap")

    repo: FakePcapRepo = pcap_repo
    service = PCAPService(repo)

    service_response, sensor = service._get_replay_sensor_by_hostname(sensor_name, service_response)
    replayers = service._get_replayers(sensor, preserve_timestamp)


    assert replayers is not None, "The replayers should not be None"
    assert isinstance(replayers, list), "The replayers should be a list"
    assert len(replayers) == len(sensor.apps) if preserve_timestamp else len(replayers) == 1, "The number of replayers should be equal to the number of apps on the sensor if preserve_timestamp is True, otherwise it should be 1"
    assert all(isinstance(replayer, Replayer) for replayer in replayers), "All replayers should be instances of Replayer"
    assert all(isinstance(replayer, Replayer) for replayer in replayers) if preserve_timestamp else all(isinstance(replayer, TCPReplayer) for replayer in replayers), "All replayers should be instances of TCPReplayer if preserve_timestamp is True, otherwise they should be instances of Replayer"

# ------------------------------ Save PCAP Tests -----------------------------

@pytest.mark.save_pcap
@pytest.mark.parametrize("pcap_file", [VALID_PCAP_FILE_NAME, VALID_PCAPNG_FILE_NAME, INVALID_PCAP_FILE_NAME], indirect=True)
def test_pcap_file_validation(pcap_dict, pcap_repo, capsys):
    details = pcap_dict["details"]
    expected = details["expected"]
    file = details["file"]
    filename: str = file.filename
    data: io.BytesIO = io.BytesIO(details["data"])
    data.name = filename
    data.mode = "r+b"
    service = PCAPService(pcap_repo)
    with capsys.disabled():


        validation_response: PCAPServiceResponse = service._validate_pcap_file(data)
        print(f"\n\n------------ {details['name'].upper()} ------------------")
        print(f"Valid: {validation_response.valid}")
        print(f"Name: {validation_response.name}")
        print(f"Errors ({len(validation_response.errors)}): {validation_response.errors}")
        print(f"Warnings ({len(validation_response.warnings)}): {validation_response.warnings}")
        print("\n\n")

        assert validation_response is not None, "The validation_response should not be None"

        assert isinstance(validation_response.valid, bool), f"Valid is not a boolean. Valid is {validation_response.valid}"
        assert validation_response.valid == expected["valid"], f"Valid is: {validation_response.valid}. The validation_response.valid should be {expected['valid']}"
        assert validation_response.name == expected["name"], f"The name is {validation_response.name} and the name of validation response should be {expected['name']}"
        assert len(validation_response.errors) == len(expected["errors"]), "The errors should be the same length as the expected errors"
        assert len(validation_response.warnings) == len(expected["warnings"]), "The warnings should be the same length as the expected warnings"


    for error in validation_response.errors:
        assert error.type == ServiceMsgType.ERROR, f"Error type {error.type} is not an error"
        assert error.msg_type in [ServiceErrorType.NO_FILE_PROVIDED, ServiceErrorType.INVALID_PCAP_FILE, ServiceErrorType.EOF_ERROR], f"Error msg_type {error.msg_type} is not within the known error message types"
        assert error in expected["errors"], f"Error {error} is not in the expected errors"

    for warning in validation_response.warnings:
        assert warning.type == ServiceMsgType.WARNING, f"Warning type {warning.type} is not a warning"
        assert warning.msg_type in [ServiceWarningType.FILE_EXTENSION_MISSING, ServiceWarningType.INVALID_FILE_EXTENSION, ServiceWarningType.INSECURE_FILE_NAME], f"Warning msg_type {warning.msg_type} is not within the known warning message types"
        assert warning in expected["warnings"], f"Warning {warning} is not in the expected warnings"

@pytest.mark.save_pcap# @pytest.mark.parametrize("pcap_file_type", ["valid_pcap_file", "valid_pcapng_file", "invalid_pcap_file"])
@pytest.mark.parametrize("pcap_file", [VALID_PCAP_FILE_NAME, INVALID_PCAP_FILE_NAME], indirect=True)
def test_pcap_upload(tmp_path, pcap_dict, pcap_repo, capsys):
    with capsys.disabled():
        details = pcap_dict["details"]
        file: FileStorage = details["file"]
        filename = file.filename
        data: bytes = details["data"]
        print(f"FIle: {file}\n")
        print(f"FIle dir: {dir(file)}\n")
        print(f"FIle vars: {vars(file)}\n")
        expected = details["expected"]
        upload_dir = tmp_path.joinpath(UPLOADS_DIR)
        upload_dir.mkdir(exist_ok=True)

        service = PCAPService(pcap_repo)
        service_response: PCAPServiceResponse = service.upload_pcap(filename, data=data, pcap_dir=upload_dir)


        print(f"\n\n------------ {file.filename.upper()} ------------------")
        print(f"Valid: {service_response.valid}")
        print(f"Name: {service_response.name}")
        print(f"Errors ({len(service_response.errors)}): {service_response.errors}")
        print(f"Warnings ({len(service_response.warnings)}): {service_response.warnings}")
        print(f"Listdir: {os.listdir(upload_dir)}\n")
        print("\n\n")
        assert service_response is not None, "The service_response should not be None"
        assert service_response.success == expected["success"], f"Success is: {service_response.success}. The service_response.success should be {expected['success']}"

        assert len(service_response.errors) == len(expected["errors"]), "The errors should be the same length as the expected errors"
        assert len(service_response.warnings) == len(expected["warnings"]), "The warnings should be the same length as the expected warnings"
        assert all(pcap.endswith(('.pcap','.pcapng')) for pcap in os.listdir(upload_dir)), "The upload directory should only have pcaps with the extension .pcap or .pcapng"
        # if the file was invalid then it shouldn't contain it. Otherwise, it should contain it
        assert (file.filename not in os.listdir(upload_dir)) == (not service_response.success), "if you upload an invalid file, it should not be in the upload directory. Otherwise, it should be in the upload directory"

@pytest.mark.save_pcap
@pytest.mark.parametrize("pcap_file", [VALID_PCAP_FILE_NAME, VALID_PCAPNG_FILE_NAME, VALID_PCAP_FILE_NO_EXTENSION_NAME], indirect=True)
def test_get_pcaps_from_dir(pcap_repo, pcap_dict,  capsys):
    # We only need one parameterized test so we can get the directory
    # TODO: Sync and return of the repo
    with capsys.disabled():
        service = PCAPService(pcap_repo)

        pcaps: List[PcapModel]
        mydir = pcap_dict["directory"]
        service_response, pcaps = service.get_pcaps_from_directory(str(mydir), "*.pcap*")
        pattern = rf"{mydir}"
        filtered_list = [pcap for pcap in pcaps if re.search(pattern, pcap.path)]

        print(f"\n\n------------ {mydir} ------------------")
        print(f'List: {os.listdir(mydir)}')
        print(f'Pattern: {pattern}')
        print(f'Filtered list: {filtered_list}')
        print(f'Service response: {service_response}')
        print(f'PCAPS: {pcaps}')
        print(f"Pytest Directory: {pcap_dict['directory']}")
        print(f"Pytest Directory Files: {os.listdir(pcap_dict['directory'])}")
        print("MAKE SURE YOU DOCUMENT THAT ANY PCAP FILE PUT IN THE DIRECTORY MUST HAVE THE EXTENSION .pcap or .pcapng OR IT WILL NOT BE FOUND ON SYNC!!!")

        assert pcaps is not None, "The pcaps should not be None"
        assert service_response is not None, "The service_response should not be None"
        assert service_response.success, "The service_response should be successful"
        # The number of pcaps should equal the number of keys that are dicts in the pcap_dict that have an expected key with the success key set to True
        assert len(filtered_list) == 2, "The number of pcaps added by pytest should be two. One for the pcap and one for the pcapng."
        # assert each pcap ends in either pcapng or pcap
        assert all(pcap.name.endswith(('.pcap', '.pcapng')) for pcap in pcaps), "All pcaps should end with either .pcap or .pcapng"

@pytest.mark.save_pcap
@pytest.mark.parametrize("pcap_file", [VALID_PCAP_FILE_NAME], indirect=True)
def test_delete_pcap(pcap_repo, pcap_dict, capsys):
    with capsys.disabled():
        starting_number_of_pcaps_in_repo = len(pcap_repo.get_all())
        pcap_to_delete = pcap_repo.get_all()[0]
        name = pcap_to_delete.name
        service = PCAPService(pcap_repo)
        mydir = pcap_dict["directory"]
        service_response = service.delete_pcap(name=name, pcap_dir=mydir)
        ending_number_of_pcaps_in_repo = len(pcap_repo.get_all())

        print(f"\n\n------------ {name} ------------------")
        print(f'List: {os.listdir(mydir)}')
        print(f'Service response: {service_response}')
        print(f"Pytest Directory: {pcap_dict['directory']}")
        print(f"Pytest Directory Files: {os.listdir(pcap_dict['directory'])}")

        assert service_response is not None, "The service_response should not be None"
        assert service_response.success, "The service_response should be successful"
        assert starting_number_of_pcaps_in_repo != ending_number_of_pcaps_in_repo, "The number of pcaps in the repo should be different after deleting a pcap"
        assert len(service_response.warnings) == 1, "The service_response should have one warning that the pcap wasn't deleted from the directory because it doesn't exist"
        assert service_response.warnings[0].msg == "The file has already been removed from disk.", "The warning message should be that the file seems to have  already been removed from disk."
