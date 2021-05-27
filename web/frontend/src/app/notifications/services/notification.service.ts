import { Injectable } from '@angular/core';

import { EntityConfig } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';

const entityConfig: EntityConfig = { entityPart: 'notifications', type: 'Notification' };

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends ApiService<any> {
  public buttonList: any = [];
  private dipButtons: any = [{"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"},
                            {"name": "Catalog", "selected": false, "title": "Catalog Messages","role": "catalog", "notifications": [], "icon": "apps"},
                            {"name": "Settings", "selected": false, "title": "Settings Messages","role": "settings", "notifications": [], "icon": "layers"},
                            {"name": "Nodes", "selected": false, "title": "Nodes Messages", "role": "nodes", "notifications": [], "icon": "storage"},
                            {"name": "RuleSync", "selected": false, "title": "RuleSync Messages", "role": "rulesync", "notifications": [], "icon": "swap_horiz"},
                            {"name": "ES-Scale", "selected": false, "title": "ES-Scale Messages", "role": "scale", "notifications": [], "icon": "tune"},
                            {"name": "Agent", "selected": false, "title": "Agent Messages", "role": "agent", "notifications": [], "icon": "desktop_windows"},
                            {"name": "PCAP", "selected": false, "title": "PCAP Replay", "role": "pcap", "notifications": [], "icon": "network_check"},
                            {"name": "Cold Log Ingest", "selected": false, "title": "Cold Log Ingest", "role": "process_logs", "notifications": [], "icon": "archive"},
                            {"name": "Tools", "selected": false, "title": "Tools Messages", "role": "tools", "notifications": [], "icon": "build"},
                            {"name": "Index Management", "selected": false, "title": "Index Management Messages", "role": "curator", "notifications": [], "icon": "timeline"}];

  /**
   *Creates an instance of CatalogService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor() {
    super(entityConfig);
    this.setupNavigation_();
  }

  private setupNavigation_() {
    this.buttonList = this.dipButtons;
  }
}
