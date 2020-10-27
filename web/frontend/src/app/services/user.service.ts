import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { UserClass } from '../classes';
import { UserInterface, UserServiceInterface } from '../interfaces';

/**
 * Service used for
 * - API call to get user
 * - storing user
 * - retrieving info from stored user
 *
 * @export
 * @class UserService
 */
@Injectable({
  providedIn: 'root'
})
export class UserService implements UserServiceInterface {
  // stored version for user
  private user_: UserClass;

  /**
   * Creates an instance of UserService.
   *
   * @param {HttpClient} httpClient_
   * @memberof UserService
   */
  constructor(private httpClient_: HttpClient) { }

  /**
   * Used for setting the current user
   *
   * @param {UserClass} user
   * @memberof UserService
   */
  setUser(user: UserClass): void {
    this.user_ = user;
  }

  /**
   * Used for retrieving current user
   *
   * @returns {UserClass}
   * @memberof UserService
   */
  getUser(): UserClass {
    return this.user_;
  }

  /**
   * Used for retrieving user controller admin value
   *
   * @returns {boolean}
   * @memberof UserService
   */
  isControllerAdmin(): boolean {
    return this.user_.controller_admin;
  }

  /**
   * Used for retrieving user controller maintainer value
   *
   * @returns {boolean}
   * @memberof UserService
   */
  isControllerMaintainer(): boolean {
    return this.user_.controller_maintainer;
  }

  /**
   * Used for retrieving user operator value
   *
   * @returns {boolean}
   * @memberof UserService
   */
  isOperator(): boolean {
    return this.user_.operator;
  }

  /**
   * Used for retrieving user realm admin value
   *
   * @returns {boolean}
   * @memberof UserService
   */
  isRealmAdmin(): boolean {
    return this.user_.realm_admin;
  }

  /**
   * REST call to GET user
   *
   * @returns {Observable<UserClass>}
   * @memberof UserService
   */
  getUserFromAPI(): Observable<UserClass> {
    return this.httpClient_.get<UserInterface>(environment.USER_SERVICE_CURRENT_USER)
                           .pipe(map((data: UserInterface) => new UserClass(data)));
  }
}
