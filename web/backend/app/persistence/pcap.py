from typing import Dict, List, Optional, Union
from . import MongoRepo, DBModelNotFound
from app.models.pcap import PcapModel, ReplayPCAPModel, ReplaySensorModel



class PcapRepo(MongoRepo):
    """
    The `PcapRepo` class represents a repository for managing pcap documents in MongoDB.
    These documents are used to store information about pcaps that have been uploaded to the system.

    See `PcapModel` for more information about the structure of these documents.
    See `PcapService` for more information about the operations that can be performed on these documents.

    Methods:
        __init__(): Initializes a `PcapRepo` object and creates the necessary indexes.
        _find(key, val): Finds document(s) in the collection based on the specified key-value pair and returns it as a `PcapModel` object or a list of `PcapModel` objects.
        get_replay_sensor(replay_input): Gets a replay sensor by using the hostname from the provided `ReplayPCAPModel` object or string.

    Raises:
        DBModelNotFound: Raised when no document is found matching the specified key-value pair.
    """

    def __init__(self) -> None:
        super().__init__("pcaps")
        self._indexes = [
            {'keys':[("sha256", 1)], 'unique': True},
            {'keys':[("name", 1)], 'unique': True},
            {'keys':[("path", 1)], 'unique': True}
        ]
        self.initialize_indexes()

    def _find(self, key: Optional[str] = None, val: Optional[str] = None) -> Union[PcapModel, List[PcapModel]]:
        """
        Finds document(s) in the collection based on the specified key-value pair and returns it as a `PcapModel` object or a list of `PcapModel` objects.

        Args:
            key: The key to search for in the document.
            val: The value to match against the specified key.

        Returns:
            A `PcapModel` object or a list of `PcapModel` objects.

        Raises:
            DBModelNotFound: Raised when no document is found matching the specified key-value pair.
        """
        doc = self._find_doc(key, val)
        return PcapModel(**doc) if isinstance(doc, dict) else [PcapModel(**_doc) for _doc in doc]

    def get_replay_sensor(self, replay_input: Union[ReplayPCAPModel, str]) -> ReplaySensorModel:
        """
        Gets a replay sensor by using the hostname from the provided `ReplayPCAPModel` object or string.

        Returns a `ReplaySensorModel` object representing the replay sensor, including information such as:
            installed applications, IP address, hostname, network interfaces, and encoded/decoded password.

        If the `ReplayPCAPModel` object does not specify interfaces, the sensor's interfaces will not be returned, as they only matter if `preserve_timestamp` is set to false.

        Args:
            replay_input (Union[ReplayPCAPModel, str]): The `ReplayPCAPModel` object or hostname string.

        Raises:
            DBModelNotFound: Raised when no document is found matching the specified key-value pair.

        Returns:
            ReplaySensorModel: A `ReplaySensorModel` object representing the replay sensor.
        """

        hostname = replay_input.sensor_hostname if isinstance(replay_input, ReplayPCAPModel) else replay_input
        ifaces = replay_input.ifaces if isinstance(replay_input, ReplayPCAPModel) and replay_input.ifaces else []
        sensor_node = self.database.nodes.find_one({"hostname": hostname})
        if not sensor_node:
            raise DBModelNotFound(f"Could not find a sensor with hostname {hostname}")
        kitinfo = self.database.settings.find_one({"_id": "kit_settings_form"}, {"_id":0, "password": 1})
        sensor_app_data = self.database.catalog_saved_values.aggregate(
            [
                {"$lookup":{"from": "nodes","localField": "values.node_hostname","foreignField": "hostname","as": "node"}},
                {"$match":{"node.node_type": "Sensor", "node.hostname": hostname}},
                {"$project":{"_id": "$node._id","application": 1,"deployment_name": 1,"values.interfaces": 1, "hostname": "$node.hostname", "ip": "$node.ip_address"}}
            ]
        )

        # Iterate through sensor_app_data and create a list of applications that are installed on the sensor
        #   {
        #       '_id': ['853ab4cf12c841fc828826168115579e'],
        #       'application': 'arkime',
        #       'deployment_name': 'brandon-sensor3-arkime',
        #       'hostname': ['brandon-sensor3.clarke'],
        #       'ip': ['10.40.18.70'],
        #       'values': {'interfaces': ['ens224']}
        #   }
        apps = [app["application"] for app in sensor_app_data if app and app["application"] in ["arkime", "suricata", "zeek"]]

        doc = {
            'ip': sensor_node['ip_address'],
            'hostname': hostname,
            'interfaces': ifaces,
            'apps': apps,
            'username': 'root',
            'password': kitinfo['password']
        }
        return ReplaySensorModel(**doc)
