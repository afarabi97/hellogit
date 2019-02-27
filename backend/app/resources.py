from typing import Dict, List

def convert_GiB_to_MiB(GiB: float) -> float:
    return GiB * 1024


def convert_MiB_to_KiB(MiB: float) -> float:
    return MiB * 1024


def convert_GiB_to_KiB(GiB: float) -> float:
    val = convert_GiB_to_MiB(GiB)
    return convert_MiB_to_KiB(val)

def convert_KiB_to_GiB(KiB: float, round_places=3) -> float:
    ret_val = KiB / 1024 / 1024
    if round_places > 0:
        return round(ret_val, round_places)
    return ret_val

def convert_GB_to_KB(GB: float) -> float:
    return GB * 1000 * 1000


def cal_percentage_of_total(total: float, percentage: int) -> float:
    if percentage > 100 or percentage < 1:
        raise ValueError("Percentage can not be larger than 100 or less than 1")
    return (percentage / 100) * total


class CephStoragePool:
    
    def __init__(self, nodes: List[Dict]):
        self._nodes = nodes
        self._ceph_pool_capacity = self._set_storage_capacity()
        self._reservations = []
        self._ceph_pool_allocatable = 0
        self._set_storage_allocatable()

    def _set_storage_capacity(self):
        ret_val = 0
        for node in self._nodes:
            device_facts = node['deviceFacts']
            for disk in device_facts['disks']:
                for name in node['ceph_drives']:
                    if disk['name'] == name:
                        ret_val += convert_GB_to_KB(disk['size_gb'])
        return ret_val

    def add_reservation(self, name: str, KB:int):        
        self._reservations.append({'name': name, 'size': KB})
        self._set_storage_allocatable()

    def _set_storage_allocatable(self):
        storage_allocatable = self._ceph_pool_capacity
        for reservation in self._reservations:
            storage_allocatable -= reservation['size']

        self._ceph_pool_allocatable = storage_allocatable

    @property
    def ceph_pool_capacity(self) -> int:
        """        
        :return: Storage capacity as KB
        """
        return int(self._ceph_pool_capacity)

    @property
    def ceph_pool_allocatable(self) -> int:
        """
        :return: Storage allocatable as KB
        """
        return int(self._ceph_pool_allocatable)


class NodeResources:
    def __init__(self, node: Dict):
        self._node = node
        self._device_facts = node['deviceFacts']
        self._cpu_capacity = self._device_facts["cpus_available"] * 1000
        self._memory_capacity = convert_GiB_to_KiB(self._device_facts["memory_available"])
        self._storage_capacity = self._cal_storage_capacity()
        self._memory_allocatable = 0
        self._cpu_allocatable = 0
        self._storage_allocatable = 0

        # Memory is measured in Kibibytes.
        self._operating_system_reservation = {'type': 'system', 'cpu': 1000, 'memory': convert_MiB_to_KiB(800)}
        self._kube_reservation = {'type': 'kube', 'cpu': 200, 'memory': convert_MiB_to_KiB(200)}
        self._reservations = []
        self.add_reservation(self._operating_system_reservation)
        self.add_reservation(self._kube_reservation)
        
        cpu_reserve = int(cal_percentage_of_total(self._cpu_allocatable, 5))
        mem_reserve = int(cal_percentage_of_total(self._memory_allocatable, 5)) 
        
        # Added to ensure that we have enough CPU and memory for metallb pods and metric beat pods.
        cpu_reserve += 200
        mem_reserve += convert_MiB_to_KiB(200)
        self._system_pod_reservation = {'type': 'sys-pod', 'cpu': cpu_reserve, 'memory': mem_reserve}
        self.add_reservation(self._system_pod_reservation)

    def _cal_storage_capacity(self) -> int:
        """
        Calculates the storage capacity.

        :return: KB for pcap stroage
        """
        ret_val = 0
        for disk in self._device_facts['disks']:
            try:
                for name in self._node['pcap_drives']:
                    if disk['name'] == name:
                        ret_val += disk['size_gb']
            except KeyError:
                break
        return convert_GB_to_KB(ret_val)

    def _set_memory_allocatable(self):
        mem_allocatable = self._memory_capacity
        for reservation in self._reservations:
            mem_allocatable -= reservation['memory']
        
        self._memory_allocatable = mem_allocatable

    def _set_cpu_allocatable(self):
        cpu_allocatable = self._cpu_capacity
        for reservation in self._reservations:
            cpu_allocatable -= reservation['cpu']

        self._cpu_allocatable = cpu_allocatable

    def _set_storage_allocatable(self):
        storage_allocatable = self._storage_capacity
        for reservation in self._reservations:
            try:
                storage_allocatable -= reservation['storage']
            except KeyError:
                pass
        self._storage_allocatable = storage_allocatable

    def add_reservation(self, reservation: Dict) -> None:
        """
        Adds a reservation to the nodes resources and then recomputes whats allocatable.
        Throws an KeyError exception if the reservation dictionary is missing a required field.

        :param reservation

        :return:
        """
        if reservation["cpu"] and reservation["memory"] and reservation["type"]:
            self._reservations.append(reservation)
            self._set_cpu_allocatable()
            self._set_memory_allocatable()

    @property
    def cpu_capacity(self) -> int:
        """
        Returns the total number of millicpus that is in this resource.
        This is returned (IE: 12000 is 12 CPU cores.)

        :return: milliscpus
        """
        return self._cpu_capacity

    @property
    def cpu_allocatable(self) -> int:
        """
        Returns the number of millicpus that are allocatable.
        This is returned (IE: 12000 is 12 CPU cores.)

        :return: milliscpus
        """
        return self._cpu_allocatable

    @property
    def mem_capacity(self) -> int:
        """
        Returns the total memory that is this resource.
        This memory is convertned and returned as Kibibytes.

        :return:        
        """
        return self._memory_capacity

    @property
    def mem_allocatable(self) -> int:
        """
        Returns the memory that is currently allocatable.
        This memory is convertned and returned as Kibibytes.

        :return:        
        """
        return self._memory_allocatable

    @property
    def storage_allocatable(self) -> int:
        return self._storage_allocatable


