

class KickstartConfiguration():
    """
    Represents a single node object such as a controller, master-server, server, sensor or remote-sensor

    Attributes:
        dhcp_start (str): See frontend help page
        dhcp_end (str): See frontend help page
        gateway (str): See frontend help page
        netmask (str): See frontend help page
    """

    def set_dhcp_start(self, dhcp_start: str) -> None:
        self.dhcp_start = dhcp_start

    def set_dhcp_end(self, dhcp_end: str) -> None:
        self.dhcp_end = dhcp_end

    def set_gateway(self, gateway: str) -> None:
        self.gateway = gateway

    def set_netmask(self, netmask: str) -> None:
        self.netmask = netmask
