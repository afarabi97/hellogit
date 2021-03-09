import { Observable } from 'rxjs';

import { UserClass } from '../../classes';

/**
 * Interface defines the user service
 *
 * @export
 * @interface UserServiceInterface
 */
export interface UserServiceInterface {
  setUser(userClass: UserClass): void;
  getUser(): UserClass;
  isControllerAdmin(): boolean;
  isControllerMaintainer(): boolean;
  isOperator(): boolean;
  isRealmAdmin(): boolean;
  getUserFromAPI(): Observable<UserClass>;
}