class NodeResourcePool:
    def __init__(self, nodes: List[Dict]):
        self._node_resources = []
        for node in nodes:
            self._node_resources.append(NodeResources(node))

        self._pool_cpu_capacity = self._cal_pool_cpu_capacity()
        self._pool_mem_capacity = self._cal_pool_mem_capacity()
        self._pool_cpu_allocatable = self._cal_pool_cpu_allocatable()
        self._pool_mem_allocatable = self._cal_pool_mem_allocatable()
        self._lowest_cpu_capacity = self._set_lowest_cpu_capacity()
        self._lowest_cpu_allocatable = self._set_lowest_cpu_allocatable()

    def _cal_pool_cpu_capacity(self) -> int:
        capacity = 0
        for node_resource in self._node_resources:
            capacity += node_resource.cpu_capacity
        return capacity

    def _cal_pool_mem_capacity(self) -> int:
        capacity = 0
        for node_resource in self._node_resources:
            capacity += node_resource.mem_capacity
        return capacity

    def _cal_pool_cpu_allocatable(self) -> int:
        allocatable = 0
        for node_resource in self._node_resources:
            allocatable += node_resource.cpu_allocatable
        return allocatable

    def _cal_pool_mem_allocatable(self) -> int:
        allocatable = 0
        for node_resource in self._node_resources:
            allocatable += node_resource.mem_allocatable
        return allocatable

    def _set_lowest_cpu_capacity(self) -> int:
        ret_val = None
        for node_resource in self._node_resources:
            if ret_val is None:
                ret_val = node_resource.cpu_capacity
            elif ret_val > node_resource.cpu_capacity:
                ret_val = node_resource.cpu_capacity
        return ret_val

    def _set_lowest_cpu_allocatable(self) -> int:
        ret_val = None
        for node_resource in self._node_resources:
            if ret_val is None:
                ret_val = node_resource.cpu_allocatable
            elif ret_val > node_resource.cpu_allocatable:
                ret_val = node_resource.cpu_allocatable
        return ret_val

    @property
    def pool_cpu_capacity(self):
        return self._pool_cpu_capacity

    @property
    def pool_mem_capacity(self):
        return self._pool_mem_capacity

    @property
    def pool_cpu_allocatable(self):
        return self._pool_cpu_allocatable

    @property
    def pool_mem_allocatable(self):
        return self._pool_mem_allocatable

    @property
    def lowest_cpu_capacity(self):
        return self._lowest_cpu_capacity

    @property
    def lowest_cpu_allocatable(self):
        return self._lowest_cpu_capacity
