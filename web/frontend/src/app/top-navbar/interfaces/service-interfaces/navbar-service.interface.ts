import { Observable } from 'rxjs';

import { DIPTimeClass } from '../../classes/dip-time.class';

/**
 * Interface defines navbar service
 *
 * @export
 * @interface NavbarServiceInterface
 */
export interface NavbarServiceInterface {
  getCurrentDIPTime(): Observable<DIPTimeClass>;
}
