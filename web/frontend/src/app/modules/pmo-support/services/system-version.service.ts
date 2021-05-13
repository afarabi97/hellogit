import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { SystemVersionClass } from '../classes';
import { SystemVersionInterface, SystemVersionServiceInterface } from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'SystemVersionService' };

/**
 * Service used for getting the system version
 *
 * @export
 * @class SystemVersionService
 * @extends {ApiService<any>}
 */
@Injectable({
  providedIn: null
})
export class SystemVersionService extends ApiService<any> implements SystemVersionServiceInterface {

  /**
   * Creates an instance of SystemVersionService.
   *
   * @memberof SystemVersionService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET system version
   *
   * @returns {Observable<SystemVersionClass>}
   * @memberof SystemVersionService
   */
  get_system_version(): Observable<SystemVersionClass> {
    return this.httpClient_.get<SystemVersionInterface>(environment.SYSTEM_VERSION_SERVICE_SYSTEM_VERSION)
                           .pipe(map((response: SystemVersionInterface) => new SystemVersionClass(response)),
                                 catchError((err: any) => this.handleError('version', err)));
  }
}
