from pathlib import Path
import pytest
import shutil
from scapy.layers.inet import IP, TCP
from typing import Dict, List, Optional
from scapy.utils import wrpcap
import subprocess
from scapy.packet import Raw
from scapy.layers.l2 import Ether
from werkzeug.datastructures import FileStorage
from app.models.pcap import PcapModel, ReplaySensorModel


from app.service.pcap_service import ServiceErrorType, ServiceMsg, ServiceMsgType, ServiceWarningType
from app.persistence import Repo
REGULAR_PCAP_BYTES = b'\xd4\xc3\xb2\xa1\x02\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff\x00\x00\x01\x00\x00\x00'
PCAP_NEXT_GEN_BYTES = b'\n\r\r\n\xc0\x00\x00\x00M<+\x1a\x01\x00\x00\x00\xff\xff\xff\xff\xff\xff\xff\xff'
INVALID_PCAP_BYTES = b'<html><script>alert(TESTING_ALERT_MESSAGE)</script></b></html>\n'

INVALID_PCAP_FILE_NAME = "invalid_pcap_file.pcap"
VALID_PCAP_FILE_NO_EXTENSION_NAME = "valid_pcap_no_extension"
VALID_PCAPNG_FILE_NAME = "valid_pcapng_file.pcapng"
VALID_PCAP_FILE_NAME = "valid_pcap_file.pcap"


@pytest.fixture(scope="session")
def prepare_pcaps(tmp_path_factory):  # use tmpdir_factory for session-scoped fixture
    """Fixture to set up all PCAP files prior to the execution of tests."""
    pcap_dir = tmp_path_factory.mktemp("pcap_dir", numbered=False)
    filenames = [VALID_PCAP_FILE_NAME, VALID_PCAPNG_FILE_NAME,
                 VALID_PCAP_FILE_NO_EXTENSION_NAME, INVALID_PCAP_FILE_NAME]

    for pcap_file_name in filenames:
        filename = pcap_dir.joinpath(pcap_file_name)

        if "invalid" in pcap_file_name:
            with open(str(filename), "wb") as f:
                f.write(
                    b'<html><script>alert(TESTING_ALERT_MESSAGE)</script></b></html>\n')
        else:

            num_of_packets = 20
            increment_seconds = 100
            packets = [
                Ether() /
                IP(dst=f"10.0.0.{i % 254 + 1}") /
                TCP(dport=80) /
                Raw(load=f"Packet {i}")
                for i in range(1, num_of_packets + 1)
            ]
            timestamps = [1633000000.000000 + i *
                          increment_seconds for i in range(num_of_packets)]
            for packet, ts in zip(packets, timestamps):
                packet.time = ts

            wrpcap(str(filename), packets)

            if Path(filename).suffix.lower() == ".pcapng":
                path_filename = Path(str(filename))
                temp_filename = path_filename.with_name(
                    f"{path_filename.stem}_temp{path_filename.suffix}")
                # Define a temporary filename
                # temp_filename = filename.with_name(f"{filename.stem}_temp{filename.suffix}")
                # Use subprocess to call editcap for converting the file
                try:
                    subprocess.run(
                        ["editcap", "-F", "pcapng", str(filename), str(temp_filename)], check=True)
                except subprocess.CalledProcessError as e:
                    print(
                        f"An error occurred during conversion with editcap: {str(e)}")
                    return
                except FileNotFoundError:
                    print(
                        "editcap is not found. Ensure it is installed and available in the system's PATH.")
                    return
                # Copy the modified file back to the original filename
                shutil.copy2(str(temp_filename), str(filename))
                # Optionally, remove the temporary file
                temp_filename.unlink()

    return Path(str(pcap_dir))  # return the directory containing all pcaps


@pytest.fixture
def pcap_file(request, prepare_pcaps):  # use prepare_pcaps as a dependency
    """Fixture to provide individual PCAP file based on parameter."""
    pcap_file_name = request.param
    filename = prepare_pcaps.joinpath(pcap_file_name)
    with open(str(filename), "rb") as f:
        yield FileStorage(f, filename=filename.name)


