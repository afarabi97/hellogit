import {
  HealthStatusDiskUsageInterface,
  HealthStatusInterface,
  HealthStatusNodeInfoInterface,
  HealthStatusNodeInfoStatusTypesDataInterface,
  HealthStatusNodeInfoStatusTypesInterface,
  HealthStatusTotalsInterface,
  HealthStatusUtilizationInfoInterface,
  HealthStatusVirtualMemoryInterface
} from '../interfaces';

export class HealthStatusTotalsClass implements HealthStatusTotalsInterface {
  cpus_requested: number;
  mem_requested: number;
  cpus_requested_str: string;
  mem_requested_str: string;
  remaining_allocatable_cpu?: string;
  remaining_allocatable_mem?: string;
  name?: string;
  node_type?: string;

  /**
   * Creates an instance of HealthStatusTotalsClass.
   *
   * @param {HealthStatusTotalsInterface} health_status_totals
   * @memberof HealthStatusTotalsClass
   */
  constructor(health_status_totals: HealthStatusTotalsInterface) {
    this.cpus_requested = health_status_totals.cpus_requested;
    this.mem_requested = health_status_totals.mem_requested;
    this.cpus_requested_str = health_status_totals.cpus_requested_str;
    this.mem_requested_str = health_status_totals.mem_requested_str;
    this.remaining_allocatable_cpu = health_status_totals.remaining_allocatable_cpu;
    this.remaining_allocatable_mem = health_status_totals.remaining_allocatable_mem;
    this.name = health_status_totals.name;
    this.node_type = health_status_totals.node_type;
  }
}

export class HealthStatusNodeInfoClass implements HealthStatusNodeInfoInterface {
  status: HealthStatusNodeInfoStatusTypesClass;
  node_type: string;
  public_ip?: string;

  /**
   * Creates an instance of HealthStatusNodeInfoClass.
   *
   * @param {HealthStatusNodeInfoInterface} health_status_node_info
   * @memberof HealthStatusNodeInfoClass
   */
  constructor(health_status_node_info: HealthStatusNodeInfoInterface) {
    this.status = new HealthStatusNodeInfoStatusTypesClass(health_status_node_info.status);
    this.node_type = health_status_node_info.node_type;
    this.public_ip = health_status_node_info?.public_ip;
  }
}

export class HealthStatusNodeInfoStatusTypesClass implements HealthStatusNodeInfoStatusTypesInterface {
  allocatable: HealthStatusNodeInfoStatusTypesDataClass;
  capacity: HealthStatusNodeInfoStatusTypesDataClass;

  /**
   * Creates an instance of HealthStatusNodeInfoStatusTypesClass.
   *
   * @param {HealthStatusNodeInfoStatusTypesInterface} health_status_node_info_status_types_interface
   * @memberof HealthStatusNodeInfoStatusTypesClass
   */
  constructor(health_status_node_info_status_types_interface: HealthStatusNodeInfoStatusTypesInterface) {
    this.allocatable = new HealthStatusNodeInfoStatusTypesDataClass(health_status_node_info_status_types_interface.allocatable);
    this.capacity = new HealthStatusNodeInfoStatusTypesDataClass(health_status_node_info_status_types_interface.capacity);
  }
}

export class HealthStatusNodeInfoStatusTypesDataClass implements HealthStatusNodeInfoStatusTypesDataInterface {
  cpu: string;
  'ephemeral-storage': string;
  memory: string;

  /**
   * Creates an instance of HealthStatusNodeInfoStatusTypesDataClass.
   *
   * @param {HealthStatusNodeInfoStatusTypesDataInterface} health_status_node_info_status_types_data_interface
   * @memberof HealthStatusNodeInfoStatusTypesDataClass
   */
  constructor(health_status_node_info_status_types_data_interface: HealthStatusNodeInfoStatusTypesDataInterface) {
    this.cpu = health_status_node_info_status_types_data_interface.cpu;
    this['ephemeral-storage'] = health_status_node_info_status_types_data_interface['ephemeral-storage'];
    this.memory = health_status_node_info_status_types_data_interface.memory;
  }
}

