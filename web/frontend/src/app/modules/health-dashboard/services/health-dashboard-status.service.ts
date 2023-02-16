import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { KeyValueClass, KitTokenClass } from '../../../classes';
import { EntityConfig, KeyValueInterface, KitTokenInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { HealthDashboardStatusServiceInterface } from '../interfaces';

const ENTITY_CONFIG: EntityConfig = { entityPart: '', type: 'HealthDashboardStatusService' };

/**
 * Service used to retrieve api dashboard statuses
 *
 * @export
 * @class HealthDashboardStatusService
 * @extends {ApiService<any>}
 * @implements {HealthDashboardStatusServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class HealthDashboardStatusService extends ApiService<any> implements HealthDashboardStatusServiceInterface {

  /**
   * Creates an instance of HealthDashboardStatusService.
   *
   * @memberof HealthDashboardStatusService
   */
  constructor() {
    super(ENTITY_CONFIG);
  }

  /**
   * REST call to GET health dashboard status
   *
   * @return {Observable<KitTokenClass[]>}
   * @memberof HealthDashboardStatusService
   */
  get_health_dashboard_status(): Observable<KitTokenClass[]> {
    return this.httpClient_.get<KitTokenInterface[]>(environment.HEALTH_DASHBOARD_STATUS)
                           .pipe(map((response: KitTokenInterface[]) => response.map((status: KitTokenInterface) => new KitTokenClass(status))),
                                 catchError((error: HttpErrorResponse) => this.handleError('get health dashboard status', error)));
  }

  /**
   * REST call to GET remote health dashboard status
   *
   * @return {Observable<KitTokenClass[]>}
   * @memberof HealthDashboardStatusService
   */
  get_remote_health_dashboard_status(): Observable<KitTokenClass[]> {
    return this.httpClient_.get<KitTokenInterface[]>(environment.HEALTH_REMOTE_DASHBOARD_STATUS)
                           .pipe(map((response: KitTokenInterface[]) => response.map((status: KitTokenInterface) => new KitTokenClass(status))),
                                 catchError((error: HttpErrorResponse) => this.handleError('get remote health dashboard status', error)));
  }

  /**
   * REST call to GET health dashboard status kibana info remote
   *
   * @param {string} ip_address
   * @return {Observable<KeyValueClass[]>}
   * @memberof HealthDashboardStatusService
   */
  get_health_dashboard_status_kibana_info_remote(ip_address: string): Observable<KeyValueClass[]> {
    const url: string = `${environment.HEALTH_DASHBOARD_STATUS_KIBANA_INFO_REMOTE}/${ip_address}`;

    return this.httpClient_.get<KeyValueInterface[]>(url)
                           .pipe(map((response: KeyValueInterface[]) => response.map((kv: KeyValueInterface) => new KeyValueClass(kv))),
                                 catchError((error: HttpErrorResponse) => this.handleError('get health dashboard status kibana info remote', error)));
  }
}
