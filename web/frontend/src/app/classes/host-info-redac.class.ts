import { HostInfoClass } from './host-info.class';

/**
 * Class defines the HostInfoRedac
 *
 * @export
 * @class HostInfoRedacClass
 * @implements {HostInfoClass}
 */
export class HostInfoRedacClass implements HostInfoClass {
  hostname: string;
  management_ip: string;
  mac: string;

  /**
   * Creates an instance of HostInfo.
   *
   * @param {HostInfoInterface} host_info_interface
   * @memberof HostInfo
   */
  constructor(host_info_class: HostInfoClass){
    this.hostname = host_info_class.hostname;
    this.management_ip = host_info_class.management_ip;
    this.mac = undefined;
  }
}
