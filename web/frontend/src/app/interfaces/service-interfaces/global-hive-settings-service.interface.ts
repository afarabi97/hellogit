import { Observable } from 'rxjs';

import { HiveSettingsClass } from '../../classes';

/**
 * Interface defines the Global Hive Settings Service
 *
 * @export
 * @interface GlobalHiveSettingsServiceInterface
 */
export interface GlobalHiveSettingsServiceInterface {
  get_hive_settings(): Observable<HiveSettingsClass>;
}
