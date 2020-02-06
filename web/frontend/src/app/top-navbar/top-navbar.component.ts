import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, EventEmitter, Output} from '@angular/core';
import { NotificationsComponent } from '../notifications/component/notifications.component';
import { CookieService } from '../services/cookies.service';
import { NavBarService } from './navbar.service';
import { interval } from "rxjs";
import { WebsocketService } from '../services/websocket.service';
import { WeaponSystemNameService} from '../services/weapon-system-name.service';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss'],
  host: {
    'class': 'app-top-navbar'
  }
})
export class TopNavbarComponent implements OnInit {
  public showLinkNames = true;
  public time: Date;
  public timezone: string;
  public version: string;
  public system_name: string;

  private portal = { label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false };
  private kickstart = { label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers', isExternalLink: false };
  private kit = { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage', isExternalLink: false }
  private windowsAgents = { label: 'Install Windows Agents', url: '/windows_agent_deployer', icon: 'cloud_download', isExternalLink: false };
  private catalog = { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false };
  private addNode = { label: 'Add Node', url: '/add_node', icon: 'computer', isExternalLink: false };
  private upgrade = { label: 'Upgrade', url: '/upgrade', icon: 'timeline', isExternalLink: false };
  private esScale = { label: 'ES Scale', url: '/es_scale', icon: 'tune', isExternalLink: false };
  private health = { label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false };
  private configurationMaps = { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false };
  private dockerRegistry = { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false };
  private rulesets = { label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false };
  private pcaps = { label: 'Test PCAP files', url: 'pcaps', icon: 'security', isExternalLink: false };
  private tools = { label: 'Tools', url: '/tools', icon: 'build', isExternalLink: false };
  private thisiscvah = { label: 'THISISCVAH', url: `http://${window.location.hostname}/THISISCVAH`, icon: 'book', isExternalLink: true };

  public sideNavigationButtons: any;

  private dipNavigation = [
    {
      children: [this.portal]
    },
    {
      label: 'System Setup',
      children: [this.kickstart,
                 this.kit,
                 this.windowsAgents,
                 this.catalog,
                 this.addNode,
                 this.upgrade,
                 this.esScale
                 ]
    },
    {
      label: 'Kubernetes',
      children: [this.health,
                 this.configurationMaps,
                 this.dockerRegistry]
    },
    {
      label: 'Policy Management',
      children: [this.rulesets,
                 this.pcaps]
    },
    {
      label: 'Tools',
      children: [this.tools]
    },
    {
      label: 'Confluence',
      children: [this.thisiscvah]
    },
  ];

  private mipNavigation = [
    {
      label: 'System Setup',
      children: [this.kickstart,
                 this.kit
                 ]
    },
  ];

  private gipNavigation = [
    {
      label: 'System Setup',
      children: [this.kickstart,
                 this.kit
                 ]
    },
  ];

  private navigation: any = {
    'DIP': this.dipNavigation,
    'MIP': this.mipNavigation,
    'GIP': this.gipNavigation
  }

  @Output() themeChanged: EventEmitter<any> = new EventEmitter();

  emitTheme() {
    this.themeChanged.emit({'system_name': this.system_name});
  }

  @ViewChild('notifications', {static: false}) notifications: NotificationsComponent;

  constructor(private cookieService: CookieService,
              private navService: NavBarService,
              private socketSrv: WebsocketService,
              private sysNameSrv: WeaponSystemNameService,
              private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.setSystemName();

    this.showLinkNames = this.cookieService.get('isOpen') === 'true' ? true : false;
    const clockCounter = interval(1000);

    this.navService.getCurrentDIPTime().subscribe(data => {
      this.setClock(data);
      clockCounter.subscribe(n => {
        this.time = new Date(this.time.getTime() + 1000);
      });
    });

    this.navService.getVersion().subscribe(versionObj => {
      this.version = versionObj.version;
    });

    this.socketRefresh();
  }

  selectSystemName() {
    let dialogRef = this.sysNameSrv.selectSystemName();

    dialogRef.afterClosed().subscribe(response => {
      let system_name = response.controls['dropdown'].value;
      const url = '/api/save_system_name';
       this.sysNameSrv.saveSystemName(system_name).subscribe(response => {
         this.setSystemName();
      });
    });

  }

  private setSystemName() {
    this.sysNameSrv.getSystemName().subscribe(
      data => {
        this.system_name = data['system_name'];
        this.sideNavigationButtons = this.navigation[this.system_name];
        this.emitTheme();
        this.ref.detectChanges();
      },
      err => {
        this.system_name = 'DIP';
        this.sideNavigationButtons = this.navigation[this.system_name];
        this.emitTheme();
        this.ref.detectChanges();
      }
    );
  }

  private setClock(data: Object){
    this.timezone = data["timezone"];
    let datetime = data["datetime"];
    let dateParts = datetime.split(' ')[0].split("-");
    let timeParts = datetime.split(' ')[1].split(":");

    this.time = new Date(
      dateParts[2], //Year
      dateParts[0] - 1, //Month
      dateParts[1], //Day
      timeParts[0], // hours
      timeParts[1], // minutes
      timeParts[2] // seconds
    );
  }

  private restartClock(){
    this.navService.getCurrentDIPTime().subscribe(data => {
      this.setClock(data);
    });
  }

  openNotifications() {
    this.notifications.openNotification();
  }

  toggleSideNavigation() {
    this.showLinkNames = !this.showLinkNames;
    this.cookieService.set('isOpen', this.showLinkNames.toString());
  }

  private socketRefresh(){
    this.socketSrv.getSocket().on('clockchange', (data: any) => {
      this.restartClock();
    });
  }
}
