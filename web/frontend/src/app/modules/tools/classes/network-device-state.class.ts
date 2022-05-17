import { NetworkDeviceStateInterface } from '../interfaces/network-device-state.interface';

/**
 * Class defines the Network Device State
 *
 * @export
 * @class NetworkDeviceStateClass
 * @extends {IFACEStateClass}
 * @implements {NetworkDeviceStateInterface}
 */
export class NetworkDeviceStateClass implements NetworkDeviceStateInterface {
  node: string;
  device: string;
  state: string;
  link_up: boolean;

  /**
   * Creates an instance of NetworkDeviceStateClass.
   *
   * @param {NetworkDeviceStateInterface} network_device_state_interface
   * @memberof NetworkDeviceStateClass
   */
  constructor(network_device_state_interface: NetworkDeviceStateInterface) {
    this.node = network_device_state_interface.node;
    this.device = network_device_state_interface.device;
    this.state = network_device_state_interface.state;
    this.link_up = network_device_state_interface.link_up;
  }
}
