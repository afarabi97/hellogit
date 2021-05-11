import { UserPortalLinkInterface } from '../interfaces';

/**
 * Class defines the user portal link
 *
 * @export
 * @class UserPortalLinkClass
 * @implements {UserPortalLinkInterface}
 */
export class UserPortalLinkClass implements UserPortalLinkInterface {
  _id: string;
  name: string;
  url: string;
  description: string;

  /**
   * Creates an instance of UserPortalLinkClass.
   *
   * @param {UserPortalLinkInterface} user_portal_link_interface
   * @memberof UserPortalLinkClass
   */
  constructor(user_portal_link_interface: UserPortalLinkInterface) {
    this._id = user_portal_link_interface._id;
    this.name = user_portal_link_interface.name;
    this.url = user_portal_link_interface.url;
    this.description = user_portal_link_interface.description;
  }
}
