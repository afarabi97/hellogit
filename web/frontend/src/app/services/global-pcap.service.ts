import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { PCAPClass } from '../classes';
import { EntityConfig, GlobalPCAPServiceInterface, PCAPInterface } from '../interfaces';
import { ApiService } from './abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'GlobalPCAPService' };

/**
 * Service used for global pcap api calls
 *
 * @export
 * @class GlobalPCAPService
 * @extends {ApiService<any>}
 * @implements {GlobalPCAPServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class GlobalPCAPService extends ApiService<any> implements GlobalPCAPServiceInterface {

  /**
   * Creates an instance of GlobalPCAPService.
   *
   * @memberof GlobalPCAPService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET pcaps
   *
   * @return {Observable<PCAPClass[]>}
   * @memberof GlobalPCAPService
   */
  get_pcaps(): Observable<PCAPClass[]> {
    return this.httpClient_.get<PCAPInterface[]>(environment.GLOBAL_PCAP_SERVICE_GET_PCAPS)
      .pipe(map((response: PCAPInterface[]) => response.map((p: PCAPInterface) => new PCAPClass(p))),
            catchError((error: HttpErrorResponse) => this.handleError('get pcaps', error)));
  }
}
