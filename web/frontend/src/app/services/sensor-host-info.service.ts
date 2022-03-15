import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { HostInfoClass } from '../classes';
import { EntityConfig, HostInfoInterface, SensorHostInfoServiceInterface } from '../interfaces';
import { ApiService } from './abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'SensorHostInfoService' };

/**
 * Service used for
 * - API call to get sensor host info
 *
 * @export
 * @class SensorHostInfoService
 */
@Injectable({
  providedIn: null
})
export class SensorHostInfoService extends ApiService<any> implements SensorHostInfoServiceInterface {

  /**
   * Creates an instance of SensorHostInfoService.
   *
   * @memberof SensorHostInfoService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET sensor host info
   *
   * @returns {Observable<HostInfoClass[]>}
   * @memberof SensorHostInfoService
   */
  get_sensor_host_info(): Observable<HostInfoClass[]> {
    return this.httpClient_.get<HostInfoInterface[]>(environment.SENSOR_HOST_INFO_SERVICE_GET_SENSOR_HOST_INFO)
      .pipe(map((response: HostInfoInterface[]) => response.map((sensor_host_info: HostInfoInterface) => new HostInfoClass(sensor_host_info))),
            catchError((error: HttpErrorResponse) => this.handleError('sensor host info', error)));
  }
}
