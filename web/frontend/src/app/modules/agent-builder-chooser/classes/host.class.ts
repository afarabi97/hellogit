import { HostInterface } from '../interfaces';

/**
 * Class defines the Host
 *
 * @export
 * @class HostClass
 * @implements {HostInterface}
 */
export class HostClass implements HostInterface {
  hostname: string;
  state: string;
  last_state_change: string;
  target_config_id: string;

  /**
   * Creates an instance of HostClass.
   *
   * @param {HostInterface} host_interface
   * @param {string} config_id
   * @memberof HostClass
   */
  constructor(host_interface: HostInterface, config_id: string) {
    this.hostname = host_interface.hostname;
    this.state = host_interface.state;
    this.last_state_change = host_interface.last_state_change;
    this.target_config_id = config_id;
  }
}
