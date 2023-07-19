import { Observable } from 'rxjs';

import { PortalLinkClass, SuccessMessageClass, UserPortalLinkClass } from '../../classes';

/**
 * Interface defines the portal service
 *
 * @export
 * @interface PortalServiceInterface
 */
export interface PortalServiceInterface {
  get_portal_links(): Observable<PortalLinkClass[]>;
  get_user_links(): Observable<UserPortalLinkClass[]>;
  add_user_link(user_portal_link: UserPortalLinkClass): Observable<UserPortalLinkClass[]>;
  remove_user_link(user_portal_link: UserPortalLinkClass): Observable<SuccessMessageClass>;
}
