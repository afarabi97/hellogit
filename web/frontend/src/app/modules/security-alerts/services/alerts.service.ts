import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { AlertListClass, ModifyRemoveReturnClass } from '../classes';
import { AlertListInterface, AlertServiceInterface, ModifyRemoveReturnInterface } from '../interfaces';

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
   * @return {Observable<Object[]>}
   * @memberof AlertService
   */
  get_alerts(fields: string, start_time: string,
             end_time: string, acknowledged: boolean=false,
             escalated: boolean=false, show_closed: boolean=false): Observable<Object[]> {
    const ack: string = acknowledged ? 'yes' : 'no';
    const escalate: string = escalated ? 'yes' : 'no';
    const show_closed_alerts: string = show_closed ? 'yes' : 'no';
    const url: string = `${environment.ALERT_SERVICE_BASE}${ack}/${escalate}/${show_closed_alerts}/${start_time}/${end_time}/${fields}`;

    return this.httpClient_.get<Object[]>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get alerts', error)));
  }

  /**
   * REST call to POST get alert list
   *
   * @param {Object} update_alert
   * @param {number} [size=0]
   * @return {Observable<AlertListClass>}
   * @memberof AlertService
   */
  get_alert_list(update_alert: Object, size: number=0): Observable<AlertListClass> {
    const url: string = `${environment.ALERT_SERVICE_LIST}${size}`;

    return this.httpClient_.post<AlertListInterface>(url, update_alert)
      .pipe(map((response: AlertListInterface) => new AlertListClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get alert list', error)));
  }

  /**
   * REST call to POST modify alerts
   *
   * @param {Object} update_alert
   * @return {Observable<ModifyRemoveReturnClass>}
   * @memberof AlertService
   */
  modify_alert(update_alert: Object): Observable<ModifyRemoveReturnClass> {
    return this.httpClient_.post<ModifyRemoveReturnInterface>(environment.ALERT_SERVICE_MODIFY, update_alert)
      .pipe(map((response: ModifyRemoveReturnInterface) => new ModifyRemoveReturnClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('modify alert', error)));
  }

  /**
   * REST call to POST remove alerts
   *
   * @param {Object} update_alert
   * @return {Observable<ModifyRemoveReturnClass>}
   * @memberof AlertService
   */
  remove_alerts(update_alert: Object): Observable<ModifyRemoveReturnClass> {
    return this.httpClient_.post<ModifyRemoveReturnInterface>(environment.ALERT_SERVICE_REMOVE, update_alert)
      .pipe(map((response: ModifyRemoveReturnInterface) => new ModifyRemoveReturnClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('remove alerts', error)));
  }
}