@pytest.fixture
def pcap_dict(pcap_file):
    # """This fixture mocks a fake pcap file."""
    # valid_pcap_file= sample_pcap(tmpdir, VALID_PCAP_FILE_NAME)
    # # valid_pcap_file = write_pcap_to_file(tmpdir, VALID_PCAP_FILE_NAME, REGULAR_PCAP_BYTES)
    # valid_pcapng_file = sample_pcap(tmpdir, VALID_PCAPNG_FILE_NAME)
    # # valid_pcapng_file = write_pcap_to_file(tmpdir, VALID_PCAPNG_FILE_NAME, PCAP_NEXT_GEN_BYTES)
    # valid_pcap_no_extension = sample_pcap(tmpdir, VALID_PCAP_FILE_NO_EXTENSION_NAME)
    # invalid_pcap_file = write_pcap_to_file(tmpdir, INVALID_PCAP_FILE_NAME, INVALID_PCAP_BYTES)
    is_valid_pcap = pcap_file.filename in [
        VALID_PCAP_FILE_NAME,
        VALID_PCAPNG_FILE_NAME,
        VALID_PCAP_FILE_NO_EXTENSION_NAME,
    ]
    errors: List[ServiceMsg] = []
    warnings: List[ServiceMsg] = []

    if pcap_file.filename == VALID_PCAPNG_FILE_NAME:
        errors = []
        warnings = [ServiceMsg(type=ServiceMsgType.WARNING, msg="The file does not have a .pcap extension.",
                               msg_type=ServiceWarningType.INVALID_FILE_EXTENSION)]
    elif pcap_file.filename == INVALID_PCAP_FILE_NAME:
        errors = [ServiceMsg(type=ServiceMsgType.ERROR, msg="The file is not a supported capture file.",
                             msg_type=ServiceErrorType.INVALID_PCAP_FILE)]
        warnings = []

    yield {
        "directory": Path(pcap_file.stream.name).parent,
        "details": {
            "file": pcap_file,
            "data": pcap_file.stream.read(),
            "name": pcap_file.filename,
            "directory": Path(pcap_file.stream.name).parent,
            "expected": {
                "success": is_valid_pcap,
                "name": pcap_file.filename,
                "valid": is_valid_pcap,
                "errors": errors,
                "warnings": warnings,
            },
        },
    }


@pytest.fixture(scope="function")
def pcap_repo() -> Repo:
    return FakePcapRepo()


