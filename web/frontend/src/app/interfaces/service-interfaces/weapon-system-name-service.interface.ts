import { Observable } from 'rxjs';

import { SystemNameClass } from '../../classes';

/**
 * Interface defines the weapon system name service
 *
 * @export
 * @interface WeaponSystemNameServiceInterface
 */
export interface WeaponSystemNameServiceInterface {
  setSystemName(systemName: SystemNameClass): void;
  getSystemName(): string;
  getSystemNameFromAPI(): Observable<SystemNameClass>;
}
