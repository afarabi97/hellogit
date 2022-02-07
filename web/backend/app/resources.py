from typing import Dict, List


def convert_gib_to_mib(gib: float) -> float:
    return gib * 1024


def convert_mib_to_kib(mib: float) -> float:
    return mib * 1024


def convert_gib_to_kib(gib: float) -> float:
    val = convert_gib_to_mib(gib)
    return convert_mib_to_kib(val)


def convert_mib_to_gib(mib: float, round_places=3) -> float:
    ret_val = mib / 1024
    if round_places > 0:
        return round(ret_val, round_places)
    return ret_val


def convert_kib_to_gib(kib: float, round_places=3) -> float:
    ret_val = kib / 1024 / 1024
    if round_places > 0:
        return round(ret_val, round_places)
    return ret_val


def convert_gb_to_kb(gb: float) -> float:
    return gb * 1000 * 1000


def cal_percentage_of_total(total: float, percentage: int) -> float:
    if percentage == 0:
        return 0

    if percentage > 100 or percentage < 0:
        raise ValueError("Percentage can not be larger than 100 or less than 0")
    return (percentage / 100) * total


class StoragePool:
    def __init__(self, nodes: List[Dict]):
        self._nodes = nodes
        self._pool_capacity = self._set_storage_capacity()
        self._reservations = []
        self._pool_allocatable = 0
        self._set_storage_allocatable()

    def _set_storage_capacity(self):
        ret_val = 0
        for node in self._nodes:
            device_facts = node["deviceFacts"]
            for disk in device_facts["disks"]:
                for name in node["es_drives"]:
                    if disk["name"] == name:
                        ret_val += convert_gb_to_kb(disk["size_gb"])
        return ret_val

    def add_reservation(self, name: str, kb: int):
        self._reservations.append({"name": name, "size": kb})
        self._set_storage_allocatable()

    def _set_storage_allocatable(self):
        storage_allocatable = self._pool_capacity
        for reservation in self._reservations:
            storage_allocatable -= reservation["size"]

        self._pool_allocatable = storage_allocatable

    @property
    def pool_capacity(self) -> int:
        """
        :return: Storage capacity as KB
        """
        return int(self._pool_capacity)

    @property
    def pool_allocatable(self) -> int:
        """
        :return: Storage allocatable as KB
        """
        return int(self._pool_allocatable)


class NodeResources:
    def __init__(self, node: Dict):
        self._node = node
        self._device_facts = node["deviceFacts"]
        self._cpu_capacity = self._device_facts["cpus_available"] * 1000
        self._memory_capacity = convert_gib_to_kib(
            self._device_facts["memory_available"]
        )
        self._storage_capacity = self._cal_storage_capacity()
        self._memory_allocatable = self._memory_capacity
        self._cpu_allocatable = self._cpu_capacity
        self._storage_allocatable = self._storage_capacity

        # Memory is measured in Kibibytes.

        self._operating_system_reservation = self._create_os_reservation()
        self._kube_reservation = self._create_kube_reservation()
        self._system_pod_reservation = self._create_system_pod_reservation()

        self._reservations = []
        self.add_reservation(self._operating_system_reservation)
        self.add_reservation(self._kube_reservation)
        self.add_reservation(self._system_pod_reservation)

    def __str__(self) -> str:
        return (
            "Reservations: " + str(self._reservations) + "\n"
            "Length: " + str(len(self._reservations)) + "\n"
            "cpu_capacity: " + str(self.cpu_capacity) + "\n"
            "mem_capacity: " + str(self.mem_capacity) + "\n"
            "cpu_allocatable: " + str(self.cpu_allocatable) + "\n"
            "mem_allocatable: " + str(self.mem_allocatable) + "\n"
        )

    def _create_os_reservation(self) -> Dict:
        cpu_reserve = int(cal_percentage_of_total(self._cpu_capacity, 10))
        if cpu_reserve > 1000:
            cpu_reserve = 1000

        mem_reserve = int(cal_percentage_of_total(self._memory_capacity, 5))
        if mem_reserve > convert_gib_to_kib(1):
            mem_reserve = convert_gib_to_kib(1)

        return {"type": "system", "cpu": cpu_reserve, "memory": mem_reserve}

    def _create_kube_reservation(self) -> Dict:
        cpu_reserve = int(cal_percentage_of_total(self._cpu_capacity, 5))
        if cpu_reserve > 1000:
            cpu_reserve = 1000

        mem_reserve = int(cal_percentage_of_total(self._memory_capacity, 5))
        if mem_reserve > convert_gib_to_kib(1):
            mem_reserve = convert_gib_to_kib(1)

        return {"type": "kube", "cpu": cpu_reserve, "memory": mem_reserve}

    def _create_system_pod_reservation(self) -> Dict:
        cpu_reserve = int(cal_percentage_of_total(self._cpu_capacity, 10))
        mem_reserve = int(cal_percentage_of_total(self._memory_capacity, 10))
        if cpu_reserve < 1000:
            cpu_reserve = 1000

        mem_minimum = convert_mib_to_kib(500)
        if mem_reserve < mem_minimum:
            mem_reserve = mem_minimum

        return {"type": "sys-pod", "cpu": cpu_reserve, "memory": mem_reserve}

    def _cal_storage_capacity(self) -> int:
        """
        Calculates the storage capacity.

        :return: KB for pcap stroage
        """
        ret_val = 0
        for disk in self._device_facts["disks"]:
            try:
                for name in self._node["pcap_drives"]:
                    if disk["name"] == name:
                        ret_val += disk["size_gb"]
            except KeyError:
                break
        return convert_gb_to_kb(ret_val)

    def _set_memory_allocatable(self):
        mem_allocatable = self._memory_capacity
        for reservation in self._reservations:
            mem_allocatable -= reservation["memory"]

        self._memory_allocatable = mem_allocatable

    def _set_cpu_allocatable(self):
        cpu_allocatable = self._cpu_capacity
        for reservation in self._reservations:
            cpu_allocatable -= reservation["cpu"]

        self._cpu_allocatable = cpu_allocatable

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

    def get_default_reservations(self) -> Dict:
        """
        Returns the default reservations needed for each node
        for the inventory file.
        """
        return {
            "sys_cpu_reserve": self._operating_system_reservation["cpu"],
            "sys_mem_reserve": int(self._operating_system_reservation["memory"]),
            "kube_cpu_reserve": self._kube_reservation["cpu"],
            "kube_mem_reserve": int(self._kube_reservation["memory"]),
        }


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
            if ret_val is None or ret_val > node_resource.cpu_capacity:
                ret_val = node_resource.cpu_capacity
        return ret_val

    def _set_lowest_cpu_allocatable(self) -> int:
        ret_val = None
        for node_resource in self._node_resources:
            if ret_val is None or ret_val > node_resource.cpu_allocatable:
                ret_val = node_resource.cpu_allocatable
        return ret_val

    def get_node_resources(self, index: int) -> NodeResources:
        return self._node_resources[index]

    def get_node_reservations(self, index: int) -> Dict:
        return self.get_node_resources(index).get_default_reservations()

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
