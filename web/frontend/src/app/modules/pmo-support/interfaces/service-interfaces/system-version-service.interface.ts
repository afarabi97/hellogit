import { Observable } from "rxjs";

import { SystemVersionClass } from '../../classes';

/**
 * Interface defines the system version service
 *
 * @export
 * @interface SystemVersionServiceInterface
 */
export interface SystemVersionServiceInterface {
  get_system_version(): Observable<SystemVersionClass>;
}
