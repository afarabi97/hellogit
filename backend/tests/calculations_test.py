import json
import os
import sys
import unittest
from pprint import pprint

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

sys.path.append(SCRIPT_DIR + '/../')

from app.calculations import (NodeResources, ServerCalculations, 
                              NodeCalculations, NodeValues, KitPercentages)
from app.resources import (CephStoragePool, convert_GiB_to_KiB, 
                           convert_GB_to_KB, convert_GiB_to_KiB, 
                           convert_GiB_to_MiB, convert_KiB_to_GiB, 
                           convert_MiB_to_KiB)
from app.kit_controller import _replace_kit_inventory
from pathlib import Path


"""
Node Name: dnav-sensor1.lan
Capacity:    {'cpu': '12', 'memory': '12137164Ki', 'pods': '110'}
Allocatable: {'cpu': '12', 'memory': '12034764Ki', 'pods': '110'}

Node Name: dnav-srv1.lan
Capacity:    {'cpu': '16', 'memory': '16264848Ki', 'pods': '110'}
Allocatable: {'cpu': '14800m', 'memory': '15138448Ki', 'pods': '110'}

"""

class TestKitPercentages(unittest.TestCase):

    def setUp(self):
        kit = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        json_file = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        kit_form_submission = json.loads(json_file.read_text(), encoding='utf-8')        
        self.perc_cal1 = KitPercentages(kit_form_submission["kitForm"])

    def test_percentage_overrides(self):
        """
        Ensures that the percentages passed in through form submission are
        overridden
        """                    
        self.assertEqual(87, self.perc_cal1.elastic_cpu_perc)
        self.assertEqual(15, self.perc_cal1.kafka_cpu_perc)        
        self.assertEqual(79, self.perc_cal1.elastic_ceph_storage_perc)
        self.assertEqual(89, self.perc_cal1.elastic_curator_threshold_perc)
        self.assertEqual(88, self.perc_cal1.elastic_mem_perc)
        self.assertEqual(6, self.perc_cal1.log_stash_cpu_perc)
        self.assertEqual(4, self.perc_cal1.zookeeper_cpu_perc)
        self.assertEqual(20, self.perc_cal1.moloch_cpu_perc(0))
        self.assertEqual(57, self.perc_cal1.bro_cpu_perc(0))
        self.assertEqual(5, self.perc_cal1.suricata_cpu_perc(0))
        

class TestNodeResources(unittest.TestCase):

    def test_noderesources(self):
        json_file = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        kit_form_submission = json.loads(json_file.read_text(), encoding='utf-8')

        sensor = kit_form_submission["kitForm"]["sensors"][0]
        node_res = NodeResources(sensor)
        self.assertEqual(12136448.0, node_res._memory_capacity)
        self.assertEqual(12000, node_res._cpu_capacity)

        self.assertEqual(10260, node_res.cpu_allocatable)
        self.assertEqual(10556826.0, node_res.mem_allocatable)


