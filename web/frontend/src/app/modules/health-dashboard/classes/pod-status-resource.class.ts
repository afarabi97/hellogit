import { PodStatusResourceInterface } from '../interfaces';

/**
 * Class defines the Pod Status Resource
 *
 * @export
 * @class PodStatusResourceClass
 * @implements {PodStatusResourceInterface}
 */
export class PodStatusResourceClass implements PodStatusResourceInterface {
  name: string;
  resources: {
    limits: Object;
    requests: Object;
  };

  /**
   * Creates an instance of PodStatusResourceClass.
   *
   * @param {PodStatusResourceInterface} pod_status_resource_interface
   * @memberof PodStatusResourceClass
   */
  constructor(pod_status_resource_interface: PodStatusResourceInterface) {
    this.name = pod_status_resource_interface.name;
    this.resources = pod_status_resource_interface.resources;
  }
}
