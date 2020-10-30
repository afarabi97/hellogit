import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { HTTP_OPTIONS } from '../../globals';
import { EntityConfig, OriginalControllerIPInterface, UpgradeControllerInterface } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'UpgradeService' };

/**
 * Service used for http upgrade rest calls
 *
 * @export
 * @class UpgradeService
 * @extends {ApiService<any>}
 */
@Injectable()
export class UpgradeService extends ApiService<any> {
  /**TODO - Add object structures, return types, method types interfaces, service interface */

  /**
   * Creates an instance of UpgradeService.
   *
   * @memberof UpgradeService
   */
  constructor() {
    super(entityConfig);
  }

  getUpgradePaths(originalCtrlIP: OriginalControllerIPInterface): Observable<Object> {
    return this.httpClient_.post(environment.UPGRADE_SERVICE_UPGRADE_PATHS, originalCtrlIP, HTTP_OPTIONS)
                           .pipe(catchError((err: any) => this.handleError('upgrade/paths', err)));
  }

  doUpgrade(upgradeControllerInterface: UpgradeControllerInterface) {
    return this.httpClient_.post(environment.UPGRADE_SERVICE_UPGRADE, upgradeControllerInterface, HTTP_OPTIONS)
                           .pipe(catchError((err: any) => this.handleError('upgrade', err)));
  }
}