class TestSensorCalculations(unittest.TestCase):    
    
    def setUp(self):
        kit = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        kit2 = Path(SCRIPT_DIR + '/testfiles/kit2.json')
        kit3 = Path(SCRIPT_DIR + '/testfiles/kit3.json')

        json_file = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        kit_form_submission = json.loads(json_file.read_text(), encoding='utf-8')
        kit_form_submission["kitForm"]["enable_percentages"] = False
        self.node_cal1 = NodeCalculations(kit_form_submission["kitForm"])

        json_file = Path(SCRIPT_DIR + '/testfiles/kit2.json')
        kit_form_submission = json.loads(json_file.read_text(), encoding='utf-8')
        self.node_cal2 = NodeCalculations(kit_form_submission["kitForm"])

        json_file = Path(SCRIPT_DIR + '/testfiles/kit3.json')
        kit_form_submission = json.loads(json_file.read_text(), encoding='utf-8')
        self.node_cal3 = NodeCalculations(kit_form_submission["kitForm"])
    
    def test_bro_calculations(self):
        sensor = self.node_cal1.get_node_values[0] #type: NodeValues
        self.assertEqual(1, self.node_cal1.number_of_nodes)
        self.assertEqual(5950, sensor.bro_cpu_request)
        self.assertEqual(6, sensor.bro_workers)

        sensor = self.node_cal2.get_node_values[0] #type: NodeValues
        self.assertEqual(1, self.node_cal2.number_of_nodes)
        self.assertEqual(15868, sensor.bro_cpu_request)
        self.assertEqual(16, sensor.bro_workers)
        
        self.assertEqual(2, self.node_cal3.number_of_nodes)
        sensor1 = self.node_cal3.get_node_values[0] #type: NodeValues
        sensor2 = self.node_cal3.get_node_values[1] #type: NodeValues
        self.assertEqual(5950, sensor1.bro_cpu_request)
        self.assertEqual(6, sensor1.bro_workers)
        self.assertEqual(98518, sensor2.bro_cpu_request)
        self.assertEqual(99, sensor2.bro_workers)
        
    def test_moloch_calculations(self):
        sensor = self.node_cal1.get_node_values[0] #type: NodeValues
        self.assertEqual(1, self.node_cal1.number_of_nodes)
        self.assertEqual(1949, sensor.moloch_cpu_request)
        self.assertEqual(2, sensor.moloch_threads)

        sensor = self.node_cal2.get_node_values[0] #type: NodeValues
        self.assertEqual(1, self.node_cal2.number_of_nodes)
        self.assertEqual(5198, sensor.moloch_cpu_request)
        self.assertEqual(5, sensor.moloch_threads)
        
        self.assertEqual(2, self.node_cal3.number_of_nodes)
        sensor1 = self.node_cal3.get_node_values[0] #type: NodeValues
        sensor2 = self.node_cal3.get_node_values[1] #type: NodeValues
        self.assertEqual(1949, sensor1.moloch_cpu_request)
        self.assertEqual(2, sensor1.moloch_threads)
        self.assertEqual(32273, sensor2.moloch_cpu_request)
        #Moloch cant scale past the 24 thread limit.
        self.assertEqual(24, sensor2.moloch_threads)

    def test_suricata_cpu_request(self):
        sensor = self.node_cal1.get_node_values[0] #type: NodeValues
        self.assertEqual(1, self.node_cal1.number_of_nodes)
        self.assertEqual(615, sensor.suricata_cpu_request)        

        sensor = self.node_cal2.get_node_values[0] #type: NodeValues
        self.assertEqual(1, self.node_cal2.number_of_nodes)
        self.assertEqual(1641, sensor.suricata_cpu_request)        
        
        self.assertEqual(2, self.node_cal3.number_of_nodes)
        sensor1 = self.node_cal3.get_node_values[0] #type: NodeValues
        sensor2 = self.node_cal3.get_node_values[1] #type: NodeValues
        self.assertEqual(615, sensor1.suricata_cpu_request)        
        self.assertEqual(10191, sensor2.suricata_cpu_request)
        

class TestCephStoragePool(unittest.TestCase):

    def setUp(self):
        kit = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        kit2 = Path(SCRIPT_DIR + '/testfiles/kit2.json')
        kit3 = Path(SCRIPT_DIR + '/testfiles/kit3.json')
        kit_form_submission = json.loads(kit.read_text(), encoding='utf-8')
        kit_form_submission["kitForm"]["enable_percentages"] = False
        self.storage1 = CephStoragePool(kit_form_submission["kitForm"]["servers"])

        kit_form_submission = json.loads(kit2.read_text(), encoding='utf-8')
        self.storage2 = CephStoragePool(kit_form_submission["kitForm"]["servers"])

        kit_form_submission = json.loads(kit3.read_text(), encoding='utf-8')
        self.storage3 = CephStoragePool(kit_form_submission["kitForm"]["servers"])

    def test_ceph_pool_storage(self):                
        self.assertEqual(40000000, self.storage1.ceph_pool_capacity)
        self.assertEqual(40000000, self.storage1.ceph_pool_allocatable)        
        self.assertEqual(400000000, self.storage2.ceph_pool_capacity)
        self.assertEqual(400000000, self.storage2.ceph_pool_allocatable)        
        self.assertEqual(80000000, self.storage3.ceph_pool_capacity)
        self.assertEqual(80000000, self.storage3.ceph_pool_allocatable)


