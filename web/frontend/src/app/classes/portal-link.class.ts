import { PortalLinkInterface } from '../interfaces';

/**
 * Class defines the portal link
 *
 * @export
 * @class PortalLinkClass
 * @implements {PortalLinkInterface}
 */
export class PortalLinkClass implements PortalLinkInterface {
  dns: string;
  ip: string;
  logins: string;

  /**
   * Creates an instance of PortalLinkClass.
   *
   * @param {PortalLinkInterface} portal_link_interface
   * @memberof PortalLinkClass
   */
  constructor(portal_link_interface: PortalLinkInterface) {
    this.dns = portal_link_interface.dns;
    this.ip = portal_link_interface.ip;
    this.logins = portal_link_interface.logins;
  }
}
