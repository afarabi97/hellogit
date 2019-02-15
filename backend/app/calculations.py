from app.resources import (NodeResources, 
                           cal_percentage_of_total, 
                           NodeResourcePool,
                           convert_GiB_to_KiB,
                           convert_KiB_to_GiB,
                           CephStoragePool)
from typing import Dict, List


class KitPercentages:
    def __init__(self, kit_form: Dict):
        self._kit_form = kit_form
        self._server_res_pool = NodeResourcePool(kit_form["servers"])
        self._is_override_percentages = self._kit_form["enable_percentages"]
        allocatable = self._server_res_pool.pool_cpu_allocatable        
        if allocatable > 16000:
            self._is_home_build = False
        else:
            self._is_home_build = True        

    @property
    def elastic_cpu_perc(self) -> int:
        ret_val = 90
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["elastic_cpu_percentage"])
        elif self._is_home_build:
            ret_val = 70
        return ret_val

    @property
    def elastic_mem_perc(self) -> int:
        ret_val = 90
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["elastic_memory_percentage"])
        elif self._is_home_build:
            ret_val = 70
        
        return ret_val
    
    @property
    def elastic_ceph_storage_perc(self) -> int:
        ret_val = 80
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["elastic_storage_percentage"])
        return ret_val    

    @property
    def log_stash_cpu_perc(self) -> int:
        ret_val = 5
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["logstash_cpu_percentage"])
        return ret_val
    
    def moloch_cpu_perc(self, sensor_index=None) -> int:        
        ret_val = 19
        if self._is_override_percentages:
            if sensor_index is None:
                raise ValueError("sensor_index is a required parameter on overrides.")
            ret_val = int(self._kit_form["sensors"][sensor_index]["moloch_cpu_percentage"])

        return ret_val
    
    def bro_cpu_perc(self, sensor_index=None) -> int:        
        ret_val = 58
        if self._is_override_percentages:
            if sensor_index is None:
                raise ValueError("sensor_index is a required parameter on overrides.")
            ret_val = int(self._kit_form["sensors"][sensor_index]["bro_cpu_percentage"])
        return ret_val
    
    def suricata_cpu_perc(self, sensor_index=None) -> int:
        ret_val = 6
        if self._is_override_percentages:
            if sensor_index is None:
                raise ValueError("sensor_index is a required parameter on overrides.")
            ret_val = int(self._kit_form["sensors"][sensor_index]["suricata_cpu_percentage"])
        return ret_val

    @property
    def zookeeper_cpu_perc(self) -> int:
        ret_val = 3
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["zookeeper_cpu_percentage"])
        return ret_val

    @property
    def kafka_cpu_perc(self) -> int:
        ret_val = 13
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["kafka_cpu_percentage"])

        return ret_val

    @property
    def elastic_curator_threshold_perc(self) -> int:
        ret_val = 90
        if self._is_override_percentages:
            ret_val = int(self._kit_form["server_resources"]["elastic_curator_threshold"])
        return ret_val


