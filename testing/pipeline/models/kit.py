from argparse import Namespace, ArgumentParser
from models import Model
from models.common import VCenterSettings
from util.network import IPAddressManager
from typing import Dict


class KitSettingsDef(Model):
    def __init__(self):
        self.domain = ''
        self.password = ''
        self.controller_interface = ''
        self.netmask = ''
        self.gateway = ''
        self.upstream_dns = ''
        self.upstream_ntp = ''
        self.kubernetes_services_cidr = ''
        self.dhcp_range = ''

        # Everything below is not part of the vmware settings api payload
        self.network_id = ''
        self.network_block_index = 0

    def from_namespace(self, namespace: Namespace, ctrl_ip_override: str=None):
        self.network_block_index = namespace.network_block_index
        self.domain = namespace.domain
        self.network_id = namespace.network_id
        self.upstream_dns = namespace.upstream_dns
        self.upstream_ntp = namespace.upstream_ntp
        if ctrl_ip_override:
            self.controller_interface = ctrl_ip_override
        else:
            self.controller_interface = IPAddressManager(self.network_id, self.network_block_index).get_controller_ip_address()
        self.dhcp_range = IPAddressManager(self.network_id, self.network_block_index).get_dhcp_ip_block()
        self.netmask = namespace.netmask
        self.password = self.b64decode_string(namespace.password)
        self.gateway = namespace.gateway
        self.kubernetes_services_cidr = IPAddressManager(self.network_id, self.network_block_index).get_kubernetes_ip_block()

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--upstream-dns', dest='upstream_dns', help="Set an upstream dns server ip")
        parser.add_argument('--upstream-ntp', dest='upstream_ntp', help="Set an upstream ntp server ip")
        parser.add_argument("--gateway", dest="gateway", help="The gateway ipaddress for the VM.", required=True)
        parser.add_argument("--netmask", dest="netmask", help="The network netmask needed for setting the management interface.", default="255.255.255.0")
        parser.add_argument("--network-id", dest="network_id", help="The network ID the application will be selecting IPs from.", required=True)
        parser.add_argument("--network-block-index", dest="network_block_index",
                            help="The network block index to use. If left as default it will default to 1 which uses 64 as the last octet. [64, 128, 192]",
                            default=0, choices=range(0, 3), type=int)
        parser.add_argument('--domain', dest='domain', required=False, help="The kit domain", default="lan")
        parser.add_argument("--kit-password", dest="password", help="The root password of the VMs after it is cloned.", required=True)

class KitSettingsV2(Model):

    def __init__(self):
        super().__init__()
        self.vcenter = VCenterSettings()
        self.settings = KitSettingsDef()

    def from_namespace(self, namespace: Namespace, ctrl_ip_override: str=None):
        self.vcenter.from_namespace(namespace)
        self.settings.from_namespace(namespace, ctrl_ip_override)

    @staticmethod
    def add_args(parser: ArgumentParser):
        VCenterSettings.add_args(parser)
        KitSettingsDef.add_args(parser)

    def to_vmware_settings_api_payload(self) -> Dict:
        is_vcenter = self.vcenter.datacenter is not None
        return {
            "ip_address": self.vcenter.ipaddress,
            "username": self.vcenter.username,
            "password": self.vcenter.password,
            "datastore": self.vcenter.datastore,
            "folder": self.vcenter.folder,
            "portgroup": self.vcenter.portgroup,
            "datacenter": self.vcenter.datacenter,
            "cluster": self.vcenter.cluster,
            "vcenter": is_vcenter
        }

    def to_general_settings_api_payload(self) -> Dict:
        return {"domain": self.settings.domain,
                "controller_interface": self.settings.controller_interface,
                "netmask": self.settings.netmask,
                "gateway": self.settings.gateway,
                "dhcp_range": self.settings.dhcp_range}

    def to_kit_settings_api_payload(self) -> Dict:
        return {"password": self.settings.password,
                "upstream_dns": self.settings.upstream_dns,
                "upstream_ntp": self.settings.upstream_ntp,
                "kubernetes_services_cidr": self.settings.kubernetes_services_cidr}

    def to_mip_settings_api_payload(self) -> Dict:
        return {"password": self.settings.password,
                "user_password": self.settings.password,
                "luks_password": self.settings.password}
