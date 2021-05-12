import { HealthStatusInterface, HealthStatusTotalsInterface, HealthStatusNodeInfoInterface, HealthStatusUtilizationInfoInterface, HealthStatusDiskUsageInterface, HealthStatusVirtualMemoryInterface } from "../interfaces";

export class HealthStatusTotalsClass implements HealthStatusTotalsInterface {
  cpus_requested: number;
  mem_requested: number;
  cpus_requested_str: string;
  mem_requested_str: string;
  remaining_allocatable_cpu?: string;
  remaining_allocatable_mem?: string;
  name?: string;
  node_type?: string;

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
  'status.allocatable.cpu': string;
  'status.allocatable.ephemeral-storage': string;
  'status.allocatable.memory': string;
  'status.capacity.cpu': string;
  'status.capacity.ephemeral-storage': string;
  'status.capacity.memory': string;
  node_type: string;
  public_ip?: string;

  constructor(health_status_node_info: HealthStatusNodeInfoInterface) {
    this['status.allocatable.cpu'] = health_status_node_info['status.allocatable.cpu'];
    this['status.allocatable.ephemeral-storage'] = health_status_node_info['status.allocatable.ephemeral-storage'];
    this['status.allocatable.memory'] = health_status_node_info['status.allocatable.memory'];
    this['status.capacity.cpu'] = health_status_node_info['status.capacity.cpu'];
    this['status.capacity.ephemeral-storage'] = health_status_node_info['status.capacity.ephemeral-storage'];
    this['status.capacity.memory'] = health_status_node_info['status.capacity.memory'];
    this.node_type = health_status_node_info.node_type;
    this.public_ip = health_status_node_info?.public_ip;
  }
}

export class HealthStatusDiskUsageClass implements HealthStatusDiskUsageInterface {
  total: number;
  used: number;
  free: number;
  percent: number;

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