class ServerCalculations:
    def __init__(self, kit_form: Dict):
        self._kit_form = kit_form
        self._percentages = KitPercentages(kit_form)
        self._num_servers = len(kit_form["servers"])
        self._num_sensors = len(kit_form["sensors"])
        self._num_sensors_with_ceph_storage = self._num_sensors_with_ceph(kit_form["sensors"])
        self._server_res_pool = NodeResourcePool(self._kit_form["servers"])

        # TODO self._sensor_res_pool needs to be removed in next iteration of the refactor. 
        # in fact we should beable to delete it when kafa and zookeeper are no longer supported.
        self._sensor_res_pool = NodeResourcePool(self._kit_form["sensors"])
        self._ceph_storage_pool = CephStoragePool(kit_form["servers"] + kit_form["sensors"])
        self._log_stash_cpu_request = 0
        self._elastic_cpu_request = 0
        self._elastic_mem_request = 0        

    #TODO We should consider removing ceh support from censors.
    def _num_sensors_with_ceph(self, sensors: List[Dict]):
        count = 0
        for sensor in sensors:
            if len(sensor['ceph_drives']) > 0:
                count += 1            
        return 0

    #TODO This is a carry over from old math I do not like, this needs to be redesigned in next phase.
    def _get_lowest_allocatable_cpu(self):
        if self._server_res_pool.lowest_cpu_allocatable > self._sensor_res_pool.lowest_cpu_allocatable:
            return self._sensor_res_pool.lowest_cpu_allocatable
        return self._server_res_pool.lowest_cpu_allocatable

    @property
    def log_stash_replicas(self) -> int:
        return 1        

    @property    
    def log_stash_cpu_request(self) -> int:
        allocatable = self._server_res_pool.pool_cpu_allocatable
        self._log_stash_cpu_request = cal_percentage_of_total(allocatable, self._percentages.log_stash_cpu_perc) / self._num_servers        
        return int(self._log_stash_cpu_request)

    @property
    def elastic_cpu_request(self) -> int:
        allocatable = self._server_res_pool.pool_cpu_allocatable
        self._elastic_cpu_request = cal_percentage_of_total(allocatable, self._percentages.elastic_cpu_perc) / self.elastic_total_node_count
        return int(self._elastic_cpu_request)

    @property
    def elastic_master_node_count(self) -> int:
        mem_allocatable = cal_percentage_of_total(self._server_res_pool.pool_mem_allocatable, self._percentages.elastic_mem_perc)
        node_count = mem_allocatable / convert_GiB_to_KiB(24)
        if node_count < 1 or node_count < self._num_servers:
            node_count = self._num_servers

        if node_count > 5:
            node_count = 5            
        return int(node_count)
    
    @property
    def elastic_data_node_count(self) -> int:
        mem_allocatable = cal_percentage_of_total(self._server_res_pool.pool_mem_allocatable, self._percentages.elastic_mem_perc)
        node_count = mem_allocatable / convert_GiB_to_KiB(24)
        if node_count > 5:
            return int(node_count - 5)
        return 0

    @property
    def elastic_total_node_count(self) -> int:
        return self.elastic_master_node_count + self.elastic_data_node_count

    @property
    def kafka_cpu_request(self) -> int:
        lowest_cpus = self._get_lowest_allocatable_cpu()
        ret_val = cal_percentage_of_total(lowest_cpus, self._percentages.kafka_cpu_perc)
        return int(ret_val)        

    @property
    def kafka_jvm_memory(self) -> int:
        return 1

    @property
    def kafka_pv_size(self) -> int:
        return 3

    @property
    def elastic_memory_request(self) -> int: 
        """
        The amount of memory you would like to assign per Elasticsearch instance. Elasticsearch 
        will use the memlock feature of the OS to take the memory and immediately commit it for 
        itself. Good values depend very heavily on the type of traffic that the system runs and developing 
        good predictive models of what work is one of the more challenging engineering problems
        that exists. We generally recommend you stick with the recommended default. If you
        know what you are doing, you might try experimenting with this value.

        :return: KiB
        """
        elastic_memory = cal_percentage_of_total(self._server_res_pool.pool_mem_allocatable, self._percentages.elastic_mem_perc)
        self._elastic_mem_request = elastic_memory / self.elastic_total_node_count
        return int(convert_KiB_to_GiB(self._elastic_mem_request))

    # The amount of space allocated in GB to each persistent volume for Elasticsearch
    @property
    def elastic_pv_size(self) -> float: 
        """
        The amount of space to allocate from the Ceph cluster to the persistent volume
        used per Elasticsearch instance.
        :return: KB
        """
        elastic_ceph_stroage = cal_percentage_of_total(self._ceph_storage_pool.ceph_pool_allocatable, 
                                                       self._percentages.elastic_ceph_storage_perc)
        ret_val = elastic_ceph_stroage / self.elastic_total_node_count
        return convert_KiB_to_GiB(ret_val)
    
    @property
    def elastic_curator_threshold(self) -> int:
        """
        The percentage of maximum allocated space for Elasticsearch that can be filled
        before Curator begins deleting indices. The oldest moloch indices that exceed
        this threshold will be deleted.
        """
        return self._percentages.elastic_curator_threshold_perc

    @property
    def zookeeper_cpu_request(self) -> int:
        lowest_cpus = self._get_lowest_allocatable_cpu()
        ret_val = cal_percentage_of_total(lowest_cpus, self._percentages.zookeeper_cpu_perc)
        return int(ret_val)

    @property
    def zookeeper_replicas(self) -> int:
        """
        :return: int
        """
        node_count = self._num_sensors + self._num_servers
        if node_count <= 2:
            return 1
        return 3    
    
    @property
    def zookeeper_jvm_memory(self) -> int:
        return 1

    @property
    def zookeeper_pv_size(self) -> int:        
        return 3   

    @property
    def moloch_ceph_pcap_pv_size(self) -> int:
        if self._num_sensors_with_ceph_storage == 0:
            return 0

        ret_val = cal_percentage_of_total(self._ceph_storage_pool.ceph_pool_allocatable, 
                                          self._percentages.moloch_ceph_storage_perc)
        ret_val = ret_val / self._num_sensors_with_ceph_storage
        return convert_KiB_to_GiB(ret_val)

    def to_dict(self) -> Dict:
        return {
            'kafka_cpu_request': self.kafka_cpu_request,
            'log_stash_cpu_request': self.log_stash_cpu_request,
            'elastic_cpu_request': self.elastic_cpu_request,
            'elastic_data_pod_count': self.elastic_data_node_count,
            'elastic_master_pod_count': self.elastic_master_node_count,
            'elastic_memory_request': self.elastic_memory_request,
            'elastic_pv_size': self.elastic_pv_size,
            'elastic_curator_threshold': self.elastic_curator_threshold,
            'log_stash_replicas': self.log_stash_replicas,
            'kafka_pv_size': self.kafka_pv_size,
            'kafka_jvm_memory': self.kafka_jvm_memory,
            'zookeeper_cpu_request': self.zookeeper_cpu_request,
            'zookeeper_jvm_memory': self.zookeeper_jvm_memory,
            'zookeeper_pv_size': self.zookeeper_pv_size,
            'zookeeper_replicas': self.zookeeper_replicas,
            'moloch_ceph_pcap_pv_size': self.moloch_ceph_pcap_pv_size
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
        return int(ret_val)

    @property          
    def suricata_cpu_request(self) -> int: 
        ret_val = cal_percentage_of_total(self._node_resources.cpu_allocatable, self._percentages.suricata_cpu_perc(self._node_index))
        return int(ret_val)

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
            'moloch_threads': self.moloch_threads
        }


class NodeCalculations:

    def __init__(self,
                 kit_form: Dict):
        self._kit_form = kit_form
        self._percentages = KitPercentages(self._kit_form)
        self._num_servers = len(kit_form["servers"])
        self._num_sensors = len(kit_form["sensors"])
        self._node_values = []
        for index, sensor in enumerate(kit_form["sensors"]):
            self._node_values.append(NodeValues(index, sensor, self._percentages))

    @property
    def number_of_nodes(self) -> int:
        return len(self._node_values)

    @property
    def get_node_values(self) -> List[NodeValues]:
        return self._node_values
