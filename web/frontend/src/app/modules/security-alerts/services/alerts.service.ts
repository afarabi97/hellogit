import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { AlertListClass, HiveSettingsClass, ModifyRemoveReturnClass, UpdateAlertsClass } from '../classes';
import {
  AlertListInterface,
  AlertServiceInterface,
  HiveSettingsInterface,
  ModifyRemoveReturnInterface,
  UpdateAlertsInterface
} from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'AlertService' };

/**
 * Service used for alert related calls
 *
 * @export
 * @class AlertService
 * @extends {ApiService<any>}
 * @implements {AlertServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class AlertService extends ApiService<any> implements AlertServiceInterface {

  /**
   * Creates an instance of AlertService.
   *
   * @memberof AlertService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET fields
   *
   * @return {Observable<string[]>}
   * @memberof AlertService
   */
  get_fields(): Observable<string[]> {
    return this.httpClient_.get<string[]>(environment.ALERT_SERVICE_FIELDS)
      .pipe(map((response: string[]) => response),
            catchError((error: HttpErrorResponse) => this.handleError('get fields', error)));
  }

  /**
   * REST call to GET alerts
   *
   * @param {string} fields
   * @param {string} start_time
   * @param {string} end_time
   * @param {boolean} [acknowledged=false]
   * @param {boolean} [escalated=false]
   * @param {boolean} [show_closed=false]
   * @return {Observable<UpdateAlertsClass[]>}
   * @memberof AlertService
   */
  get_alerts(fields: string, start_time: string,
             end_time: string, acknowledged: boolean=false,
             escalated: boolean=false, show_closed: boolean=false): Observable<UpdateAlertsClass[]> {
    const ack: string = acknowledged ? 'yes' : 'no';
    const escalate: string = escalated ? 'yes' : 'no';
    const show_closed_alerts: string = show_closed ? 'yes' : 'no';
    const url: string = `${environment.ALERT_SERVICE_BASE}${ack}/${escalate}/${show_closed_alerts}/${start_time}/${end_time}/${fields}`;

    return this.httpClient_.get<UpdateAlertsInterface[]>(url)
      .pipe(map((response: UpdateAlertsInterface[]) => response.map((update_alert: UpdateAlertsInterface) => new UpdateAlertsClass(update_alert))),
            catchError((error: HttpErrorResponse) => this.handleError('get alerts', error)));
  }

  /**
   * REST call to POST get alert list
   *
   * @param {UpdateAlertsClass} update_alert
   * @param {number} [size=0]
   * @return {Observable<AlertListClass>}
   * @memberof AlertService
   */
  get_alert_list(update_alert: UpdateAlertsClass, size: number=0): Observable<AlertListClass> {
    const url: string = `${environment.ALERT_SERVICE_LIST}${size}`;

    return this.httpClient_.post<AlertListInterface>(url, update_alert)
      .pipe(map((response: AlertListInterface) => new AlertListClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get alert list', error)));
  }

  /**
   * REST call to POST modify alerts
   *
   * @param {UpdateAlertsClass} update_alert
   * @return {Observable<ModifyRemoveReturnClass>}
   * @memberof AlertService
   */
  modify_alert(update_alert: UpdateAlertsClass): Observable<ModifyRemoveReturnClass> {
    return this.httpClient_.post<ModifyRemoveReturnInterface>(environment.ALERT_SERVICE_MODIFY, update_alert)
      .pipe(map((response: ModifyRemoveReturnInterface) => new ModifyRemoveReturnClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('modify alert', error)));
  }

  /**
   * REST call to POST remove alerts
   *
   * @param {UpdateAlertsClass} update_alert
   * @return {Observable<ModifyRemoveReturnClass>}
   * @memberof AlertService
   */
  remove_alerts(update_alert: UpdateAlertsClass): Observable<ModifyRemoveReturnClass> {
    return this.httpClient_.post<ModifyRemoveReturnInterface>(environment.ALERT_SERVICE_REMOVE, update_alert)
      .pipe(map((response: ModifyRemoveReturnInterface) => new ModifyRemoveReturnClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('remove alerts', error)));
  }

  /**
   * REST call to GET hive settings
   *
   * @return {Observable<HiveSettingsClass>}
   * @memberof AlertService
   */
  get_hive_settings(): Observable<HiveSettingsClass> {
    return this.httpClient_.get<HiveSettingsInterface>(environment.ALERT_SERVICE_SETTINGS)
      .pipe(map((response: HiveSettingsInterface) => new HiveSettingsClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get hive settings', error)));
  }

  /**
   * REST call to POST save hive settings
   *
   * @param {HiveSettingsInterface} hive_settings
   * @return {Observable<HiveSettingsClass>}
   * @memberof AlertService
   */
  save_hive_settings(hive_settings: HiveSettingsInterface): Observable<HiveSettingsClass> {
    return this.httpClient_.post<HiveSettingsInterface>(environment.ALERT_SERVICE_SETTINGS, hive_settings)
      .pipe(map((response: HiveSettingsInterface) => new HiveSettingsClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('save hive settings', error)));
  }
}
