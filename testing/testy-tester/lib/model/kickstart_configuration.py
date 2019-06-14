

class KickstartConfiguration():
    """
    Represents a single node object such as a controller, master_server, server, sensor or remote-sensor

    Attributes:    
        gateway (str): See frontend help page
        netmask (str): See frontend help page
    """
    
    def set_gateway(self, gateway: str) -> None:
        self.gateway = gateway

    def set_netmask(self, netmask: str) -> None:
        self.netmask = netmask
