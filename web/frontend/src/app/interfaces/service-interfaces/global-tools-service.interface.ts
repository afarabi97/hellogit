import { Observable } from 'rxjs';

import { IFACEStateClass } from '../../classes';

/**
 * Interface defines the Global Tools Service
 *
 * @export
 * @interface GlobalToolsServiceInterface
 */
export interface GlobalToolsServiceInterface {
  get_spaces(): Observable<string[]>;
  get_iface_states(hostname: string): Observable<IFACEStateClass[]>;
}
