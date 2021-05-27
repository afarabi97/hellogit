import { Injectable } from '@angular/core';

import { UserClass } from '../classes';
import { AppLoadServiceInterface } from '../interfaces';
import { UserService } from './user.service';

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
   * @memberof AppLoadService
   */
  constructor(private userService_: UserService) {}

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
}
