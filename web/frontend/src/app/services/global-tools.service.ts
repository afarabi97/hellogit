import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { IFACEStateClass } from '../classes';
import { EntityConfig, GlobalToolsServiceInterface, IFACEStateInterface } from '../interfaces';
import { ApiService } from './abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'GlobalToolsService' };

/**
 * Service used for various global tool related rest calls
 *
 * @export
 * @class GlobalToolsService
 * @extends {ApiService<any>}
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalToolsService extends ApiService<any> implements GlobalToolsServiceInterface {

  /**
   * Creates an instance of GlobalToolsService.
   *
   * @memberof GlobalToolsService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET spaces
   *
   * @returns {Observable<string[]>}
   * @memberof GlobalToolsService
   */
  get_spaces(): Observable<string[]> {
    return this.httpClient_.get<string[]>(environment.GLOBAL_TOOLS_SERVICE_GET_SPACES)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get spaces', error)));
  }

  /**
   * REST call to GET iface states
   *
   * @param {string} hostname
   * @return {Observable<IFACEStateClass[]>}
   * @memberof GlobalToolsService
   */
  get_iface_states(hostname: string): Observable<IFACEStateClass[]> {
    const url: string = `${environment.GLOBAL_TOOLS_SERVICE_GET_IFACE_STATES}${hostname}`;

    return this.httpClient_.get<IFACEStateInterface[]>(url)
      .pipe(map((response: IFACEStateInterface[]) => response.map((iface_status: IFACEStateInterface) => new IFACEStateClass(iface_status))),
            catchError((error: HttpErrorResponse) => this.handleError('get iface states', error)));
  }
}
