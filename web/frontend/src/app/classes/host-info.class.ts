import { HostInfoInterface } from '../interfaces';

/**
 * Class defines the HostInfoClass
 *
 * @export
 * @class HostInfoClass
 * @implements {HostInfoInterface}
 */
export class HostInfoClass implements HostInfoInterface {
  hostname: string;
  management_ip: string;
  mac: string;

  /**
   * Creates an instance of HostInfo.
   *
   * @param {HostInfoInterface} host_info_interface
   * @memberof HostInfo
   */
  constructor(host_info_interface: HostInfoInterface){
    this.hostname = host_info_interface.hostname;
    this.mac = host_info_interface.mac;
    this.management_ip = host_info_interface.management_ip;
  }
}
