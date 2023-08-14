import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { BackgroundJobClass, GenericJobAndKeyClass } from '../classes';
import { BackgroundJobInterface, EntityConfig, GenericJobAndKeyInterface, GlobalJobServiceInterface } from '../interfaces';
import { ApiService } from './abstract/api.service';

const ENTITY_CONFIG: EntityConfig = { entityPart: '', type: 'GlobalJobService' };

/**
 * Service used for global job services
 *
 * @export
 * @class GlobalJobService
 * @extends {ApiService<any>}
 * @implements {GlobalJobServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class GlobalJobService extends ApiService<any> implements GlobalJobServiceInterface {

  /**
   * Creates an instance of GlobalJobService.
   *
   * @memberof GlobalJobService
   */
  constructor() {
    super(ENTITY_CONFIG);
  }

  /**
   * REST call to GET job
   *
   * @param {string} job_id
   * @return {Observable<BackgroundJobClass>}
   * @memberof GlobalJobService
   */
  job_get(job_id: string): Observable<BackgroundJobClass> {
    const url: string = `${environment.JOB_SERVICE_BASE}${job_id}`;

    return this.httpClient_.get<BackgroundJobInterface>(url)
      .pipe(map((response: BackgroundJobInterface) => {
              if (Object.keys(response).length > 0 ) {
                return new BackgroundJobClass(response);
              } else {
                return response;
              }
            }),
            catchError((error: HttpErrorResponse) => this.handleError('job get', error)));
  }

  /**
   * REST call to PUT job retry
   *
   * @param {string} job_id
   * @return {Observable<GenericJobAndKeyClass>}
   * @memberof GlobalJobService
   */
  job_retry(job_id: string): Observable<GenericJobAndKeyClass> {
    const url: string = `${environment.GLOBAL_JOB_SERVICE_BASE}${job_id}/retry`;

    return this.httpClient_.put<GenericJobAndKeyInterface>(url, null)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('job retry', error)));
  }
}
