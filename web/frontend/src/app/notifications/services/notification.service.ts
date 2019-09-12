import { Injectable } from '@angular/core';
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
                            {"name": "RuleSync", "selected": false, "title": "RuleSync Messages", "role": "rulesync", "notifications": [], "icon": "swap_horiz"},
                            {"name": "Agent", "selected": false, "title": "Agent Messages", "role": "agent", "notifications": [], "icon": "desktop_windows"},
                            {"name": "PCAP", "selected": false, "title": "PCAP Replay", "role": "pcap", "notifications": [], "icon": "network_check"},
                            {"name": "Upgrade", "selected": false, "title": "Upgrade Messages", "role": "upgrade", "notifications": [], "icon": "timeline"}];


  /**
   *Creates an instance of CatalogService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor() {
    super(config);
  }

}