export class HealthStatusDiskUsageClass implements HealthStatusDiskUsageInterface {
  total: number;
  used: number;
  free: number;
  percent: number;

  /**
   * Creates an instance of HealthStatusDiskUsageClass.
   *
   * @param {HealthStatusDiskUsageInterface} disk_usage
   * @memberof HealthStatusDiskUsageClass
   */
  constructor(disk_usage: HealthStatusDiskUsageInterface) {
    this.total = disk_usage.total;
    this.used = disk_usage.used;
    this.free = disk_usage.free;
    this.percent = disk_usage.percent;
  }
}

export class HealthStatusVirtualMemoryClass implements HealthStatusVirtualMemoryInterface {
  total: number;
  available: number;
  percent: number;
  used: number;
  free: number;
  active: number;
  inactive: number;
  buffers: number;
  cached: number;
  shared: number;
  slab: number;

  /**
   * Creates an instance of HealthStatusVirtualMemoryClass.
   *
   * @param {HealthStatusVirtualMemoryInterface} virtual_memory
   * @memberof HealthStatusVirtualMemoryClass
   */
  constructor(virtual_memory: HealthStatusVirtualMemoryInterface) {
    this.total = virtual_memory.total;
    this.available = virtual_memory.available;
    this.percent = virtual_memory.percent;
    this.used = virtual_memory.used;
    this.free = virtual_memory.free;
    this.active = virtual_memory.active;
    this.inactive = virtual_memory.inactive;
    this.buffers = virtual_memory.buffers;
    this.cached = virtual_memory.cached;
    this.shared = virtual_memory.shared;
    this.slab = virtual_memory.slab;
  }
}

export class HealthStatusUtilizationInfoClass implements HealthStatusUtilizationInfoInterface {
  cpu_percent: number;
  data_usage: HealthStatusDiskUsageClass;
  root_usage: HealthStatusDiskUsageClass;
  memory: HealthStatusVirtualMemoryClass;

  /**
   * Creates an instance of HealthStatusUtilizationInfoClass.
   *
   * @param {HealthStatusUtilizationInfoInterface} health_status_utilization_info
   * @memberof HealthStatusUtilizationInfoClass
   */
  constructor(health_status_utilization_info: HealthStatusUtilizationInfoInterface) {
    this.cpu_percent = health_status_utilization_info.cpu_percent;
    this.data_usage = new HealthStatusDiskUsageClass(health_status_utilization_info.data_usage);
    this.root_usage = new HealthStatusDiskUsageClass(health_status_utilization_info.root_usage);
    this.memory = new HealthStatusVirtualMemoryClass(health_status_utilization_info.memory);
  }
}

export class HealthStatusClass implements HealthStatusInterface {
  totals: {[key: string]: HealthStatusTotalsInterface};
  pods: Array<Object>;
  nodes: Array<Object>;
  node_info: {[key: string]: HealthStatusNodeInfoInterface};
  utilization_info:{[key: string]: HealthStatusUtilizationInfoInterface};

  /**
   * Creates an instance of HealthStatusClass.
   *
   * @param {HealthStatusInterface} health_status
   * @memberof HealthStatusClass
   */
  constructor(health_status: HealthStatusInterface) {
    this.totals = {};
    for (const [key, value] of Object.entries(health_status.totals)) {
      this.totals[key] = new HealthStatusTotalsClass(value);
    }

    this.pods = health_status.pods;
    this.nodes = health_status.nodes;

    this.node_info = {};
    for (const [key, value] of Object.entries(health_status.node_info)) {
      this.node_info[key] = new HealthStatusNodeInfoClass(value);
    }

    this.utilization_info = {};
    for (const [key, value] of Object.entries(health_status.utilization_info)) {
      this.utilization_info[key] = new HealthStatusUtilizationInfoClass(value);
    }
  }
}
