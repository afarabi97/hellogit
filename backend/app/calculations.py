from app.resources import (NodeResources, 
                           cal_percentage_of_total, 
                           NodeResourcePool,
                           convert_GiB_to_KiB,
                           convert_KiB_to_GiB)
from typing import Dict, List, Tuple
from shared.constants import NODE_TYPES


def get_servers_from_list(nodes: List) -> List:
    ret_val = []
    for node in nodes:
        if node["node_type"] == NODE_TYPES[0]:
            ret_val.append(node)
    return ret_val


def get_sensors_from_list(nodes: List) -> List:
    ret_val = []
    for node in nodes:
        if node["node_type"] == NODE_TYPES[1]:
            ret_val.append(node)
    return ret_val


def server_and_sensor_count(nodes: List) -> Tuple[int, int]:
    server_count = 0
    sensor_count = 0
    for node in nodes:        
        if node["node_type"] == NODE_TYPES[0]:
            server_count += 1
        elif node["node_type"] == NODE_TYPES[1]:
            sensor_count += 1
    return server_count, sensor_count
            

class KitPercentages:
    def __init__(self, kit_form: Dict):
        self._kit_form = kit_form
        self._sensor_list = get_sensors_from_list(kit_form["nodes"])
        self._server_list = get_servers_from_list(kit_form["nodes"])
        self._server_res_pool = NodeResourcePool(self._server_list)
        self._is_override_percentages = False
        allocatable = self._server_res_pool.pool_cpu_allocatable        
        if allocatable > 16000:
            self._is_home_build = False
        else:
            self._is_home_build = True

        self._moloch_cpu_perc = 0
        self._moloch_mem_limit = 0
        self._bro_cpu_perc = 0
        self._suricata_cpu_perc = 0

    def _set_starting_sensor_defaults(self, sensor_index: int):
        """
        If a sensor is disabled
        """
        self._moloch_cpu_perc = 35
        self._moloch_mem_limit = 80
        self._bro_cpu_perc = 25
        self._suricata_cpu_perc = 40
        sensor_apps = self._sensor_list[sensor_index]["sensor_apps"]
        if len(sensor_apps) == 3:
            return

        if len(sensor_apps) == 1:
            if "moloch" in sensor_apps:
                self._moloch_cpu_perc = 100
                self._moloch_mem_limit = 95
                self._bro_cpu_perc = 0
                self._suricata_cpu_perc = 0
            elif "bro" in sensor_apps:
                self._moloch_cpu_perc = 0
                self._moloch_mem_limit = 0
                self._bro_cpu_perc = 100
                self._suricata_cpu_perc = 0
            elif "suricata" in sensor_apps:
                self._moloch_cpu_perc = 0
                self._moloch_mem_limit = 0
                self._bro_cpu_perc = 0
                self._suricata_cpu_perc = 100
        elif len(sensor_apps) == 2:
            if "moloch" not in sensor_apps:
                half = int(self._moloch_cpu_perc / 2) # round down if a decimal
                remainder = self._moloch_cpu_perc % 2
                self._bro_cpu_perc += half + remainder
                self._suricata_cpu_perc += half
                self._moloch_cpu_perc = 0
                self._moloch_mem_limit = 0
            elif "bro" not in sensor_apps:
                half = int(self._bro_cpu_perc / 2)
                remainder = self._bro_cpu_perc % 2
                self._suricata_cpu_perc += half
                self._moloch_cpu_perc += half + remainder
                self._moloch_mem_limit = 80
                self._bro_cpu_perc = 0
            elif "suricata" not in sensor_apps:
                half = int(self._suricata_cpu_perc / 2)
                remainder = self._suricata_cpu_perc % 2
                self._moloch_cpu_perc += half + remainder
                self._moloch_mem_limit = 80
                self._bro_cpu_perc += half
                self._suricata_cpu_perc = 0
        else:            
            raise ValueError("Unknown length of sensor applications! This code needs to be updated!")

    @property
    def is_home_build(self) -> bool:
        return self._is_home_build

    @property
    def elastic_curator_threshold_perc(self) -> int:
        ret_val = 90
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["elastic_curator_threshold"])
        return ret_val

    # BEGIN SENSOR PERCENTAGES
    def moloch_cpu_perc(self, sensor_index: int) -> int:
        if self._is_override_percentages:
            ret_val = int(self._kit_form["nodes"][sensor_index]["moloch_cpu_percentage"])
        else:
            self._set_starting_sensor_defaults(sensor_index)
            ret_val = self._moloch_cpu_perc

        return ret_val
    
    def bro_cpu_perc(self, sensor_index: int) -> int:
        if self._is_override_percentages:
            ret_val = int(self._kit_form["nodes"][sensor_index]["bro_cpu_percentage"])
        else:
            self._set_starting_sensor_defaults(sensor_index)
            ret_val = self._bro_cpu_perc

        return ret_val
    
    def suricata_cpu_perc(self, sensor_index: int) -> int:
        if self._is_override_percentages:
            ret_val = int(self._kit_form["nodes"][sensor_index]["suricata_cpu_percentage"])
        else:
            self._set_starting_sensor_defaults(sensor_index)
            ret_val = self._suricata_cpu_perc
        return ret_val   

    def moloch_mem_limit_perc(self, sensor_index: int) -> int:
        if self._is_override_percentages:
            ret_val = int(self._kit_form["nodes"][sensor_index]["moloch_mem_limit"])
        else:
            self._set_starting_sensor_defaults(sensor_index)
            ret_val = self._moloch_mem_limit

        return ret_val     


