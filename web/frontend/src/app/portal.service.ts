import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Description of user link data
 */
export interface UserLinkInterface {
  '_id': string,
  'name': string,
  'url': string,
  'description': string
}

@Injectable({
  providedIn: 'root'
})
export class PortalService {

  constructor(private http: HttpClient) { }

  getPortalLinks(){    
    const url = '/api/get_portal_links';
    return this.http.get(url).pipe();
  }

  addUserLink(link: Object) {
    const url = '/api/add_user_link';
    return this.http.post(url, link).pipe();

  }

  removeUserLink(link: Object) {
    const url = "/api/remove_user_link/" + link['_id'];
    return this.http.delete(url).pipe();
  }

  getUserLinks() {
    const url = '/api/get_user_links';
    return this.http.get(url).pipe();
  }
}
