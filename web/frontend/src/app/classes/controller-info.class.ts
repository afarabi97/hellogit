import { ControllerInfoInterface } from '../interfaces';
import { IPSetFirstLastClass } from './ip-set-first-last.class';

/**
 * Class defines the Controller Info
 *
 * @export
 * @class ControllerInfoClass
 * @implements {ControllerInfoInterface}
 */
export class ControllerInfoClass implements ControllerInfoInterface {
  ip_address: string;
  gateway: string;
  netmask: string;
  name: string;
  cidrs: string[];
  dhcp_range: string;
  cidr_ranges: Record<string, IPSetFirstLastClass>;

  /**
   * Creates an instance of ControllerInfoClass.
   *
   * @param {ControllerInfoInterface} controllerInfoInterface
   * @memberof ControllerInfoClass
   */
  constructor (controllerInfoInterface: ControllerInfoInterface) {
    this.ip_address = controllerInfoInterface.ip_address;
    this.gateway = controllerInfoInterface.gateway;
    this.netmask = controllerInfoInterface.netmask;
    this.name = controllerInfoInterface.name;
    this.cidrs = controllerInfoInterface.cidrs;
    this.dhcp_range = controllerInfoInterface.dhcp_range;
    this.cidr_ranges = controllerInfoInterface.cidr_ranges;
  }
}
