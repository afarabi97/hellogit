import { Injectable } from '@angular/core';

import { EntityConfig } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';
import { WeaponSystemNameService } from '../../services/weapon-system-name.service';

const entityConfig: EntityConfig = { entityPart: 'notifications', type: 'Notification' };

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends ApiService<any> {
  public buttonList: any;
  private dipButtons: any = [{"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"},
                            {"name": "Catalog", "selected": false, "title": "Catalog Messages","role": "catalog", "notifications": [], "icon": "apps"},
                            {"name": "Kickstart", "selected": false, "title": "Kickstart Messages","role": "kickstart", "notifications": [], "icon": "layers"},
                            {"name": "Kit", "selected": false, "title": "Kit Messages", "role": "kit", "notifications": [], "icon": "storage"},
                            {"name": "RuleSync", "selected": false, "title": "RuleSync Messages", "role": "rulesync", "notifications": [], "icon": "swap_horiz"},
                            {"name": "ES-Scale", "selected": false, "title": "ES-Scale Messages", "role": "scale", "notifications": [], "icon": "tune"},
                            {"name": "Agent", "selected": false, "title": "Agent Messages", "role": "agent", "notifications": [], "icon": "desktop_windows"},
                            {"name": "PCAP", "selected": false, "title": "PCAP Replay", "role": "pcap", "notifications": [], "icon": "network_check"},
                            {"name": "Cold Log Ingest", "selected": false, "title": "Cold Log Ingest", "role": "process_logs", "notifications": [], "icon": "archive"},
                            {"name": "Tools", "selected": false, "title": "Tools Messages", "role": "tools", "notifications": [], "icon": "build"},
                            {"name": "Index Management", "selected": false, "title": "Index Management Messages", "role": "curator", "notifications": [], "icon": "timeline"}];

  private gipButtons: any = [{"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"},
                            {"name": "Catalog", "selected": false, "title": "Catalog Messages","role": "catalog", "notifications": [], "icon": "apps"},
                            {"name": "Kickstart", "selected": false, "title": "Kickstart Messages","role": "kickstart", "notifications": [], "icon": "layers"},
                            {"name": "Kit", "selected": false, "title": "Kit Messages", "role": "kit", "notifications": [], "icon": "storage"},
                            {"name": "ES-Scale", "selected": false, "title": "ES-Scale Messages", "role": "scale", "notifications": [], "icon": "tune"},
                            {"name": "Tools", "selected": false, "title": "Tools Messages", "role": "tools", "notifications": [], "icon": "build"},
                            {"name": "Index Management", "selected": false, "title": "Index Management Messages", "role": "curator", "notifications": [], "icon": "timeline"}];

  private mipButtons: any = [
    {"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"},
    {"name": "Kickstart", "selected": false, "title": "Kickstart Messages","role": "kickstart", "notifications": [], "icon": "layers"},
    {"name": "MipConfig", "selected": false, "title": "MIP Configuration Messages", "role": "mipconfig", "notifications": [], "icon": "storage"}
  ];
  private systemName_: string;

  /**
   *Creates an instance of CatalogService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor(private weaponSystemNameService_: WeaponSystemNameService) {
    super(entityConfig);

    this.setupNavigation_();
  }

  private setupNavigation_() {
    this.systemName_ = this.weaponSystemNameService_.getSystemName();

    if (this.systemName_ === 'MIP') {
      this.buttonList = this.mipButtons;
    }

    if (this.systemName_ === 'DIP') {
      this.buttonList = this.dipButtons;
    }

    if (this.systemName_ === 'GIP') {
      this.buttonList = this.gipButtons;
    }
  }
}