class FakePcapRepo(Repo):

    def __init__(self):
        super().__init__()
        pcaps = [
            {
                "name": "2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap",
                "size": 7639515,
                "path": "/var/www/html/pcaps/2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap",
                "sha256": "89687b5d606ba818f0a100e92c9e48641aacfcb32c2c122c5d3002cfa1802cb7",
                "created_date": "2023-10-05 06:09:43",
                "first_packet_date": "2018-09-06 01:17:50",
                "last_packet_date": "2018-09-06 01:36:28"
            },
            {
                "name": "2019-03-06-Flawed-Ammyy-traffic.pcap",
                "size": 4610405,
                "path": "/var/www/html/pcaps/2019-03-06-Flawed-Ammyy-traffic.pcap",
                "sha256": "19ce2fb46685b832cda2225e0599c4492dfb2ffb48eba7848f8300b15a8e15e3",
                "created_date": "2023-10-05 06:09:43",
                "first_packet_date": "2019-03-06 01:58:23",
                "last_packet_date": "2019-03-06 10:08:48"
            },
            {
                "name": "2019-05-01-password-protected-doc-infection-traffic.pcap",
                "size": 6992374,
                "path": "/var/www/html/pcaps/2019-05-01-password-protected-doc-infection-traffic.pcap",
                "sha256": "d2f4cc20ff022366938755b15a230eb2d8ec43c3cab8dfdb78356c4eb13126e7",
                "created_date": "2023-10-05 06:09:44",
                "first_packet_date": "2019-05-01 02:57:28",
                "last_packet_date": "2019-05-01 03:15:25"
            },
            {
                "name": "2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap",
                "size": 3335658,
                "path": "/var/www/html/pcaps/2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap",
                "sha256": "b50612f71b0b1e61419ed457024d0ac65d827989b7e02db7eb05224071776fd6",
                "created_date": "2023-10-05 06:09:44",
                "first_packet_date": "2019-07-09 18:21:14",
                "last_packet_date": "2019-07-09 20:15:26"
            },
            {
                "name": "2019-08-12-Rig-EK-sends-MedusaHTTP-malware.pcap",
                "size": 743725,
                "path": "/var/www/html/pcaps/2019-08-12-Rig-EK-sends-MedusaHTTP-malware.pcap",
                "sha256": "6c111fcab4b320174aae040f5fef894a310b0ee23d505d7ba8dc50d5b8ef2994",
                "created_date": "2023-10-05 06:09:45",
                "first_packet_date": "2019-08-12 20:57:47",
                "last_packet_date": "2019-08-12 22:02:50"
            },
            {
                "name": "2019-09-03-password-protected-Word-doc-pushes-Remcos-RAT.pcap",
                "size": 1274254,
                "path": "/var/www/html/pcaps/2019-09-03-password-protected-Word-doc-pushes-Remcos-RAT.pcap",
                "sha256": "df2b7f722a207d993100aff1dfe4a7bf7ad85139f867dfd99b76cd7e46b101af",
                "created_date": "2023-10-05 06:09:45",
                "first_packet_date": "2019-09-03 19:15:36",
                "last_packet_date": "2019-09-03 20:24:55"
            },
            {
                "name": "smb1_transaction_request.pcap",
                "size": 1731,
                "path": "/var/www/html/pcaps/smb1_transaction_request.pcap",
                "sha256": "cf4a530bf6a6dddc89b1d8f4c140533df1e95d0762d10936c9d4b0d943000d75",
                "created_date": "2023-10-05 06:09:47",
                "first_packet_date": "2018-01-12 10:09:33",
                "last_packet_date": "2018-01-12 10:09:34"
            },
            {
                "name": "wannacry.pcap",
                "size": 37791327,
                "path": "/var/www/html/pcaps/wannacry.pcap",
                "sha256": "feb8befd8d6891511bd00471d153a2bf8d57d022e1d81e00755941b872fdc355",
                "created_date": "2023-10-05 06:09:46",
                "first_packet_date": "2017-05-18 08:06:10",
                "last_packet_date": "2017-05-18 08:17:46"
            },
            {
                "name": "zeek_it_intel.pcap",
                "size": 3705075,
                "path": "/var/www/html/pcaps/zeek_it_intel.pcap",
                "sha256": "1b42b4221a61f54e4be888035089f71ece2ead11b4105ab9fd9df65171b1b06c",
                "created_date": "2023-10-05 06:09:48",
                "first_packet_date": "2021-03-02 15:36:42",
                "last_packet_date": "2021-03-02 15:36:56"
            }
        ]
        self.pcaps = [PcapModel(**pcap) for pcap in pcaps]
        self.sensors = [
            ReplaySensorModel(
                hostname="brandon-sensor1.clarke",
                ip="10.40.18.70",
                interfaces=["ens224"],
                username="root",
                password="password",
                apps=["arkime", "suricata", "zeek"]
            ),
            ReplaySensorModel(
                hostname="robottest-sensor.clarke",
                ip="10.40.18.50",
                interfaces=["ens34"],
                username="root",
                password="password",
                apps=[]
            ),
            ReplaySensorModel(
                hostname="brandon-sensor3.clarke",
                ip="10.40.18.93",
                interfaces=["ens224"],
                username="root",
                password="password",
                apps=["suricata", "zeek"]
            )

        ]

    def add(self, model: PcapModel) -> PcapModel:
        self.pcaps.append(model)

    def get(self, _id: str) -> PcapModel:
        return next((pcap for pcap in self.pcaps if pcap._id == _id), None)

    def get_by_key(self, key: str, value: str) -> PcapModel:
        # return next((pcap for pcap in self.pcaps if getattr(pcap, key) == value), None)
        return next((pcap for pcap in self.pcaps if pcap.to_dict()[key] == value), None)

    def remove(self, _id: str) -> None:
        self.pcaps = [pcap for pcap in self.pcaps if pcap._id != _id]

    def get_all(self) -> List[PcapModel]:
        return self.pcaps

    def get_replay_sensor(self, hostname: str) -> ReplaySensorModel:
        return next((sensor for sensor in self.sensors if sensor.hostname == hostname), None)

    def _create_index(self, index: Dict):
        pass

    def _find(self,key: Optional[str] = None, value: Optional[str] = None):
        # doc = self._find_doc(key, value)
        return next((pcap for pcap in self.pcaps if pcap.to_dict()[key] == value), None)
