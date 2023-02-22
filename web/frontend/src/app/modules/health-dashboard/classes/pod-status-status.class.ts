import {
  PodStatusStatusInterface,
  StatusConditionInterface,
  StatusContainerStatusInterface,
  StatusPodIPSInterface
} from '../interfaces';
import { StatusConditionClass } from './status-condition.class';
import { StatusContainerStatusClass } from './status-container-status.class';
import { StatusPodIPSClass } from './status-pod-ips.class';

/**
 * Class defines the Pod Status Status
 *
 * @export
 * @class PodStatusStatusClass
 * @implements {PodStatusStatusInterface}
 */
export class PodStatusStatusClass implements PodStatusStatusInterface {
  conditions: StatusConditionClass[];
  container_statuses: StatusContainerStatusClass[];
  host_ip: string;
  phase: string;
  pod_ip: string;
  pod_i_ps: StatusPodIPSClass[];
  qos_class: string;
  start_time: string;

  /**
   * Creates an instance of PodStatusStatusClass.
   *
   * @param {PodStatusStatusInterface} pod_status_status_interface
   * @memberof PodStatusStatusClass
   */
  constructor(pod_status_status_interface: PodStatusStatusInterface) {
    this.conditions = pod_status_status_interface.conditions.map((sc: StatusConditionInterface) => new StatusConditionClass(sc));
    this.container_statuses = pod_status_status_interface.container_statuses.map((scs: StatusContainerStatusInterface) => new StatusContainerStatusClass(scs));
    this.host_ip = pod_status_status_interface.host_ip;
    this.phase = pod_status_status_interface.phase;
    this.pod_ip = pod_status_status_interface.pod_ip;
    this.pod_i_ps = pod_status_status_interface.pod_i_ps.map((spips: StatusPodIPSInterface) => new StatusPodIPSClass(spips));
    this.qos_class = pod_status_status_interface.qos_class;
    this.start_time = pod_status_status_interface.start_time;
  }
}