class ServerCalculations:
    def __init__(self, kit_form: Dict):
        self._kit_form = kit_form
        self._percentages = KitPercentages(kit_form)
        server_count, sensor_count = server_and_sensor_count(kit_form["nodes"])
        self._num_servers = server_count
        self._num_sensors = sensor_count
        self._server_res_pool = NodeResourcePool(get_servers_from_list(self._kit_form["nodes"]))
        self._log_stash_cpu_request = 0        
        self._elastic_cpu_request = 0
        self._elastic_mem_request = 0
        self._is_large_build = False

        mem_capacity = self._server_res_pool.get_node_resources(0).mem_capacity
        mem_capacity = convert_KiB_to_GiB(mem_capacity)
        # Large builds are anything bigger than 100 GB
        if mem_capacity > 100: 
            self._is_large_build = True

    @property
    def logstash_replicas(self) -> int:
        if self._is_large_build:
            return 2 * self._num_servers
        return self._num_servers
        
    @property
    def logstash_cpu_limit(self):
        if self._is_large_build:
            return 6000
        return 4000

    @property    
    def logstash_cpu_request(self) -> int:
        return 1500

    @property
    def logstash_memory_limit(self) -> int:
        if self._is_large_build:
            return 16
        return 10

    @property
    def logstash_memory_request(self) -> int:
        if self._is_large_build:
            return 12
        return 8
        
    @property
    def logstash_jvm_memory(self) -> int:
        if self._is_large_build:
            return 12
        return 8

    @property
    def logstash_pipeline_workers(self) -> int:
        if self._is_large_build:
            return 6
        return 4    

    @property
    def elastic_master_node_count(self) -> int:
        return 3
    
    @property
    def elastic_min_masters(self) -> int:
        if self._percentages._is_home_build:
            return 1
        return 2

    @property
    def elastic_data_node_count(self) -> int:
        return self._num_servers

    @property
    def elastic_total_node_count(self) -> int:
        return self.elastic_master_node_count + self.elastic_data_node_count        

    @property
    def elastic_curator_threshold(self) -> int:
        """
        The percentage of maximum allocated space for Elasticsearch that can be filled
        before Curator begins deleting indices. The oldest moloch indices that exceed
        this threshold will be deleted.
        """
        return self._percentages.elastic_curator_threshold_perc

    @property
    def elastic_data_memory(self) -> int:
        if self._is_large_build:
            return 60
        return 30

    @property
    def elastic_data_jvm_memory(self) -> int:        
        return int(self.elastic_data_memory / 2)

    @property
    def elastic_data_cpu_request(self): 
        if self._is_large_build:
            return 16000
        return 8000

    @property
    def elastic_master_cpu_request(self):
        return 2000

    @property
    def elastic_master_memory(self):
        return 6

    @property
    def elastic_master_jvm_memory(self):        
        return 4

    def to_dict(self) -> Dict:
        return {
            'elastic_curator_threshold': self.elastic_curator_threshold,            
            'elastic_master_memory': self.elastic_master_memory,
            'elastic_master_pod_count': self.elastic_master_node_count,
            'elastic_master_jvm_memory': self.elastic_master_jvm_memory,
            'elastic_master_cpu_request': self.elastic_master_cpu_request,
            'elastic_data_cpu_request': self.elastic_data_cpu_request,
            'elastic_data_jvm_memory': self.elastic_data_jvm_memory,
            'elastic_data_memory': self.elastic_data_memory,
            'elastic_data_pod_count': self.elastic_data_node_count,
            'logstash_cpu_limit': self.logstash_cpu_limit,
            'logstash_cpu_request': self.logstash_cpu_request,
            'logstash_replicas': self.logstash_replicas,
            'logstash_pipeline_workers': self.logstash_pipeline_workers,
            'logstash_jvm_memory': self.logstash_jvm_memory,
            'logstash_memory_limit': self.logstash_memory_limit,
            'logstash_memory_request': self.logstash_memory_request            
        }


