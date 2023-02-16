import { PodStatusInterface, PodStatusResourceInterface } from '../interfaces';
import { PodStatusResourceClass } from './pod-status-resource.class';
import { PodStatusStatusClass } from './pod-status-status.class';

/**
 * Class defines the Pod Status
 *
 * @export
 * @class PodStatusClass
 * @implements {PodStatusInterface}
 */
export class PodStatusClass implements PodStatusInterface  {
  namespace: string;
  name: string;
  node_name: string;
  status_brief: string;
  restart_count: number;
  states: string[];
  resources: PodStatusResourceClass[];
  status: PodStatusStatusClass;
  warnings: number;

  /**
   * Creates an instance of PodStatusClass.
   *
   * @param {PodStatusInterface} pod_status_interface
   * @memberof PodStatusClass
   */
  constructor(pod_status_interface: PodStatusInterface) {
    this.namespace = pod_status_interface.namespace;
    this.name = pod_status_interface.name;
    this.node_name = pod_status_interface.node_name;
    this.status_brief = pod_status_interface.status_brief;
    this.restart_count = pod_status_interface.restart_count;
    this.states = pod_status_interface.states;
    this.resources = pod_status_interface.resources.map((psr: PodStatusResourceInterface) => new PodStatusResourceClass(psr));
    this.status = new PodStatusStatusClass(pod_status_interface.status);
    this.warnings = pod_status_interface.warnings;
  }
}
