import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { GenericJobAndKeyClass } from '../../../classes';
import { EntityConfig, GenericJobAndKeyInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { DiagnosticsServiceInterface } from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'DiagnosticsService' };

/**
 * Service is used for retrieving diagnostics and downloading diagnostics
 *
 * @export
 * @class DiagnosticsService
 * @extends {ApiService<any>}
 * @implements {DiagnosticsServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class DiagnosticsService extends ApiService<any> implements DiagnosticsServiceInterface {

  /**
   * Creates an instance of DiagnosticsService.
   *
   * @memberof DiagnosticsService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to POST diagnostics
   *
   * @returns {Observable<GenericJobAndKeyClass>}
   * @memberof DiagnosticsService
   */
  diagnostics(): Observable<GenericJobAndKeyClass> {
    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.DIAGNOSTICS_SERVICE_DIAGNOSTICS, null)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('post diagnostics', error)));
  }

  /**
   * REST call to GET download diagnostics
   *
   * @param {string} job_id
   * @returns {Observable<Blob>}
   * @memberof DiagnosticsService
   */
  download_diagnostics(job_id: string): Observable<HttpEvent<Blob>> {
    const url: string = `${environment.DIAGNOSTICS_SERVICE_DIAGNOSTICS_DOWNLOAD}${job_id}`;

    return this.httpClient_.get(url, { responseType: 'blob', reportProgress: true, observe: 'events' })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get diagnostics', error)));
  }
}
