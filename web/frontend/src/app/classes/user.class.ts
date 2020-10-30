import { UserInterface } from '../interfaces';

/**
 * Class defines User
 *
 * @export
 * @class UserClass
 * @implements {UserInterface}
 */
export class UserClass implements UserInterface {
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

  /**
   * Creates an instance of UserClass.
   *
   * @param {UserInterface} userInterface
   * @memberof UserClass
   */
  constructor(userInterface: UserInterface) {
    this.uid = userInterface.uid;
    this.givenName = userInterface.givenName;
    this.surname = userInterface.surname;
    this.displayName = userInterface.displayName;
    this.email = userInterface.email;
    this.memberOf = userInterface.memberOf;
    this.clientRoles = userInterface.clientRoles;
    this.roles = userInterface.roles;
    this.controller_admin = userInterface.controller_admin;
    this.controller_maintainer = userInterface.controller_maintainer;
    this.operator = userInterface.operator;
    this.realm_admin = userInterface.realm_admin;
  }
}
