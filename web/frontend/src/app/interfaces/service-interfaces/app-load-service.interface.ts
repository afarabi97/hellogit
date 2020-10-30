import { SystemNameClass, UserClass } from '../../classes';

/**
 * Interface defines the app load service
 *
 * @export
 * @interface AppLoadServiceInterface
 */
export interface AppLoadServiceInterface {
  getCurrentUser(): Promise<UserClass>;
  getSystemName(): Promise<SystemNameClass>;
}
