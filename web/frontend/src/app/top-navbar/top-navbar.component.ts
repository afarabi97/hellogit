import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationsComponent } from '../notifications/component/notifications.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';


@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent implements OnInit {
  showLinkNames = true;
  sideNavigationButtons = [
    {
      children: [{ label: 'Portal', url: '/portal', icon: 'dashboard' }]
    }, {
      label: 'System Setup',
      children: [{ label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers' }, { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage' }, { label: 'Build Host Agent', url: '/agent-builder-chooser', icon: 'build' }, { label: 'Install Host Agents', url: '/agent_installer', icon: 'cloud_download' }, { label: 'Catalog', url: '/catalog', icon: 'apps' }]
    }, {
      label: 'Kubernetes',
      children: [{ label: 'Health', url: '/health', icon: 'local_hospital' }, { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls' }, { label: 'Docker Registry', url: '/registry', icon: 'view_day' }]
    }, {
      label: 'Policy Management',
      children: [{ label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz' }, { label: 'Test PCAP files', url: 'pcaps', icon: 'security' }]
    }, {
      label: 'Confluence',
      children: [{ label: 'THISISCVAH', url: `http://${window.location.hostname}/THISISCVAH`, icon: 'book' }]
    }, {
      children: [{ label: 'Help', url: '/help', icon: 'help' }]
    }];

  @ViewChild('notifications') notifications: NotificationsComponent;

  constructor(private route: ActivatedRoute, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'tfplenum',
      sanitizer.bypassSecurityTrustResourceUrl('favicon.ico'));

  }

  ngOnInit() {
  }

  openNotifications() {
    this.notifications.openNotification();
  }
}
