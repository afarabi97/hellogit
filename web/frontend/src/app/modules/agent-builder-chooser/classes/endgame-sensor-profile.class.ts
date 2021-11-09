import { EndgameSensorProfileInterface } from '../interfaces/endgame-sensor-profile.interface';

/**
 * Class defines the endgame sensor profile
 *
 * @export
 * @class EndgameSensorProfileClass
 * @implements {EndgameSensorProfileInterface}
 */
export class EndgameSensorProfileClass implements EndgameSensorProfileInterface {
  id: string;
  name: string;

  /**
   * Creates an instance of EndgameSensorProfileClass.
   *
   * @param {EndgameSensorProfileInterface} endgame_sensor_profile_interface
   * @memberof EndgameSensorProfileClass
   */
  constructor(endgame_sensor_profile_interface: EndgameSensorProfileInterface) {
    this.id = endgame_sensor_profile_interface.id;
    this.name = endgame_sensor_profile_interface.name;
  }
}
