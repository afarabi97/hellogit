import { Observable } from 'rxjs';

import { AlertListClass, ModifyRemoveReturnClass } from '../../classes';

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
             escalated: boolean, show_closed: boolean): Observable<Object[]>;
  get_alert_list(update_alert: Object, size: number): Observable<AlertListClass>;
  modify_alert(update_alert: Object): Observable<ModifyRemoveReturnClass>;
  remove_alerts(update_alert: Object): Observable<ModifyRemoveReturnClass>;
}
