import { NodeMetrics, PodMetrics } from "../../src/app/health-dashboard/interfaces/health"

export const MockNodeMetricsInterface: NodeMetrics = {
  name: "blank-sensor1",
  address: "10.40.01.64",
  ready: true,
  type: "sensor",
  storage: [],
  memory: { available: 14464249856, percent: 13.1 },
  cpu: 1.7,
  capacity: { cpu: "160000m", emphermeral_storage: "17.88Gi", memory: "15.401Gi", pods: "110" },
  allocatable: { cpu: "16000m", emphermeral_storage: "16.77Gi", memory: "15.401Gi", pods: "110" },
  remaining: { cpu: "15550m", memory: "15.206Gi" },
  node_info: {},
};

export const MockPodMetricsInterface: PodMetrics = {
  name: "cert-manager-7213981723",
  namespace: "cert-manager",
  node_name: "blank-sensor1",
  resources: [{}],
  restart_count: 0,
  states: [],
  status: { host_ip: "10.40.01.64", phase: "Running", pod_ip: "10.233.40.1", pod_i_ps: [{}],
    container_statuses: [{}], conditions: [{}], start_time: "2021-06-19 20:49:08",
    qos_class: "BestEffort" },
  status_brief: "Running",
};
