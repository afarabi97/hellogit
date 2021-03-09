import { Observable } from "rxjs";

import { HostInfoClass } from '../../classes/host-info.class';

export interface SensorHostInfoServiceInterface {
  get_sensor_host_info(): Observable<HostInfoClass[]>;
}
