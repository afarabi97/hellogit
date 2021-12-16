import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig, SuccessMessageInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { IndexManagementOptionInterface } from '../interfaces/index-management-option.interface';
import { IndexManagementServiceInterface } from '../interfaces/services/index-management-service.interface';
import { SuccessMessageClass } from '../../../classes';


const entityConfig: EntityConfig = { entityPart: '', type: 'IndexManagementService' };

/**
 * Service handles elasticsearch index management calls
 *
 * @export
 * @class IndexManagementService
 * @extends {ApiService<any>}
 * @implements {IndexManagementServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class IndexManagementService extends ApiService<any> implements IndexManagementServiceInterface {

  /**
   * Creates an instance of IndexManagementService.
   *
   * @memberof IndexManagementService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to POST index management
   *
   * @param {IndexManagementOptionInterface} index_management_option
   * @returns {(Observable<SuccessMessageClass>)}
   * @memberof IndexManagementService
   */
  index_management(index_management_option: IndexManagementOptionInterface): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.INDEX_MANAGEMENT_SERVICE_INDEX_MANAGEMENT, index_management_option)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('index management', error)));
  }

  /**
   * REST call to GET get closed indices
   *
   * @returns {(Observable<string[]>)}
   * @memberof IndexManagementService
   */
  get_closed_indices(): Observable<string[]> {
    return this.httpClient_.get<string[]>(environment.INDEX_MANAGEMENT_SERVICE_GET_CLOSED_INDICES)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get closed indices', error)));
  }

  /**
   * REST call to GET get opened indices
   *
   * @returns {(Observable<string[]>)}
   * @memberof IndexManagementService
   */
   get_all_indices(): Observable<string[]> {
    return this.httpClient_.get<string[]>(environment.INDEX_MANAGEMENT_SERVICE_GET_INDICES)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get indices', error)));
  }
}