class TestServerCalculations(unittest.TestCase):

    def setUp(self):
        kit = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        kit2 = Path(SCRIPT_DIR + '/testfiles/kit2.json')
        kit3 = Path(SCRIPT_DIR + '/testfiles/kit3.json')

        kit_form_submission = json.loads(kit.read_text(), encoding='utf-8')
        kit_form_submission["kitForm"]["enable_percentages"] = False
        self.kit1_cal = ServerCalculations(kit_form_submission["kitForm"])

        kit_form_submission = json.loads(kit2.read_text(), encoding='utf-8')
        self.kit2_cal = ServerCalculations(kit_form_submission["kitForm"])

        kit_form_submission = json.loads(kit3.read_text(), encoding='utf-8')
        self.kit3_cal = ServerCalculations(kit_form_submission["kitForm"])

    def test_elk_calculations(self):
        self.assertEqual(1, self.kit1_cal.log_stash_replicas)
        self.assertEqual(703, self.kit1_cal.log_stash_cpu_request)
        self.assertEqual(9842, self.kit1_cal.elastic_cpu_request)

    def test_kafka_cpu_request(self):
        self.assertEqual(1560, self.kit1_cal.kafka_cpu_request)
        self.assertEqual(3900, self.kit2_cal.kafka_cpu_request)
        self.assertEqual(1560, self.kit3_cal.kafka_cpu_request)

    def test_elk_node_counts(self):
        self.assertEqual(1, self.kit2_cal.log_stash_replicas)

        self.assertEqual(1, self.kit1_cal.elastic_master_node_count)
        self.assertEqual(0, self.kit1_cal.elastic_data_node_count)
        self.assertEqual(1, self.kit1_cal.elastic_total_node_count)

        self.assertEqual(5, self.kit2_cal.elastic_master_node_count)
        self.assertEqual(12, self.kit2_cal.elastic_data_node_count)
        self.assertEqual(17, self.kit2_cal.elastic_total_node_count)
                
        self.assertEqual(2, self.kit3_cal.elastic_master_node_count)
        self.assertEqual(2, self.kit3_cal.elastic_total_node_count)
        self.assertEqual(0, self.kit3_cal.elastic_data_node_count)
        
    def test_elastic_memory_request(self):
        # self.assertEqual(9.665, self.kit1_cal.elastic_memory_request)
        self.assertEqual(9, self.kit1_cal.elastic_memory_request)
        self.assertEqual(25, self.kit2_cal.elastic_memory_request)
        self.assertEqual(12, self.kit3_cal.elastic_memory_request)

    def test_elastic_pv_size(self):
        self.assertEqual(1, self.kit1_cal.elastic_total_node_count)
        self.assertEqual(40000000, self.kit1_cal._ceph_storage_pool.ceph_pool_capacity)
        self.assertEqual(40000000, self.kit1_cal._ceph_storage_pool.ceph_pool_allocatable)
        self.assertEqual(30.518, self.kit1_cal.elastic_pv_size)

        self.assertEqual(17, self.kit2_cal.elastic_total_node_count)
        self.assertEqual(400000000, self.kit2_cal._ceph_storage_pool.ceph_pool_capacity)
        self.assertEqual(400000000, self.kit2_cal._ceph_storage_pool.ceph_pool_allocatable)
        self.assertEqual(17.952, self.kit2_cal.elastic_pv_size)

        self.assertEqual(2, self.kit3_cal.elastic_total_node_count)
        self.assertEqual(80000000, self.kit3_cal._ceph_storage_pool.ceph_pool_capacity)
        self.assertEqual(80000000, self.kit3_cal._ceph_storage_pool.ceph_pool_allocatable)
        self.assertEqual(30.518, self.kit3_cal.elastic_pv_size)

    def test_elastic_curator_threshold(self):
        self.assertEqual(90, self.kit3_cal.elastic_curator_threshold)

    def test_zookeeper_replicas(self):
        self.assertEqual(1, self.kit1_cal.zookeeper_replicas)
        self.assertEqual(1, self.kit2_cal.zookeeper_replicas)
        self.assertEqual(3, self.kit3_cal.zookeeper_replicas)

    def test_zookeeper_cpu_request(self):
        self.assertEqual(360, self.kit1_cal.zookeeper_cpu_request)


class TestInventoryFileCreation(unittest.TestCase):

    def test_inventory_creation(self):
        kit3 = Path(SCRIPT_DIR + '/testfiles/kit1.json')
        kit_form_submission = json.loads(kit3.read_text(), encoding='utf-8')
        is_successful, password = _replace_kit_inventory(kit_form_submission['kitForm'])
        self.assertTrue(is_successful)
        self.assertIsNotNone(password)


class TestConverters(unittest.TestCase):

    def test_converters(self):
        self.assertEqual(76.294, convert_KiB_to_GiB(80000000, 3))
        self.assertEqual(0.0762939453125, convert_KiB_to_GiB(80000, 0))
        self.assertEqual(0.076, convert_KiB_to_GiB(80000, 3))


if __name__ == '__main__':
    unittest.main()
