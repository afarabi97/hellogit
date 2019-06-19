import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
  public buttonList: any = [];


  /**
   *Creates an instance of NotificationService.
   * @param {HttpClient} http
   * @memberof NotificationService
   */
  constructor(private http: HttpClient) {
    this.buttonList = [   {"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"},
                          {"name": "Catalog", "selected": false, "title": "Catalog Messages","role": "catalog", "notifications": [], "icon": "apps"},
                          {"name": "Kickstart", "selected": false, "title": "Kickstart Messages","role": "kickstart", "notifications": [], "icon": "layers"},
                          {"name": "Kit", "selected": false, "title": "Kit Messages", "role": "kit", "notifications": [], "icon": "storage"},
                          {"name": "RuleSync", "selected": false, "title": "RuleSync Messages", "role": "rulesync", "notifications": [], "icon": "swap_horiz"}];
  }


  /**
   * get all Notifications
   *
   * @returns {Observable<any>}
   * @memberof NotificationService
   */
  getNotications(): Observable<any>{
    const url = '/api/notifications';
    return this.http.get(url).pipe();
  }

  /**
   * delete all Notifications
   *
   * @returns {Observable<Object>}
   * @memberof NotificationService
   */
  deleteAllNotications(): Observable<Object>{
    const url = '/api/notifications';
    return this.http.delete(url, HTTP_OPTIONS).pipe();
  }

  /**
   * delete a single Notification
   *
   * @param {string} id
   * @returns {Observable<Object>}
   * @memberof NotificationService
   */
  deleteNotication(id: string): Observable<Object>{
    const url = '/api/notification/' + id;
    return this.http.delete(url, HTTP_OPTIONS).pipe();
  }


}
