import { Observable } from 'rxjs';

import { EndgameSensorProfileClass } from '../../classes/endgame-sensor-profile.class';

/**
 * Interface defines the endgame service
 *
 * @export
 * @interface EndgameServiceInterface
 */
export interface EndgameServiceInterface {
  endgame_sensor_profiles(payload: Object) : Observable<EndgameSensorProfileClass[]>;
}
