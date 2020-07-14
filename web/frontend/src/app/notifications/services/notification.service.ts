import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { EntityConfig, ApiService } from '../../services/tfplenum.service';
import { WeaponSystemNameService} from '../../services/weapon-system-name.service';

export const config: EntityConfig = { entityPart: 'notifications', type: 'Notification' };
export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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
                            {"name": "Tools", "selected": false, "title": "Tools Messages", "role": "tools", "notifications": [], "icon": "build"},
                            {"name": "Index Management", "selected": false, "title": "Index Management Messages", "role": "curator", "notifications": [], "icon": "timeline"}];

  private mipButtons: any = [
    {"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"},
    {"name": "Kickstart", "selected": false, "title": "Kickstart Messages","role": "kickstart", "notifications": [], "icon": "layers"},
    {"name": "MipConfig", "selected": false, "title": "MIP Configuration Messages", "role": "mipconfig", "notifications": [], "icon": "storage"}
  ];


  system_name: string;

  /**
   *Creates an instance of CatalogService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor(private sysNameSrv: WeaponSystemNameService) {
    super(config);
    this.setupNavigation();
  }

  private setupNavigation() {
    this.sysNameSrv.getSystemName().subscribe(
      data => {
        this.system_name = data['system_name'];

        if (this.system_name === 'MIP') {
          this.buttonList = this.mipButtons;
        }

        if (this.system_name === 'DIP') {
          this.buttonList = this.dipButtons;
        }
      },
      err => {
        this.system_name = 'DIP';
        this.buttonList = this.dipButtons;
      }
    );
  }

}
