import { IFACEStateClass } from '../../../classes';
import { IFACEStateInterface } from '../../../interfaces';
import { InitialDeviceStateInterface } from '../interfaces/initial-device-states.interface';

/**
 * Class defines the Initial Device State
 *
 * @export
 * @class InitialDeviceStateClass
 * @implements {InitialDeviceStateInterface}
 */
export class InitialDeviceStateClass implements InitialDeviceStateInterface {
  node: string;
  interfaces: IFACEStateClass[];

  /**
   * Creates an instance of InitialDeviceStateClass.
   *
   * @param {InitialDeviceStateInterface} initial_device_state_interface
   * @memberof InitialDeviceStateClass
   */
  constructor(initial_device_state_interface: InitialDeviceStateInterface) {
    this.node = initial_device_state_interface.node;
    this.interfaces = initial_device_state_interface.interfaces.map((iface_state: IFACEStateInterface) => new IFACEStateClass(iface_state));
  }
}
