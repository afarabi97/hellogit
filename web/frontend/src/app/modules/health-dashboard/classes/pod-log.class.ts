import { PodLogInterface } from '../interfaces';

/**
 * Class defines the Pod Log
 *
 * @export
 * @class PodLogClass
 * @implements {PodLogInterface}
 */
export class PodLogClass implements PodLogInterface {
  logs: string;
  name: string;

  /**
   * Creates an instance of PodLogClass.
   *
   * @param {PodLogInterface} pod_log_interface
   * @memberof PodLogClass
   */
  constructor(pod_log_interface: PodLogInterface) {
    this.logs = pod_log_interface.logs;
    this.name = pod_log_interface.name;
  }
}
