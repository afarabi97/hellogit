from app.models import Model
from scapy.error import Scapy_Exception
from scapy.utils import PcapReader
from werkzeug.utils import secure_filename


class PcapModel(Model):

    @staticmethod
    def validate_file(pcap_file) -> bool:
        try:
            is_valid_pcap = isinstance(PcapReader(pcap_file), PcapReader)
            return is_valid_pcap
        except Scapy_Exception as err:
            return False

    @staticmethod
    def get_secure_filename(filename):
        if not filename.endswith('.pcap'):
            return secure_filename(f"{filename}.pcap")
        return secure_filename(filename)
