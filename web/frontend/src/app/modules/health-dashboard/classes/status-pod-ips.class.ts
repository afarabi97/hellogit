import { StatusPodIPSInterface } from '../interfaces';

/**
 * Class defines the Status Pod IPS
 *
 * @export
 * @class StatusPodIPSClass
 * @implements {StatusPodIPSInterface}
 */
export class StatusPodIPSClass implements StatusPodIPSInterface {
  ip: string;

  /**
   * Creates an instance of StatusPodIPSClass.
   *
   * @param {StatusPodIPSInterface} status_pod_ips_interface
   * @memberof StatusPodIPSClass
   */
  constructor(status_pod_ips_interface: StatusPodIPSInterface) {
    this.ip = status_pod_ips_interface.ip;
  }
}
