import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { EndgameSensorProfileClass } from '../classes';
import { EndgameLoginInterface, EndgameSensorProfileInterface, EndgameServiceInterface } from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'EndgameService' };

@Injectable({
  providedIn: null
})
export class EndgameService extends ApiService<any> implements EndgameServiceInterface {

  /**
   * Creates an instance of EndgameService.
   *
   * @memberof EndgameService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to POST endgame sensor profile
   *
   * @param {EndgameLoginInterface} sensor_login
   * @returns {Observable<EndgameSensorProfileClass[]>}
   * @memberof EndgameService
   */
  endgame_sensor_profiles(endgame_login: EndgameLoginInterface) : Observable<EndgameSensorProfileClass[]> {
    return this.httpClient_.post<EndgameSensorProfileInterface[]>(environment.ENDGAME_SERVICE_ENDGAME_SENSOR_PROFILES, endgame_login)
      .pipe(map((response: EndgameSensorProfileInterface[]) => response.map((sp: EndgameSensorProfileInterface) => new EndgameSensorProfileClass(sp))),
            catchError((error: HttpErrorResponse) => this.handleError('post endgame sensor profile', error)));
  }
}
