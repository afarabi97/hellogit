class HostConfiguration(object):
    """
    Represents a single node object such as a controller, master_server, server, sensor or remote-sensor

    Attributes:
        dhcp_start (str): See frontend help page
        dhcp_end (str): See frontend help page
        gateway (str): See frontend help page
        netmask (str): See frontend help page
    """

    def __init__(self, ip_address: str, cluster_name: str, datacenter: str, username: str, password: str, iso_folder_path: str) -> None:
        self.ip_address = ip_address
        self.cluster_name = cluster_name
        self.datacenter = datacenter
        self.username = username
        self.password = password
        self.iso_folder_path = iso_folder_path
        self.storage_datastore = None
        self.storage_folder = None
         

    def set_storage_options(self, datastore: str, folder: str) -> None:
        """
        Sets the node storage options

        :param datastore:
        :param folder:
        :return:
        """
        
        self.storage_datastore = datastore
        self.storage_folder = folder
