import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationsComponent } from '../notifications/component/notifications.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { CookieService } from '../services/cookies.service';


@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent implements OnInit {
  showLinkNames = true;
  sideNavigationButtons = [
    {
      children: [{ label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false }]
    }, {
      label: 'System Setup',
      children: [{ label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers', isExternalLink: false },
                 { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage', isExternalLink: false },
                 { label: 'Build Host Agent', url: '/agent-builder-chooser', icon: 'build', isExternalLink: false },
                 { label: 'Install Host Agents', url: '/agent_installer', icon: 'cloud_download', isExternalLink: false },
                 { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false }]
    }, {
      label: 'Kubernetes',
      children: [{ label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false },
                 { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false },
                 { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false }]
    }, {
      label: 'Policy Management',
      children: [{ label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false },
                 { label: 'Test PCAP files', url: 'pcaps', icon: 'security', isExternalLink: false }]
    }, {
      label: 'Confluence',
      children: [{ label: 'THISISCVAH', url: `http://${window.location.hostname}/THISISCVAH`, icon: 'book', isExternalLink: true }]
    }];

  @ViewChild('notifications') notifications: NotificationsComponent;

  constructor(private route: ActivatedRoute, private cookieService: CookieService) {
  }

  ngOnInit() {
    this.showLinkNames = this.cookieService.get('isOpen') == 'true' ? true : false;
  }

  openNotifications() {
    this.notifications.openNotification();
  }

  toggleSideNavigation() {
    this.showLinkNames = !this.showLinkNames;
    this.cookieService.set('isOpen', this.showLinkNames.toString());
  }
}
