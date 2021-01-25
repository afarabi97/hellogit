import { UserClass } from '../../classes';
import { UserService } from '../../services/user.service';
import {
  allSections,
  SYSTEM_NAMES_ALL,
  SYSTEM_NAMES_DIP,
  SYSTEM_NAMES_DIP_GIP,
  SYSTEM_NAMES_MIP
} from '../constants/navbar.constants';
import { NavGroupInterface, NavLinkInterface } from '../interfaces';

/**
 * Used to get the side nav buttons
 *
 * @export
 * @param {string} system_name
 * @param {UserService} userService
 * @param {boolean} kitStatus
 * @returns
 */
export function getSideNavigationButtons(system_name: string, userService: UserService, kitStatus: boolean, html_spaces: string[]): NavGroupInterface[] {
  const user: UserClass = userService.getUser();
  const controller_admin: boolean = userService.isControllerAdmin();
  const controller_maintainer: boolean = userService.isControllerMaintainer();
  const operator: boolean = userService.isOperator();
  const realm_admin: boolean = userService.isRealmAdmin();
  const allLinks: NavLinkInterface[] = [
    { label: user.displayName, url: `https://${window.location.hostname}/auth/realms/CVAH-SSO/account`, icon: 'account_circle', isExternalLink: true, section: 'general', system: SYSTEM_NAMES_ALL, privs: true, target: "_blank", kitStatus: false },
    { label: 'Logout', url: `https://${window.location.hostname}/Shibboleth.sso/Logout`, icon: 'exit_to_app', isExternalLink: true, section: 'general', system: SYSTEM_NAMES_ALL, privs: true, target: "_self", kitStatus: false },
    { label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false, section: 'general', system: SYSTEM_NAMES_ALL, privs: true, kitStatus: false },
    { label: 'SSO Admin', url: `https://${window.location.hostname}/auth/admin/CVAH-SSO/console`, icon: 'group', isExternalLink: true, section: 'system_setup', system: SYSTEM_NAMES_ALL, privs: realm_admin, target: "_blank", kitStatus: false },
    { label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers', isExternalLink: false, section: 'system_setup', system: SYSTEM_NAMES_ALL, privs: controller_admin, kitStatus: false },
    { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage', isExternalLink: false, section: 'system_setup', system: SYSTEM_NAMES_DIP_GIP, privs: controller_admin, kitStatus: false },
    { label: 'Install Windows Agents', url: '/windows_agent_deployer', icon: 'cloud_download', isExternalLink: false, section: 'system_setup', system: SYSTEM_NAMES_DIP, privs: operator, kitStatus: true },
    { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false, section: 'system_setup', system: SYSTEM_NAMES_DIP_GIP, privs: controller_maintainer, kitStatus: true },
    { label: 'Add Node', url: '/add_node', icon: 'computer', isExternalLink: false, section: 'system_setup', system: SYSTEM_NAMES_DIP, privs: controller_admin, kitStatus: true },
    { label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false, section: 'kubernetes', system: SYSTEM_NAMES_DIP_GIP, privs: true, kitStatus: true },
    { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false, section: 'kubernetes', system: SYSTEM_NAMES_DIP_GIP, privs: operator, kitStatus: true },
    { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false, section: 'kubernetes', system: SYSTEM_NAMES_DIP_GIP, privs: true, kitStatus: false },
    { label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false, section: 'policy_mgmt', system: SYSTEM_NAMES_DIP_GIP, privs: operator, kitStatus: true },
    { label: 'Alerts', url: '/alerts', icon: 'warning', isExternalLink: false, section: 'general', system: SYSTEM_NAMES_DIP, privs: operator, kitStatus: true },
    { label: 'Test PCAP files', url: 'pcaps', icon: 'security', isExternalLink: false, section: 'policy_mgmt', system: SYSTEM_NAMES_DIP, privs: operator, kitStatus: true },
    { label: 'Tools', url: '/tools', icon: 'build', isExternalLink: false, section: 'tools', system: SYSTEM_NAMES_ALL, privs: controller_maintainer, kitStatus: false },
    { label: 'API Docs', url: '/api/docs', icon: 'web', isExternalLink: true, section: 'tools', system: SYSTEM_NAMES_ALL, privs: controller_maintainer, target: "_blank", kitStatus: false },
    { label: 'ES Scale', url: '/es_scale', icon: 'tune', isExternalLink: false, section: 'Elastic', system: SYSTEM_NAMES_DIP, privs: controller_maintainer, kitStatus: true },
    { label: 'Index Management', url: '/index_management', icon: 'settings', isExternalLink: false, section: 'Elastic', system: SYSTEM_NAMES_DIP, privs: controller_maintainer, kitStatus: true },
    { label: 'Cold Log Ingest', url: '/logingest', icon: 'cloud_download', isExternalLink: false, section: 'Elastic', system: SYSTEM_NAMES_DIP_GIP, privs: operator, kitStatus: true },
    { label: 'MIP Configuration', url: 'mip_config', icon: 'storage', isExternalLink: false, section: 'system_setup', system: SYSTEM_NAMES_MIP, privs: controller_admin, kitStatus: false },
    { label: 'Support', url: 'support', icon: 'contact_phone', isExternalLink: false, section: 'support', system: SYSTEM_NAMES_ALL, privs: operator, kitStatus: false }
  ];
  html_spaces.forEach((element: string) => {
    allLinks.push(
      {
        label: element,
        url: encodeURI(`http://${window.location.hostname}/docs/${element}`),
        icon: 'book',
        isExternalLink: true,
        section: 'confluence',
        system: SYSTEM_NAMES_ALL,
        privs: true,
        target: '_blank',
        kitStatus: false
      });
  });
  const navigationButtons: NavGroupInterface[] = allSections.filter((section: NavGroupInterface) => {
    /* istanbul ignore else */
    if (section.system.includes(system_name)) {
      const children: NavLinkInterface[] = allLinks.filter((link: NavLinkInterface) => {
        /* istanbul ignore else */
        if ((link.section === section.id) && (link.system.includes(system_name)) &&
            (link.privs) && ((link.kitStatus && kitStatus) || !link.kitStatus)) {
          return link;
        }
      });
      /* istanbul ignore else */
      if (children.length > 0) {
        section.children = children;
        return section;
      }
    }
  });

  return navigationButtons;
}
