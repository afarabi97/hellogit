import { StatusConditionInterface } from './status-condition.interface';
import { StatusContainerStatusInterface } from './status-container-status.interface';
import { StatusPodIPSInterface } from './status-pod-ips.interface';

/**
 * Interface defines the Pod Status Status
 *
 * @export
 * @interface PodStatusStatusInterface
 */
export interface PodStatusStatusInterface {
  conditions: StatusConditionInterface[];
  container_statuses: StatusContainerStatusInterface[];
  host_ip: string;
  phase: string;
  pod_ip: string;
  pod_i_ps: StatusPodIPSInterface[];
  qos_class: string;
  start_time: string;
}
