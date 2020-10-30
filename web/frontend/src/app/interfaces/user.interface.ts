/**
 * Interface defines user
 *
 * @export
 * @interface UserInterface
 */
export interface UserInterface {
  uid: string;
  givenName: string;
  surname: string;
  displayName: string;
  email: string;
  memberOf: string[];
  clientRoles: string[];
  roles: string[];
  controller_admin: boolean;
  controller_maintainer: boolean;
  operator: boolean;
  realm_admin: boolean;
}
