import { UserClass } from '../../classes';
import { UserService } from '../../services/user.service';
import { allSections } from '../constants/navbar.constants';
import { NavGroupInterface, NavLinkInterface } from '../interfaces';

export class NavBarMethodsClass {

  /**
   * Used to get the side nav buttons
   *
   * @static
   * @param {string} system_name
   * @param {UserService} userService
   * @param {boolean} kitStatus
   * @returns
   */
  static getSideNavigationButtons(userService: UserService, kitStatus: boolean, html_spaces: string[]): NavGroupInterface[] {
    const user: UserClass = userService.getUser();
    const controller_admin: boolean = userService.isControllerAdmin();
    const controller_maintainer: boolean = userService.isControllerMaintainer();
    const operator: boolean = userService.isOperator();
    const realm_admin: boolean = userService.isRealmAdmin();
    const allLinks: NavLinkInterface[] = [
      { label: user.displayName, url: `https://${window.location.hostname}/auth/realms/CVAH-SSO/account`, icon: 'account_circle', isExternalLink: true, section: 'general', privs: true, target: "_blank", kitStatus: false },
      { label: 'Logout', url: `https://${window.location.hostname}/Shibboleth.sso/Logout`, icon: 'exit_to_app', isExternalLink: true, section: 'general', privs: true, target: "_self", kitStatus: false },
      { label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false, section: 'general', privs: true, kitStatus: false },
      { label: 'SSO Admin', url: `https://${window.location.hostname}/auth/admin/CVAH-SSO/console`, icon: 'group', isExternalLink: true, section: 'system_setup',  privs: realm_admin, target: "_blank", kitStatus: false },
      { label: 'System Settings', url: '/settings', icon: 'layers', isExternalLink: false, section: 'system_setup', privs: controller_admin, kitStatus: false },
      { label: 'Node Management', url: '/node-mng', icon: 'dns', isExternalLink: false, section: 'system_setup', privs: controller_admin, kitStatus: false },
      { label: 'MIP Management', url: '/mip-mng', icon: 'laptop', isExternalLink: false, section: 'system_setup', privs: controller_admin, kitStatus: false },
      { label: 'Remote Agents', url: '/windows_agent_deployer', icon: 'manage_search', isExternalLink: false, section: 'system_setup', privs: operator, kitStatus: true },
      { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false, section: 'system_setup', privs: controller_maintainer, kitStatus: true },
      { label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false, section: 'kubernetes', privs: true, kitStatus: true },
      { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false, section: 'kubernetes', privs: operator, kitStatus: true },
      { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false, section: 'kubernetes', privs: true, kitStatus: false },
      { label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false, section: 'policy_mgmt', privs: operator, kitStatus: true },
      { label: 'Alerts', url: '/alerts', icon: 'warning', isExternalLink: false, section: 'general', privs: operator, kitStatus: true },
      { label: 'Test PCAP Files', url: 'pcaps', icon: 'security', isExternalLink: false, section: 'policy_mgmt', privs: operator, kitStatus: true },
      { label: 'Tools', url: '/tools', icon: 'build', isExternalLink: false, section: 'tools', privs: controller_maintainer, kitStatus: false },
      { label: 'API Docs', url: '/api/docs', icon: 'web', isExternalLink: true, section: 'tools', privs: controller_maintainer, target: "_blank", kitStatus: false },
      { label: 'ES Scale', url: '/es_scale', icon: 'tune', isExternalLink: false, section: 'Elastic', privs: controller_maintainer, kitStatus: true },
      { label: 'Index Management', url: '/index_management', icon: 'settings', isExternalLink: false, section: 'Elastic', privs: controller_maintainer, kitStatus: true },
      { label: 'Cold Log Ingest', url: '/logingest', icon: 'cloud_download', isExternalLink: false, section: 'Elastic', privs: operator, kitStatus: true },
      { label: 'PMO Support', url: 'support', icon: 'contact_phone', isExternalLink: false, section: 'support', privs: operator, kitStatus: false }
    ];
    html_spaces.forEach((element: string) => {
      allLinks.push(
        {
          label: element,
          url: encodeURI(`http://${window.location.hostname}/docs/${element}`),
          icon: 'book',
          isExternalLink: true,
          section: 'confluence',
          privs: true,
          target: '_blank',
          kitStatus: false
        });
    });
    const navigationButtons: NavGroupInterface[] = allSections.filter((section: NavGroupInterface) => {
      /* istanbul ignore else */
      const children: NavLinkInterface[] = allLinks.filter((link: NavLinkInterface) => {
        /* istanbul ignore else */
        if ((link.section === section.id) &&
            (link.privs) && ((link.kitStatus && kitStatus) || !link.kitStatus)) {
          return link;
        }
      });
      /* istanbul ignore else */
      if (children.length > 0) {
        section.children = children;
        return section;
      }
    });

    return navigationButtons;
  }
}
