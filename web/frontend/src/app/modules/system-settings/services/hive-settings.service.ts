import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { HiveSettingsClass } from '../../../classes';
import { EntityConfig, HiveSettingsInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { HiveSettingsServiceInterface } from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'HiveSettingsService' };

/**
 * Service used to perform hive setting calls
 *
 * @export
 * @class HiveSettingsService
 * @extends {ApiService<any>}
 * @implements {HiveSettingsServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class HiveSettingsService extends ApiService<any> implements HiveSettingsServiceInterface {

  /**
   * Creates an instance of HiveSettingsService.
   *
   * @memberof HiveSettingsService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to POST save hive settings
   *
   * @param {HiveSettingsInterface} hive_settings
   * @return {Observable<HiveSettingsClass>}
   * @memberof HiveSettingsService
   */
  save_hive_settings(hive_settings: HiveSettingsInterface): Observable<HiveSettingsClass> {
    return this.httpClient_.post<HiveSettingsInterface>(environment.ALERT_SERVICE_SETTINGS, hive_settings)
      .pipe(map((response: HiveSettingsInterface) => new HiveSettingsClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('save hive settings', error)));
  }
}
