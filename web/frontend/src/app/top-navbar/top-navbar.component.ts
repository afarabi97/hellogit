import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NotificationsComponent } from '../notifications/component/notifications.component';
import { CookieService } from '../services/cookies.service';
import { NavBarService } from './navbar.service';
import { interval } from "rxjs";
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent implements OnInit {
  showLinkNames = true;
  time: Date;
  timezone: string;
  version: string;

  sideNavigationButtons = [
    {
      children: [{ label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false }]
    }, {
      label: 'System Setup',
      children: [{ label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers', isExternalLink: false },
                 { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage', isExternalLink: false },
                 { label: 'Install Windows Agents', url: '/windows_agent_deployer', icon: 'cloud_download', isExternalLink: false },
                 { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false },
                 { label: 'Add Node', url: '/add_node', icon: 'computer', isExternalLink: false },
                 { label: 'Upgrade', url: '/upgrade', icon: 'timeline', isExternalLink: false },
                 { label: 'ES Scale', url: '/es_scale', icon: 'tune', isExternalLink: false }]
    }, {
      label: 'Kubernetes',
      children: [{ label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false },
                 { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false },
                 { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false }]
    }, {
      label: 'Policy Management',
      children: [{ label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false },
                 { label: 'Test PCAP files', url: 'pcaps', icon: 'security', isExternalLink: false }]
    },
    {
      label: 'Tools',
      children: [{ label: 'Tools', url: '/tools', icon: 'build', isExternalLink: false }]
    },
    {
      label: 'Confluence',
      children: [{ label: 'THISISCVAH', url: `http://${window.location.hostname}/THISISCVAH`, icon: 'book', isExternalLink: true }]
    },
    ];

  @ViewChild('notifications', {static: false}) notifications: NotificationsComponent;

  constructor(private cookieService: CookieService,
              private navService: NavBarService,
              private socketSrv: WebsocketService) { }

  ngOnInit() {
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
