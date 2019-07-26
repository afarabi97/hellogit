import json
import requests

from datetime import datetime
from lib.connection_mngs import MongoConnectionManager
from lib.model.kit import Kit, Node
from lib.util import zero_pad, wait_for_mongo_job
from typing import Union, List, Dict


class APIFailure(Exception):
    pass


def print_json(something: Union[Dict, List]) -> None:
    print("Printing Response back:")
    print(json.dumps(something, indent=4, sort_keys=True))


def get_request(url: str) -> Union[List, Dict]:
    response = requests.get(url, verify=False)
    if response.status_code == 200:
        return response.json()
    else:
        raise APIFailure(url + ' FAILED!\n' + str(response.status_code))


def post_request(url: str, payload: Dict) -> Union[List, Dict]:
    response = requests.post(url, json=payload, verify=False)
    if response.status_code == 200:
        return response.json()
    else:
        raise APIFailure(url + ' FAILED!\n' + str(response.status_code))


class KickstartPayloadGenerator:

    def __init__(self, controller_ip: str, kit: Kit):
        self._controller_ip = controller_ip
        self._kit = kit

    def _construct_node_part(self, node: Node) -> Dict:
        mac_address = node.management_interface.mac_address
        if not mac_address:
            mac_address = node.management_interface.mac_auto_generated

        data_drive = "sdb"
        if node.es_drives:
            data_drive = node.es_drives[0]
        elif node.pcap_drives:
            data_drive = node.pcap_drives[0]

        return {
            "hostname": node.hostname,
            "ip_address": node.management_interface.ip_address,
            "mac_address": mac_address,
            "boot_drive": node.boot_drive,
            "data_drive": data_drive,
            "pxe_type": "BIOS"
        }

    def _construct_node_parts(self) -> List[Dict]:
        ret_val = []
        for node in self._kit.get_nodes():
            if node.type == Node.valid_node_types[2]:
                #if the node is the controller ignore it
                continue
            ret_val.append(self._construct_node_part(node))
        return ret_val

    def generate(self) -> Dict:
        controller = self._kit.get_controller() # type: Node
        return {
            "dhcp_range": self._kit.kickstart_configuration.dhcp_range,
            "gateway": self._kit.kickstart_configuration.gateway,
            "netmask": self._kit.kickstart_configuration.netmask,
            "root_password": self._kit.password,
            "re_password": self._kit.password,
            "controller_interface": [
                controller.management_interface.ip_address
            ],
            "nodes": self._construct_node_parts(),
            "continue": True
        }


class KitPayloadGenerator:

    def __init__(self, controller_ip: str, kit: Kit):
        self._controller_ip = controller_ip
        self._url = "https://" + controller_ip + "{}"
        self._kit = kit
        self._device_facts_map = {}

    def _request_device_facts(self, node: Node) -> Dict:
        payload = {"management_ip": node.management_interface.ip_address}
        ret_val = post_request(self._url.format("/api/gather_device_facts"), payload)
        ret_val["disks"] = json.loads(ret_val["disks"])
        ret_val["interfaces"] = json.loads(ret_val["interfaces"])
        return ret_val

    def _set_device_facts_ip_map(self) -> None:
        """
        Sets class variable to {"<ip_of_node>": "<device facts payload>"}
        :return:
        """
        self._device_facts_map = {}
        for node in self._kit.get_server_nodes():
            self._device_facts_map[node.management_interface.ip_address] = self._request_device_facts(node)

        for node in self._kit.get_sensor_nodes():
            self._device_facts_map[node.management_interface.ip_address] = self._request_device_facts(node)

    def _construct_server_part(self, node: Node) -> Dict:
        if node.type not in Node.valid_server_types:
            raise ValueError("You passed an invalid node type inot this methods. "
                             "It must be %s" % str(Node.valid_server_types))

        is_master = node.type == Node.valid_node_types[0]
        return {
            "node_type": "Server",
            "hostname": node.hostname,
            "management_ip_address": node.management_interface.ip_address,
            "is_master_server": is_master,
            "deviceFacts": self._device_facts_map[node.management_interface.ip_address]
        }

    def _construct_sensor_part(self, node: Node) -> Dict:
        if node.type not in Node.valid_sensor_types:
            raise ValueError("You passed an invalid node type inot this methods. "
                             "It must be %s" % str(Node.valid_sensor_types))

        is_remote = node.type == Node.valid_node_types[1]

        return {
            "node_type": "Sensor",
            "hostname": node.hostname,
            "management_ip_address": node.management_interface.ip_address,
            "is_remote": is_remote,
            "deviceFacts": self._device_facts_map[node.management_interface.ip_address]
        }

    def _construct_time_part(self) -> Dict:
        """
        :return: Returns a Dict of the timeform.
        """
        t = datetime.utcnow()
        return {
            "date": {
                "year": t.year,
                "month": t.month,
                "day": t.day
            },
            "time": "{}:{}".format(zero_pad(t.hour), zero_pad(t.minute)),
            "timezone": "UTC"
        }

    def _construct_home_nets(self) -> List[Dict]:
        ret_val = []
        if self._kit.home_nets:
            for home_net in self._kit.home_nets:
                ret_val.append({"home_net": home_net})
        return ret_val

    def _construct_extrenal_nets(self) -> List[Dict]:
        ret_val = []
        if self._kit.external_nets:
            for external_net in self._kit.external_nets:
                ret_val.append({"external_net": external_net})
        return ret_val

    def _set_device_facts_ip_map(self) -> None:
        """
        Sets class variable to {"<ip_of_node>": "<device facts payload>"}
        :return:
        """
        self._device_facts_map = {}
        for node in self._kit.get_server_nodes():
            self._device_facts_map[node.management_interface.ip_address] = self._request_device_facts(node)

        for node in self._kit.get_sensor_nodes():
            self._device_facts_map[node.management_interface.ip_address] = self._request_device_facts(node)

    def _construct_kit_payload(self) -> Dict:
        node_parts = []
        for server in self._kit.get_server_nodes():
            srv_part = self._construct_server_part(server)
            node_parts.append(srv_part)

        for sensor in self._kit.get_sensor_nodes():
            ses_part = self._construct_sensor_part(sensor)
            node_parts.append(ses_part)

        return {
            "kitForm": {
                "nodes": node_parts,
                "kubernetes_services_cidr": self._kit.kubernetes_cidr,
                "dns_ip": None,
            },
            "timeForm": self._construct_time_part()
        }

    def generate(self) -> Dict:
        self._set_device_facts_ip_map()
        return self._construct_kit_payload()

