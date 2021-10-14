import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { NotificationClass } from '../../../classes';
import { EntityConfig, NotificationInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { NotificationServiceInterface } from '../interface/service-interfaces/notification-service.interface';

const entityConfig: EntityConfig = { entityPart: 'notifications', type: 'NotificationService' };

/**
 * Service used for performing notiifcation related api calls
 *
 * @export
 * @class NotificationService
 * @extends {ApiService<any>}
 * @implements {NotificationServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class NotificationService extends ApiService<any> implements NotificationServiceInterface {

  /**
   * Creates an instance of NotificationService.
   *
   * @memberof NotificationService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET notifications
   *
   * @returns {Observable<NotificationClass[]>}
   * @memberof NotificationService
   */
  get_notifications(): Observable<NotificationClass[]> {
    return this.httpClient_.get<NotificationInterface[]>(environment.NOTIFICATION_SERVICE_BASE_URL)
      .pipe(map((response: NotificationInterface[]) => response.map((r: NotificationInterface) => new NotificationClass(r))),
            catchError((error: HttpErrorResponse) => this.handleError('get notifications', error)));
  }

  /**
   * REST call to GET notification
   *
   * @param {string} id
   * @returns {Observable<void>}
   * @memberof NotificationService
   */
  delete_notification(id: string): Observable<void> {
    const url = `${environment.NOTIFICATION_SERVICE_BASE_URL}/${id}`;

    return this.httpClient_.delete<void>(url, {})
      .pipe(catchError((error: any) => this.handleError('delete notification', error)));
  }

  /**
   * REST call to GET notifications
   *
   * @returns {Observable<void>}
   * @memberof NotificationService
   */
  delete_all_notifications(): Observable<void> {
    return this.httpClient_.delete<void>(environment.NOTIFICATION_SERVICE_BASE_URL, {})
      .pipe(catchError((err: any) => this.handleError('delete all notifications', err)));
  }
}
