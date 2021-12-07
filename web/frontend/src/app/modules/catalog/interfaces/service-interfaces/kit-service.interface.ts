import { Observable } from 'rxjs';

import { NodeClass } from '../../../../classes';

/**
 * Interface defines the Kit Service
 *
 * @export
 * @interface KitServiceInterface
 */
export interface KitServiceInterface {
  get_kit_nodes(): Observable<NodeClass[]>;
}
