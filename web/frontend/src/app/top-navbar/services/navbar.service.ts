import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { EntityConfig } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';
import { DIPTimeClass } from '../classes/dip-time.class';
import { DIPTimeInterface } from '../interfaces/dip-time.interface';
import { NavbarServiceInterface } from '../interfaces/service-interfaces/navbar-service.interface';

const entityConfig: EntityConfig = { entityPart: '', type: 'NavBarService' };

/**
 * Service used for getting the dip time and application version
 *
 * @export
 * @class NavBarService
 * @extends {ApiService<any>}
 */
@Injectable({
  providedIn: 'root'
})
export class NavBarService extends ApiService<any> implements NavbarServiceInterface {

  /**
   * Creates an instance of NavBarService.
   *
   * @memberof NavBarService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET current dip time
   *
   * @returns {Observable<DIPTimeClass>}
   * @memberof NavBarService
   */
  getCurrentDIPTime(): Observable<DIPTimeClass> {
    return this.httpClient_.get<DIPTimeInterface>(environment.NAV_BAR_SERVICE_GET_CURRENT_DIP_TIME)
                           .pipe(map((response: DIPTimeInterface) => new DIPTimeClass(response)),
                                 catchError((err: any) => this.handleError('get_current_dip_time', err)));
  }
}
