import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { PortalLinkClass, UserPortalLinkClass } from '../classes';
import { EntityConfig, PortalLinkInterface, PortalServiceInterface, UserPortalLinkInterface } from '../interfaces';
import { ApiService } from './abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'PortalService' };

/**
 * Service used for getting portal and user defined portal links
 *
 * @export
 * @class PortalService
 * @extends {ApiService<any>}
 * @implements {PortalServiceInterface}
 */
@Injectable({
  providedIn: 'root'
})
export class PortalService extends ApiService<any> implements PortalServiceInterface {

  /**
   * Creates an instance of PortalService.
   *
   * @memberof PortalService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET portal links
   *
   * @returns {Observable<PortalLinkClass[]>}
   * @memberof PortalService
   */
  get_portal_links(): Observable<PortalLinkClass[]> {
    return this.httpClient_.get<PortalLinkInterface[]>(environment.PORTAL_SERVICE_GET_PORTAL_LINKS)
      .pipe(map((response: PortalLinkInterface[]) => response.map((portal: PortalLinkClass) => new PortalLinkClass(portal))),
            catchError((error: HttpErrorResponse) => this.handleError('get portal links', error)));

  }

  /**
   * REST call to GET user portal links
   *
   * @returns {Observable<UserPortalLinkClass[]>}
   * @memberof PortalService
   */
  get_user_links(): Observable<UserPortalLinkClass[]> {
    return this.httpClient_.get<UserPortalLinkInterface[]>(environment.PORTAL_SERVICE_GET_USER_LINKS)
      .pipe(map((response: UserPortalLinkInterface[]) => response.map((user_portal_link: UserPortalLinkInterface) => new UserPortalLinkClass(user_portal_link))),
            catchError((error: HttpErrorResponse) => this.handleError('get user portal links', error)));
  }

  /**
   * REST call to POST user portal links
   *
   * @param {UserPortalLinkClass} user_portal_link
   * @returns {Observable<UserPortalLinkClass[]>}
   * @memberof PortalService
   */
  add_user_link(user_portal_link: UserPortalLinkClass): Observable<UserPortalLinkClass[]> {
    return this.httpClient_.post<UserPortalLinkInterface[]>(environment.PORTAL_SERVICE_ADD_USER_LINK, user_portal_link)
      .pipe(map((response: UserPortalLinkInterface[]) => response.map((user_portal_link_new: UserPortalLinkInterface) => new UserPortalLinkClass(user_portal_link_new))),
            catchError((error: HttpErrorResponse) => this.handleError('add user portal link', error)));

  }

  /**
   * REST call to DELETE user portal link
   *
   * @param {UserPortalLinkClass} user_portal_link
   * @returns {Observable<UserPortalLinkClass[]>}
   * @memberof PortalService
   */
  remove_user_link(user_portal_link: UserPortalLinkClass): Observable<UserPortalLinkClass[]> {
    const url = `${environment.PORTAL_SERVICE_REMOVE_USER_LINK}${user_portal_link._id}`;

    return this.httpClient_.delete<UserPortalLinkInterface[]>(url)
      .pipe(map((response: UserPortalLinkInterface[]) => response.map((user_portal_link_new: UserPortalLinkInterface) => new UserPortalLinkClass(user_portal_link_new))),
            catchError((error: HttpErrorResponse) => this.handleError('delete user portal link', error)));
  }
}
