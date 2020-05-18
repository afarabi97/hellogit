from argparse import Namespace, ArgumentParser
from models import Model
from models.kickstart import KickstartSettings
from util.network import IPAddressManager
from randmac import RandMac


class KitSettings(Model):

    def __init__(self):
        super().__init__()
        self.kubernetes_cidr = ''
        self.use_proxy_pool = False

    @staticmethod
    def add_args(parser: ArgumentParser):
        #Function to come
        pass

    def from_kickstart(self, kickstart_settings: KickstartSettings):
       self.kubernetes_cidr = IPAddressManager(kickstart_settings.node_defaults.network_id, kickstart_settings.node_defaults.network_block_index).get_kubernetes_ip_block()
