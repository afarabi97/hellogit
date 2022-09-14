import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { GenericJobAndKeyClass } from '../../../classes';
import { EntityConfig, GenericJobAndKeyInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { BackgroundJobClass, JobLogClass } from '../classes';
import { BackgroundJobInterface, JobLogInterface, JobServiceInterface } from '../interfaces';

const ENTITY_CONFIG: EntityConfig = { entityPart: '', type: 'CatalogService' };

/**
 * Service used for job related service api rest calls
 *
 * @export
 * @class JobService
 * @extends {ApiService<any>}
 * @implements {JobServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class JobService extends ApiService<any> implements JobServiceInterface {

  /**
   * Creates an instance of JobService.
   *
   * @memberof JobService
   */
  constructor() {
    super(ENTITY_CONFIG);
  }

  /**
   * REST call to GET job logs
   *
   * @param {string} job_id
   * @return {Observable<JobLogClass[]>}
   * @memberof JobService
   */
  job_logs(job_id: string): Observable<JobLogClass[]> {
    const url: string = `${environment.JOB_SERVICE_LOG}${job_id}`;

    return this.httpClient_.get<JobLogInterface[]>(url)
      .pipe(map((response: JobLogInterface[]) => response.map((job_log: JobLogInterface) => new JobLogClass(job_log))),
            catchError((error: HttpErrorResponse) => this.handleError('job logs', error)));
  }

  /**
   * REST call to GET job
   *
   * @param {string} job_id
   * @return {Observable<BackgroundJobClass>}
   * @memberof JobService
   */
  job_get(job_id: string): Observable<BackgroundJobClass> {
    const url: string = `${environment.JOB_SERVICE_BASE}${job_id}`;

    return this.httpClient_.get<BackgroundJobInterface>(url)
      .pipe(map((response: BackgroundJobInterface) => new BackgroundJobClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('job get', error)));
  }

  /**
   * REST call to DELETE job
   *
   * @param {string} job_id
   * @return {Observable<GenericJobAndKeyClass>}
   * @memberof JobService
   */
  job_delete(job_id: string): Observable<GenericJobAndKeyClass> {
    const url: string = `${environment.JOB_SERVICE_BASE}${job_id}`;

    return this.httpClient_.delete<GenericJobAndKeyInterface>(url)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('job delete', error)));
  }
}