class NodeValues:
    def __init__(self, node_index: int, node: Dict, kit_percentages: KitPercentages):
        self._node_index = node_index
        self._node_resources = NodeResources(node)
        self._percentages = kit_percentages

    @property
    def bro_cpu_request(self) -> int:
        ret_val = cal_percentage_of_total(self._node_resources.cpu_allocatable, self._percentages.bro_cpu_perc(self._node_index))
        return int(ret_val)

    @property
    def moloch_cpu_request(self) -> int:
        ret_val = cal_percentage_of_total(self._node_resources.cpu_allocatable, self._percentages.moloch_cpu_perc(self._node_index))
        #The maximum cap a moloch pod can have is 24 cores.
        if ret_val > 24000:
            ret_val = 24000
        return int(ret_val)

    @property          
    def suricata_cpu_request(self) -> int:
        ret_val = cal_percentage_of_total(self._node_resources.cpu_allocatable, self._percentages.suricata_cpu_perc(self._node_index))
        return int(ret_val)

    @property
    def moloch_mem_limit(self) -> float:
        ret_val = cal_percentage_of_total(self._node_resources.mem_allocatable, self._percentages.moloch_mem_limit_perc(self._node_index))
        return convert_KiB_to_GiB(ret_val)

    @property
    def bro_workers(self) -> int:
        if self.bro_cpu_request <= 1000:
            return 1
        
        rounded_up = round( self.bro_cpu_request / 1000) * 1000
        return int(rounded_up / 1000)        

    @property
    def moloch_threads(self) -> int:
        if self.moloch_cpu_request <= 1000:
            return 1
        
        rounded_up = round( self.moloch_cpu_request / 1000) * 1000
        moloch_threads = int(rounded_up / 1000)
        if moloch_threads > 24:
            moloch_threads = 24

        return moloch_threads

    def to_dict(self) -> Dict:
        return {
            'bro_cpu_request': self.bro_cpu_request,
            'moloch_cpu_request': self.moloch_cpu_request,
            'suricata_cpu_request': self.suricata_cpu_request,
            'bro_workers': self.bro_workers,
            'moloch_threads': self.moloch_threads,
            'moloch_mem_limit': self.moloch_mem_limit
        }


class NodeCalculations:

    def __init__(self,
                 kit_form: Dict):
        self._kit_form = kit_form
        self._percentages = KitPercentages(self._kit_form)
        server_count, sensor_count = server_and_sensor_count(kit_form["nodes"])
        self._num_servers = server_count
        self._num_sensors = sensor_count
        self._node_values = []
        for index, sensor in enumerate(get_sensors_from_list(kit_form["nodes"])):
            self._node_values.append(NodeValues(index, sensor, self._percentages))

    @property
    def number_of_nodes(self) -> int:
        return len(self._node_values)

    @property
    def get_node_values(self) -> List[NodeValues]:
        return self._node_values
