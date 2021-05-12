export interface HealthStatusTotalsInterface {
  cpus_requested: number;
  mem_requested: number;
  cpus_requested_str: string;
  mem_requested_str: string;
  remaining_allocatable_cpu?: string;
  remaining_allocatable_mem?: string;
  name?: string;
  node_type?: string;
}

export interface HealthStatusNodeInfoInterface {
  'status.allocatable.cpu': string;
  'status.allocatable.ephemeral-storage': string;
  'status.allocatable.memory': string;
  'status.capacity.cpu': string;
  'status.capacity.ephemeral-storage': string;
  'status.capacity.memory': string;
  node_type: string;
  public_ip?: string
}

export interface HealthStatusDiskUsageInterface {
  total: number;
  used: number;
  free: number;
  percent: number;
}

export interface HealthStatusVirtualMemoryInterface {
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
}

export interface HealthStatusUtilizationInfoInterface {
  cpu_percent: number;
  data_usage: HealthStatusDiskUsageInterface;
  root_usage: HealthStatusDiskUsageInterface;
  memory: HealthStatusVirtualMemoryInterface;
}

export interface HealthStatusInterface {
  totals: {[key: string]: HealthStatusTotalsInterface};
  pods: Array<Object>;
  nodes: Array<Object>;
  node_info:{[key: string]: HealthStatusNodeInfoInterface};
  utilization_info: {[key: string]: HealthStatusUtilizationInfoInterface};
}
