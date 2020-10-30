import { Injectable } from '@angular/core';

import { SystemNameClass, UserClass } from '../classes';
import { AppLoadServiceInterface } from '../interfaces';
import { UserService } from './user.service';
import { WeaponSystemNameService } from './weapon-system-name.service';

/**
 * Service makes important calls need for application loading
 *
 * @export
 * @class AppLoadService
 */
@Injectable({
  providedIn: 'root'
})
export class AppLoadService implements AppLoadServiceInterface {

  /**
   * Creates an instance of AppLoadService.
   *
   * @param {UserService} userService_
   * @param {WeaponSystemNameService} weaponSystemNameService_
   * @memberof AppLoadService
   */
  constructor(private userService_: UserService,
              private weaponSystemNameService_: WeaponSystemNameService) {}

  /**
   * Used to retrieve current user and return as promise
   *
   * @returns {Promise<UserClass>}
   * @memberof AppLoadService
   */
  async getCurrentUser(): Promise<UserClass> {
    const user: UserClass = await this.userService_.getUserFromAPI()
                                                   .toPromise();
    this.userService_.setUser(user);

    return user;
  }

  /**
   * Used to retrieve system name and return as promise
   *
   * @returns {Promise<SystemNameClass>}
   * @memberof AppLoadService
   */
  async getSystemName(): Promise<SystemNameClass> {
    const systemName: SystemNameClass = await this.weaponSystemNameService_.getSystemNameFromAPI()
                                                                           .toPromise();
    this.weaponSystemNameService_.setSystemName(systemName);

    return systemName;
  }
}
