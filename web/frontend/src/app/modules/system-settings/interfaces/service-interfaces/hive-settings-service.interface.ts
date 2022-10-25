import { Observable } from 'rxjs';

import { HiveSettingsClass } from '../../../../classes';
import { HiveSettingsInterface } from '../../../../interfaces';

/**
 * Interface defines the Hive Settings Service
 *
 * @export
 * @interface HiveSettingsServiceInterface
 */
export interface HiveSettingsServiceInterface {
  save_hive_settings(hive_settings: HiveSettingsInterface): Observable<HiveSettingsClass>;
}
