import { HiveSettingsClass } from '../../../classes';
import { AlertListClass } from '../classes';

/**
 * Interface defines the Fork Join Hive Settings and Alert List
 *
 * @export
 * @interface ForkJoinHiveSettingsAndAlertListInterface
 */
export interface ForkJoinHiveSettingsAndAlertListInterface {
  hive_settings: HiveSettingsClass;
  alert_list: AlertListClass;
}
