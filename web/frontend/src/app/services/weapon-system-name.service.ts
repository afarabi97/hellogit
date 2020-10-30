import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { SystemNameClass } from '../classes';
import { SystemNameInterface, WeaponSystemNameServiceInterface } from '../interfaces';

/**
 * Service used for
 * - API call to get system name
 * - storing system name
 * - retrieving system name
 *
 * @export
 * @class WeaponSystemNameService
 */
@Injectable({
  providedIn: 'root'
})
export class WeaponSystemNameService implements WeaponSystemNameServiceInterface {
  // stored version for system name
  private systemName_: SystemNameClass;

  /**
   * Creates an instance of WeaponSystemNameService.
   *
   * @param {HttpClient} httpClient_
   * @memberof WeaponSystemNameService
   */
  constructor(private httpClient_: HttpClient) { }

  /**
   * Used for setting stored version for system name
   *
   * @param {SystemNameClass} systemName
   * @memberof WeaponSystemNameService
   */
  setSystemName(systemName: SystemNameClass): void {
    this.systemName_ = systemName;
  }

  /**
   * Used for getting the stored version for system name
   *
   * @returns {string}
   * @memberof WeaponSystemNameService
   */
  getSystemName(): string {
    return this.systemName_.system_name;
  }

  /**
   * REST call to GET system name
   *
   * @returns {Observable<SystemNameClass>}
   * @memberof WeaponSystemNameService
   */
  getSystemNameFromAPI(): Observable<SystemNameClass> {
    return this.httpClient_.get<SystemNameInterface>(environment.WEAPON_SYSTEM_NAME_SERVICE_SYSTEM_NAME)
                           .pipe(map((data: SystemNameInterface) => new SystemNameClass(data)));
  }
}
