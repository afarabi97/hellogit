import { Observable } from 'rxjs';

import { AlertListClass, HiveSettingsClass, ModifyRemoveReturnClass, UpdateAlertsClass } from '../../classes';
import { HiveSettingsInterface } from '../../interfaces';

/**
 * Interface defines the Alert Service
 *
 * @export
 * @interface AlertServiceInterface
 */
export interface AlertServiceInterface {
  get_fields(): Observable<string[]>;
  get_alerts(fields: string, start_time: string,
             end_time: string, acknowledged: boolean,
             escalated: boolean, show_closed: boolean): Observable<UpdateAlertsClass[]>;
  get_alert_list(update_alert: UpdateAlertsClass, size: number): Observable<AlertListClass>;
  modify_alert(update_alert: UpdateAlertsClass): Observable<ModifyRemoveReturnClass>;
  remove_alerts(update_alert: UpdateAlertsClass): Observable<ModifyRemoveReturnClass>;
  save_hive_settings(hive_settings: HiveSettingsInterface): Observable<HiveSettingsClass>;
  get_hive_settings(): Observable<HiveSettingsClass>;
}
