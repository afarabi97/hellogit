from argparse import Namespace, ArgumentParser
from models import Model
from models.kickstart import KickstartSettings, HwKickstartSettings
from util.network import IPAddressManager
from randmac import RandMac


class KitSettings(Model):

    def __init__(self):
        super().__init__()
        self.kubernetes_cidr = ''

    @staticmethod
    def add_args(parser: ArgumentParser):
        #Function to come
        pass

    def from_kickstart(self, kickstart_settings: KickstartSettings):
       self.kubernetes_cidr = IPAddressManager(kickstart_settings.node_defaults.network_id,
                                                kickstart_settings.node_defaults.network_block_index).get_kubernetes_ip_block()

class HwKitSettings(Model):

    def __init__(self):
        super().__init__()
        self.kubernetes_cidr = ''

    def from_kickstart(self, hwkickstart_settings: HwKickstartSettings):
        ip_base = '.'.join(hwkickstart_settings.dhcp_ip_block.split('.')[:-1])
        self.kubernetes_cidr = '{}.112'.format(ip_base)