class CatalogPayloadGenerator:

    def __init__(self, controller_ip: str, kit: Kit):
        self._controller_ip = controller_ip
        self._url = "https://" + controller_ip + "{}"
        self._kit = kit
        self._device_facts_map = {}

    def _request_device_facts(self, node: Node) -> Dict:
        payload = {"management_ip": node.management_interface.ip_address}
        ret_val = post_request(self._url.format("/api/gather_device_facts"), payload)
        ret_val["disks"] = json.loads(ret_val["disks"])
        ret_val["interfaces"] = json.loads(ret_val["interfaces"])
        return ret_val

    def _set_device_facts_ip_map(self) -> None:
        """
        Sets class variable to {"<ip_of_node>": "<device facts payload>"}
        :return:
        """
        self._device_facts_map = {}
        for node in self._kit.get_server_nodes():
            self._device_facts_map[node.management_interface.ip_address] = self._request_device_facts(node)

        for node in self._kit.get_sensor_nodes():
            self._device_facts_map[node.management_interface.ip_address] = self._request_device_facts(node)

    def _construct_selectedNode_part(self, node_affinity: str) -> List[Dict]:
        node_parts = []
        all_parts = []
        if node_affinity == 'Server - Any':
            for server in self._kit.get_server_nodes():
                srv_part = self._device_facts_map[server.management_interface.ip_address]
                node_parts.append(srv_part)
        if node_affinity == 'Sensor':
            for sensor in self._kit.get_sensor_nodes():
                ses_part = self._device_facts_map[sensor.management_interface.ip_address]

                deviceFacts = { "deviceFacts": ses_part,
                                "hostname" : sensor.hostname,
                                "node_type" : node_affinity,
                                "deployment_name": sensor.suricata_catalog.deployment_name,
                                "management_ip_address": sensor.management_interface.ip_address,
                                "is_remote": False}
                all_parts.append(deviceFacts)

        return all_parts

    def _construct_config_part(self, node_affinity: str) -> List[Dict]:
        node_parts = []
        if node_affinity == 'Server - Any':
            for server in self._kit.get_server_nodes():
                srv_part = { server.suricata_catalog.deployment_name : server.suricata_catalog.to_dict() }
                node_parts.append(srv_part)

        if node_affinity == 'Sensor':
            for sensor in self._kit.get_sensor_nodes():
                ses_part = { sensor.suricata_catalog.deployment_name : sensor.suricata_catalog.to_dict() }
                node_parts.append(ses_part)
        return node_parts

    def _construct_catalog_part(self, role: str, process: str, node_affinity: str) -> Dict:
        payload = {
            "role": role,
            "process": {
                "selectedProcess":  process,
                "selectedNodes": self._construct_selectedNode_part(node_affinity),
            },
            "configs": self._construct_config_part(node_affinity)
        }
        ret_val = post_request(self._url.format("/api/catalog/generate_values"), payload)
        valuesPayload = {
            "role": role,
            "process": {
                "selectedProcess":  process,
                "selectedNodes": self._construct_selectedNode_part(node_affinity),
                "node_affinity": node_affinity
            },
            "values": ret_val
        }
        return valuesPayload

    def generate(self, role: str, process: str, node_affinity: str) -> Dict:
        self._set_device_facts_ip_map()
        return self._construct_catalog_part(role, process, node_affinity)

class APITester:

    def __init__(self, controller_ip: str, kit: Kit):
        self._controller_ip = controller_ip
        self._url = "https://" + controller_ip + "{}"
        self._kit = kit
        self._device_facts_map = {}
        self._kickstart_payload_generator = KickstartPayloadGenerator(controller_ip, kit)
        self._kit_payload_generator = KitPayloadGenerator(controller_ip, kit)
        self._catalog_payload_generator = CatalogPayloadGenerator(controller_ip, kit)

    def run_catalog_api_call(self) -> None:
        payload = self._catalog_payload_generator.generate("suricata","install","Sensor")
        response = post_request(self._url.format("/api/catalog/install"), payload)

    def run_kit_api_call(self) -> None:
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_kit.drop()
            mongo_manager.mongo_last_jobs.drop()

        payload = self._kit_payload_generator.generate()
        response = post_request(self._url.format("/api/execute_kit_inventory"), payload)
        wait_for_mongo_job("Kit", self._controller_ip, 60)

    def run_kickstart_api_call(self) -> None:
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_kickstart.drop()
            mongo_manager.mongo_last_jobs.drop()

        payload = self._kickstart_payload_generator.generate()
        response = post_request(self._url.format("/api/generate_kickstart_inventory"), payload)
        wait_for_mongo_job("Kickstart", self._controller_ip, 30)
