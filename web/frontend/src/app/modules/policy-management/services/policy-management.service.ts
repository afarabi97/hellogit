import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { CatalogStatusClass, JobClass } from '../classes';
import { CatalogStatusInterface, JobInterface, PolicyManagementServiceInterface } from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'PolicyManagementService' };

/**
 * Service used to get catalog and job status
 *
 * @export
 * @class PolicyManagementService
 * @extends {ApiService<any>}
 */
@Injectable({
  providedIn: 'root'
})
export class PolicyManagementService extends ApiService<any> implements PolicyManagementServiceInterface {

  /**
   * Creates an instance of PolicyManagementService.
   *
   * @memberof PolicyManagementService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET catalog status
   *
   * @param {string} application
   * @returns {Observable<CatalogStatusClass[]>}
   * @memberof PolicyManagementService
   */
  check_catalog_status(application: string): Observable<CatalogStatusClass[]> {
    const url = `${environment.POLICY_MANAGEMENT_SERVICE_CHECK_CATALOG_STATUS}/${application}/status`;

    return this.httpClient_.get<CatalogStatusInterface[]>(url)
      .pipe(map((response: CatalogStatusInterface[]) => response.map((catalog_status: CatalogStatusInterface) => new CatalogStatusClass(catalog_status))),
            catchError((error: HttpErrorResponse) => this.handleError('check catalog status', error)));
  }

  /**
   * REST call to GET jobs
   *
   * @returns {Observable<JobClass[]>}
   * @memberof PolicyManagementService
   */
  get_jobs(): Observable<JobClass[]> {
    return this.httpClient_.get<JobInterface[]>(environment.POLICY_MANAGEMENT_SERVICE_GET_JOBS)
      .pipe(map((response: JobInterface[]) => response.map((job: JobInterface) => new JobClass(job))),
            catchError((error: HttpErrorResponse) => this.handleError('get jobs', error)));
  }
}
