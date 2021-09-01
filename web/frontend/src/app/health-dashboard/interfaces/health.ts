export interface NodeMetrics {
  name: string;
  address: string;
  ready: boolean;
  type: string;
  storage: string[];
  memory: Memory;
  cpu: number;
  capacity: Capacity;
  allocatable: Allocatable;
  remaining: Remaining;
  node_info: Object;
}

interface Memory {
  available: number;
  percent: number;
}

interface Capacity {
  cpu: string;
  emphermeral_storage: string;
  memory: string;
  pods: string;
}

interface Allocatable {
  cpu: string;
  emphermeral_storage: string;
  memory: string;
  pods: string;
}

interface Remaining {
  cpu: string;
  memory: string;
}

export interface PodMetrics {
  name: string;
  namespace: string;
  node_name: string;
  resources: Object[];
  restart_count: number;
  states: string[];
  status: Status;
  status_brief: string;
  warnings?: number;
}

interface Status {
  conditions: Object[];
  container_statuses: Object[];
  host_ip: string;
  phase: string;
  pod_i_ps: Object[];
  pod_ip: string;
  qos_class: string;
  start_time: string;
}


export interface ApplicationStatus {
  type: string[];
  items: {};
}
