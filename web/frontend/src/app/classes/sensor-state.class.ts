import { SensorStateInterface } from '../interfaces';

export class SensorStateClass implements SensorStateInterface {
  hostname: string;
  state: string;

  /**
   * Creates an instance of SensorStateClass.
   *
   * @param {SensorStateInterface} sensor_state_interface
   * @memberof SensorStateClass
   */
  constructor(sensor_state_interface: SensorStateInterface) {
    this.hostname = sensor_state_interface.hostname;
    this.state = sensor_state_interface.state;
  }
}
