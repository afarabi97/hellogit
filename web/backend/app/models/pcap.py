from app.models import Model
from scapy.utils import  PcapNgReader
from scapy.error import Scapy_Exception

class PcapModel(Model):

    @staticmethod
    def validate_file(pcap_file) -> bool:
        try:
            PcapNgReader(pcap_file)
        except Scapy_Exception as err:
            return False
        else:
            return True
