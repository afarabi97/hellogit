import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { EntityConfig, ApiService } from '../../services/tfplenum.service';

export const config: EntityConfig = { entityPart: 'notifications', type: 'Notification' };
export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends ApiService<any> {
  public buttonList: any = [{"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"},
                            {"name": "Catalog", "selected": false, "title": "Catalog Messages","role": "catalog", "notifications": [], "icon": "apps"},
                            {"name": "Kickstart", "selected": false, "title": "Kickstart Messages","role": "kickstart", "notifications": [], "icon": "layers"},
                            {"name": "Kit", "selected": false, "title": "Kit Messages", "role": "kit", "notifications": [], "icon": "storage"},
                            {"name": "RuleSync", "selected": false, "title": "RuleSync Messages", "role": "rulesync", "notifications": [], "icon": "swap_horiz"}];


  /**
   *Creates an instance of CatalogService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor() {
    super(config);
  }

}
