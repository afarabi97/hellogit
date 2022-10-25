import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { EntityConfig, GlobalHiveSettingsServiceInterface } from '../interfaces';
import { ApiService } from './abstract/api.service';
import { HiveSettingsClass } from '../classes';
import { HiveSettingsInterface } from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'GlobalHiveSettingsService' };

/**
 * Service used to perform global hive setting calls
 *
 * @export
 * @class GlobalHiveSettingsService
 * @extends {ApiService<any>}
 * @implements {GlobalHiveSettingsServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class GlobalHiveSettingsService extends ApiService<any> implements GlobalHiveSettingsServiceInterface {

  /**
   * Creates an instance of GlobalHiveSettingsService.
   *
   * @memberof GlobalHiveSettingsService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET hive settings
   *
   * @return {Observable<HiveSettingsClass>}
   * @memberof GlobalHiveSettingsService
   */
  get_hive_settings(): Observable<HiveSettingsClass> {
    return this.httpClient_.get<HiveSettingsInterface>(environment.GLOBAL_ALERT_SERVICE_SETTINGS)
      .pipe(map((response: HiveSettingsInterface) => new HiveSettingsClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get hive settings', error)));
  }
}
